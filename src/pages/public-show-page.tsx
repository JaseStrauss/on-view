import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArtworkDetailBottomSheet } from "@/components/gallery/artwork/artwork-detail-bottom-sheet";
import { ArtworkLightbox } from "@/components/gallery/artwork/artwork-lightbox";
import { PublicShowCatalogueSection } from "@/components/gallery/public-show/public-show-catalogue-section";
import { PublicShowHeader } from "@/components/gallery/public-show/public-show-header";
import { PublicShowNav } from "@/components/gallery/public-show/public-show-nav";
import { PublicShowVirtualViewSection } from "@/components/gallery/public-show/public-show-virtual-view-section";
import { DocumentMeta } from "@/components/document-meta";
import { PublicShowSkeleton } from "@/components/loading-skeletons";
import { useCatalogueOnlyView } from "@/hooks/use-catalogue-only-view";
import { useMobile } from "@/hooks/use-mobile";
import { usePublicCatalogueLayout } from "@/hooks/use-public-catalogue-layout";
import { usePublicShowExhibition } from "@/hooks/use-public-show-exhibition";
import { usePublicShowWorkSelection } from "@/hooks/use-public-show-work-selection";
import { DEMO_SLUG } from "@/data/demo-exhibition";
import { parseExhibitionViewQuery } from "@/lib/exhibition/view-mode";

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

  const {
    loading,
    notFound,
    exhibition,
    placements,
    catalogueArtworks,
    presenterName,
    sortedPlacements,
    room,
    exhibitionDates,
    featuringLine,
    shareMeta,
  } = usePublicShowExhibition(slug);

  const {
    lightboxIndex,
    setLightboxIndex,
    selectedPlacementId,
    selectedPlacement,
    selectPlacement,
    openLightboxForPlacement,
    handleCatalogueOnlyChange,
    handleCatalogueWorkSelect,
  } = usePublicShowWorkSelection({
    sortedPlacements,
    catalogueOnly,
    setCatalogueOnly,
    loading,
  });

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

  const catalogueSection = (
    <PublicShowCatalogueSection
      placements={sortedPlacements}
      layout={catalogueLayout}
      onLayoutChange={setCatalogueLayout}
      selectedPlacementId={selectedPlacementId}
      onSelectWork={handleCatalogueWorkSelect}
      onExpandWork={openLightboxForPlacement}
    />
  );

  const virtualViewSection = !catalogueOnly ? (
    <PublicShowVirtualViewSection
      room={room}
      placements={placements}
      selectedPlacement={selectedPlacement}
      selectedPlacementId={selectedPlacementId}
      isMobile={isMobile}
      onSelectPlacement={selectPlacement}
      onExpandPlacement={openLightboxForPlacement}
    />
  ) : null;

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

      <PublicShowHeader
        exhibition={exhibition}
        placements={placements}
        catalogueArtworks={catalogueArtworks}
        room={room}
        presenterName={presenterName}
        exhibitionDates={exhibitionDates}
        featuringLine={featuringLine}
        workCount={sortedPlacements.length}
        catalogueOnly={catalogueOnly}
        defaultedToCatalogueOnly={defaultedToCatalogueOnly}
        onCatalogueOnlyChange={handleCatalogueOnlyChange}
      />

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
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
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
