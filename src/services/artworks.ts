import {
  csvRowToFormData,
  titleFromFilename,
  type CsvArtworkRow,
} from "@/lib/bulk-artwork/parse";
import { artworkFormToDbFields } from "@/lib/artwork/form";
import { ARTWORK_IMAGE_BUCKET, supabase } from "@/lib/supabase";
import type { Artwork, ArtworkFormData } from "@/types/artwork";

export interface BulkArtworkFailure {
  label: string;
  error: string;
}

export interface BulkArtworkResult {
  artworks: Artwork[];
  failures: BulkArtworkFailure[];
}

export interface BulkImageImportInput {
  file: File;
  width_cm: string;
  height_cm: string;
}

export async function fetchArtworks(): Promise<Artwork[]> {
  const { data, error } = await supabase
    .from("artworks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createArtwork(
  userId: string,
  form: ArtworkFormData,
  imageFile?: File | null,
  imagePathOverride?: string | null,
): Promise<Artwork> {
  let imagePath: string | null = imagePathOverride ?? null;

  if (imageFile) {
    const extension = imageFile.name.split(".").pop() ?? "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(ARTWORK_IMAGE_BUCKET)
      .upload(path, imageFile);

    if (uploadError) throw uploadError;
    imagePath = path;
  }

  const { data, error } = await supabase
    .from("artworks")
    .insert({
      user_id: userId,
      ...artworkFormToDbFields(form),
      image_path: imagePath,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Artwork;
}

export async function updateArtwork(
  id: string,
  form: ArtworkFormData,
): Promise<Artwork> {
  const { data, error } = await supabase
    .from("artworks")
    .update(artworkFormToDbFields(form))
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Artwork;
}

export async function deleteArtwork(artwork: Artwork): Promise<void> {
  const imagePath = artwork.image_path;

  if (
    imagePath &&
    !imagePath.startsWith("http://") &&
    !imagePath.startsWith("https://") &&
    !imagePath.startsWith("/")
  ) {
    const { error: storageError } = await supabase.storage
      .from(ARTWORK_IMAGE_BUCKET)
      .remove([imagePath]);

    if (storageError) throw storageError;
  }

  const { error } = await supabase
    .from("artworks")
    .delete()
    .eq("id", artwork.id);
  if (error) throw error;
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

export async function createArtworksFromImageFiles(
  userId: string,
  items: BulkImageImportInput[],
): Promise<BulkArtworkResult> {
  const artworks: Artwork[] = [];
  const failures: BulkArtworkFailure[] = [];

  for (const item of items) {
    try {
      const artwork = await createArtwork(
        userId,
        {
          title: titleFromFilename(item.file.name),
          artist: "",
          year: "",
          medium: "",
          width_cm: item.width_cm,
          height_cm: item.height_cm,
          status: "available",
          description: "",
          condition_notes: "",
        },
        item.file,
      );
      artworks.push(artwork);
    } catch (err) {
      failures.push({
        label: item.file.name,
        error: err instanceof Error ? err.message : "Upload failed",
      });
    }
  }

  return { artworks, failures };
}

export async function createArtworksFromCsvRows(
  userId: string,
  rows: CsvArtworkRow[],
): Promise<BulkArtworkResult> {
  const artworks: Artwork[] = [];
  const failures: BulkArtworkFailure[] = [];

  for (const row of rows) {
    const label = row.title.trim() || `Row ${row.rowNumber}`;

    try {
      const form = csvRowToFormData(row);
      const imageUrl = row.image_url.trim();
      let imageFile: File | null = null;
      let imagePathOverride: string | null = null;

      if (imageUrl) {
        imageFile = await fetchRemoteImageFile(imageUrl);
        if (!imageFile) {
          imagePathOverride = imageUrl;
        }
      }

      const artwork = await createArtwork(
        userId,
        form,
        imageFile,
        imagePathOverride,
      );
      artworks.push(artwork);
    } catch (err) {
      failures.push({
        label,
        error: err instanceof Error ? err.message : "Import failed",
      });
    }
  }

  return { artworks, failures };
}

export function getArtworkImageUrl(imagePath: string | null): string | null {
  if (!imagePath) return null;

  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("/") ||
    imagePath.startsWith("data:")
  ) {
    return imagePath;
  }

  const { data } = supabase.storage
    .from(ARTWORK_IMAGE_BUCKET)
    .getPublicUrl(imagePath);

  return data.publicUrl;
}
