import { useMemo } from "react";
import { AppLoader } from "@/components/app-loader";
import type { Exhibition } from "@/types";
import { Label } from "@/components/ui/label";

export interface AddToExhibitionValue {
  enabled: boolean;
  exhibitionId: string;
}

interface AddToExhibitionFieldsProps {
  exhibitions: Exhibition[];
  loading?: boolean;
  value: AddToExhibitionValue;
  onChange: (value: AddToExhibitionValue) => void;
}

export function getDefaultAddToExhibitionValue(
  exhibitions: Exhibition[],
  initialExhibitionId?: string | null,
): AddToExhibitionValue {
  const exhibition =
    exhibitions.find((e) => e.id === initialExhibitionId) ?? exhibitions[0];

  return {
    enabled: Boolean(initialExhibitionId && exhibition),
    exhibitionId: exhibition?.id ?? "",
  };
}

export function AddToExhibitionFields({
  exhibitions,
  loading = false,
  value,
  onChange,
}: AddToExhibitionFieldsProps) {
  const selectedExhibition = useMemo(
    () => exhibitions.find((e) => e.id === value.exhibitionId) ?? null,
    [exhibitions, value.exhibitionId],
  );

  if (loading) {
    return (
      <AppLoader
        layout="inline"
        label="Loading exhibitions…"
        className="py-2"
      />
    );
  }

  if (exhibitions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Create an exhibition in your studio to add works to a show catalogue.
      </p>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={value.enabled}
          onChange={(event) =>
            onChange({ ...value, enabled: event.target.checked })
          }
          className="mt-1 rounded border-input"
        />
        <div>
          <span className="text-sm font-medium">Add to exhibition catalogue</span>
          <p className="text-xs text-muted-foreground">
            Include this work in the show&apos;s catalogue sidebar. You can drag
            it onto a wall in the exhibition editor when you&apos;re ready.
          </p>
        </div>
      </label>

      {value.enabled && (
        <div className="space-y-2">
          <Label htmlFor="add-to-exhibition">Exhibition</Label>
          <select
            id="add-to-exhibition"
            value={value.exhibitionId}
            onChange={(event) =>
              onChange({
                ...value,
                exhibitionId: event.target.value,
              })
            }
            className="flex h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm"
          >
            {exhibitions.map((exhibition) => (
              <option key={exhibition.id} value={exhibition.id}>
                {exhibition.title}
              </option>
            ))}
          </select>
          {selectedExhibition && (
            <p className="text-xs text-muted-foreground">
              Opens the exhibition editor after saving so you can hang this work
              where you like.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
