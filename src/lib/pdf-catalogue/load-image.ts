import type { CatalogueImage } from "@/lib/pdf-catalogue/types";

export async function loadCatalogueImage(
  url: string,
): Promise<CatalogueImage | null> {
  try {
    let dataUrl: string;
    let blobType = "image/jpeg";

    if (url.startsWith("data:")) {
      dataUrl = url;
      const mimeMatch = url.match(/^data:([^;]+);/);
      if (mimeMatch?.[1]) blobType = mimeMatch[1];
    } else {
      const response = await fetch(url, { mode: "cors" });
      if (!response.ok) return null;

      const blob = await response.blob();
      blobType = blob.type || blobType;
      dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }

    const dimensions = await new Promise<{ w: number; h: number }>(
      (resolve, reject) => {
        const img = new Image();
        img.onload = () =>
          resolve({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = reject;
        img.src = dataUrl;
      },
    );

    const format: CatalogueImage["format"] = blobType.includes("png")
      ? "PNG"
      : "JPEG";

    return {
      dataUrl,
      format,
      aspectRatio: dimensions.w / dimensions.h,
    };
  } catch {
    return null;
  }
}
