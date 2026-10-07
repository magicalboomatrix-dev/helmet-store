/**
 * Safely normalizes an image path or URL for Next.js Image / standard img tags.
 * Handles:
 * - relative local public images (e.g., "1.jpg" -> "/1.jpg")
 * - local upload paths (e.g., "/uploads/photo.jpg" -> "/uploads/photo.jpg")
 * - full remote URLs (e.g., "https://..." or "http://...")
 * - data URLs (e.g., "data:image/...")
 */
export function formatImageUrl(src) {
  if (!src) return "/1.jpg";
  const s = String(src).trim();
  if (
    s.startsWith("http://") ||
    s.startsWith("https://") ||
    s.startsWith("data:") ||
    s.startsWith("/")
  ) {
    return s;
  }
  return `/${s}`;
}

/**
 * Returns a clean, deduplicated array of all images for a product.
 * Ensures the primary img is first.
 */
export function getProductImages(product) {
  if (!product) return ["/1.jpg"];
  const list = [];

  if (product.img) {
    list.push(formatImageUrl(product.img));
  }

  if (Array.isArray(product.images)) {
    for (const item of product.images) {
      if (item) {
        const formatted = formatImageUrl(item);
        if (!list.includes(formatted)) {
          list.push(formatted);
        }
      }
    }
  }

  return list.length > 0 ? list : ["/1.jpg"];
}

/**
 * Safely compresses an image file on the client using HTML5 Canvas before uploading.
 * Downscales huge phone screenshots (PNG/JPEG) to max 1600px width/height and ~200-400 KB JPG.
 * Avoids serverless body size limit (4.5 MB on Vercel) and prevents 413 "Request Entity Too Large".
 */
export async function compressImageClient(file, { maxWidth = 1600, maxHeight = 1600, quality = 0.82 } = {}) {
  if (typeof window === "undefined" || !file || !file.type?.startsWith("image/")) {
    return file;
  }
  // Skip SVG or animated GIFs or HEIC (if browser doesn't support canvas drawing)
  if (file.type === "image/svg+xml" || file.type === "image/gif" || file.type.includes("heic") || file.type.includes("heif")) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => resolve(file);
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => resolve(file);
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve(file);

          // Fill white background for transparent PNG screenshots
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob || blob.size >= file.size) {
                // If compression didn't reduce file size, keep original
                resolve(file);
              } else {
                const baseName = file.name ? file.name.replace(/\.[^/.]+$/, "") : "payment_screenshot";
                const compressedFile = new File([blob], `${baseName}.jpg`, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              }
            },
            "image/jpeg",
            quality
          );
        } catch {
          resolve(file);
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

