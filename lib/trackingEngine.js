/**
 * Automated Milestone Engine
 * Calculates realistic, timestamped delivery checkpoints based on elapsed time,
 * order creation date, and customer destination city without external courier APIs.
 */

export function calculateOrderTracking(order, settings = {}) {
  if (!order) return null;

  const originLocation = settings.originCity || "Central Warehouse, New Delhi";
  const destCity = order.customer?.city || "Destination City";
  const destState = order.customer?.state || "State";
  const isPaymentVerified = order.paymentStatus === "Paid";
  const createdDate = new Date(order.paymentVerifiedAt || order.createdAt || Date.now());
  const now = new Date();

  // Elapsed hours since order placement
  const elapsedHours = Math.max(0, (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60));

  // Determine active stage
  // Stages:
  // 1: Confirmed (0-3h)
  // 2: Packed (3-10h)
  // 3: Dispatched (10-28h)
  // 4: In Transit (28-50h)
  // 5: Out for Delivery (50-65h)
  // 6: Delivered (65h+)
  
  let currentStageIndex = isPaymentVerified ? 0 : -1;

  if (!isPaymentVerified) {
    currentStageIndex = -1;
  } else if (order.trackingStatus && order.trackingStatus !== "Auto") {
    const statusMap = {
      Confirmed: 0,
      Packed: 1,
      Dispatched: 2,
      "In Transit": 3,
      "Out for Delivery": 4,
      Delivered: 5,
    };
    currentStageIndex = statusMap[order.trackingStatus] ?? 0;
  } else {
    if (elapsedHours >= 65) currentStageIndex = 5;
    else if (elapsedHours >= 50) currentStageIndex = 4;
    else if (elapsedHours >= 28) currentStageIndex = 3;
    else if (elapsedHours >= 10) currentStageIndex = 2;
    else if (elapsedHours >= 3) currentStageIndex = 1;
    else currentStageIndex = 0;
  }

  const addHours = (date, hours) => new Date(date.getTime() + hours * 3600000);

  const rawMilestones = [
    {
      id: "confirmed",
      title: "Order Placed & Verified",
      location: originLocation,
      description: "Order received and confirmed. Inventory safety check initiated.",
      timeOffsetHours: 0,
    },
    {
      id: "packed",
      title: "Quality Inspected & Packed",
      location: originLocation,
      description: "Helmet passes 4-point visor & shell safety check. Dual-layer shockproof box sealed.",
      timeOffsetHours: 3.5,
    },
    {
      id: "dispatched",
      title: "Dispatched from Logistics Hub",
      location: `${originLocation} Gateway`,
      description: "Handed over to express courier fleet. Transit manifest generated.",
      timeOffsetHours: 12,
    },
    {
      id: "transit",
      title: "In Transit — Regional Facility",
      location: `Regional Sorting Facility, near ${destCity}`,
      description: "Arrived at regional distribution facility. Scanned for local hub sorting.",
      timeOffsetHours: 32,
    },
    {
      id: "out_for_delivery",
      title: "Out for Delivery",
      location: `Local Delivery Hub, ${destCity}, ${destState}`,
      description: "Out for delivery with courier executive. Delivery expected today.",
      timeOffsetHours: 54,
    },
    {
      id: "delivered",
      title: "Delivered",
      location: `${order.customer?.address || "Address"}, ${destCity}`,
      description: "Package successfully delivered and signed by customer.",
      timeOffsetHours: 64,
    },
  ];

  // Estimated delivery date (3 days from createdDate)
  const estimatedDelivery = isPaymentVerified ? addHours(createdDate, 65) : null;

  const milestones = rawMilestones.map((m, idx) => {
    const isCompleted = idx <= currentStageIndex;
    const isCurrent = idx === currentStageIndex;
    const isUpcoming = idx > currentStageIndex;

    // Projected or actual timestamp
    const milestoneDate = addHours(createdDate, m.timeOffsetHours);

    return {
      id: m.id,
      title: m.title,
      location: m.location,
      description: m.description,
      timestamp: isCompleted && milestoneDate > now ? now : milestoneDate,
      timeFormatted: formatMilestoneDate(isCompleted && milestoneDate > now ? now : milestoneDate, now),
      status: isCurrent ? "current" : isCompleted ? "completed" : "upcoming",
      isCompleted,
      isCurrent,
      isUpcoming,
    };
  });

  const statusNames = [
    "Confirmed",
    "Packed",
    "Dispatched",
    "In Transit",
    "Out for Delivery",
    "Delivered",
  ];

  return {
    orderId: order.orderId,
    currentStatus: isPaymentVerified ? statusNames[currentStageIndex] : "Awaiting Payment Verification",
    currentStageIndex,
    totalStages: statusNames.length,
    progressPercentage: isPaymentVerified
      ? Math.round(((currentStageIndex + 1) / statusNames.length) * 100)
      : 0,
    isDelivered: isPaymentVerified && currentStageIndex === 5,
    estimatedDeliveryFormatted: estimatedDelivery?.toLocaleDateString("en-IN", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }) || null,
    milestones,
  };
}

/**
 * Human friendly date formatter: "Today at 2:30 PM", "Yesterday at 11:00 AM", or "Oct 2, 2026"
 */
function formatMilestoneDate(date, now = new Date()) {
  const d = new Date(date);
  const isToday = d.toDateString() === now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  const timeString = d.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (isToday) return `Today at ${timeString}`;
  if (isYesterday) return `Yesterday at ${timeString}`;

  return `${d.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  })} at ${timeString}`;
}
