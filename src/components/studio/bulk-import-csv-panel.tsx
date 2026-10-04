import { Download } from "lucide-react";
import {
  downloadBulkImportCsvTemplate,
  type useBulkCsvImport,
} from "@/hooks/use-bulk-csv-import";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type BulkCsvImportState = ReturnType<typeof useBulkCsvImport>;

interface BulkImportCsvPanelProps {
  csvRows: BulkCsvImportState["csvRows"];
  csvErrors: BulkCsvImportState["csvErrors"];
  csvFileName: BulkCsvImportState["csvFileName"];
  previewColumns: BulkCsvImportState["previewColumns"];
  onCsvFile: (file: File) => void | Promise<void>;
  maxCsvRowCount: number;
}

export function BulkImportCsvPanel({
  csvRows,
  csvErrors,
  csvFileName,
  previewColumns,
  onCsvFile,
  maxCsvRowCount,
}: BulkImportCsvPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Import CSV</CardTitle>
        <CardDescription>
          Include a header row with columns like title, artist, year, medium,
          description, width_cm (required), height_cm (required), status, and
          image_url. Up to {maxCsvRowCount} data rows per import.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={downloadBulkImportCsvTemplate}
          >
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
              if (file) void onCsvFile(file);
              event.target.value = "";
            }}
          />
        </div>

        <div className="rounded-lg border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
          <p>
            <span className="text-foreground">title</span> is required. Status
            values: available, sold, on_loan, reserved.
          </p>
          <p className="mt-2">
            If an image URL cannot be downloaded, the URL is stored as-is on the
            artwork record.
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
  );
}
