import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Download,
  FileSpreadsheet,
  Images,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  AddToExhibitionFields,
  getDefaultAddToExhibitionValue,
  type AddToExhibitionValue,
} from "@/components/add-to-exhibition-fields";
import { DemoStudioBanner } from "@/components/demo-studio-banner";
import { PageBackLink } from "@/components/page-back-link";
import { useAuth } from "@/contexts/auth-context";
import { useExhibitions } from "@/hooks/use-exhibitions";
import { finishBulkArtworksWithOptionalCatalogue } from "@/lib/bulk-artwork-flow";
import { showDemoOnlyToast } from "@/lib/public-demo";
import {
  CSV_TEMPLATE,
  isAcceptedImageFile,
  MAX_BULK_IMAGE_COUNT,
  parseArtworkCsv,
  type CsvArtworkRow,
} from "@/lib/bulk-import";
import { cn } from "@/lib/utils";
import {
  createArtworksFromCsvRows,
  createArtworksFromImageFiles,
} from "@/services/artworks";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
type ImportMode = "images" | "csv";

interface SelectedImage {
  id: string;
  file: File;
  previewUrl: string;
}

function downloadCsvTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "on-view-artwork-import-template.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

interface BulkArtworkImportPageProps {
  demoMode?: boolean;
}

export function BulkArtworkImportPage({
  demoMode = false,
}: BulkArtworkImportPageProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialExhibitionId = searchParams.get("exhibition");
  const { exhibitions, loading: exhibitionsLoading } = useExhibitions(user?.id);
  const [mode, setMode] = useState<ImportMode>("images");
  const [addToExhibition, setAddToExhibition] = useState<AddToExhibitionValue>({
    enabled: false,
    exhibitionId: "",
  });
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [csvRows, setCsvRows] = useState<CsvArtworkRow[]>([]);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [csvFileName, setCsvFileName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (exhibitions.length === 0) return;
    setAddToExhibition((current) => {
      if (current.exhibitionId) return current;
      return getDefaultAddToExhibitionValue(exhibitions, initialExhibitionId);
    });
  }, [exhibitions, initialExhibitionId]);

  useEffect(() => {
    return () => {
      selectedImages.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [selectedImages]);

  const canSubmit =
    mode === "images"
      ? selectedImages.length > 0
      : csvRows.length > 0 && csvErrors.length === 0;

  const remainingImageSlots = MAX_BULK_IMAGE_COUNT - selectedImages.length;

  function addImageFiles(fileList: FileList | File[]) {
    const incoming = Array.from(fileList);
    const accepted = incoming.filter(isAcceptedImageFile);
    const rejectedCount = incoming.length - accepted.length;

    if (rejectedCount > 0) {
      toast.error("Some files were skipped", {
        description: "Only JPEG, PNG, WebP, and GIF images are supported.",
      });
    }

    if (accepted.length === 0) return;

    const availableSlots = Math.max(0, remainingImageSlots);
    const filesToAdd = accepted.slice(0, availableSlots);

    if (accepted.length > availableSlots) {
      toast.error(`You can upload up to ${MAX_BULK_IMAGE_COUNT} images at once.`);
    }

    setSelectedImages((current) => [
      ...current,
      ...filesToAdd.map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
    setError(null);
  }

  function removeImage(id: string) {
    setSelectedImages((current) => {
      const target = current.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((item) => item.id !== id);
    });
  }

  async function handleCsvFile(file: File) {
    const text = await file.text();
    const result = parseArtworkCsv(text);
    setCsvFileName(file.name);
    setCsvRows(result.rows);
    setCsvErrors(result.errors);
    setError(null);
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    if (demoMode) {
      showDemoOnlyToast();
      return;
    }
    if (!user) return;

    setSubmitting(true);
    setError(null);

    try {
      const result =
        mode === "images"
          ? await createArtworksFromImageFiles(
            user.id,
            selectedImages.map((item) => item.file),
          )
          : await createArtworksFromCsvRows(user.id, csvRows);

      if (result.artworks.length === 0 && result.failures.length > 0) {
        setError("Nothing was imported. Check the errors below and try again.");
        toast.error("Import failed", {
          description: result.failures[0]?.error,
        });
        return;
      }

      await finishBulkArtworksWithOptionalCatalogue(
        result.artworks,
        result.failures,
        addToExhibition,
        navigate,
        { itemLabel: "work" },
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setSubmitting(false);
    }
  }

  const previewColumns = useMemo(
    () =>
      [
        "title",
        "artist",
        "year",
        "medium",
        "description",
        "status",
        "image_url",
      ] as const,
    [],
  );

  const cancelPath = demoMode ? "/studio/demo" : "/studio";
  const addOnePath = demoMode
    ? "/studio/demo/artworks/new"
    : "/studio/artworks/new";
  const backTo = initialExhibitionId
    ? `/studio/exhibitions/${initialExhibitionId}`
    : cancelPath;
  const backLabel = initialExhibitionId ? "Exhibition" : "Exhibitions";

  return (
    <>
      {demoMode && <DemoStudioBanner />}

      <div className="mx-auto max-w-5xl px-6 py-12">
        <PageBackLink to={backTo} className="mb-4">
          {backLabel}
        </PageBackLink>
        <div className="mb-8">
          <h1 className="font-serif text-4xl italic">Bulk import</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Upload many images at once, or import a spreadsheet of catalogue
            records. Titles from filenames become draft entries you can refine
            later in your catalogue.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <Button
            type="button"
            variant={mode === "images" ? "default" : "outline"}
            onClick={() => setMode("images")}
          >
            <Images className="size-4" />
            Upload images
          </Button>
          <Button
            type="button"
            variant={mode === "csv" ? "default" : "outline"}
            onClick={() => setMode("csv")}
          >
            <FileSpreadsheet className="size-4" />
            Import CSV
          </Button>
        </div>

        {!demoMode && (
          <div className="mb-6">
            <AddToExhibitionFields
              exhibitions={exhibitions}
              loading={exhibitionsLoading}
              value={addToExhibition}
              onChange={setAddToExhibition}
            />
          </div>
        )}

        {mode === "images" ? (
          <Card>
            <CardHeader>
              <CardTitle>Upload images</CardTitle>
              <CardDescription>
                Drop up to {MAX_BULK_IMAGE_COUNT} images. Each file becomes a
                catalogue entry titled from the filename.
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
                    addImageFiles(event.dataTransfer.files);
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
                      if (event.target.files) addImageFiles(event.target.files);
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
                            className="h-full w-full object-cover"
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            className="absolute top-2 right-2 size-7"
                            onClick={() => removeImage(item.id)}
                            aria-label={`Remove ${item.file.name}`}
                          >
                            <X className="size-3.5" />
                          </Button>
                        </div>
                        <div className="space-y-1 p-3">
                          <p className="truncate text-sm font-medium">
                            {item.file.name.replace(/\.[^.]+$/, "")}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {item.file.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Import CSV</CardTitle>
              <CardDescription>
                Include a header row with columns like title, artist, year,
                medium, description, width_cm, height_cm, status, and image_url.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={downloadCsvTemplate}>
                  <Download className="size-4" />
                  Download template
                </Button>
                <Input
                  id="bulk-csv"
                  type="file"
                  accept=".csv,text/csv"
                  className="max-w-xs"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void handleCsvFile(file);
                    event.target.value = "";
                  }}
                />
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
                <p>
                  <span className="text-foreground">title</span> is required.
                  Status values: available, sold, on_loan, reserved.
                </p>
                <p className="mt-2">
                  If an image URL cannot be downloaded, the URL is stored as-is on
                  the artwork record.
                </p>
              </div>

              {csvFileName && (
                <p className="text-sm text-muted-foreground">
                  Loaded <span className="text-foreground">{csvFileName}</span>
                  {csvRows.length > 0 && ` · ${csvRows.length} rows ready`}
                </p>
              )}

              {csvErrors.length > 0 && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                  <ul className="space-y-1">
                    {csvErrors.map((message) => (
                      <li key={message}>{message}</li>
                    ))}
                  </ul>
                </div>
              )}

              {csvRows.length > 0 && csvErrors.length === 0 && (
                <div className="overflow-x-auto rounded-lg border">
                  <table className="min-w-full text-left text-sm">
                    <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        {previewColumns.map((column) => (
                          <th key={column} className="px-3 py-2 font-medium">
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvRows.slice(0, 8).map((row) => (
                        <tr key={row.rowNumber} className="border-b last:border-0">
                          {previewColumns.map((column) => (
                            <td
                              key={column}
                              className="max-w-[12rem] truncate px-3 py-2"
                            >
                              {row[column] || "—"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {csvRows.length > 8 && (
                    <p className="border-t px-3 py-2 text-xs text-muted-foreground">
                      Showing 8 of {csvRows.length} rows
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {error && <p className="mt-6 text-sm text-destructive">{error}</p>}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            type="button"
            disabled={!canSubmit || (submitting && !demoMode)}
            onClick={() => void handleSubmit()}
          >
            {submitting && !demoMode ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Importing…
              </>
            ) : mode === "images" ? (
              <>
                <Upload className="size-4" />
                Import {selectedImages.length || ""} image
                {selectedImages.length === 1 ? "" : "s"}
                {demoMode ? " (demo)" : ""}
              </>
            ) : (
              <>
                <FileSpreadsheet className="size-4" />
                Import {csvRows.length || ""} row{csvRows.length === 1 ? "" : "s"}
                {demoMode ? " (demo)" : ""}
              </>
            )}
          </Button>
          <Button type="button" variant="outline" render={<Link to={cancelPath} />}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="ghost"
            render={<Link to={addOnePath} />}
          >
            Add one artwork instead
          </Button>
        </div>
      </div>
    </>
  );
}
