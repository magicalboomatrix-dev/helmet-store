import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import Settings from "@/models/Settings";
import { calculateOrderTracking } from "@/lib/trackingEngine";
import { isAdminRequest } from "@/lib/adminAuth";

export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    // Search by orderId (e.g. HS-10492) or by Mongo _id
    let order = await Order.findOne({ orderId: id.toUpperCase() });
    if (!order && id.length === 24) {
      order = await Order.findById(id);
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Fetch settings for UPI and WhatsApp
    let settings = await Settings.findOne({ key: "store_settings" });
    if (!settings) {
      settings = {
        upiId: "helmetstore@upi",
        upiPayeeName: "Helmet Store",
        whatsappNumber: "917027888321",
        originCity: "Central Warehouse, New Delhi",
      };
    }

    // Calculate automated delivery milestones
    const tracking = calculateOrderTracking(order, settings);
    const safeOrder = order.toObject();
    if (safeOrder.paymentProof) {
      safeOrder.paymentProof = {
        submittedAt: safeOrder.paymentProof.submittedAt,
        reviewNote: safeOrder.paymentProof.reviewNote,
        reviewedAt: safeOrder.paymentProof.reviewedAt,
        hasImage: Boolean(safeOrder.paymentProof.imageUrl),
      };
    }

    return NextResponse.json({
      success: true,
      order: safeOrder,
      tracking,
      settings: {
        upiId: settings.upiId || "helmetstore@upi",
        upiPayeeName: settings.upiPayeeName || "Helmet Store",
        whatsappNumber: settings.whatsappNumber || "917027888321",
        originCity: settings.originCity || "Central Warehouse, New Delhi",
      },
    });
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ success: false, error: "Admin sign-in required." }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();
    const { paymentStatus, trackingStatus, notes } = body;

    if (paymentStatus === "Paid") {
      return NextResponse.json(
        { success: false, error: "Verify the uploaded payment proof to mark this order paid." },
        { status: 400 }
      );
    }

    const updateData = {};
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (trackingStatus) updateData.trackingStatus = trackingStatus;
    if (notes !== undefined) updateData.notes = notes;

    let order = await Order.findOneAndUpdate(
      { orderId: id.toUpperCase() },
      updateData,
      { new: true }
    );

    if (!order && id.length === 24) {
      order = await Order.findByIdAndUpdate(id, updateData, { new: true });
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("PUT /api/orders/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ success: false, error: "Admin sign-in required." }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const { id } = await params;

    let deleted = await Order.findOneAndDelete({ orderId: id.toUpperCase() });
    if (!deleted && id.length === 24) {
      deleted = await Order.findByIdAndDelete(id);
    }

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/orders/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
