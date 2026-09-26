import { Box, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CatalogueViewToggleProps {
  catalogueOnly: boolean;
  onChange: (catalogueOnly: boolean) => void;
  className?: string;
}

export function CatalogueViewToggle({
  catalogueOnly,
  onChange,
  className,
}: CatalogueViewToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex rounded-full border border-border bg-muted/40 p-1",
        className,
      )}
      role="group"
      aria-label="Exhibition view mode"
    >
      <Button
        type="button"
        size="sm"
        variant={!catalogueOnly ? "default" : "ghost"}
        className="rounded-full"
        onClick={() => onChange(false)}
        aria-pressed={!catalogueOnly}
      >
        <Box className="size-4" />
        3D gallery
      </Button>
      <Button
        type="button"
        size="sm"
        variant={catalogueOnly ? "default" : "ghost"}
        className="rounded-full"
        onClick={() => onChange(true)}
        aria-pressed={catalogueOnly}
      >
        <List className="size-4" />
        Catalogue only
      </Button>
    </div>
  );
}
