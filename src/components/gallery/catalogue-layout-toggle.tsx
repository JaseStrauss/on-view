import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PublicCatalogueLayout } from "@/hooks/use-public-catalogue-layout";

interface CatalogueLayoutToggleProps {
  layout: PublicCatalogueLayout;
  onChange: (layout: PublicCatalogueLayout) => void;
  className?: string;
}

export function CatalogueLayoutToggle({
  layout,
  onChange,
  className,
}: CatalogueLayoutToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex rounded-full border border-border bg-muted/40 p-1",
        className,
      )}
      role="group"
      aria-label="Catalogue layout"
    >
      <Button
        type="button"
        size="sm"
        variant={layout === "list" ? "default" : "ghost"}
        className="rounded-full"
        onClick={() => onChange("list")}
        aria-pressed={layout === "list"}
      >
        <List className="size-4" />
        List
      </Button>
      <Button
        type="button"
        size="sm"
        variant={layout === "grid" ? "default" : "ghost"}
        className="rounded-full"
        onClick={() => onChange("grid")}
        aria-pressed={layout === "grid"}
      >
        <LayoutGrid className="size-4" />
        Grid
      </Button>
    </div>
  );
}
