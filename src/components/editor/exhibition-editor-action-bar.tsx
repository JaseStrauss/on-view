import { Link } from "react-router-dom";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { LazyExportCatalogueButton } from "@/components/lazy-export-catalogue-button";
import { Button } from "@/components/ui/button";
import { copyPublicExhibitionLink } from "@/lib/copy-to-clipboard";
import type { Exhibition, PlacementWithArtwork, RoomTemplate } from "@/types";
import type { Artwork } from "@/types/artwork";

interface ExhibitionEditorActionBarProps {
  exhibition: Exhibition;
  placements: PlacementWithArtwork[];
  room: RoomTemplate;
  catalogueArtworks: Artwork[];
  publishing: boolean;
  onPublish: () => void;
  onPreview: () => void;
  /** Base path for studio links (e.g. `/studio/demo` in the demo builder). */
  studioBasePath?: string;
}

export function ExhibitionEditorActionBar({
  exhibition,
  placements,
  room,
  catalogueArtworks,
  publishing,
  onPublish,
  onPreview,
  studioBasePath = "/studio",
}: ExhibitionEditorActionBarProps) {
  function handleCopyLink() {
    if (!exhibition.is_published) {
      toast("Open your exhibition first to get a shareable link", {
        description:
          "Visitors can only view your show after you open the exhibition.",
      });
      return;
    }

    void copyPublicExhibitionLink(exhibition.slug);
  }

  return (
    <div className="sticky top-0 z-30 -mx-6 border-b border-border/60 bg-background/95 px-6 py-3 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={exhibition.is_published ? "outline" : "default"}
          onClick={onPublish}
          disabled={publishing}
        >
          {publishing
            ? "Saving…"
            : exhibition.is_published
              ? "Close exhibition"
              : "Open exhibition"}
        </Button>

        <Button variant="outline" onClick={handleCopyLink}>
          <Copy className="size-4" />
          Copy link
        </Button>

        <Button variant="outline" onClick={onPreview}>
          <ExternalLink className="size-4" />
          Preview
        </Button>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            render={
              <Link
                to={`${studioBasePath}/artworks/new?exhibition=${exhibition.id}`}
              />
            }
          >
            Add artwork
          </Button>
          <Button
            variant="ghost"
            size="sm"
            render={
              <Link
                to={`${studioBasePath}/artworks/bulk?exhibition=${exhibition.id}`}
              />
            }
          >
            Bulk import
          </Button>
          <LazyExportCatalogueButton
            exhibition={exhibition}
            placements={placements}
            room={room}
            catalogueArtworks={catalogueArtworks}
            variant="ghost"
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}
