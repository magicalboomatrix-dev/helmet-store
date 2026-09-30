import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";

export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const filter = {};
    if (search.trim()) {
      const q = search.trim();
      filter.$or = [
        { orderId: { $regex: q, $options: "i" } },
        { "customer.phone": { $regex: q, $options: "i" } },
        { "customer.name": { $regex: q, $options: "i" } },
      ];
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(100);
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { customer, items, paymentMethod = "UPI" } = body;

    if (!customer || !customer.name || !customer.phone || !customer.address || !customer.city) {
      return NextResponse.json(
        { success: false, error: "Please provide complete delivery details (Name, Phone, Address, City)." },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Your cart is empty. Add items to place an order." },
        { status: 400 }
      );
    }

    // Generate unique Order ID, e.g. HS-68219
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const orderId = `HS-${randomNum}`;

    // Calculate subtotal & total
    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1),
      0
    );
    const shippingFee = 0; // Free shipping
    const total = subtotal + shippingFee;

    const formattedItems = items.map((item) => ({
      productId: String(item.id || item._id || "item"),
      name: item.name,
      price: Number(item.price),
      qty: Number(item.qty || 1),
      img: item.img || "1.jpg",
    }));

    const order = await Order.create({
      orderId,
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        email: customer.email ? customer.email.trim() : "",
        address: customer.address.trim(),
        city: customer.city.trim(),
        state: customer.state ? customer.state.trim() : "India",
        pincode: customer.pincode ? customer.pincode.trim() : "",
      },
      items: formattedItems,
      subtotal,
      shippingFee,
      total,
      paymentMethod,
      paymentStatus: "Pending",
      trackingStatus: "Auto",
    });

    // Auto-decrement inventory stock if products exist in DB
    for (const item of formattedItems) {
      if (item.productId && item.productId.length === 24) {
        try {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: -item.qty },
          });
        } catch (stockErr) {
          console.warn("Failed to auto-decrement stock for:", item.productId, stockErr.message);
        }
      }
    }

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
