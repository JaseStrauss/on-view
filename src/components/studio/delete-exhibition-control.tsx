import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DeleteExhibitionControlProps {
  exhibitionId: string;
  exhibitionTitle: string;
  onDelete: (id: string) => Promise<void>;
  onDeleted?: () => void;
  variant?: "icon" | "section";
  className?: string;
}

export function DeleteExhibitionControl({
  exhibitionId,
  exhibitionTitle,
  onDelete,
  onDeleted,
  variant = "section",
  className,
}: DeleteExhibitionControlProps) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await onDelete(exhibitionId);
      toast.success(`"${exhibitionTitle}" deleted`);
      onDeleted?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not delete exhibition",
      );
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (variant === "icon") {
    if (confirming) {
      return (
        <div className={cn("flex flex-wrap items-center gap-2", className)}>
          <span className="text-xs text-muted-foreground">Delete?</span>
          <Button
            type="button"
            variant="destructive"
            size="xs"
            disabled={deleting}
            onClick={handleDelete}
          >
            {deleting ? "Deleting…" : "Yes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="xs"
            disabled={deleting}
            onClick={() => setConfirming(false)}
          >
            No
          </Button>
        </div>
      );
    }

    return (
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className={cn("text-muted-foreground hover:text-destructive", className)}
        onClick={() => setConfirming(true)}
        aria-label={`Delete ${exhibitionTitle}`}
      >
        <Trash2 className="size-4" />
      </Button>
    );
  }

  return (
    <section
      className={cn(
        "rounded-xl border border-destructive/20 bg-destructive/5 p-5",
        className,
      )}
    >
      <h2 className="font-medium text-destructive">Delete exhibition</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Permanently remove{" "}
        <span className="font-medium text-foreground">{exhibitionTitle}</span>.
        Works hung on the walls and catalogue links for this show will be
        removed. Your artworks stay in your catalogue.
      </p>

      {confirming ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="destructive"
            disabled={deleting}
            onClick={handleDelete}
          >
            {deleting ? "Deleting…" : "Confirm delete"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={deleting}
            onClick={() => setConfirming(false)}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="mt-4 text-destructive hover:text-destructive"
          onClick={() => setConfirming(true)}
        >
          <Trash2 className="size-4" />
          Delete exhibition
        </Button>
      )}
    </section>
  );
}
