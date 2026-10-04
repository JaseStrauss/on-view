import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FileSpreadsheet, Images, Loader2, Upload } from "lucide-react";
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
import { useBulkArtworkImportSubmit } from "@/hooks/use-bulk-artwork-import-submit";
import { useBulkCsvImport } from "@/hooks/use-bulk-csv-import";
import { useBulkImageImport } from "@/hooks/use-bulk-image-import";
import { useExhibitions } from "@/hooks/use-exhibitions";
import { getArtworkFlowPaths } from "@/lib/demo-studio-routes";
import type { BulkImportMode } from "@/lib/bulk-artwork-import";
import { Button } from "@/components/ui/button";

interface BulkArtworkImportPageProps {
  demoMode?: boolean;
}

export function BulkArtworkImportPage({
  demoMode = false,
}: BulkArtworkImportPageProps) {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const exhibitionId = searchParams.get("exhibition");
  const { exhibitions, loading: exhibitionsLoading } = useExhibitions(user?.id);
  const [mode, setMode] = useState<BulkImportMode>("images");
  const [addToExhibition, setAddToExhibition] = useState<AddToExhibitionValue>({
    enabled: false,
    exhibitionId: "",
  });

  const paths = useMemo(
    () => getArtworkFlowPaths(demoMode, exhibitionId),
    [demoMode, exhibitionId],
  );

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
      return getDefaultAddToExhibitionValue(exhibitions, exhibitionId);
    });
  }, [exhibitions, exhibitionId]);

  const canSubmit =
    mode === "images"
      ? selectedImages.length > 0
      : csvRows.length > 0 && csvErrors.length === 0;

  const imageFiles = useMemo(
    () => selectedImages.map((item) => item.file),
    [selectedImages],
  );

  const { handleSubmit, submitting, error, clearError } =
    useBulkArtworkImportSubmit({
      demoMode,
      mode,
      canSubmit,
      imageFiles,
      csvRows,
      addToExhibition,
      exhibitionId,
      userId: user?.id,
    });

  function onAddImageFiles(files: FileList | File[]) {
    addImageFiles(files);
    clearError();
  }

  async function onCsvFileSelected(file: File) {
    await handleCsvFile(file);
    clearError();
  }

  return (
    <>
      {demoMode && <DemoStudioBanner />}

      <div className="mx-auto max-w-5xl px-6 py-12">
        <PageBackLink to={paths.backTo} className="mb-4">
          {paths.backLabel}
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
            disabled={!canSubmit || submitting}
            onClick={() => void handleSubmit()}
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Importing…
              </>
            ) : mode === "images" ? (
              <>
                <Upload className="size-4" />
                Import {selectedImages.length || ""} image
                {selectedImages.length === 1 ? "" : "s"}
              </>
            ) : (
              <>
                <FileSpreadsheet className="size-4" />
                Import {csvRows.length || ""} row
                {csvRows.length === 1 ? "" : "s"}
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            render={<Link to={paths.cancelPath} />}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="ghost"
            render={<Link to={paths.addOnePath} />}
          >
            Add one artwork instead
          </Button>
        </div>
      </div>
    </>
  );
}
