import type { ArtworkStatus } from "@/types/artwork";
import { ARTWORK_STATUS_OPTIONS } from "@/lib/artwork-form";

export const MAX_BULK_IMAGE_COUNT = 50;
export const MAX_CSV_ROW_COUNT = 200;

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export interface CsvArtworkRow {
  rowNumber: number;
  title: string;
  artist: string;
  year: string;
  medium: string;
  width_cm: string;
  height_cm: string;
  status: ArtworkStatus;
  description: string;
  condition_notes: string;
  image_url: string;
}

export interface CsvParseResult {
  rows: CsvArtworkRow[];
  errors: string[];
}

const STATUS_VALUES = new Set<ArtworkStatus>(
  ARTWORK_STATUS_OPTIONS.map((option) => option.value),
);

const HEADER_ALIASES: Record<string, keyof Omit<CsvArtworkRow, "rowNumber">> = {
  title: "title",
  name: "title",
  work: "title",
  artist: "artist",
  year: "year",
  date: "year",
  medium: "medium",
  width: "width_cm",
  width_cm: "width_cm",
  height: "height_cm",
  height_cm: "height_cm",
  status: "status",
  description: "description",
  condition_notes: "condition_notes",
  notes: "condition_notes",
  condition: "condition_notes",
  image_url: "image_url",
  image: "image_url",
  imageurl: "image_url",
  "image url": "image_url",
};

export const CSV_TEMPLATE = `title,artist,year,medium,width_cm,height_cm,status,image_url,description,condition_notes
Summer light,Jane Doe,2024,Oil on linen,60,80,available,https://example.com/work.jpg,A sunlit interior with warm shadows.,
`;

export function titleFromFilename(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "");
  const normalized = base.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  return normalized || "Untitled";
}

export function isAcceptedImageFile(file: File): boolean {
  if (ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    return true;
  }

  return /\.(jpe?g|png|webp|gif)$/i.test(file.name);
}

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, " ");
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (inQuotes) {
      if (char === '"') {
        if (line[index + 1] === '"') {
          current += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      fields.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  fields.push(current.trim());
  return fields;
}

function parseStatus(value: string, rowNumber: number): ArtworkStatus | string {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, "_");
  if (!normalized) return "available";

  if (STATUS_VALUES.has(normalized as ArtworkStatus)) {
    return normalized as ArtworkStatus;
  }

  return `Row ${rowNumber}: status must be available, sold, on_loan, or reserved`;
}

export function parseArtworkCsv(text: string): CsvParseResult {
  const normalizedText = text.replace(/^\uFEFF/, "").trim();
  const errors: string[] = [];

  if (!normalizedText) {
    return { rows: [], errors: ["CSV file is empty."] };
  }

  const lines = normalizedText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    return {
      rows: [],
      errors: ["CSV must include a header row and at least one data row."],
    };
  }

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  const titleIndex = headers.findIndex(
    (header) => HEADER_ALIASES[header] === "title",
  );

  if (titleIndex === -1) {
    return {
      rows: [],
      errors: ['CSV must include a "title" column.'],
    };
  }

  const columnMap = headers.map((header) => HEADER_ALIASES[header] ?? null);
  const rows: CsvArtworkRow[] = [];

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const rowNumber = lineIndex + 1;
    const values = parseCsvLine(lines[lineIndex]);

    const row: CsvArtworkRow = {
      rowNumber,
      title: "",
      artist: "",
      year: "",
      medium: "",
      width_cm: "",
      height_cm: "",
      status: "available",
      description: "",
      condition_notes: "",
      image_url: "",
    };

    values.forEach((value, columnIndex) => {
      const field = columnMap[columnIndex];
      if (!field) return;

      if (field === "status") {
        row.status = value as ArtworkStatus;
      } else {
        row[field] = value;
      }
    });

    if (!row.title.trim()) {
      errors.push(`Row ${rowNumber}: title is required.`);
      continue;
    }

    const statusResult = parseStatus(row.status, rowNumber);
    if (typeof statusResult === "string") {
      errors.push(statusResult);
      continue;
    }

    row.status = statusResult;
    rows.push(row);

    if (rows.length > MAX_CSV_ROW_COUNT) {
      errors.push(`CSV is limited to ${MAX_CSV_ROW_COUNT} rows per import.`);
      break;
    }
  }

  return { rows, errors };
}

export function csvRowToFormData(row: CsvArtworkRow) {
  return {
    title: row.title.trim(),
    artist: row.artist.trim(),
    year: row.year.trim(),
    medium: row.medium.trim(),
    width_cm: row.width_cm.trim(),
    height_cm: row.height_cm.trim(),
    status: row.status,
    description: row.description.trim(),
    condition_notes: row.condition_notes.trim(),
  };
}
