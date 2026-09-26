import { useEffect, useMemo, useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatRoomConfigSummary,
  getRoomParamDefinitions,
  getRoomTemplateMeta,
  listRoomTemplateMeta,
  mergeRoomConfig,
  type RoomConfig,
} from "@/rooms/room-config";

interface RoomConfigPanelProps {
  templateId: string;
  value: RoomConfig;
  onChange: (config: RoomConfig) => void;
  /** Saved template id — used to detect layout-type changes in the editor. */
  savedTemplateId?: string;
  onTemplateChange?: (templateId: string) => void;
  showTemplatePicker?: boolean;
  onApply?: (templateId: string, config: RoomConfig) => void | Promise<void>;
  applyLabel?: string;
  showApplyButton?: boolean;
  disabled?: boolean;
  /** Collapse behind a clickable header — useful in the exhibition editor. */
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export function RoomConfigPanel({
  templateId,
  value,
  onChange,
  savedTemplateId,
  onTemplateChange,
  showTemplatePicker = false,
  onApply,
  applyLabel = "Apply dimensions",
  showApplyButton = false,
  disabled = false,
  collapsible = false,
  defaultExpanded = true,
}: RoomConfigPanelProps) {
  const params = getRoomParamDefinitions(templateId);
  const [draft, setDraft] = useState<RoomConfig>(() =>
    mergeRoomConfig(templateId, value),
  );
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [saving, setSaving] = useState(false);
  const resolvedDraft = useMemo(
    () => mergeRoomConfig(templateId, draft),
    [templateId, draft],
  );
  const savedConfig = useMemo(
    () => mergeRoomConfig(templateId, value),
    [templateId, value],
  );

  useEffect(() => {
    setDraft(mergeRoomConfig(templateId, value));
  }, [templateId, value]);

  function handleTemplateChange(nextTemplateId: string) {
    const nextDraft = mergeRoomConfig(nextTemplateId, null);
    setDraft(nextDraft);
    onChange(nextDraft);
    onTemplateChange?.(nextTemplateId);
  }

  function updateParam(key: string, raw: string) {
    const next = mergeRoomConfig(templateId, {
      ...draft,
      [key]: Number(raw),
    });
    setDraft(next);
    onChange(next);
  }

  async function handleApply() {
    if (!onApply) return;
    setSaving(true);
    try {
      await onApply(templateId, resolvedDraft);
    } finally {
      setSaving(false);
    }
  }

  if (params.length === 0) return null;

  const configDirty = params.some(
    (param) => resolvedDraft[param.key] !== savedConfig[param.key],
  );
  const templateDirty =
    showTemplatePicker &&
    savedTemplateId !== undefined &&
    templateId !== savedTemplateId;
  const dirty = configDirty || templateDirty;
  const summary = formatRoomConfigSummary(templateId, resolvedDraft);

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
              <CardTitle className="text-base">Gallery space</CardTitle>
              <p className="text-sm text-muted-foreground">{summary}</p>
              {dirty && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Unsaved changes
                </p>
              )}
            </div>
            <ChevronDownIcon
              className={`mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""
                }`}
              aria-hidden
            />
          </button>
        ) : (
          <>
            <CardTitle>Gallery space</CardTitle>
            <CardDescription>
              {showTemplatePicker
                ? "Change the gallery space or adjust dimensions. Switching layout may remove works on walls that no longer exist."
                : "Adjust wall lengths and ceiling height. Existing artworks are kept in place where possible."}
            </CardDescription>
          </>
        )}
      </CardHeader>
      {(!collapsible || expanded) && (
        <CardContent className="space-y-5">
          {collapsible && (
            <p className="text-sm text-muted-foreground">
              {showTemplatePicker
                ? "Change the gallery space or adjust dimensions. Switching layout may remove works on walls that no longer exist."
                : "Adjust wall lengths and ceiling height. Existing artworks are kept in place where possible."}
            </p>
          )}
          {showTemplatePicker && onTemplateChange && (
            <div className="space-y-2">
              <Label htmlFor="room-template">Gallery space</Label>
              <select
                id="room-template"
                value={templateId}
                disabled={disabled}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="flex h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm"
              >
                {listRoomTemplateMeta().map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                {getRoomTemplateMeta(templateId).description}
              </p>
            </div>
          )}

          {params.map((param) => (
            <div key={param.key} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor={`room-param-${param.key}`}>{param.label}</Label>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {resolvedDraft[param.key].toFixed(param.step < 1 ? 1 : 0)}{" "}
                  {param.unit}
                </span>
              </div>
              <input
                id={`room-param-${param.key}`}
                type="range"
                min={param.min}
                max={param.max}
                step={param.step}
                value={resolvedDraft[param.key]}
                disabled={disabled}
                onChange={(e) => updateParam(param.key, e.target.value)}
                className="w-full accent-primary"
              />
            </div>
          ))}

          {showApplyButton && onApply && (
            <Button
              type="button"
              onClick={handleApply}
              disabled={disabled || saving || !dirty}
            >
              {saving ? "Saving…" : applyLabel}
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
}
