import { CatalogueLayoutToggle } from "@/components/gallery/catalogue/catalogue-layout-toggle";
import { CatalogueWorkEntry } from "@/components/gallery/catalogue/catalogue-work-entry";
import { CatalogueWorkGrid } from "@/components/gallery/catalogue/catalogue-work-grid";
import type { PublicCatalogueLayout } from "@/hooks/use-public-catalogue-layout";
import { cn } from "@/lib/utils";
import type { PlacementWithArtwork } from "@/types";

interface PublicShowCatalogueSectionProps {
  placements: PlacementWithArtwork[];
  layout: PublicCatalogueLayout;
  onLayoutChange: (layout: PublicCatalogueLayout) => void;
  selectedPlacementId: string | null;
  onSelectWork: (placementId: string) => void;
  onExpandWork: (placementId: string) => void;
}

export function PublicShowCatalogueSection({
  placements,
  layout,
  onLayoutChange,
  selectedPlacementId,
  onSelectWork,
  onExpandWork,
}: PublicShowCatalogueSectionProps) {
  if (placements.length === 0) return null;

  return (
    <section id="catalogue" className="px-6 py-16 md:py-24">
      <div
        className={cn(
          "mx-auto",
          layout === "grid" ? "max-w-6xl" : "max-w-4xl",
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
          <CatalogueLayoutToggle layout={layout} onChange={onLayoutChange} />
        </header>

        {layout === "grid" ? (
          <CatalogueWorkGrid
            placements={placements}
            selectedPlacementId={selectedPlacementId}
            onSelect={onSelectWork}
            onExpand={onExpandWork}
          />
        ) : (
          <div className="space-y-0">
            {placements.map((placement, index) => (
              <div
                key={placement.id}
                id={`work-${placement.id}`}
                className="scroll-mt-24"
              >
                <CatalogueWorkEntry
                  placement={placement}
                  index={index}
                  isSelected={selectedPlacementId === placement.id}
                  onSelect={() => onSelectWork(placement.id)}
                  onExpand={() => onExpandWork(placement.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
