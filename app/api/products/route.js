import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectToDatabase();
    const products = await Product.find({}).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { success: false, products: [], error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await connectToDatabase();
    const result = await Product.deleteMany({});

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `Deleted ${result.deletedCount} products.`,
    });
  } catch (error) {
    console.error("DELETE /api/products error:", error);
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

    const {
      name,
      price,
      img,
      images,
      desc,
      features,
      rating,
      stock,
      colors,
      weight,
      isFeatured,
    } = body;

    if (!name || price === undefined || !img) {
      return NextResponse.json(
        { success: false, error: "Name, price, and primary image are required." },
        { status: 400 }
      );
    }

    const imageList = Array.isArray(images) && images.length > 0 ? [...images] : [img];
    if (!imageList.includes(img)) {
      imageList.unshift(img);
    }

    const product = await Product.create({
      name: name.trim(),
      price: Number(price),
      img: img.trim(),
      images: imageList,
      desc: desc ? desc.trim() : "",
      features: Array.isArray(features) ? features : [],
      rating: rating !== undefined ? Number(rating) : 0,
      stock: stock !== undefined ? Number(stock) : 0,
      colors: Array.isArray(colors) ? colors : [],
      weight: weight ? weight.trim() : "",
      isFeatured: Boolean(isFeatured),
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
