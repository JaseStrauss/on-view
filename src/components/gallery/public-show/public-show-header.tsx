import { Link } from "react-router-dom";
import { CatalogueViewToggle } from "@/components/gallery/catalogue/catalogue-view-toggle";
import { ShareExhibitionButton } from "@/components/gallery/public-show/share-exhibition-button";
import { LazyExportCatalogueButton } from "@/components/lazy-export-catalogue-button";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Artwork } from "@/types/artwork";
import type { Exhibition, PlacementWithArtwork, RoomTemplate } from "@/types";

interface PublicShowHeaderProps {
  exhibition: Exhibition;
  placements: PlacementWithArtwork[];
  catalogueArtworks: Artwork[];
  room: RoomTemplate;
  presenterName: string | null;
  exhibitionDates: string | null;
  featuringLine: string | null;
  workCount: number;
  catalogueOnly: boolean;
  defaultedToCatalogueOnly: boolean;
  onCatalogueOnlyChange: (catalogueOnly: boolean) => void;
}

export function PublicShowHeader({
  exhibition,
  placements,
  catalogueArtworks,
  room,
  presenterName,
  exhibitionDates,
  featuringLine,
  workCount,
  catalogueOnly,
  defaultedToCatalogueOnly,
  onCatalogueOnlyChange,
}: PublicShowHeaderProps) {
  return (
    <header className="border-b border-border/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
        <Link
          to="/"
          className="font-sans text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground"
        >
          On View
        </Link>
        <div className="flex items-center gap-1">
          <ShareExhibitionButton
            slug={exhibition.slug}
            title={exhibition.title}
          />
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
          {room.name} · {workCount} work
          {workCount === 1 ? "" : "s"}
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          <CatalogueViewToggle
            catalogueOnly={catalogueOnly}
            onChange={onCatalogueOnlyChange}
          />
          {catalogueOnly && defaultedToCatalogueOnly && (
            <p className="max-w-md text-xs text-muted-foreground">
              Showing catalogue only for easier reading on this device. Switch to
              3D gallery anytime.
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
