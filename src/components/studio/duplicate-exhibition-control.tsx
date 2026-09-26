import { useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Exhibition } from "@/types";

interface DuplicateExhibitionControlProps {
  exhibitionId: string;
  exhibitionTitle: string;
  onDuplicate: (id: string) => Promise<Exhibition>;
  onDuplicated?: (exhibition: Exhibition) => void;
  variant?: "icon" | "section";
  className?: string;
}

export function DuplicateExhibitionControl({
  exhibitionId,
  exhibitionTitle,
  onDuplicate,
  onDuplicated,
  variant = "icon",
  className,
}: DuplicateExhibitionControlProps) {
  const [duplicating, setDuplicating] = useState(false);

  async function handleDuplicate() {
    setDuplicating(true);
    try {
      const copy = await onDuplicate(exhibitionId);
      toast.success(`"${copy.title}" saved as draft`);
      onDuplicated?.(copy);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not duplicate exhibition",
      );
    } finally {
      setDuplicating(false);
    }
  }

  if (variant === "icon") {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className={cn("text-muted-foreground hover:text-foreground", className)}
        disabled={duplicating}
        onClick={() => void handleDuplicate()}
        aria-label={`Duplicate ${exhibitionTitle}`}
      >
        <Copy className="size-4" />
      </Button>
    );
  }

  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-muted/20 p-5",
        className,
      )}
    >
      <h2 className="font-medium">Duplicate exhibition</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Create a draft copy of{" "}
        <span className="font-medium text-foreground">{exhibitionTitle}</span>{" "}
        with the same gallery space, catalogue, and wall hang.
      </p>
      <Button
        type="button"
        variant="outline"
        className="mt-4"
        disabled={duplicating}
        onClick={() => void handleDuplicate()}
      >
        <Copy className="size-4" />
        {duplicating ? "Duplicating…" : "Duplicate as draft"}
      </Button>
    </section>
  );
}
