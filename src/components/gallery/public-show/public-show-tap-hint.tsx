import { useCallback, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const ORBIT_HINT_KEY = "on-view-public-orbit-hint-dismissed";
const TAP_HINT_KEY = "on-view-public-tap-hint-dismissed";

function isOrbitHintDismissed(): boolean {
  return localStorage.getItem(ORBIT_HINT_KEY) === "1";
}

function dismissOrbitHint(): void {
  localStorage.setItem(ORBIT_HINT_KEY, "1");
}

function isTapHintDismissed(): boolean {
  return localStorage.getItem(TAP_HINT_KEY) === "1";
}

function dismissTapHint(): void {
  localStorage.setItem(TAP_HINT_KEY, "1");
}

interface PublicShowTapHintProps {
  visible: boolean;
  onDismiss: () => void;
}

export function PublicShowTapHint({ visible, onDismiss }: PublicShowTapHintProps) {
  if (!visible) return null;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-14 z-20 flex justify-center px-4 md:hidden"
      role="status"
    >
      <div className="pointer-events-auto flex max-w-sm items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm shadow-lg">
        <span>Tap a work in the gallery</span>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onDismiss}
          aria-label="Dismiss hint"
        >
          <X className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function usePublicShowTapHint(hasPlacements: boolean) {
  const [dismissed, setDismissed] = useState(isTapHintDismissed);

  const handleDismiss = useCallback(() => {
    dismissTapHint();
    setDismissed(true);
  }, []);

  return {
    showTapHint: hasPlacements && !dismissed,
    dismissTapHint: handleDismiss,
  };
}

interface PublicShowOrbitHintProps {
  visible: boolean;
  isMobile: boolean;
  onDismiss: () => void;
}

export function PublicShowOrbitHint({
  visible,
  isMobile,
  onDismiss,
}: PublicShowOrbitHintProps) {
  if (!visible) return null;

  const message = isMobile
    ? "Drag to look around · pinch to zoom"
    : "Drag to look around · scroll to zoom";

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-6"
      role="status"
    >
      <div
        className="pointer-events-auto flex max-w-md items-center gap-2 rounded-full border border-border/80 bg-card/95 px-5 py-3 text-center text-sm shadow-lg backdrop-blur-sm"
      >
        <span>{message}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="shrink-0"
          onClick={onDismiss}
          aria-label="Dismiss hint"
        >
          <X className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function usePublicShowOrbitHint(hasPlacements: boolean) {
  const [dismissed, setDismissed] = useState(isOrbitHintDismissed);

  const handleDismiss = useCallback(() => {
    dismissOrbitHint();
    setDismissed(true);
  }, []);

  return {
    showOrbitHint: hasPlacements && !dismissed,
    dismissOrbitHint: handleDismiss,
  };
}
