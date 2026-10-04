import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ArtworkDetailSheet } from "@/components/studio/artwork-detail-sheet";
import { StudioCatalogueFilters } from "@/components/studio/studio-catalogue-filters";
import { StudioCatalogueGrid } from "@/components/studio/studio-catalogue-grid";
import { Input } from "@/components/ui/input";
import { useCatalogueViewPreferences } from "@/hooks/use-catalogue-view-preferences";
import {
    countCatalogueActiveFilters,
    formatYearRangeLabel,
    getCatalogueFilterOptions,
    getCatalogueYearExtent,
    isYearRangeActive,
    organizeCatalogueArtworks,
} from "@/lib/gallery/catalogue-view";
import type { Artwork, ArtworkStatus } from "@/types/artwork";

interface StudioCatalogueProps {
    artworks: Artwork[];
    onArtworksChange: (artworks: Artwork[]) => void;
    readOnly?: boolean;
}

export function StudioCatalogue({
    artworks,
    onArtworksChange,
    readOnly = false,
}: StudioCatalogueProps) {
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<ArtworkStatus | "all">(
        "all",
    );
    const [artistFilter, setArtistFilter] = useState<string[]>([]);
    const [mediumFilter, setMediumFilter] = useState<string[]>([]);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [selectedArtworkId, setSelectedArtworkId] = useState<string | null>(
        null,
    );
    const [detailOpen, setDetailOpen] = useState(false);

    const {
        sortKey,
        setSortKey,
        groupByYear,
        setGroupByYear,
        yearRange,
        setYearRange,
        clearYearRange,
    } = useCatalogueViewPreferences();

    const yearExtent = useMemo(
        () => getCatalogueYearExtent(artworks),
        [artworks],
    );

    const artistOptions = useMemo(
        () => getCatalogueFilterOptions(artworks, "artist"),
        [artworks],
    );

    const mediumOptions = useMemo(
        () => getCatalogueFilterOptions(artworks, "medium"),
        [artworks],
    );

    const activeFilterCount = countCatalogueActiveFilters(
        statusFilter,
        artistFilter,
        mediumFilter,
        yearRange,
    );

    const { artworks: visibleArtworks, groups } = useMemo(
        () =>
            organizeCatalogueArtworks(
                artworks,
                query,
                statusFilter,
                artistFilter,
                mediumFilter,
                yearRange,
                sortKey,
                groupByYear,
            ),
        [
            artworks,
            query,
            statusFilter,
            artistFilter,
            mediumFilter,
            yearRange,
            sortKey,
            groupByYear,
        ],
    );

    const selectedArtwork = useMemo(
        () => artworks.find((artwork) => artwork.id === selectedArtworkId) ?? null,
        [artworks, selectedArtworkId],
    );

    const yearRangeLabel = formatYearRangeLabel(yearRange);
    const hasActiveFilters =
        activeFilterCount > 0 || query.trim().length > 0;

    function handleSelect(artwork: Artwork) {
        setSelectedArtworkId(artwork.id);
        setDetailOpen(true);
    }

    function handleCloseDetail() {
        setDetailOpen(false);
    }

    function handleUpdated(updated: Artwork) {
        onArtworksChange(
            artworks.map((artwork) =>
                artwork.id === updated.id ? updated : artwork,
            ),
        );
    }

    function handleDeleted(artworkId: string) {
        onArtworksChange(artworks.filter((artwork) => artwork.id !== artworkId));
        if (selectedArtworkId === artworkId) {
            setDetailOpen(false);
            setSelectedArtworkId(null);
        }
    }

    function clearFilters() {
        setStatusFilter("all");
        setArtistFilter([]);
        setMediumFilter([]);
        clearYearRange();
        setQuery("");
    }

    const gridProps = {
        selectedArtworkId,
        onSelect: handleSelect,
        onDeleted: handleDeleted,
        readOnly,
    };

    return (
        <div className="mt-6 space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative min-w-0 flex-1">
                    <Search
                        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden
                    />
                    <Input
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search works…"
                        className="pl-9"
                        aria-label="Search catalogue"
                    />
                </div>

                <StudioCatalogueFilters
                    open={filtersOpen}
                    onOpenChange={setFiltersOpen}
                    activeFilterCount={activeFilterCount}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    artistFilter={artistFilter}
                    onArtistFilterChange={setArtistFilter}
                    artistOptions={artistOptions}
                    mediumFilter={mediumFilter}
                    onMediumFilterChange={setMediumFilter}
                    mediumOptions={mediumOptions}
                    sortKey={sortKey}
                    onSortKeyChange={setSortKey}
                    groupByYear={groupByYear}
                    onGroupByYearChange={setGroupByYear}
                    yearRange={yearRange}
                    onYearRangeChange={setYearRange}
                    yearExtent={yearExtent}
                    onClearFilters={clearFilters}
                />
            </div>

            {yearRangeLabel && isYearRangeActive(yearRange) && (
                <p className="text-sm text-muted-foreground">
                    Showing years {yearRangeLabel}.
                </p>
            )}

            {artworks.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    No works in your catalogue yet.
                </p>
            ) : visibleArtworks.length === 0 ? (
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                        No works match your search or filters.
                    </p>
                    {hasActiveFilters && (
                        <button
                            type="button"
                            className="text-sm text-foreground underline-offset-4 hover:underline"
                            onClick={clearFilters}
                        >
                            Clear search and filters
                        </button>
                    )}
                </div>
            ) : groupByYear && groups.length > 0 ? (
                <div className="space-y-10">
                    {groups.map((group) => (
                        <section key={group.label} className="space-y-4">
                            <h3 className="font-serif text-xl italic text-muted-foreground">
                                {group.label}
                            </h3>
                            <StudioCatalogueGrid
                                artworks={group.artworks}
                                {...gridProps}
                            />
                        </section>
                    ))}
                </div>
            ) : (
                <StudioCatalogueGrid artworks={visibleArtworks} {...gridProps} />
            )}

            <ArtworkDetailSheet
                artwork={selectedArtwork}
                open={detailOpen}
                onClose={handleCloseDetail}
                onUpdated={handleUpdated}
                onDeleted={handleDeleted}
                readOnly={readOnly}
            />
        </div>
    );
}
