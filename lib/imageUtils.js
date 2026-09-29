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
