import { describe, expect, it } from "vitest";
import {
  csvRowToFormData,
  getBulkImportLimits,
  MAX_DEMO_BULK_IMAGE_COUNT,
  MAX_DEMO_CSV_ROW_COUNT,
  parseArtworkCsv,
  titleFromFilename,
  type CsvArtworkRow,
} from "@/lib/bulk-artwork/parse";

describe("titleFromFilename", () => {
  it("strips extension and normalizes separators", () => {
    expect(titleFromFilename("summer_light-01.JPG")).toBe("summer light 01");
  });

  it("returns Untitled for empty basename", () => {
    expect(titleFromFilename(".png")).toBe("Untitled");
  });
});

describe("getBulkImportLimits", () => {
  it("uses tighter caps in demo mode", () => {
    expect(getBulkImportLimits(true)).toEqual({
      maxImageCount: MAX_DEMO_BULK_IMAGE_COUNT,
      maxCsvRowCount: MAX_DEMO_CSV_ROW_COUNT,
    });
    expect(getBulkImportLimits(false).maxImageCount).toBe(50);
    expect(getBulkImportLimits(false).maxCsvRowCount).toBe(200);
  });
});

describe("parseArtworkCsv", () => {
  it("rejects empty input", () => {
    expect(parseArtworkCsv("   ")).toEqual({
      rows: [],
      errors: ["CSV file is empty."],
    });
  });

  it("requires a title column", () => {
    expect(parseArtworkCsv("artist,year\nJane,2024")).toEqual({
      rows: [],
      errors: ['CSV must include a "title" column.'],
    });
  });

  it("parses a valid row with header aliases", () => {
    const csv = `name,artist,date,width_cm,height_cm,status
Summer light,Jane Doe,2024,60,80,on loan`;

    const { rows, errors } = parseArtworkCsv(csv);

    expect(errors).toEqual([]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      rowNumber: 2,
      title: "Summer light",
      artist: "Jane Doe",
      year: "2024",
      status: "on_loan",
    });
  });

  it("handles quoted fields with commas", () => {
    const csv = `title,artist,width_cm,height_cm,description
"Harbour, dusk",Ann,90,60,"A calm scene, at dusk"`;

    const { rows, errors } = parseArtworkCsv(csv);

    expect(errors).toEqual([]);
    expect(rows[0]?.title).toBe("Harbour, dusk");
    expect(rows[0]?.description).toBe("A calm scene, at dusk");
  });

  it("reports missing title", () => {
    const csv = `title,artist,width_cm,height_cm
,Jane,60,80
Valid,Ann,60,80`;

    const { rows, errors } = parseArtworkCsv(csv);

    expect(rows).toHaveLength(1);
    expect(rows[0]?.title).toBe("Valid");
    expect(errors).toEqual(["Row 2: title is required."]);
  });

  it("reports invalid status when title is present", () => {
    const csv = `title,artist,width_cm,height_cm,status
Work,Jane,60,80,bogus`;

    const { rows, errors } = parseArtworkCsv(csv);

    expect(rows).toHaveLength(0);
    expect(errors).toEqual([
      "Row 2: status must be available, sold, on_loan, or reserved",
    ]);
  });

  it("honors a custom max row count", () => {
    const csv = `title,width_cm,height_cm
One,60,80
Two,60,80
Three,60,80`;

    const { rows, errors } = parseArtworkCsv(csv, { maxRowCount: 2 });

    expect(rows).toHaveLength(2);
    expect(errors).toEqual(["CSV is limited to 2 rows per import."]);
  });

  it("reports missing width_cm and height_cm", () => {
    const csv = `title,artist,width_cm,height_cm
No width,Jane,,80
No height,Ann,60,
`;

    const { rows, errors } = parseArtworkCsv(csv);

    expect(rows).toHaveLength(0);
    expect(errors).toEqual([
      "Row 2: width_cm is required and must be a positive number.",
      "Row 3: height_cm is required and must be a positive number.",
    ]);
  });
});

describe("csvRowToFormData", () => {
  it("trims string fields", () => {
    const row: CsvArtworkRow = {
      rowNumber: 2,
      title: "  Work  ",
      artist: " Ann ",
      year: " 2024 ",
      medium: " Oil ",
      width_cm: " 60 ",
      height_cm: " 80 ",
      status: "available",
      description: " Notes ",
      condition_notes: " Fine ",
      image_url: "",
    };

    expect(csvRowToFormData(row)).toEqual({
      title: "Work",
      artist: "Ann",
      year: "2024",
      medium: "Oil",
      width_cm: "60",
      height_cm: "80",
      status: "available",
      description: "Notes",
      condition_notes: "Fine",
    });
  });
});
