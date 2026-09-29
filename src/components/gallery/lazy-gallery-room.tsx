import { lazy, Suspense } from "react";
import type { GalleryRoomProps } from "@/components/gallery/gallery-room-types";
import { GALLERY_VIEWPORT_CLASS } from "@/components/gallery/gallery-viewport";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const GalleryRoom = lazy(() =>
  import("@/components/gallery/gallery-room").then((module) => ({
    default: module.GalleryRoom,
  })),
);

function GalleryRoomFallback({ className }: { className?: string }) {
  return (
    <Skeleton
      className={cn(GALLERY_VIEWPORT_CLASS, "w-full rounded-xl", className)}
      aria-hidden
    />
  );
}

export function LazyGalleryRoom(props: GalleryRoomProps) {
  return (
    <Suspense fallback={<GalleryRoomFallback className={props.className} />}>
      <GalleryRoom {...props} />
    </Suspense>
  );
}

export { GALLERY_VIEWPORT_CLASS } from "@/components/gallery/gallery-viewport";
