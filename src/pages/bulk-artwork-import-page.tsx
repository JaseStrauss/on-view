import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FileSpreadsheet, Images, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  AddToExhibitionFields,
  getDefaultAddToExhibitionValue,
  type AddToExhibitionValue,
} from "@/components/add-to-exhibition-fields";
import { DemoStudioBanner } from "@/components/demo-studio-banner";
import { PageBackLink } from "@/components/page-back-link";
import { BulkImportCsvPanel } from "@/components/studio/bulk-import-csv-panel";
import { BulkImportImagesPanel } from "@/components/studio/bulk-import-images-panel";
import { useAuth } from "@/contexts/auth-context";
import { useBulkCsvImport } from "@/hooks/use-bulk-csv-import";
import { useBulkImageImport } from "@/hooks/use-bulk-image-import";
import { useExhibitions } from "@/hooks/use-exhibitions";
import { finishBulkArtworksWithOptionalCatalogue } from "@/lib/bulk-artwork-flow";
import { showDemoOnlyToast } from "@/lib/public-demo";
import {
  createArtworksFromCsvRows,
  createArtworksFromImageFiles,
} from "@/services/artworks";
import { Button } from "@/components/ui/button";

type ImportMode = "images" | "csv";

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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    selectedImages,
    dragActive,
    setDragActive,
    addImageFiles,
    removeImage,
  } = useBulkImageImport();

  const {
    csvRows,
    csvErrors,
    csvFileName,
    previewColumns,
    handleCsvFile,
  } = useBulkCsvImport();

  useEffect(() => {
    if (exhibitions.length === 0) return;
    setAddToExhibition((current) => {
      if (current.exhibitionId) return current;
      return getDefaultAddToExhibitionValue(exhibitions, initialExhibitionId);
    });
  }, [exhibitions, initialExhibitionId]);

  const canSubmit =
    mode === "images"
      ? selectedImages.length > 0
      : csvRows.length > 0 && csvErrors.length === 0;

  function onAddImageFiles(files: FileList | File[]) {
    addImageFiles(files);
    setError(null);
  }

  async function onCsvFileSelected(file: File) {
    await handleCsvFile(file);
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
          <BulkImportImagesPanel
            selectedImages={selectedImages}
            dragActive={dragActive}
            setDragActive={setDragActive}
            onAddFiles={onAddImageFiles}
            onRemoveImage={removeImage}
          />
        ) : (
          <BulkImportCsvPanel
            csvRows={csvRows}
            csvErrors={csvErrors}
            csvFileName={csvFileName}
            previewColumns={previewColumns}
            onCsvFile={onCsvFileSelected}
          />
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
                Import {csvRows.length || ""} row
                {csvRows.length === 1 ? "" : "s"}
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
