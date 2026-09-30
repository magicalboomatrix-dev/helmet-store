import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "store_settings", unique: true },
    whatsappNumber: { type: String, default: "917027888321", trim: true },
    storeName: { type: String, default: "Helmet Store", trim: true },
    upiId: { type: String, default: "helmetstore@upi", trim: true },
    upiPayeeName: { type: String, default: "Helmet Store", trim: true },
    originCity: { type: String, default: "New Delhi Warehouse", trim: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
