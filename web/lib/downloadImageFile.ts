// Converts a non-JPEG/PNG source (the AI image pipeline defaults to WebP for
// storage/site-performance reasons — see generate-image/route.ts) into a real
// baseline JPEG via canvas before it's saved to disk. Instagram/Facebook/
// LinkedIn's manual upload flows and any future Meta Graph API auto-posting
// don't reliably accept WebP, so every file this function hands the user must
// be something those platforms will actually take — regardless of what format
// the source asset happens to be stored in.
function convertBlobToJpeg(blob: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Canvas 2D context unavailable"));
        return;
      }
      // JPEG has no alpha channel — flatten any transparency onto white rather
      // than let the browser default it to black.
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (jpegBlob) => {
          URL.revokeObjectURL(objectUrl);
          if (jpegBlob) resolve(jpegBlob);
          else reject(new Error("Canvas failed to produce a JPEG blob"));
        },
        "image/jpeg",
        0.92
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image for JPEG conversion"));
    };
    img.src = objectUrl;
  });
}

const SOCIAL_SAFE_TYPES = new Set(["image/jpeg", "image/png"]);

export async function downloadImageFile(url: string, filenameHint: string, onError?: (message: string) => void) {
  try {
    const res = await fetch(url);
    let blob = await res.blob();
    let extension = blob.type.split("/")[1] || "png";

    if (!SOCIAL_SAFE_TYPES.has(blob.type)) {
      try {
        blob = await convertBlobToJpeg(blob);
        extension = "jpg";
      } catch (conversionErr) {
        console.error("JPEG conversion failed, downloading original format instead:", conversionErr);
        // Fall through and download the original blob rather than blocking the
        // download entirely — the extension already reflects its real type.
      }
    }

    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = `${filenameHint}.${extension}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  } catch (err) {
    console.error("Image download failed:", err);
    const message =
      "Couldn't download the image automatically — right-click the image above and choose \"Save image as...\" instead.";
    if (onError) onError(message);
    else alert(message);
  }
}
