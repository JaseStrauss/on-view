import {
  csvRowToFormData,
  MAX_DEMO_BULK_IMAGE_COUNT,
  MAX_DEMO_CSV_ROW_COUNT,
  titleFromFilename,
  type CsvArtworkRow,
} from "@/lib/bulk-import";
import type { Artwork, ArtworkFormData } from "@/types/artwork";
import type { BulkArtworkFailure } from "@/services/artworks";
import {
  createSampleSandboxState,
  ensureSandboxState,
  getDemoSandboxArtworks,
  loadSandboxState,
  saveSandboxState,
  SANDBOX_USER_ID,
  type DemoSandboxState,
} from "@/lib/demo-sandbox";

const MAX_DEMO_IMAGE_BYTES = 3 * 1024 * 1024;

export interface DemoBulkArtworkResult {
  artworks: Artwork[];
  failures: BulkArtworkFailure[];
}

function nowIso(): string {
  return new Date().toISOString();
}

function formToArtworkFields(form: ArtworkFormData) {
  return {
    title: form.title.trim(),
    artist: form.artist.trim(),
    year: form.year ? Number(form.year) : null,
    medium: form.medium.trim() || null,
    width_cm: form.width_cm ? Number(form.width_cm) : null,
    height_cm: form.height_cm ? Number(form.height_cm) : null,
    status: form.status,
    description: form.description.trim() || null,
    condition_notes: form.condition_notes.trim() || null,
  };
}

async function fileToDataUrl(file: File): Promise<string> {
  if (file.size > MAX_DEMO_IMAGE_BYTES) {
    throw new Error(
      "Image is too large for demo storage. Use a file under 3 MB or sign up to save to the cloud.",
    );
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read image file"));
    reader.readAsDataURL(file);
  });
}

async function fetchRemoteImageFile(url: string): Promise<File | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const blob = await response.blob();
    if (!blob.type.startsWith("image/")) return null;

    const extension = blob.type.split("/")[1] || "jpg";
    const filename =
      url.split("/").pop()?.split("?")[0] || `import.${extension}`;

    return new File([blob], filename, { type: blob.type });
  } catch {
    return null;
  }
}

function getOrInitSandboxState(): DemoSandboxState {
  return (
    loadSandboxState() ?? ensureSandboxState(() => createSampleSandboxState())
  );
}

function createDemoArtworkRecord(
  form: ArtworkFormData,
  imagePath: string | null,
): Artwork {
  const timestamp = nowIso();
  return {
    id: crypto.randomUUID(),
    user_id: SANDBOX_USER_ID,
    ...formToArtworkFields(form),
    image_path: imagePath,
    created_at: timestamp,
    updated_at: timestamp,
  };
}

function appendArtworksToSandbox(
  state: DemoSandboxState,
  artworks: Artwork[],
): DemoSandboxState {
  if (artworks.length === 0) return state;

  const catalogueArtworkIds = [
    ...new Set([
      ...state.catalogueArtworkIds,
      ...artworks.map((artwork) => artwork.id),
    ]),
  ];

  return {
    ...state,
    customArtworks: [...(state.customArtworks ?? []), ...artworks],
    catalogueArtworkIds,
  };
}

function persistSandboxArtworks(artworks: Artwork[]): void {
  const state = getOrInitSandboxState();
  const next = appendArtworksToSandbox(state, artworks);
  try {
    saveSandboxState(next);
  } catch {
    throw new Error(
      "Demo storage is full in this tab. Import fewer or smaller images.",
    );
  }
}

export function getAllSandboxArtworks(state: DemoSandboxState): Artwork[] {
  const builtIn = getDemoSandboxArtworks();
  const custom = state.customArtworks ?? [];
  if (custom.length === 0) return builtIn;

  const builtInIds = new Set(builtIn.map((artwork) => artwork.id));
  return [
    ...builtIn,
    ...custom.filter((artwork) => !builtInIds.has(artwork.id)),
  ];
}

export function resolveSandboxArtwork(
  state: DemoSandboxState,
  artworkId: string,
): Artwork | undefined {
  return getAllSandboxArtworks(state).find(
    (artwork) => artwork.id === artworkId,
  );
}

export async function addDemoSandboxCustomArtwork(
  form: ArtworkFormData,
  imageFile: File | null,
): Promise<Artwork> {
  let imagePath: string | null = null;
  if (imageFile) {
    imagePath = await fileToDataUrl(imageFile);
  }

  const artwork = createDemoArtworkRecord(form, imagePath);
  persistSandboxArtworks([artwork]);
  return artwork;
}

export async function importDemoSandboxImageFiles(
  files: File[],
): Promise<DemoBulkArtworkResult> {
  if (files.length > MAX_DEMO_BULK_IMAGE_COUNT) {
    return {
      artworks: [],
      failures: [
        {
          label: "Import",
          error: `Demo imports are limited to ${MAX_DEMO_BULK_IMAGE_COUNT} images at once.`,
        },
      ],
    };
  }

  const artworks: Artwork[] = [];
  const failures: BulkArtworkFailure[] = [];

  for (const file of files) {
    try {
      const imagePath = await fileToDataUrl(file);
      artworks.push(
        createDemoArtworkRecord(
          {
            title: titleFromFilename(file.name),
            artist: "",
            year: "",
            medium: "",
            width_cm: "",
            height_cm: "",
            status: "available",
            description: "",
            condition_notes: "",
          },
          imagePath,
        ),
      );
    } catch (err) {
      failures.push({
        label: file.name,
        error: err instanceof Error ? err.message : "Upload failed",
      });
    }
  }

  if (artworks.length > 0) {
    try {
      persistSandboxArtworks(artworks);
    } catch (err) {
      return {
        artworks: [],
        failures: [
          ...failures,
          {
            label: "Import",
            error:
              err instanceof Error ? err.message : "Could not save to demo",
          },
        ],
      };
    }
  }

  return { artworks, failures };
}

export async function importDemoSandboxCsvRows(
  rows: CsvArtworkRow[],
): Promise<DemoBulkArtworkResult> {
  if (rows.length > MAX_DEMO_CSV_ROW_COUNT) {
    return {
      artworks: [],
      failures: [
        {
          label: "Import",
          error: `Demo imports are limited to ${MAX_DEMO_CSV_ROW_COUNT} CSV rows at once.`,
        },
      ],
    };
  }

  const artworks: Artwork[] = [];
  const failures: BulkArtworkFailure[] = [];

  for (const row of rows) {
    const label = row.title.trim() || `Row ${row.rowNumber}`;

    try {
      const form = csvRowToFormData(row);
      const imageUrl = row.image_url.trim();
      let imagePath: string | null = null;

      if (imageUrl) {
        const remoteFile = await fetchRemoteImageFile(imageUrl);
        if (remoteFile) {
          try {
            imagePath = await fileToDataUrl(remoteFile);
          } catch (err) {
            failures.push({
              label,
              error:
                err instanceof Error
                  ? err.message
                  : "Could not store image in demo",
            });
            continue;
          }
        } else {
          imagePath = imageUrl;
        }
      }

      artworks.push(createDemoArtworkRecord(form, imagePath));
    } catch (err) {
      failures.push({
        label,
        error: err instanceof Error ? err.message : "Import failed",
      });
    }
  }

  if (artworks.length > 0) {
    try {
      persistSandboxArtworks(artworks);
    } catch (err) {
      return {
        artworks: [],
        failures: [
          ...failures,
          {
            label: "Import",
            error:
              err instanceof Error ? err.message : "Could not save to demo",
          },
        ],
      };
    }
  }

  return { artworks, failures };
}
