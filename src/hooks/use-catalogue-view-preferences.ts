import { useEffect, useState } from "react";
import {
  CATALOGUE_SORT_OPTIONS,
  EMPTY_YEAR_RANGE,
  type CatalogueSortKey,
  type CatalogueYearRange,
} from "@/lib/gallery/catalogue-view";

const SORT_STORAGE_KEY = "on-view-catalogue-sort";
const GROUP_STORAGE_KEY = "on-view-catalogue-group-by-year";
const YEAR_RANGE_STORAGE_KEY = "on-view-catalogue-year-range";

function readSortPreference(): CatalogueSortKey {
  try {
    const stored = localStorage.getItem(SORT_STORAGE_KEY);
    if (
      stored &&
      CATALOGUE_SORT_OPTIONS.some((option) => option.value === stored)
    ) {
      return stored as CatalogueSortKey;
    }
  } catch {
    // Ignore storage errors.
  }

  return "recent";
}

function readGroupPreference(): boolean {
  try {
    return localStorage.getItem(GROUP_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function readYearRangePreference(): CatalogueYearRange {
  try {
    const stored = localStorage.getItem(YEAR_RANGE_STORAGE_KEY);
    if (!stored) return EMPTY_YEAR_RANGE;

    const parsed = JSON.parse(stored) as Partial<CatalogueYearRange>;
    return {
      from: typeof parsed.from === "string" ? parsed.from : "",
      to: typeof parsed.to === "string" ? parsed.to : "",
    };
  } catch {
    return EMPTY_YEAR_RANGE;
  }
}

export function useCatalogueViewPreferences() {
  const [sortKey, setSortKey] = useState<CatalogueSortKey>(readSortPreference);
  const [groupByYear, setGroupByYear] = useState(readGroupPreference);
  const [yearRange, setYearRange] = useState<CatalogueYearRange>(
    readYearRangePreference,
  );

  useEffect(() => {
    try {
      localStorage.setItem(SORT_STORAGE_KEY, sortKey);
    } catch {
      // Ignore storage errors.
    }
  }, [sortKey]);

  useEffect(() => {
    try {
      localStorage.setItem(GROUP_STORAGE_KEY, groupByYear ? "1" : "0");
    } catch {
      // Ignore storage errors.
    }
  }, [groupByYear]);

  useEffect(() => {
    try {
      localStorage.setItem(YEAR_RANGE_STORAGE_KEY, JSON.stringify(yearRange));
    } catch {
      // Ignore storage errors.
    }
  }, [yearRange]);

  function clearYearRange() {
    setYearRange(EMPTY_YEAR_RANGE);
  }

  return {
    sortKey,
    setSortKey,
    groupByYear,
    setGroupByYear,
    yearRange,
    setYearRange,
    clearYearRange,
  };
}
