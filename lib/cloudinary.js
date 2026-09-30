import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "de4fro6sq",
  api_key: process.env.CLOUDINARY_API_KEY || "785678416165636",
  api_secret: process.env.CLOUDINARY_API_SECRET || "C8zE88pWfPiKFGDPiK9cmTCDnZ8",
  secure: true,
});

export default cloudinary;
