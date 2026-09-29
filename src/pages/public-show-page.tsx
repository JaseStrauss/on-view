import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArtworkDetailBottomSheet } from "@/components/gallery/artwork-detail-bottom-sheet";
import { ArtworkDetailPanel } from "@/components/gallery/artwork-detail-panel";
import { ArtworkLightbox } from "@/components/gallery/artwork-lightbox";
import { CatalogueLayoutToggle } from "@/components/gallery/catalogue-layout-toggle";
import { CatalogueViewToggle } from "@/components/gallery/catalogue-view-toggle";
import { CatalogueWorkEntry } from "@/components/gallery/catalogue-work-entry";
import { CatalogueWorkGrid } from "@/components/gallery/catalogue-work-grid";
import {
  GALLERY_VIEWPORT_CLASS,
  LazyGalleryRoom,
} from "@/components/gallery/lazy-gallery-room";
import { PublicShowNav } from "@/components/gallery/public-show-nav";
import {
  PublicShowTapHint,
  usePublicShowTapHint,
} from "@/components/gallery/public-show-tap-hint";
import { ShareExhibitionButton } from "@/components/gallery/share-exhibition-button";
import { LazyExportCatalogueButton } from "@/components/lazy-export-catalogue-button";
import { DocumentMeta } from "@/components/document-meta";
import { PublicShowSkeleton } from "@/components/loading-skeletons";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCatalogueOnlyView } from "@/hooks/use-catalogue-only-view";
import { usePublicCatalogueLayout } from "@/hooks/use-public-catalogue-layout";
import { useMobile } from "@/hooks/use-mobile";
import {
  buildExhibitionShareMeta,
  type ExhibitionShareMeta,
} from "@/lib/exhibition-social-meta";
import { cn } from "@/lib/utils";
import {
  deriveExhibitionArtists,
  formatExhibitionDates,
  resolveFeaturingLine,
} from "@/lib/exhibition-details";
import { DEMO_SLUG } from "@/data/demo-exhibition";
import { fetchPublicExhibition } from "@/hooks/use-exhibitions";
import { parseExhibitionViewQuery } from "@/lib/exhibition-view-mode";
import { getRoomTemplate } from "@/rooms/templates";
import type { Artwork } from "@/types/artwork";
import type { Exhibition, PlacementWithArtwork } from "@/types";

function sortPlacements(placements: PlacementWithArtwork[]) {
  return [...placements].sort(
    (a, b) =>
      a.sort_order - b.sort_order ||
      a.created_at.localeCompare(b.created_at),
  );
}

export function PublicShowPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const viewOverride = parseExhibitionViewQuery(searchParams.get("view"));
  const isMobile = useMobile();
  const {
    catalogueOnly,
    setCatalogueOnly,
    defaultedToCatalogueOnly,
  } = useCatalogueOnlyView({
    slug,
    preferGalleryDefault: slug === DEMO_SLUG,
    viewOverride,
  });
  const { layout: catalogueLayout, setLayout: setCatalogueLayout } =
    usePublicCatalogueLayout();
  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [placements, setPlacements] = useState<PlacementWithArtwork[]>([]);
  const [catalogueArtworks, setCatalogueArtworks] = useState<Artwork[]>([]);
  const [presenterName, setPresenterName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [selectedPlacementId, setSelectedPlacementId] = useState<string | null>(
    null,
  );

  const sortedPlacements = useMemo(
    () => sortPlacements(placements),
    [placements],
  );

  const selectedPlacement = useMemo(
    () => sortedPlacements.find((p) => p.id === selectedPlacementId) ?? null,
    [sortedPlacements, selectedPlacementId],
  );

  const { showTapHint, dismissTapHint } = usePublicShowTapHint(
    !catalogueOnly && sortedPlacements.length > 0,
  );

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchPublicExhibition(slug).then((result) => {
      if (!result) {
        setNotFound(true);
      } else {
        setExhibition(result.exhibition);
        setPlacements(result.placements);
        setCatalogueArtworks(result.catalogueArtworks ?? []);
        setPresenterName(result.presenterName ?? null);
      }
      setLoading(false);
    });
  }, [slug]);

  useEffect(() => {
    if (!catalogueOnly || loading || sortedPlacements.length === 0) return;

    requestAnimationFrame(() => {
      document
        .getElementById("catalogue")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [catalogueOnly, loading, sortedPlacements.length]);

  useEffect(() => {
    if (selectedPlacementId) {
      dismissTapHint();
    }
  }, [selectedPlacementId, dismissTapHint]);

  const room = useMemo(
    () => getRoomTemplate(exhibition?.room_template_id ?? "white-cube"),
    [exhibition?.room_template_id],
  );

  const exhibitionDates = exhibition
    ? formatExhibitionDates(exhibition.opens_at, exhibition.closes_at)
    : null;

  const featuringLine = exhibition
    ? resolveFeaturingLine(
      exhibition,
      deriveExhibitionArtists(
        catalogueArtworks,
        placements,
        catalogueArtworks.length > 0,
      ),
    )
    : null;

  function selectPlacement(placementId: string | null) {
    setSelectedPlacementId(placementId);
  }

  function openLightboxForPlacement(placementId: string) {
    const index = sortedPlacements.findIndex((p) => p.id === placementId);
    if (index >= 0) {
      setSelectedPlacementId(placementId);
      setLightboxIndex(index);
    }
  }

  function focusCatalogueEntry(placementId: string) {
    selectPlacement(placementId);
    document
      .getElementById(`work-${placementId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function focusVirtualView(placementId: string) {
    if (catalogueOnly) {
      focusCatalogueEntry(placementId);
      return;
    }

    selectPlacement(placementId);
    document
      .getElementById("virtual-view")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleCatalogueOnlyChange(next: boolean) {
    setCatalogueOnly(next);
    if (next) {
      selectPlacement(null);
    }
  }

  const shareMeta = useMemo<ExhibitionShareMeta | null>(() => {
    if (!exhibition) return null;

    return buildExhibitionShareMeta({
      exhibition,
      placements: sortedPlacements,
      catalogueArtworks,
      presenterName,
      origin: window.location.origin,
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    });
  }, [
    exhibition,
    sortedPlacements,
    catalogueArtworks,
    presenterName,
  ]);

  function handleCatalogueWorkSelect(placementId: string) {
    if (catalogueOnly) {
      focusCatalogueEntry(placementId);
      return;
    }
    focusVirtualView(placementId);
  }

  const catalogueSection =
    sortedPlacements.length > 0 ? (
      <section id="catalogue" className="px-6 py-16 md:py-24">
        <div
          className={cn(
            "mx-auto",
            catalogueLayout === "grid" ? "max-w-6xl" : "max-w-4xl",
          )}
        >
          <header
            className={cn(
              "mb-16 border-b border-border/60 pb-8 md:mb-24",
              "flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between",
            )}
          >
            <div>
              <h2 className="font-sans text-xs uppercase tracking-[0.35em] text-muted-foreground">
                Works on view
              </h2>
              <p className="mt-4 font-serif text-2xl italic md:text-3xl">
                Catalogue
              </p>
            </div>
            <CatalogueLayoutToggle
              layout={catalogueLayout}
              onChange={setCatalogueLayout}
            />
          </header>

          {catalogueLayout === "grid" ? (
            <CatalogueWorkGrid
              placements={sortedPlacements}
              selectedPlacementId={selectedPlacementId}
              onSelect={handleCatalogueWorkSelect}
              onExpand={openLightboxForPlacement}
            />
          ) : (
            <div className="space-y-0">
              {sortedPlacements.map((placement, index) => (
                <div
                  key={placement.id}
                  id={`work-${placement.id}`}
                  className="scroll-mt-24"
                >
                  <CatalogueWorkEntry
                    placement={placement}
                    index={index}
                    isSelected={selectedPlacementId === placement.id}
                    onSelect={() => handleCatalogueWorkSelect(placement.id)}
                    onExpand={() => openLightboxForPlacement(placement.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    ) : null;

  const virtualViewSection = !catalogueOnly ? (
    <section
      id="virtual-view"
      className="border-b border-border/60 bg-muted/20 px-6 py-14 md:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h2 className="font-sans text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Virtual view
          </h2>
          <p className="mt-3 font-sans text-sm text-muted-foreground">
            <span className="md:hidden">Tap a work for details</span>
            <span className="hidden md:inline">
              Click a work for details in the side panel · expand the image for
              full screen
            </span>
          </p>
        </div>
        <div
          className={cn(
            "flex flex-col gap-4",
            selectedPlacement && "md:flex-row md:items-stretch",
          )}
        >
          <div className="relative w-full min-w-0">
            <LazyGalleryRoom
              room={room}
              placements={placements}
              className={cn("w-full", GALLERY_VIEWPORT_CLASS)}
              selectedPlacementId={selectedPlacementId}
              onSelectPlacement={selectPlacement}
              showWallPresets
            />
            <PublicShowTapHint
              visible={showTapHint && !selectedPlacementId}
              onDismiss={dismissTapHint}
            />
          </div>
          <ArtworkDetailPanel
            placement={selectedPlacement}
            onClose={() => selectPlacement(null)}
            onExpand={
              selectedPlacement
                ? () => openLightboxForPlacement(selectedPlacement.id)
                : undefined
            }
          />
        </div>
      </div>
    </section>
  ) : null;

  if (loading) {
    return <PublicShowSkeleton />;
  }

  if (notFound || !exhibition) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <p className="font-serif text-xl">This exhibition is not available.</p>
        <Link
          to="/"
          className="mt-6 text-sm uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
        >
          On View
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DocumentMeta meta={shareMeta} />
      <ArtworkLightbox
        placements={sortedPlacements}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onIndexChange={setLightboxIndex}
      />

      <ArtworkDetailBottomSheet
        placement={selectedPlacement}
        open={isMobile && selectedPlacement !== null && !catalogueOnly}
        onClose={() => selectPlacement(null)}
        onExpand={
          selectedPlacement
            ? () => openLightboxForPlacement(selectedPlacement.id)
            : undefined
        }
      />

      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
          <Link
            to="/"
            className="font-sans text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground"
          >
            On View
          </Link>
          <div className="flex items-center gap-1">
            <ShareExhibitionButton slug={exhibition.slug} title={exhibition.title} />
            <LazyExportCatalogueButton
              exhibition={exhibition}
              placements={placements}
              room={room}
              catalogueArtworks={catalogueArtworks}
              variant="ghost"
              size="sm"
            />
            <ThemeToggle />
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-6 pb-16 pt-6 text-center md:pb-24 md:pt-10">
          <p className="font-sans text-xs uppercase tracking-[0.35em] text-muted-foreground">
            Exhibition
          </p>
          <h1 className="mt-5 font-serif text-4xl leading-[1.1] md:text-6xl md:leading-[1.05]">
            {exhibition.title}
          </h1>
          {presenterName && (
            <p className="mt-5 font-sans text-sm tracking-wide text-muted-foreground md:text-base">
              Presented by{" "}
              <span className="text-foreground/90">{presenterName}</span>
            </p>
          )}
          {exhibitionDates && (
            <p className="mt-5 font-sans text-sm tracking-wide text-muted-foreground">
              {exhibitionDates}
            </p>
          )}
          {featuringLine && (
            <p className="mt-4 font-sans text-sm tracking-wide text-foreground/80 md:text-base">
              {featuringLine}
            </p>
          )}
          {exhibition.description && (
            <p className="mx-auto mt-8 max-w-xl whitespace-pre-line font-sans text-base leading-relaxed text-muted-foreground md:text-lg">
              {exhibition.description}
            </p>
          )}
          <p className="mt-8 font-sans text-xs text-muted-foreground">
            {room.name} · {sortedPlacements.length} work
            {sortedPlacements.length === 1 ? "" : "s"}
          </p>

          <div className="mt-8 flex flex-col items-center gap-3">
            <CatalogueViewToggle
              catalogueOnly={catalogueOnly}
              onChange={handleCatalogueOnlyChange}
            />
            {catalogueOnly && defaultedToCatalogueOnly && (
              <p className="max-w-md text-xs text-muted-foreground">
                Showing catalogue only for easier reading on this device. Switch
                to 3D gallery anytime.
              </p>
            )}
          </div>
        </div>
      </header>

      <PublicShowNav
        placements={sortedPlacements}
        showVirtualView={!catalogueOnly}
      />

      {catalogueOnly ? (
        <>
          {catalogueSection}
          {virtualViewSection}
        </>
      ) : (
        <>
          {virtualViewSection}
          {catalogueSection}
        </>
      )}

      <footer className="border-t border-border/60 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <p className="font-sans text-xs uppercase tracking-[0.25em] text-muted-foreground">
            On View
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
          >
            Back to top
          </button>
        </div>
      </footer>
    </div>
  );
}
