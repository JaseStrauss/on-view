import { DEMO_STUDIO_BANNER } from "@/lib/public-demo";

export function DemoStudioBanner() {
  return (
    <div
      className="border-b border-border/60 bg-muted/40 px-6 py-2.5 text-center text-sm text-muted-foreground"
      role="status"
    >
      {DEMO_STUDIO_BANNER}
    </div>
  );
}
