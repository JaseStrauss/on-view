import { useEffect, useMemo, useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  deriveExhibitionArtists,
  emptyToNull,
  formatArtistList,
  formatExhibitionDates,
  type ExhibitionDetailsPatch,
} from "@/lib/exhibition-details";
import type { Exhibition, PlacementWithArtwork } from "@/types";
import type { Artwork } from "@/types/artwork";

interface ExhibitionDetailsPanelProps {
  exhibition: Exhibition;
  catalogueArtworks: Artwork[];
  catalogueIsScoped: boolean;
  placements: PlacementWithArtwork[];
  onSave: (patch: ExhibitionDetailsPatch) => Promise<void>;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

interface DetailsDraft {
  description: string;
  opens_at: string;
  closes_at: string;
  featuring_override: string;
}

function toDraft(exhibition: Exhibition): DetailsDraft {
  return {
    description: exhibition.description ?? "",
    opens_at: exhibition.opens_at ?? "",
    closes_at: exhibition.closes_at ?? "",
    featuring_override: exhibition.featuring_override ?? "",
  };
}

export function ExhibitionDetailsPanel({
  exhibition,
  catalogueArtworks,
  catalogueIsScoped,
  placements,
  onSave,
  collapsible = false,
  defaultExpanded = true,
}: ExhibitionDetailsPanelProps) {
  const [draft, setDraft] = useState<DetailsDraft>(() => toDraft(exhibition));
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(toDraft(exhibition));
  }, [exhibition]);

  const savedDraft = useMemo(() => toDraft(exhibition), [exhibition]);

  const dirty =
    draft.description !== savedDraft.description ||
    draft.opens_at !== savedDraft.opens_at ||
    draft.closes_at !== savedDraft.closes_at ||
    draft.featuring_override !== savedDraft.featuring_override;

  const derivedArtists = useMemo(
    () =>
      deriveExhibitionArtists(
        catalogueArtworks,
        placements,
        catalogueIsScoped,
      ),
    [catalogueArtworks, placements, catalogueIsScoped],
  );

  const derivedFeaturing = formatArtistList(derivedArtists);
  const dateSummary = formatExhibitionDates(
    exhibition.opens_at,
    exhibition.closes_at,
  );

  async function handleSave() {
    setSaving(true);
    try {
      await onSave({
        description: emptyToNull(draft.description),
        opens_at: emptyToNull(draft.opens_at),
        closes_at: emptyToNull(draft.closes_at),
        featuring_override: emptyToNull(draft.featuring_override),
      });
    } finally {
      setSaving(false);
    }
  }

  const summaryParts = [
    dateSummary,
    derivedFeaturing ? `Featuring ${derivedFeaturing}` : null,
    exhibition.description ? "Statement added" : null,
  ].filter(Boolean);

  return (
    <Card>
      <CardHeader className={collapsible ? "pb-3" : undefined}>
        {collapsible ? (
          <button
            type="button"
            onClick={() => setExpanded((open) => !open)}
            className="flex w-full items-start justify-between gap-3 text-left"
            aria-expanded={expanded}
          >
            <div className="min-w-0 space-y-1">
              <CardTitle className="text-base">Exhibition details</CardTitle>
              <p className="text-sm text-muted-foreground">
                {summaryParts.length > 0
                  ? summaryParts.join(" · ")
                  : "Dates, statement, and featuring line for the public page"}
              </p>
              {dirty && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Unsaved changes
                </p>
              )}
            </div>
            <ChevronDownIcon
              className={`mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform ${
                expanded ? "rotate-180" : ""
              }`}
              aria-hidden
            />
          </button>
        ) : (
          <CardTitle>Exhibition details</CardTitle>
        )}
      </CardHeader>

      {(!collapsible || expanded) && (
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="exhibition-opens">Opens</Label>
              <Input
                id="exhibition-opens"
                type="date"
                value={draft.opens_at}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    opens_at: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exhibition-closes">Closes</Label>
              <Input
                id="exhibition-closes"
                type="date"
                value={draft.closes_at}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    closes_at: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="exhibition-description">Curatorial statement</Label>
            <Textarea
              id="exhibition-description"
              rows={4}
              value={draft.description}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="A short introduction for visitors and the catalogue PDF…"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="exhibition-featuring">Featuring line (optional)</Label>
            <Input
              id="exhibition-featuring"
              value={draft.featuring_override}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  featuring_override: event.target.value,
                }))
              }
              placeholder={
                derivedFeaturing
                  ? `Leave blank to use: Featuring ${derivedFeaturing}`
                  : "Add works to the catalogue to auto-detect artists"
              }
            />
            {derivedFeaturing && !draft.featuring_override.trim() && (
              <p className="text-xs text-muted-foreground">
                Public page will show: Featuring {derivedFeaturing}
              </p>
            )}
            {!derivedFeaturing && catalogueIsScoped && (
              <p className="text-xs text-muted-foreground">
                Add artist names to catalogue works to generate a featuring line.
              </p>
            )}
          </div>

          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || !dirty}
          >
            {saving ? "Saving…" : "Save details"}
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
