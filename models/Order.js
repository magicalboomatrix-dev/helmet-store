import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true, default: 1 },
  img: { type: String, default: "1.jpg" },
});

const MilestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  timestamp: { type: Date, default: Date.now },
  completed: { type: Boolean, default: true },
});

const OrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customer: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, trim: true, default: "" },
      address: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      pincode: { type: String, required: true, trim: true },
    },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: { type: String, default: "UPI" },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Proof Submitted", "Proof Rejected", "Paid", "Cash on Delivery", "Failed"],
      default: "Pending",
    },
    paymentProof: {
      imageUrl: { type: String, default: "" },
      submittedAt: { type: Date, default: null },
      reviewNote: { type: String, default: "" },
      reviewedAt: { type: Date, default: null },
    },
    paymentVerifiedAt: { type: Date, default: null },
    trackingStatus: {
      type: String,
      enum: [
        "Auto",
        "Confirmed",
        "Packed",
        "Dispatched",
        "In Transit",
        "Out for Delivery",
        "Delivered",
      ],
      default: "Auto",
    },
    customMilestones: [MilestoneSchema],
    notes: { type: String, default: "" },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        return ret;
      },
    },
  }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
