export interface RoomParamDefinition {
  key: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  default: number;
}

export type RoomConfig = Record<string, number>;

export interface RoomTemplateMeta {
  id: string;
  name: string;
  description: string;
  params: RoomParamDefinition[];
}

export const ROOM_TEMPLATE_META: Record<string, RoomTemplateMeta> = {
  "white-cube": {
    id: "white-cube",
    name: "White Cube",
    description:
      "A rectangular gallery room with four hangable walls. Width and depth can differ.",
    params: [
      {
        key: "roomWidth",
        label: "Room width",
        unit: "m",
        min: 4,
        max: 16,
        step: 0.5,
        default: 8,
      },
      {
        key: "roomDepth",
        label: "Room depth",
        unit: "m",
        min: 4,
        max: 16,
        step: 0.5,
        default: 8,
      },
      {
        key: "wallHeight",
        label: "Ceiling height",
        unit: "m",
        min: 2.5,
        max: 5,
        step: 0.1,
        default: 3.5,
      },
    ],
  },
  salon: {
    id: "salon",
    name: "Narrow Salon",
    description:
      "A wide salon with long side walls, suited to a linear hang of larger works.",
    params: [
      {
        key: "roomWidth",
        label: "Room width",
        unit: "m",
        min: 6,
        max: 12,
        step: 0.5,
        default: 8,
      },
      {
        key: "roomDepth",
        label: "Room depth",
        unit: "m",
        min: 8,
        max: 18,
        step: 0.5,
        default: 12,
      },
      {
        key: "wallHeight",
        label: "Ceiling height",
        unit: "m",
        min: 2.5,
        max: 5,
        step: 0.1,
        default: 3.5,
      },
    ],
  },
  corridor: {
    id: "corridor",
    name: "Gallery Corridor",
    description: "A long narrow space, ideal for a focused solo presentation.",
    params: [
      {
        key: "roomWidth",
        label: "Corridor width",
        unit: "m",
        min: 4,
        max: 8,
        step: 0.5,
        default: 5,
      },
      {
        key: "roomLength",
        label: "Corridor length",
        unit: "m",
        min: 10,
        max: 22,
        step: 0.5,
        default: 14,
      },
      {
        key: "wallHeight",
        label: "Ceiling height",
        unit: "m",
        min: 2.5,
        max: 5,
        step: 0.1,
        default: 3.5,
      },
    ],
  },
  "l-shape": {
    id: "l-shape",
    name: "L-shaped Gallery",
    description:
      "An L-shaped plan with two wings, useful for corner galleries and split narratives.",
    params: [
      {
        key: "mainWidth",
        label: "Main wing width",
        unit: "m",
        min: 8,
        max: 14,
        step: 0.5,
        default: 10,
      },
      {
        key: "mainDepth",
        label: "Main wing depth",
        unit: "m",
        min: 6,
        max: 12,
        step: 0.5,
        default: 8,
      },
      {
        key: "wingDepth",
        label: "Side wing depth",
        unit: "m",
        min: 3,
        max: 8,
        step: 0.5,
        default: 5,
      },
      {
        key: "wallHeight",
        label: "Ceiling height",
        unit: "m",
        min: 2.5,
        max: 5,
        step: 0.1,
        default: 3.5,
      },
    ],
  },
  "two-room-suite": {
    id: "two-room-suite",
    name: "Two-room Suite",
    description:
      "Two connected rooms with an open doorway: main gallery and side chamber.",
    params: [
      {
        key: "roomSize",
        label: "Each room size",
        unit: "m",
        min: 4,
        max: 10,
        step: 0.5,
        default: 6,
      },
      {
        key: "roomGap",
        label: "Opening width",
        unit: "m",
        min: 1,
        max: 4,
        step: 0.5,
        default: 1,
      },
      {
        key: "wallHeight",
        label: "Ceiling height",
        unit: "m",
        min: 2.5,
        max: 5,
        step: 0.1,
        default: 3.5,
      },
    ],
  },
};

export const ROOM_TEMPLATE_ORDER: string[] = [
  "white-cube",
  "salon",
  "corridor",
  "l-shape",
  "two-room-suite",
];

function clampValue(value: number, def: RoomParamDefinition): number {
  const stepped = Math.round(value / def.step) * def.step;
  return Math.min(def.max, Math.max(def.min, stepped));
}

export function getRoomParamDefinitions(
  templateId: string,
): RoomParamDefinition[] {
  return ROOM_TEMPLATE_META[templateId]?.params ?? [];
}

export function getDefaultRoomConfig(templateId: string): RoomConfig {
  const params = getRoomParamDefinitions(templateId);
  return Object.fromEntries(params.map((p) => [p.key, p.default]));
}

function applyLegacyRoomConfig(
  templateId: string,
  partial: RoomConfig,
  merged: RoomConfig,
): RoomConfig {
  if (templateId === "white-cube" && partial.roomSize !== undefined) {
    const legacySize = partial.roomSize;
    if (partial.roomWidth === undefined) {
      merged.roomWidth = legacySize;
    }
    if (partial.roomDepth === undefined) {
      merged.roomDepth = legacySize;
    }
  }
  return merged;
}

export function mergeRoomConfig(
  templateId: string,
  partial?: RoomConfig | null,
): RoomConfig {
  const defaults = getDefaultRoomConfig(templateId);
  const defs = getRoomParamDefinitions(templateId);
  const merged: RoomConfig = { ...defaults };

  if (!partial) return merged;

  applyLegacyRoomConfig(templateId, partial, merged);

  for (const def of defs) {
    const raw = partial[def.key];
    if (typeof raw === "number" && Number.isFinite(raw)) {
      merged[def.key] = clampValue(raw, def);
    }
  }

  return merged;
}

export function getRoomTemplateMeta(templateId: string): RoomTemplateMeta {
  return ROOM_TEMPLATE_META[templateId] ?? ROOM_TEMPLATE_META["white-cube"];
}

export function listRoomTemplateMeta(): RoomTemplateMeta[] {
  return ROOM_TEMPLATE_ORDER.map((id) => ROOM_TEMPLATE_META[id]).filter(
    Boolean,
  );
}

function formatDimension(value: number, step = 0.5): string {
  return value.toFixed(step < 1 ? 1 : 0);
}

export function formatRoomConfigSummary(
  templateId: string,
  config: RoomConfig,
): string {
  const merged = mergeRoomConfig(templateId, config);
  const meta = getRoomTemplateMeta(templateId);
  const ceiling = `${formatDimension(merged.wallHeight, 0.1)} m ceiling`;

  if (templateId === "corridor") {
    return `${meta.name} · ${formatDimension(merged.roomWidth)} × ${formatDimension(merged.roomLength)} m · ${ceiling}`;
  }

  if (templateId === "l-shape") {
    return `${meta.name} · ${formatDimension(merged.mainWidth)} × ${formatDimension(merged.mainDepth)} m · ${ceiling}`;
  }

  if (templateId === "two-room-suite") {
    return `${meta.name} · ${formatDimension(merged.roomSize)} m rooms · ${ceiling}`;
  }

  return `${meta.name} · ${formatDimension(merged.roomWidth)} × ${formatDimension(merged.roomDepth)} m · ${ceiling}`;
}
