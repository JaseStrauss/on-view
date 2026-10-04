import { Upload, X } from "lucide-react";
import type { SelectedBulkImage } from "@/hooks/use-bulk-image-import";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface BulkImportImagesPanelProps {
  selectedImages: SelectedBulkImage[];
  dragActive: boolean;
  setDragActive: (active: boolean) => void;
  onAddFiles: (files: FileList | File[]) => void;
  onRemoveImage: (id: string) => void;
  onUpdateDimensions: (
    id: string,
    field: "width_cm" | "height_cm",
    value: string,
  ) => void;
  maxImageCount: number;
  demoMode?: boolean;
}

export function BulkImportImagesPanel({
  selectedImages,
  dragActive,
  setDragActive,
  onAddFiles,
  onRemoveImage,
  onUpdateDimensions,
  maxImageCount,
  demoMode = false,
}: BulkImportImagesPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload images</CardTitle>
        <CardDescription>
          Drop up to {maxImageCount} images. Each file becomes a catalogue entry
          titled from the filename. Enter width and height (cm) for each work so
          wall and 3D previews match.
          {demoMode && " Images must be under 3 MB each in the demo."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div
          className={cn(
            "rounded-xl border border-dashed p-8 text-center transition-colors",
            dragActive
              ? "border-primary bg-primary/5"
              : "border-border bg-muted/20",
          )}
          onDragEnter={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setDragActive(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragActive(false);
            if (event.dataTransfer.files.length > 0) {
              onAddFiles(event.dataTransfer.files);
            }
          }}
        >
          <Upload className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">
            Drag images here, or choose files
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            JPEG, PNG, WebP, or GIF
          </p>
          <div className="mt-4">
            <Input
              id="bulk-images"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="mx-auto max-w-xs"
              onChange={(event) => {
                if (event.target.files) onAddFiles(event.target.files);
                event.target.value = "";
              }}
            />
          </div>
        </div>

        {selectedImages.length > 0 && (
          <div>
            <p className="mb-3 text-sm text-muted-foreground">
              {selectedImages.length} image
              {selectedImages.length === 1 ? "" : "s"} selected
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {selectedImages.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-lg border bg-card"
                >
                  <div className="relative aspect-[4/5] bg-muted">
                    <img
                      src={item.previewUrl}
                      alt=""
                      className="h-full w-full object-contain"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="absolute top-2 right-2 size-7"
                      onClick={() => onRemoveImage(item.id)}
                      aria-label={`Remove ${item.file.name}`}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                  <div className="space-y-2 p-3">
                    <p className="truncate text-sm font-medium">
                      {item.file.name.replace(/\.[^.]+$/, "")}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label
                          htmlFor={`bulk-width-${item.id}`}
                          requiredMark
                          className="gap-1 text-xs font-normal text-muted-foreground"
                        >
                          Width (cm)
                        </Label>
                        <Input
                          id={`bulk-width-${item.id}`}
                          type="number"
                          step="0.1"
                          min="0"
                          value={item.width_cm}
                          onChange={(event) =>
                            onUpdateDimensions(
                              item.id,
                              "width_cm",
                              event.target.value,
                            )
                          }
                          required
                          aria-required="true"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label
                          htmlFor={`bulk-height-${item.id}`}
                          requiredMark
                          className="gap-1 text-xs font-normal text-muted-foreground"
                        >
                          Height (cm)
                        </Label>
                        <Input
                          id={`bulk-height-${item.id}`}
                          type="number"
                          step="0.1"
                          min="0"
                          value={item.height_cm}
                          onChange={(event) =>
                            onUpdateDimensions(
                              item.id,
                              "height_cm",
                              event.target.value,
                            )
                          }
                          required
                          aria-required="true"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
