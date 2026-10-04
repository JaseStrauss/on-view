import { Skeleton } from "@/components/ui/skeleton";
import { GALLERY_VIEWPORT_CLASS } from "@/components/gallery/room/gallery-viewport";
import { cn } from "@/lib/utils";

export function StudioExhibitionsSkeleton() {
  return (
    <ul className="mt-6 divide-y rounded-xl border bg-card">
      {Array.from({ length: 2 }).map((_, index) => (
        <li
          key={index}
          className="flex items-center justify-between gap-4 px-5 py-4"
        >
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-4 w-20" />
        </li>
      ))}
    </ul>
  );
}

export function StudioArtworkGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-xl border bg-card">
          <Skeleton className="aspect-[4/5] w-full rounded-none" />
          <div className="space-y-2 p-6">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ExhibitionEditorSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-12">
      <div className="space-y-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-72 max-w-full" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-28" />
        ))}
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

export function PublicShowSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
          <Skeleton className="h-4 w-16" />
          <div className="flex gap-2">
            <Skeleton className="size-8 rounded-lg" />
            <Skeleton className="size-8 rounded-lg" />
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-6 pb-16 pt-6 text-center md:pb-24 md:pt-10">
          <Skeleton className="mx-auto h-3 w-24" />
          <Skeleton className="mx-auto mt-6 h-12 w-full max-w-lg" />
          <Skeleton className="mx-auto mt-5 h-4 w-40" />
          <Skeleton className="mx-auto mt-8 h-20 w-full max-w-xl" />
        </div>
      </header>

      <section className="border-b border-border/60 bg-muted/20 px-6 py-14 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <Skeleton className="mx-auto h-3 w-28" />
            <Skeleton className="mx-auto mt-3 h-4 w-64" />
          </div>
          <Skeleton className={cn("w-full rounded-xl", GALLERY_VIEWPORT_CLASS)} />
        </div>
      </section>
    </div>
  );
}
