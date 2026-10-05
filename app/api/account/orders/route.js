import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import { getCustomerSession } from "@/lib/customerAuth";

export async function GET(request) {
  const session = getCustomerSession(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Sign in to view your order history." }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const orders = await Order.find({ customerAccountId: session.userId })
      .sort({ createdAt: -1 })
      .limit(100);
    const safeOrders = orders.map((order) => {
      const safeOrder = order.toObject();
      if (safeOrder.paymentProof) {
        safeOrder.paymentProof = {
          submittedAt: safeOrder.paymentProof.submittedAt,
          reviewNote: safeOrder.paymentProof.reviewNote,
          reviewedAt: safeOrder.paymentProof.reviewedAt,
          hasImage: Boolean(safeOrder.paymentProof.imageUrl),
        };
      }
      return safeOrder;
    });
    return NextResponse.json({ success: true, orders: safeOrders });
  } catch (error) {
    console.error("Customer order history error:", error);
    return NextResponse.json({ success: false, error: "Could not load order history." }, { status: 500 });
  }
}
