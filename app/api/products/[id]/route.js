import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;
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

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (price !== undefined) updateData.price = Number(price);
    if (img !== undefined) updateData.img = img.trim();
    if (images !== undefined) updateData.images = images;
    if (desc !== undefined) updateData.desc = desc.trim();
    if (features !== undefined) updateData.features = features;
    if (rating !== undefined) updateData.rating = Number(rating);
    if (stock !== undefined) updateData.stock = Number(stock);
    if (colors !== undefined) updateData.colors = colors;
    if (weight !== undefined) updateData.weight = weight.trim();
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured);

    if (updateData.img && updateData.images && !updateData.images.includes(updateData.img)) {
      updateData.images.unshift(updateData.img);
    }

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("PUT /api/products/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
