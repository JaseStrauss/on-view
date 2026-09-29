import { supabase } from "@/lib/supabase";
import type { Exhibition } from "@/types";

const dismissKey = (userId: string) => `on-view-onboarding-dismissed-${userId}`;

export interface StudioOnboardingProgress {
  hasArtworks: boolean;
  hasExhibition: boolean;
  hasPlacements: boolean;
  hasPublishedExhibition: boolean;
}

export function isOnboardingDismissed(userId: string): boolean {
  return localStorage.getItem(dismissKey(userId)) === "1";
}

export function dismissOnboarding(userId: string): void {
  localStorage.setItem(dismissKey(userId), "1");
}

export function isOnboardingComplete(
  progress: StudioOnboardingProgress,
): boolean {
  return (
    progress.hasArtworks &&
    progress.hasExhibition &&
    progress.hasPlacements &&
    progress.hasPublishedExhibition
  );
}

export async function fetchUserHasPlacements(
  exhibitionIds: string[],
): Promise<boolean> {
  if (exhibitionIds.length === 0) return false;

  const { count, error } = await supabase
    .from("placements")
    .select("*", { count: "exact", head: true })
    .in("exhibition_id", exhibitionIds);

  if (error) throw error;
  return (count ?? 0) > 0;
}

export function buildOnboardingProgress(
  artworkCount: number,
  exhibitions: Exhibition[],
  hasPlacements: boolean,
): StudioOnboardingProgress {
  return {
    hasArtworks: artworkCount > 0,
    hasExhibition: exhibitions.length > 0,
    hasPlacements,
    hasPublishedExhibition: exhibitions.some(
      (exhibition) => exhibition.is_published,
    ),
  };
}

export function getPrimaryExhibitionId(
  exhibitions: Exhibition[],
): string | null {
  return exhibitions[0]?.id ?? null;
}

export function getPublishTargetExhibitionId(
  exhibitions: Exhibition[],
): string | null {
  const draft = exhibitions.find((exhibition) => !exhibition.is_published);
  return draft?.id ?? exhibitions[0]?.id ?? null;
}
