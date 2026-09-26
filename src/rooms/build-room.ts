import type { RoomTemplate, WallDefinition } from "@/types";
import type { RoomConfig } from "./room-config";
import { mergeRoomConfig } from "./room-config";

function makeWall(
  id: string,
  label: string,
  width: number,
  height: number,
  position: [number, number, number],
  rotation: [number, number, number],
): WallDefinition {
  return { id, label, width, height, position, rotation };
}

function buildWhiteCube(config: RoomConfig): RoomTemplate {
  const width = config.roomWidth;
  const depth = config.roomDepth;
  const height = config.wallHeight;
  const halfW = width / 2;
  const halfD = depth / 2;
  const y = height / 2;

  return {
    id: "white-cube",
    name: "White Cube",
    description:
      "A rectangular gallery room with four hangable walls. Width and depth can differ.",
    floorSize: [width + 2, depth + 2],
    cameraPosition: [halfW * 0.6, y + 0.05, halfD * 0.65],
    cameraTarget: [0, y - 0.25, -halfD * 0.45],
    walls: [
      makeWall("north", "North wall", width, height, [0, y, -halfD], [0, 0, 0]),
      makeWall(
        "east",
        "East wall",
        depth,
        height,
        [halfW, y, 0],
        [0, -Math.PI / 2, 0],
      ),
      makeWall(
        "south",
        "South wall",
        width,
        height,
        [0, y, halfD],
        [0, Math.PI, 0],
      ),
      makeWall(
        "west",
        "West wall",
        depth,
        height,
        [-halfW, y, 0],
        [0, Math.PI / 2, 0],
      ),
    ],
  };
}

function buildSalon(config: RoomConfig): RoomTemplate {
  const width = config.roomWidth;
  const depth = config.roomDepth;
  const height = config.wallHeight;
  const halfW = width / 2;
  const halfD = depth / 2;
  const y = height / 2;

  return {
    id: "salon",
    name: "Narrow Salon",
    description:
      "A wide salon with long side walls, suited to a linear hang of larger works.",
    floorSize: [width + 2, depth + 2],
    cameraPosition: [0, y + 0.05, halfD * 0.75],
    cameraTarget: [0, y - 0.05, -halfD * 0.65],
    walls: [
      makeWall(
        "left",
        "Left wall",
        depth,
        height,
        [-halfW, y, 0],
        [0, Math.PI / 2, 0],
      ),
      makeWall(
        "right",
        "Right wall",
        depth,
        height,
        [halfW, y, 0],
        [0, -Math.PI / 2, 0],
      ),
      makeWall("end", "End wall", width, height, [0, y, -halfD], [0, 0, 0]),
    ],
  };
}

function buildCorridor(config: RoomConfig): RoomTemplate {
  const width = config.roomWidth;
  const length = config.roomLength;
  const height = config.wallHeight;
  const halfW = width / 2;
  const halfL = length / 2;
  const y = height / 2;

  return {
    id: "corridor",
    name: "Gallery Corridor",
    description: "A long narrow space, ideal for a focused solo presentation.",
    floorSize: [width + 1, length + 2],
    cameraPosition: [0, y + 0.05, halfL * 0.35],
    cameraTarget: [0, y - 0.05, -halfL * 0.7],
    walls: [
      makeWall(
        "left",
        "Left wall",
        length,
        height,
        [-halfW, y, 0],
        [0, Math.PI / 2, 0],
      ),
      makeWall(
        "right",
        "Right wall",
        length,
        height,
        [halfW, y, 0],
        [0, -Math.PI / 2, 0],
      ),
      makeWall("end", "End wall", width, height, [0, y, -halfL], [0, 0, 0]),
    ],
  };
}

function buildLShape(config: RoomConfig): RoomTemplate {
  const mainWidth = config.mainWidth;
  const mainDepth = config.mainDepth;
  const wingDepth = config.wingDepth;
  const height = config.wallHeight;
  const y = height / 2;
  const halfW = mainWidth / 2;
  const halfD = mainDepth / 2;
  const wingInset = wingDepth * 0.4;
  const eastX = halfW - wingInset;
  const southZ = halfD + wingDepth * 0.55;

  return {
    id: "l-shape",
    name: "L-shaped Gallery",
    description:
      "An L-shaped plan with two wings, useful for corner galleries and split narratives.",
    floorSize: [mainWidth + wingDepth, mainDepth + wingDepth + 2],
    floorCenter: [wingDepth * 0.15, wingDepth * 0.2],
    cameraPosition: [
      halfW + wingDepth * 0.35,
      y + 0.1,
      halfD + wingDepth * 0.45,
    ],
    cameraTarget: [wingDepth * 0.1, y - 0.1, wingDepth * 0.1],
    walls: [
      makeWall(
        "north",
        "North wall (main)",
        mainWidth,
        height,
        [0, y, -halfD],
        [0, 0, 0],
      ),
      makeWall(
        "west",
        "West wall (main)",
        mainDepth,
        height,
        [-halfW, y, 0],
        [0, Math.PI / 2, 0],
      ),
      makeWall(
        "south-west",
        "South wall (west leg)",
        mainWidth - wingDepth,
        height,
        [-(wingDepth / 2), y, halfD],
        [0, Math.PI, 0],
      ),
      makeWall(
        "east-north",
        "East wall (upper)",
        halfD,
        height,
        [eastX, y, -halfD * 0.35],
        [0, -Math.PI / 2, 0],
      ),
      makeWall(
        "east-south",
        "East wall (lower)",
        wingDepth,
        height,
        [eastX, y, halfD * 0.15],
        [0, -Math.PI / 2, 0],
      ),
      makeWall(
        "south-east",
        "South wall (east leg)",
        mainWidth - wingDepth * 1.2,
        height,
        [wingDepth * 0.35, y, southZ],
        [0, Math.PI, 0],
      ),
    ],
  };
}

function buildTwoRoomSuite(config: RoomConfig): RoomTemplate {
  const size = config.roomSize;
  const gap = config.roomGap;
  const height = config.wallHeight;
  const half = size / 2;
  const y = height / 2;
  const centerA = -(gap / 2 + half);
  const centerB = gap / 2 + half;
  const outerHalf = centerB + half + 1;

  return {
    id: "two-room-suite",
    name: "Two-room Suite",
    description:
      "Two connected rooms with an open doorway: main gallery and side chamber.",
    floorSize: [outerHalf * 2, size + 2],
    cameraPosition: [0, y + 0.05, half + 2.5],
    cameraTarget: [0, y - 0.05, 0],
    walls: [
      makeWall(
        "a-north",
        "Room A, North",
        size,
        height,
        [centerA, y, -half],
        [0, 0, 0],
      ),
      makeWall(
        "a-south",
        "Room A, South",
        size,
        height,
        [centerA, y, half],
        [0, Math.PI, 0],
      ),
      makeWall(
        "a-west",
        "Room A, West",
        size,
        height,
        [centerA - half, y, 0],
        [0, Math.PI / 2, 0],
      ),
      makeWall(
        "b-north",
        "Room B, North",
        size,
        height,
        [centerB, y, -half],
        [0, 0, 0],
      ),
      makeWall(
        "b-south",
        "Room B, South",
        size,
        height,
        [centerB, y, half],
        [0, Math.PI, 0],
      ),
      makeWall(
        "b-east",
        "Room B, East",
        size,
        height,
        [centerB + half, y, 0],
        [0, -Math.PI / 2, 0],
      ),
    ],
  };
}

const BUILDERS: Record<string, (config: RoomConfig) => RoomTemplate> = {
  "white-cube": buildWhiteCube,
  salon: buildSalon,
  corridor: buildCorridor,
  "l-shape": buildLShape,
  "two-room-suite": buildTwoRoomSuite,
};

export function buildRoomTemplate(
  templateId: string,
  partialConfig?: RoomConfig | null,
): RoomTemplate {
  const config = mergeRoomConfig(templateId, partialConfig);
  const builder = BUILDERS[templateId] ?? BUILDERS["white-cube"];
  const room = builder(config);
  const meta = templateId;

  return {
    ...room,
    id: meta,
  };
}
