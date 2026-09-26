import type { Exhibition, RoomTemplate } from "@/types";
import { buildRoomTemplate } from "./build-room";
import { ROOM_TEMPLATE_ORDER, type RoomConfig } from "./room-config";

export { buildRoomTemplate } from "./build-room";
export {
  getDefaultRoomConfig,
  getRoomParamDefinitions,
  getRoomTemplateMeta,
  listRoomTemplateMeta,
  mergeRoomConfig,
  ROOM_TEMPLATE_ORDER,
  type RoomConfig,
  type RoomParamDefinition,
} from "./room-config";

/** @deprecated Use listRoomTemplateMeta() or buildRoomTemplate() */
export function listRoomTemplates(): RoomTemplate[] {
  return ROOM_TEMPLATE_ORDER.map((id) => getRoomTemplate(id));
}

export function getRoomTemplate(
  id: string,
  config?: RoomConfig | null,
): RoomTemplate {
  return buildRoomTemplate(id, config);
}

export function resolveExhibitionRoom(exhibition: Exhibition): RoomTemplate {
  return buildRoomTemplate(exhibition.room_template_id, exhibition.room_config);
}

export const DEFAULT_CHECKLIST = [
  "Wall labels printed",
  "Lighting checked",
  "Artworks installed",
  "Condition reports updated",
  "Press photos taken",
  "Opening checklist complete",
];

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}
