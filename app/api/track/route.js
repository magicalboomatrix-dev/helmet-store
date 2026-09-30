import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import Settings from "@/models/Settings";
import { calculateOrderTracking } from "@/lib/trackingEngine";

export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || "").trim();

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Please enter an Order ID or Phone Number to track." },
        { status: 400 }
      );
    }

    // Clean query
    const cleanedDigits = query.replace(/[^\d]/g, "");

    const filter = {
      $or: [
        { orderId: query.toUpperCase() },
        { orderId: `HS-${query.toUpperCase().replace("HS-", "")}` },
      ],
    };

    if (cleanedDigits.length >= 7) {
      filter.$or.push({ "customer.phone": { $regex: cleanedDigits, $options: "i" } });
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(5);

    if (orders.length === 0) {
      return NextResponse.json(
        { success: false, error: `No active orders found matching "${query}". Please check your details.` },
        { status: 404 }
      );
    }

    let settings = await Settings.findOne({ key: "store_settings" });
    if (!settings) {
      settings = { originCity: "Central Warehouse, New Delhi" };
    }

    const results = orders.map((order) => {
      const tracking = calculateOrderTracking(order, settings);
      return {
        order,
        tracking,
      };
    });

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("GET /api/track error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
