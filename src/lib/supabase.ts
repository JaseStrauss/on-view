import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase env vars missing. Copy .env.example to .env and add your project credentials.",
  );
}

export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder",
);

export const ARTWORK_BUCKET = "artwork-images";
export const ARTWORK_IMAGE_BUCKET = ARTWORK_BUCKET;

export function artworkImageUrl(path: string | null): string | null {
  if (!path) return null;
  const { data } = supabase.storage.from(ARTWORK_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
