import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(request) {
  try {
    const formData = await request.formData();
    let files = formData.getAll("files");

    if (!files || files.length === 0) {
      const singleFile = formData.get("file");
      if (singleFile && typeof singleFile === "object" && singleFile.name) {
        files = [singleFile];
      }
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadedUrls = [];

    for (const file of files) {
      if (typeof file === "string") continue;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload buffer to Cloudinary
      const secureUrl = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "helmet-store",
            resource_type: "image",
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        uploadStream.end(buffer);
      });

      uploadedUrls.push(secureUrl);
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      url: uploadedUrls[0] || null,
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image to Cloudinary: " + error.message },
      { status: 500 }
    );
  }
}
