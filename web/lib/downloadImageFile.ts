export async function downloadImageFile(url: string, filenameHint: string, onError?: (message: string) => void) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    const extension = blob.type.split("/")[1] || "png";
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
