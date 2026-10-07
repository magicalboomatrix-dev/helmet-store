import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";
import Order from "@/models/Order";
import { isAdminRequest } from "@/lib/adminAuth";
import { getCustomerSession } from "@/lib/customerAuth";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

async function findOrder(id) {
  const orderId = id.toUpperCase();
  let order = await Order.findOne({ orderId });
  if (!order && id.length === 24) order = await Order.findById(id);
  return order;
}

export async function POST(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const order = await findOrder(id);

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found." }, { status: 404 });
    }
    const customerSession = getCustomerSession(request);
    if (!customerSession) {
      return NextResponse.json({ success: false, error: "Sign in with the account that placed this order to upload proof." }, { status: 403 });
    }
    if (order.customerAccountId && order.customerAccountId !== customerSession.userId) {
      return NextResponse.json({ success: false, error: "Sign in with the account that placed this order to upload proof." }, { status: 403 });
    }
    if (!order.customerAccountId && customerSession.userId) {
      order.customerAccountId = customerSession.userId;
    }
    if (order.paymentStatus === "Paid") {
      return NextResponse.json({ success: false, error: "This order has already been verified as paid." }, { status: 409 });
    }

    const formData = await request.formData();
    const file = formData.get("proof");
    if (!file || typeof file === "string" || typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ success: false, error: "Choose a payment screenshot to upload." }, { status: 400 });
    }
    const isImage =
      (file.type && (file.type.startsWith("image/") || ALLOWED_IMAGE_TYPES.has(file.type))) ||
      /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name || "");
    if (!isImage) {
      return NextResponse.json({ success: false, error: "Upload a valid image (JPEG, PNG, WebP, or HEIC)." }, { status: 400 });
    }
    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: "The screenshot must be smaller than 5 MB." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const imageUrl = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "helmet-store/payment-proofs",
          resource_type: "image",
          public_id: `payment-${order.orderId}-${Date.now()}`,
          overwrite: false,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        }
      );
      stream.end(buffer);
    });

    order.paymentProof = {
      imageUrl,
      submittedAt: new Date(),
      reviewNote: "",
      reviewedAt: null,
    };
    order.paymentStatus = "Proof Submitted";
    await order.save();

    return NextResponse.json({
      success: true,
      paymentStatus: order.paymentStatus,
      submittedAt: order.paymentProof.submittedAt,
    });
  } catch (error) {
    console.error("Payment proof upload error:", error);
    return NextResponse.json(
      { success: false, error: "Could not upload payment proof. Please try again." },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ success: false, error: "Admin sign-in required." }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const { id } = await params;
    const { action, reviewNote = "" } = await request.json();
    const order = await findOrder(id);

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found." }, { status: 404 });
    }
    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ success: false, error: "Choose approve or reject." }, { status: 400 });
    }
    if (!order.paymentProof?.imageUrl) {
      return NextResponse.json({ success: false, error: "This order has no uploaded payment proof." }, { status: 409 });
    }

    order.paymentProof.reviewNote = String(reviewNote).trim().slice(0, 500);
    order.paymentProof.reviewedAt = new Date();
    if (action === "approve") {
      order.paymentStatus = "Paid";
      order.paymentVerifiedAt = new Date();
      order.trackingStatus = "Confirmed";
    } else {
      order.paymentStatus = "Proof Rejected";
      order.paymentVerifiedAt = null;
    }
    await order.save();

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Payment proof review error:", error);
    return NextResponse.json(
      { success: false, error: "Could not update payment verification." },
      { status: 500 }
    );
  }
}