import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import Settings from "@/models/Settings";
import { PRODUCTS } from "@/app/data/data";

export async function POST(request) {
  try {
    await connectToDatabase();

    let force = false;
    try {
      const body = await request.json();
      force = Boolean(body?.force);
    } catch {
      // Body may be empty
    }

    const count = await Product.countDocuments();
    if (count > 0 && !force) {
      return NextResponse.json({
        success: true,
        message: `Database already contains ${count} products. Pass force: true to re-seed.`,
        count,
      });
    }

    if (force) {
      await Product.deleteMany({});
    }

    const formattedProducts = PRODUCTS.map((p) => ({
      name: p.name,
      price: p.price,
      img: p.img,
      images: [p.img],
      desc: p.desc,
      features: p.features || [],
      rating: p.rating || 4.8,
      stock: p.stock ?? 10,
      colors: p.colors || [],
      weight: p.weight || "1.3 kg",
      isFeatured: p.id === 5 || p.id === 1,
    }));

    const inserted = await Product.insertMany(formattedProducts);

    let settings = await Settings.findOne({ key: "store_settings" });
    if (!settings) {
      settings = await Settings.create({
        key: "store_settings",
        whatsappNumber: "917027888321",
        storeName: "Helmet Store",
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${inserted.length} products into MongoDB!`,
      count: inserted.length,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST(new Request("http://localhost/api/seed", { method: "POST" }));
}
