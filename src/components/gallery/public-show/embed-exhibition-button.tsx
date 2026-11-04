import { useEffect, useRef, useState } from "react";
import { Code2, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  buildExhibitionEmbedIframeHtml,
  getPublicExhibitionEmbedUrl,
} from "@/lib/exhibition/embed";
import { cn } from "@/lib/utils";

interface EmbedExhibitionButtonProps {
  slug: string;
  title: string;
  disabled?: boolean;
  disabledHint?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function EmbedExhibitionButton({
  slug,
  title,
  disabled = false,
  disabledHint = "Open your exhibition first to get embed code.",
  variant = "outline",
  size = "sm",
}: EmbedExhibitionButtonProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"gallery" | "catalogue">("gallery");
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      return;
    }
    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const embedUrl = getPublicExhibitionEmbedUrl(slug, { view });
  const iframeHtml = buildExhibitionEmbedIframeHtml(slug, title, { view });

  async function copyText(value: string, successMessage: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(successMessage);
    } catch {
      toast.error("Could not copy. Select the text and copy manually.");
    }
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        disabled={disabled}
        title={disabled ? disabledHint : undefined}
        onClick={() => {
          if (disabled) {
            toast(disabledHint);
            return;
          }
          setOpen(true);
        }}
      >
        <Code2 className="size-4" />
        Embed
      </Button>

      <dialog
        ref={dialogRef}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,32rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-background p-0 text-foreground shadow-xl backdrop:bg-black/50",
        )}
        onClose={() => setOpen(false)}
        aria-labelledby="embed-exhibition-title"
      >
        <form method="dialog" className="flex max-h-[min(85vh,640px)] flex-col">
          <div className="border-b border-border px-5 py-4">
            <h2 id="embed-exhibition-title" className="font-serif text-lg italic">
              Embed this exhibition
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Paste the iframe on your website. Visitors stay on your page.
            </p>
          </div>

          <div className="space-y-5 overflow-y-auto px-5 py-5">
            <div className="space-y-2">
              <Label htmlFor="embed-view-mode">Default view</Label>
              <select
                id="embed-view-mode"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                value={view}
                onChange={(event) =>
                  setView(event.target.value as "gallery" | "catalogue")
                }
              >
                <option value="gallery">3D gallery + catalogue</option>
                <option value="catalogue">Catalogue only</option>
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="embed-iframe-snippet">Iframe code</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    void copyText(iframeHtml, "Embed code copied")
                  }
                >
                  <Copy className="size-4" />
                  Copy code
                </Button>
              </div>
              <textarea
                id="embed-iframe-snippet"
                readOnly
                rows={5}
                value={iframeHtml}
                className="w-full rounded-md border border-input bg-muted/30 px-3 py-2 font-mono text-xs leading-relaxed"
                onFocus={(event) => event.target.select()}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="embed-url">Embed URL only</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => void copyText(embedUrl, "Embed URL copied")}
                >
                  <Copy className="size-4" />
                  Copy URL
                </Button>
              </div>
              <InputLikeMonospace id="embed-url" value={embedUrl} />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
            <Button type="submit" variant="outline">
              Close
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}

function InputLikeMonospace({ id, value }: { id: string; value: string }) {
  return (
    <input
      id={id}
      readOnly
      value={value}
      className="flex h-9 w-full rounded-md border border-input bg-muted/30 px-3 font-mono text-xs"
      onFocus={(event) => event.target.select()}
    />
  );
}
