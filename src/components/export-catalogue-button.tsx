import { useState } from "react";
import { FileDown } from "lucide-react";
import type { Artwork } from "@/types/artwork";
import type { Exhibition, PlacementWithArtwork, RoomTemplate } from "@/types";
import { Button } from "@/components/ui/button";

interface ExportCatalogueButtonProps {
  exhibition: Exhibition;
  placements: PlacementWithArtwork[];
  room: RoomTemplate;
  catalogueArtworks?: Artwork[];
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function ExportCatalogueButton({
  exhibition,
  placements,
  room,
  catalogueArtworks,
  variant = "outline",
  size = "default",
}: ExportCatalogueButtonProps) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setExporting(true);
    setError(null);
    try {
      const { exportExhibitionCataloguePdf } = await import(
        "@/lib/export-exhibition-catalogue"
      );
      await exportExhibitionCataloguePdf({
        exhibition,
        placements,
        room,
        catalogueArtworks,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        variant={variant}
        size={size}
        disabled={exporting || placements.length === 0}
        onClick={() => void handleExport()}
      >
        <FileDown className="size-4" />
        {exporting ? "Exporting…" : "Export catalogue (PDF)"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
