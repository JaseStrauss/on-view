import { type FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { DeleteArtworkControl } from "@/components/studio/delete-artwork-control";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ARTWORK_STATUS_OPTIONS,
  artworkToFormData,
  formatArtworkStatus,
} from "@/lib/artwork/form";
import { cn } from "@/lib/utils";
import { getArtworkImageUrl, updateArtwork } from "@/services/artworks";
import type { Artwork, ArtworkFormData, ArtworkStatus } from "@/types/artwork";

interface ArtworkDetailSheetProps {
  artwork: Artwork | null;
  open: boolean;
  onClose: () => void;
  onUpdated: (artwork: Artwork) => void;
  onDeleted: (artworkId: string) => void;
  readOnly?: boolean;
}

export function ArtworkDetailSheet({
  artwork,
  open,
  onClose,
  onUpdated,
  onDeleted,
  readOnly = false,
}: ArtworkDetailSheetProps) {
  const [form, setForm] = useState<ArtworkFormData | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!artwork) {
      setForm(null);
      return;
    }

    setForm(artworkToFormData(artwork));
    setError(null);
  }, [artwork]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || !artwork || !form) return null;

  const activeArtwork = artwork;
  const activeForm = form;
  const imageUrl = getArtworkImageUrl(activeArtwork.image_path);

  function updateField<K extends keyof ArtworkFormData>(
    key: K,
    value: ArtworkFormData[K],
  ) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!activeForm.title.trim()) return;

    setSaving(true);
    setError(null);

    try {
      const updated = await updateArtwork(activeArtwork.id, activeForm);
      onUpdated(updated);
      toast.success(`"${updated.title}" updated`);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save artwork");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50"
        aria-hidden
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-background shadow-xl",
          "animate-in slide-in-from-right duration-200",
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="artwork-sheet-title"
      >
        <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Catalogue entry
            </p>
            <h2
              id="artwork-sheet-title"
              className="mt-1 font-serif text-2xl italic"
            >
              {readOnly ? "Artwork details" : "Edit artwork"}
            </h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close artwork details"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {imageUrl ? (
            <div className="mb-5 overflow-hidden rounded-xl border bg-muted/40">
              <img
                src={imageUrl}
                alt={activeArtwork.title}
                className="mx-auto max-h-56 w-full object-contain"
              />
            </div>
          ) : (
            <div className="mb-5 flex h-40 items-center justify-center rounded-xl border border-dashed bg-muted/30 text-sm text-muted-foreground">
              No image
            </div>
          )}

          <form id="artwork-edit-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={activeForm.title}
                onChange={(e) => updateField("title", e.target.value)}
                required
                readOnly={readOnly}
                disabled={readOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-artist">Artist</Label>
              <Input
                id="edit-artist"
                value={activeForm.artist}
                onChange={(e) => updateField("artist", e.target.value)}
                readOnly={readOnly}
                disabled={readOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-medium">Medium</Label>
              <Input
                id="edit-medium"
                value={activeForm.medium}
                onChange={(e) => updateField("medium", e.target.value)}
                placeholder="Oil on canvas"
                readOnly={readOnly}
                disabled={readOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              {readOnly ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {activeForm.description.trim() || "No description yet."}
                </p>
              ) : (
                <Textarea
                  id="edit-description"
                  value={activeForm.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="A short note for visitors and collectors…"
                  rows={4}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              {readOnly ? (
                <p className="text-sm">{formatArtworkStatus(activeForm.status)}</p>
              ) : (
                <Select
                  value={activeForm.status}
                  onValueChange={(value) =>
                    updateField("status", value as ArtworkStatus)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {formatArtworkStatus(activeForm.status)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {ARTWORK_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </form>

          {!readOnly && (
            <DeleteArtworkControl
              className="mt-8"
              artwork={activeArtwork}
              onDeleted={(artworkId) => {
                onDeleted(artworkId);
                onClose();
              }}
            />
          )}
        </div>

        <div className="flex gap-2 border-t px-5 py-4">
          {readOnly ? (
            <Button type="button" className="flex-1" onClick={onClose}>
              Close
            </Button>
          ) : (
            <>
              <Button
                type="submit"
                form="artwork-edit-form"
                disabled={saving}
                className="flex-1"
              >
                {saving ? "Saving…" : "Save changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={onClose}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
