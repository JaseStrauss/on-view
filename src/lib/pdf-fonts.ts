import type { jsPDF } from "jspdf";

const PDF_FONTS = [
  {
    file: "DMSans-Regular.ttf",
    path: "/fonts/DMSans-Regular.ttf",
    family: "DMSans",
    style: "normal",
  },
  {
    file: "DMSans-Medium.ttf",
    path: "/fonts/DMSans-Medium.ttf",
    family: "DMSans",
    style: "bold",
  },
  {
    file: "InstrumentSerif-Regular.ttf",
    path: "/fonts/InstrumentSerif-Regular.ttf",
    family: "InstrumentSerif",
    style: "normal",
  },
  {
    file: "InstrumentSerif-Italic.ttf",
    path: "/fonts/InstrumentSerif-Italic.ttf",
    family: "InstrumentSerif",
    style: "italic",
  },
] as const;

async function arrayBufferToBase64(buffer: ArrayBuffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(new Blob([buffer]));
  });
}

const loadedFontCache = new Map<string, string>();

export const PDF_SANS = "DMSans";
export const PDF_SERIF = "InstrumentSerif";

export async function registerPdfFonts(doc: jsPDF): Promise<void> {
  await Promise.all(
    PDF_FONTS.map(async ({ file, path, family, style }) => {
      let base64 = loadedFontCache.get(path);
      if (!base64) {
        const response = await fetch(path);
        if (!response.ok) {
          throw new Error(`Failed to load PDF font: ${path}`);
        }
        base64 = await arrayBufferToBase64(await response.arrayBuffer());
        loadedFontCache.set(path, base64);
      }
      doc.addFileToVFS(file, base64);
      doc.addFont(file, family, style);
    }),
  );
}
