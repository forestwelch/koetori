/**
 * Image Optimizer - Compresses and resizes images for Groq Vision API
 *
 * Constraints from Groq API:
 * - Base64 encoded size: max 4MB
 * - Resolution: max 33 megapixels (33,177,600 pixels)
 * - Images per request: max 5 (we only send 1)
 */

const MAX_BASE64_SIZE = 4 * 1024 * 1024; // 4MB
const MAX_RESOLUTION = 33177600; // 33 megapixels

/**
 * Load an image from a File object
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Compress an image using Canvas API
 */
function compressImage(
  img: HTMLImageElement,
  width: number,
  height: number,
  quality: number,
  format: string = "image/jpeg"
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Failed to get canvas context"));
      return;
    }

    // Draw image to canvas
    ctx.drawImage(img, 0, 0, width, height);

    // Convert to blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to compress image"));
        }
      },
      format,
      quality
    );
  });
}

/**
 * Check if WebP is supported by the browser
 */
function isWebPSupported(): boolean {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
}

/**
 * Optimize an image for Groq Vision API
 *
 * Strategy:
 * 1. Check if image already small enough
 * 2. Resize if resolution > 33 megapixels
 * 3. Compress with progressive quality reduction
 * 4. Convert to WebP if beneficial
 * 5. Maintain aspect ratio
 *
 * @param file - The image file to optimize
 * @returns Optimized Blob that should be under 4MB when base64 encoded
 */
export async function optimizeImageForGroq(file: File): Promise<Blob> {
  // Load the image
  const img = await loadImage(file);

  // Calculate current resolution
  const resolution = img.width * img.height;

  // Determine target dimensions (maintain aspect ratio)
  let targetWidth = img.width;
  let targetHeight = img.height;

  // Resize if resolution exceeds limit
  if (resolution > MAX_RESOLUTION) {
    const scale = Math.sqrt(MAX_RESOLUTION / resolution);
    targetWidth = Math.floor(img.width * scale);
    targetHeight = Math.floor(img.height * scale);
  }

  // Check if original file is already small enough (accounting for base64 encoding)
  const originalBase64Size = Math.ceil(file.size * 1.33);
  if (originalBase64Size <= MAX_BASE64_SIZE && resolution <= MAX_RESOLUTION) {
    // Already optimized, return original
    return file;
  }

  // Determine best format (WebP if supported, otherwise JPEG)
  const useWebP = isWebPSupported();
  const format = useWebP ? "image/webp" : "image/jpeg";

  // Progressive compression: try different quality levels
  const qualities = [0.9, 0.8, 0.7, 0.6, 0.5];

  for (const quality of qualities) {
    const blob = await compressImage(
      img,
      targetWidth,
      targetHeight,
      quality,
      format
    );
    const base64Size = Math.ceil(blob.size * 1.33);

    if (base64Size <= MAX_BASE64_SIZE) {
      // Successfully compressed to under 4MB
      return blob;
    }
  }

  // If still too large after all quality reductions, return most compressed version
  // This should rarely happen, but provides a fallback
  return compressImage(img, targetWidth, targetHeight, 0.4, format);
}
