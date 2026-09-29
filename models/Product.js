import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    img: { type: String, required: true, trim: true },
    images: { type: [String], default: [] },
    desc: { type: String, default: "", trim: true },
    features: { type: [String], default: [] },
    rating: { type: Number, default: 4.8 },
    stock: { type: Number, default: 10 },
    colors: { type: [String], default: [] },
    weight: { type: String, default: "1.3 kg", trim: true },
    isFeatured: { type: Boolean, default: false },
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

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
