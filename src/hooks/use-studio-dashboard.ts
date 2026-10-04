import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchArtworks } from "@/services/artworks";
import { seedDemoForUser } from "@/services/demo";
import {
  buildOnboardingProgress,
  fetchUserHasPlacements,
  isOnboardingComplete,
  isOnboardingDismissed,
} from "@/lib/studio-onboarding";
import type { Artwork } from "@/types/artwork";
import type { Exhibition } from "@/types";

interface UseStudioDashboardOptions {
  userId: string | undefined;
  exhibitions: Exhibition[];
  exhibitionsLoading: boolean;
  refreshExhibitions: () => Promise<void>;
}

export function useStudioDashboard({
  userId,
  exhibitions,
  exhibitionsLoading,
  refreshExhibitions,
}: UseStudioDashboardOptions) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seedingDemo, setSeedingDemo] = useState(false);
  const [hasPlacements, setHasPlacements] = useState(false);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const [showExhibitionForm, setShowExhibitionForm] = useState(false);

  async function loadStudioData() {
    const nextArtworks = await fetchArtworks();
    setArtworks(nextArtworks);
    return nextArtworks;
  }

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function initStudio(activeUserId: string) {
      setLoading(true);
      setError(null);

      try {
        const nextArtworks = await loadStudioData();

        if (
          !cancelled &&
          nextArtworks.length === 0 &&
          !exhibitionsLoading &&
          exhibitions.length === 0
        ) {
          setSeedingDemo(true);
          await seedDemoForUser(activeUserId);
          await loadStudioData();
          await refreshExhibitions();
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load exhibitions",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setSeedingDemo(false);
        }
      }
    }

    if (!exhibitionsLoading) {
      void initStudio(userId);
    }

    return () => {
      cancelled = true;
    };
  }, [userId, exhibitionsLoading, exhibitions.length, refreshExhibitions]);

  useEffect(() => {
    if (!userId) return;
    setOnboardingDismissed(isOnboardingDismissed(userId));
  }, [userId]);

  useEffect(() => {
    if (searchParams.get("new-exhibition") !== "1") return;
    setShowExhibitionForm(true);
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (exhibitionsLoading || exhibitions.length === 0) {
      setHasPlacements(false);
      return;
    }

    let cancelled = false;

    fetchUserHasPlacements(exhibitions.map((exhibition) => exhibition.id))
      .then((result) => {
        if (!cancelled) setHasPlacements(result);
      })
      .catch(() => {
        if (!cancelled) setHasPlacements(false);
      });

    return () => {
      cancelled = true;
    };
  }, [exhibitions, exhibitionsLoading]);

  const onboardingProgress = useMemo(
    () => buildOnboardingProgress(artworks.length, exhibitions, hasPlacements),
    [artworks.length, exhibitions, hasPlacements],
  );

  const showOnboardingChecklist =
    Boolean(userId) &&
    !onboardingDismissed &&
    !isOnboardingComplete(onboardingProgress) &&
    !loading &&
    !exhibitionsLoading &&
    !seedingDemo;

  return {
    artworks,
    setArtworks,
    loading,
    error,
    seedingDemo,
    hasPlacements,
    onboardingDismissed,
    setOnboardingDismissed,
    showExhibitionForm,
    setShowExhibitionForm,
    onboardingProgress,
    showOnboardingChecklist,
  };
}
