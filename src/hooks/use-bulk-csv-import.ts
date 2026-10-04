import { useMemo, useState } from "react";
import {
  CSV_TEMPLATE,
  parseArtworkCsv,
  type CsvArtworkRow,
} from "@/lib/bulk-import";

export function downloadBulkImportCsvTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "on-view-artwork-import-template.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

const PREVIEW_COLUMNS = [
  "title",
  "artist",
  "year",
  "medium",
  "description",
  "status",
  "image_url",
] as const;

export function useBulkCsvImport() {
  const [csvRows, setCsvRows] = useState<CsvArtworkRow[]>([]);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [csvFileName, setCsvFileName] = useState<string | null>(null);

  async function handleCsvFile(file: File) {
    const text = await file.text();
    const result = parseArtworkCsv(text);
    setCsvFileName(file.name);
    setCsvRows(result.rows);
    setCsvErrors(result.errors);
  }

  function clearCsv() {
    setCsvRows([]);
    setCsvErrors([]);
    setCsvFileName(null);
  }

  const previewColumns = useMemo(() => PREVIEW_COLUMNS, []);

  return {
    csvRows,
    csvErrors,
    csvFileName,
    previewColumns,
    handleCsvFile,
    clearCsv,
  };
}
