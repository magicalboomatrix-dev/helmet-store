import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import { PRODUCTS } from "@/app/data/data";

export async function GET() {
  try {
    await connectToDatabase();
    let products = await Product.find({}).sort({ createdAt: -1 });

    if (products.length === 0) {
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
      products = await Product.insertMany(formattedProducts);
    }

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({
      success: false,
      products: PRODUCTS.map((p) => ({
        ...p,
        images: [p.img],
      })),
      error: error.message,
    });
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
      rating: rating ? Number(rating) : 4.8,
      stock: stock !== undefined ? Number(stock) : 10,
      colors: Array.isArray(colors) ? colors : [],
      weight: weight ? weight.trim() : "1.3 kg",
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
