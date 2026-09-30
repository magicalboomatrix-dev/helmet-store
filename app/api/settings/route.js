import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Settings from "@/models/Settings";

export async function GET() {
  try {
    await connectToDatabase();
    let settings = await Settings.findOne({ key: "store_settings" });
    if (!settings) {
      settings = await Settings.create({
        key: "store_settings",
        whatsappNumber: "917027888321",
        storeName: "Helmet Store",
        upiId: "helmetstore@upi",
        upiPayeeName: "Helmet Store",
        originCity: "Central Warehouse, New Delhi",
      });
    }
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("GET settings error:", error);
    return NextResponse.json({
      success: false,
      settings: {
        whatsappNumber: "917027888321",
        storeName: "Helmet Store",
        upiId: "helmetstore@upi",
        upiPayeeName: "Helmet Store",
        originCity: "Central Warehouse, New Delhi",
      },
      error: error.message,
    });
  }
}

export async function PUT(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { whatsappNumber, storeName, upiId, upiPayeeName, originCity } = body;

    let settings = await Settings.findOne({ key: "store_settings" });
    if (!settings) {
      settings = new Settings({ key: "store_settings" });
    }

    if (whatsappNumber !== undefined) {
      const cleaned = String(whatsappNumber).replace(/[^\d]/g, "");
      settings.whatsappNumber = cleaned;
    }

    if (storeName !== undefined) {
      settings.storeName = storeName.trim();
    }

    if (upiId !== undefined) {
      settings.upiId = upiId.trim();
    }

    if (upiPayeeName !== undefined) {
      settings.upiPayeeName = upiPayeeName.trim();
    }

    if (originCity !== undefined) {
      settings.originCity = originCity.trim();
    }

    await settings.save();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("PUT settings error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
