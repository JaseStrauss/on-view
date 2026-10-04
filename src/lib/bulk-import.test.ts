import { describe, expect, it } from "vitest";
import {
  csvRowToFormData,
  parseArtworkCsv,
  titleFromFilename,
  type CsvArtworkRow,
} from "@/lib/bulk-import";

describe("titleFromFilename", () => {
  it("strips extension and normalizes separators", () => {
    expect(titleFromFilename("summer_light-01.JPG")).toBe("summer light 01");
  });

  it("returns Untitled for empty basename", () => {
    expect(titleFromFilename(".png")).toBe("Untitled");
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
    const csv = `name,artist,date,status
Summer light,Jane Doe,2024,on loan`;

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
    const csv = `title,artist,description
"Harbour, dusk",Ann,"A calm scene, at dusk"`;

    const { rows, errors } = parseArtworkCsv(csv);

    expect(errors).toEqual([]);
    expect(rows[0]?.title).toBe("Harbour, dusk");
    expect(rows[0]?.description).toBe("A calm scene, at dusk");
  });

  it("reports missing title", () => {
    const csv = `title,artist
,Jane
Valid,Ann`;

    const { rows, errors } = parseArtworkCsv(csv);

    expect(rows).toHaveLength(1);
    expect(rows[0]?.title).toBe("Valid");
    expect(errors).toEqual(["Row 2: title is required."]);
  });

  it("reports invalid status when title is present", () => {
    const csv = `title,artist,status
Work,Jane,bogus`;

    const { rows, errors } = parseArtworkCsv(csv);

    expect(rows).toHaveLength(0);
    expect(errors).toEqual([
      "Row 2: status must be available, sold, on_loan, or reserved",
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
