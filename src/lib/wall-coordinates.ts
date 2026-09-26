import type { WallDefinition } from "@/types";

/** Wall space in metres; origin at floor-centre of the wall. */
export interface WallPoint {
  x: number;
  y: number;
}

export interface WallCanvasRect {
  wallWidthM: number;
  wallHeightM: number;
  canvasWidthPx: number;
  canvasHeightPx: number;
}

export const DEFAULT_HANG_HEIGHT_M = 1.45;
export const SNAP_INTERVAL_M = 0.05;
export const MIN_PLACEMENT_SCALE = 0.25;
export const MAX_PLACEMENT_SCALE = 3;
export const SCALE_SNAP = 0.05;
export const ROTATION_SNAP_DEG = 5;

export function clampScale(scale: number): number {
  const clamped = Math.max(
    MIN_PLACEMENT_SCALE,
    Math.min(MAX_PLACEMENT_SCALE, scale),
  );
  return Math.round(clamped / SCALE_SNAP) * SCALE_SNAP;
}

export function snapRotation(degrees: number): number {
  return Math.round(degrees / ROTATION_SNAP_DEG) * ROTATION_SNAP_DEG;
}

export function normalizeRotation(degrees: number): number {
  let value = degrees % 360;
  if (value > 180) value -= 360;
  if (value <= -180) value += 360;
  return snapRotation(value);
}

export function snapToGrid(value: number): number {
  return Math.round(value / SNAP_INTERVAL_M) * SNAP_INTERVAL_M;
}

export function artworkSizeM(
  widthCm: number | null,
  heightCm: number | null,
  scale = 1,
): { widthM: number; heightM: number } {
  return {
    widthM: ((widthCm ?? 60) / 100) * scale,
    heightM: ((heightCm ?? 80) / 100) * scale,
  };
}

export function worldToPixelCenter(
  point: WallPoint,
  rect: WallCanvasRect,
): { left: number; top: number } {
  const { wallWidthM, wallHeightM, canvasWidthPx, canvasHeightPx } = rect;
  return {
    left: ((point.x + wallWidthM / 2) / wallWidthM) * canvasWidthPx,
    top: (1 - point.y / wallHeightM) * canvasHeightPx,
  };
}

export function pixelCenterToWorld(
  left: number,
  top: number,
  rect: WallCanvasRect,
): WallPoint {
  const { wallWidthM, wallHeightM, canvasWidthPx, canvasHeightPx } = rect;
  return {
    x: snapToGrid((left / canvasWidthPx) * wallWidthM - wallWidthM / 2),
    y: snapToGrid((1 - top / canvasHeightPx) * wallHeightM),
  };
}

export function worldToFramePixels(
  point: WallPoint,
  sizeM: { widthM: number; heightM: number },
  rect: WallCanvasRect,
): { left: number; top: number; width: number; height: number } {
  const centre = worldToPixelCenter(point, rect);
  const width = (sizeM.widthM / rect.wallWidthM) * rect.canvasWidthPx;
  const height = (sizeM.heightM / rect.wallHeightM) * rect.canvasHeightPx;

  return {
    left: centre.left - width / 2,
    top: centre.top - height / 2,
    width,
    height,
  };
}

export function clampPlacement(
  point: WallPoint,
  sizeM: { widthM: number; heightM: number },
  wall: Pick<WallDefinition, "width" | "height">,
): WallPoint {
  const halfW = sizeM.widthM / 2;
  const halfH = sizeM.heightM / 2;

  return {
    x: Math.max(
      -wall.width / 2 + halfW,
      Math.min(wall.width / 2 - halfW, point.x),
    ),
    y: Math.max(halfH, Math.min(wall.height - halfH, point.y)),
  };
}

export function getCanvasRect(
  wall: Pick<WallDefinition, "width" | "height">,
  element: HTMLElement,
): WallCanvasRect {
  const { width: canvasWidthPx, height: canvasHeightPx } =
    element.getBoundingClientRect();

  return {
    wallWidthM: wall.width,
    wallHeightM: wall.height,
    canvasWidthPx,
    canvasHeightPx,
  };
}

export function pointerToWorld(
  clientX: number,
  clientY: number,
  canvasElement: HTMLElement,
  wall: Pick<WallDefinition, "width" | "height">,
): WallPoint {
  const rect = canvasElement.getBoundingClientRect();
  const canvasRect = getCanvasRect(wall, canvasElement);
  const left = clientX - rect.left;
  const top = clientY - rect.top;
  return pixelCenterToWorld(left, top, canvasRect);
}
