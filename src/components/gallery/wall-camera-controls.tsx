import type { WallDefinition } from "@/types";
import { cn } from "@/lib/utils";

interface WallCameraControlsProps {
  walls: WallDefinition[];
  viewingWallId: string | null;
  onViewWall: (wallId: string | null) => void;
  className?: string;
}

export function WallCameraControls({
  walls,
  viewingWallId,
  onViewWall,
  className,
}: WallCameraControlsProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-1.5",
        className,
      )}
      role="toolbar"
      aria-label="Gallery view controls"
    >
      <button
        type="button"
        onClick={() => onViewWall(null)}
        className={cn(
          "rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-sm transition-colors",
          viewingWallId === null
            ? "border-foreground/20 bg-foreground/90 text-background"
            : "border-border/60 bg-background/80 text-foreground hover:bg-background",
        )}
      >
        Overview
      </button>
      {walls.map((wall) => (
        <button
          key={wall.id}
          type="button"
          onClick={() => onViewWall(wall.id)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-sm transition-colors",
            viewingWallId === wall.id
              ? "border-foreground/20 bg-foreground/90 text-background"
              : "border-border/60 bg-background/80 text-foreground hover:bg-background",
          )}
        >
          {wall.label}
        </button>
      ))}
    </div>
  );
}
