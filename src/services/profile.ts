import { supabase } from "@/lib/supabase";
import type { Profile, ProfileFormData } from "@/types/profile";

export function resolvePresenterName(
  profile: Pick<Profile, "studio_name" | "display_name"> | null,
): string | null {
  if (!profile) return null;

  const studioName = profile.studio_name?.trim();
  if (studioName) return studioName;

  const displayName = profile.display_name?.trim();
  if (displayName) return displayName;

  return null;
}

export async function fetchPublicPresenterName(
  userId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("studio_name, display_name")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return resolvePresenterName(data);
}

export async function fetchProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;

  if (data) return data;

  const { data: created, error: createError } = await supabase
    .from("profiles")
    .insert({ id: userId })
    .select("*")
    .single();

  if (createError) throw createError;
  return created;
}

export async function updateProfile(
  userId: string,
  form: ProfileFormData,
): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      display_name: form.display_name.trim() || null,
      studio_name: form.studio_name.trim() || null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function updatePassword(
  newPassword: string,
): Promise<string | null> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return error?.message ?? null;
}
