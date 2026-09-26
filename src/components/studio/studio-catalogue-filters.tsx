import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ARTWORK_STATUS_OPTIONS,
  formatArtworkStatus,
} from "@/lib/artwork-form";
import {
  CATALOGUE_SORT_OPTIONS,
  type CatalogueFieldFilter,
  type CatalogueSortKey,
  type CatalogueYearExtent,
  type CatalogueYearRange,
} from "@/lib/catalogue-view";
import { cn } from "@/lib/utils";
import type { ArtworkStatus } from "@/types/artwork";

interface StudioCatalogueFiltersProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeFilterCount: number;
  statusFilter: ArtworkStatus | "all";
  onStatusFilterChange: (value: ArtworkStatus | "all") => void;
  artistFilter: CatalogueFieldFilter;
  onArtistFilterChange: (value: CatalogueFieldFilter) => void;
  artistOptions: string[];
  mediumFilter: CatalogueFieldFilter;
  onMediumFilterChange: (value: CatalogueFieldFilter) => void;
  mediumOptions: string[];
  sortKey: CatalogueSortKey;
  onSortKeyChange: (value: CatalogueSortKey) => void;
  groupByYear: boolean;
  onGroupByYearChange: (value: boolean) => void;
  yearRange: CatalogueYearRange;
  onYearRangeChange: (
    updater: (current: CatalogueYearRange) => CatalogueYearRange,
  ) => void;
  yearExtent: CatalogueYearExtent;
  onClearFilters: () => void;
}

const selectClassName =
  "flex h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm";

const checkboxListClassName =
  "max-h-32 space-y-1 overflow-y-auto rounded-lg border border-input p-2";

function toggleFieldFilter(
  filter: CatalogueFieldFilter,
  value: string,
): CatalogueFieldFilter {
  if (filter.includes(value)) {
    return filter.filter((item) => item !== value);
  }

  return [...filter, value];
}

export function StudioCatalogueFilters({
  open,
  onOpenChange,
  activeFilterCount,
  statusFilter,
  onStatusFilterChange,
  artistFilter,
  onArtistFilterChange,
  artistOptions,
  mediumFilter,
  onMediumFilterChange,
  mediumOptions,
  sortKey,
  onSortKeyChange,
  groupByYear,
  onGroupByYearChange,
  yearRange,
  onYearRangeChange,
  yearExtent,
  onClearFilters,
}: StudioCatalogueFiltersProps) {
  return (
    <div className="relative">
      <Button
        type="button"
        variant={open || activeFilterCount > 0 ? "default" : "outline"}
        className="shrink-0"
        aria-expanded={open}
        aria-controls="catalogue-filters-panel"
        onClick={() => onOpenChange(!open)}
      >
        <SlidersHorizontal className="size-4" />
        Filters
        {activeFilterCount > 0 && (
          <span
            className={cn(
              "min-w-5 rounded-full px-1.5 text-xs tabular-nums",
              open || activeFilterCount > 0
                ? "bg-background/20 text-primary-foreground"
                : "bg-muted text-foreground",
            )}
          >
            {activeFilterCount}
          </span>
        )}
      </Button>

      {open && (
        <div
          id="catalogue-filters-panel"
          className="absolute top-[calc(100%+0.5rem)] right-0 z-20 w-[min(100vw-3rem,24rem)] rounded-xl border border-border bg-card p-4 shadow-lg"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="catalogue-sort">Sort by</Label>
              <select
                id="catalogue-sort"
                value={sortKey}
                onChange={(event) =>
                  onSortKeyChange(event.target.value as CatalogueSortKey)
                }
                className={selectClassName}
              >
                {CATALOGUE_SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="catalogue-status">Status</Label>
              <select
                id="catalogue-status"
                value={statusFilter}
                onChange={(event) =>
                  onStatusFilterChange(
                    event.target.value as ArtworkStatus | "all",
                  )
                }
                className={selectClassName}
              >
                <option value="all">All statuses</option>
                {ARTWORK_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {formatArtworkStatus(option.value)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label id="catalogue-artist-label">Artist</Label>
              {artistOptions.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No artists in catalogue.
                </p>
              ) : (
                <div
                  className={checkboxListClassName}
                  role="group"
                  aria-labelledby="catalogue-artist-label"
                >
                  {artistOptions.map((artist) => (
                    <label
                      key={artist}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        className="size-4 rounded border border-input"
                        checked={artistFilter.includes(artist)}
                        onChange={() =>
                          onArtistFilterChange(
                            toggleFieldFilter(artistFilter, artist),
                          )
                        }
                      />
                      {artist}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label id="catalogue-medium-label">Medium</Label>
              {mediumOptions.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No media in catalogue.
                </p>
              ) : (
                <div
                  className={checkboxListClassName}
                  role="group"
                  aria-labelledby="catalogue-medium-label"
                >
                  {mediumOptions.map((medium) => (
                    <label
                      key={medium}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        className="size-4 rounded border border-input"
                        checked={mediumFilter.includes(medium)}
                        onChange={() =>
                          onMediumFilterChange(
                            toggleFieldFilter(mediumFilter, medium),
                          )
                        }
                      />
                      {medium}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3 border-t border-border/60 pt-4">
              <div>
                <p className="text-sm font-medium">Year range</p>
                <p className="text-xs text-muted-foreground">
                  {yearExtent.min !== null && yearExtent.max !== null
                    ? `Catalogue spans ${yearExtent.min}–${yearExtent.max}.`
                    : "Filter by the year on each record."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="catalogue-year-from">From</Label>
                  <Input
                    id="catalogue-year-from"
                    type="number"
                    inputMode="numeric"
                    placeholder={
                      yearExtent.min !== null
                        ? String(yearExtent.min)
                        : "1990"
                    }
                    value={yearRange.from}
                    onChange={(event) =>
                      onYearRangeChange((current) => ({
                        ...current,
                        from: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="catalogue-year-to">To</Label>
                  <Input
                    id="catalogue-year-to"
                    type="number"
                    inputMode="numeric"
                    placeholder={
                      yearExtent.max !== null
                        ? String(yearExtent.max)
                        : "2024"
                    }
                    value={yearRange.to}
                    onChange={(event) =>
                      onYearRangeChange((current) => ({
                        ...current,
                        to: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2 border-t border-border/60 pt-4 text-sm">
              <input
                type="checkbox"
                className="size-4 rounded border border-input"
                checked={groupByYear}
                onChange={(event) => onGroupByYearChange(event.target.checked)}
              />
              Group results by year
            </label>
          </div>

          <div className="mt-4 flex justify-end gap-2 border-t border-border/60 pt-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={activeFilterCount === 0}
              onClick={onClearFilters}
            >
              Clear filters
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
