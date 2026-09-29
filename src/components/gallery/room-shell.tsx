import type { RoomTemplate } from "@/types";

function Wall({
  width,
  height,
  position,
  rotation,
}: {
  width: number;
  height: number;
  position: [number, number, number];
  rotation: [number, number, number];
}) {
  return (
    <mesh position={position} rotation={rotation} receiveShadow raycast={() => null}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial color="#f5f5f4" roughness={0.95} metalness={0} />
    </mesh>
  );
}

export function RoomShell({ room }: { room: RoomTemplate }) {
  const [floorCenterX, floorCenterZ] = room.floorCenter ?? [0, 0];

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[floorCenterX, 0, floorCenterZ]}
        receiveShadow
        raycast={() => null}
      >
        <planeGeometry args={room.floorSize} />
        <meshStandardMaterial color="#e7e5e4" roughness={1} />
      </mesh>

      {room.walls.map((wall) => (
        <Wall
          key={wall.id}
          width={wall.width}
          height={wall.height}
          position={wall.position}
          rotation={wall.rotation}
        />
      ))}
    </group>
  );
}
