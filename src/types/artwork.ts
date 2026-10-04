export type ArtworkStatus = "available" | "sold" | "on_loan" | "reserved";

export interface Artwork {
  id: string;
  user_id: string;
  title: string;
  artist: string;
  year: number | null;
  medium: string | null;
  width_cm: number;
  height_cm: number;
  status: ArtworkStatus;
  description: string | null;
  condition_notes: string | null;
  image_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArtworkFormData {
  title: string;
  artist: string;
  year: string;
  medium: string;
  width_cm: string;
  height_cm: string;
  status: ArtworkStatus;
  description: string;
  condition_notes: string;
}
