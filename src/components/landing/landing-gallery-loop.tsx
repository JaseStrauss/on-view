import { lazy, Suspense, useMemo } from "react";
import { getDemoPublicShow } from "@/data/demo-exhibition";
import { getRoomTemplate } from "@/rooms/templates";
import { LandingRoomScene } from "@/components/landing/landing-room-scene";
import { cn } from "@/lib/utils";

const GalleryRoom = lazy(() =>
  import("@/components/gallery/gallery-room").then((module) => ({
    default: module.GalleryRoom,
  })),
);

interface LandingGalleryLoopProps {
  className?: string;
}

export function LandingGalleryLoop({ className }: LandingGalleryLoopProps) {
  const { exhibition, placements } = useMemo(() => getDemoPublicShow(), []);
  const room = useMemo(
    () => getRoomTemplate(exhibition.room_template_id),
    [exhibition.room_template_id],
  );

  return (
    <div className={cn("relative h-full w-full", className)} aria-hidden>
      <Suspense
        fallback={
          <LandingRoomScene motion className="absolute inset-0 rounded-none" />
        }
      >
        <GalleryRoom
          room={room}
          placements={placements}
          interactive={false}
          autoRotate
          className="absolute inset-0 h-full min-h-0 rounded-none border-0"
        />
      </Suspense>
    </div>
  );
}
