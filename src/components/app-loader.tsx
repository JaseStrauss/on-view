import { cn } from "@/lib/utils";

type AppLoaderLayout = "page" | "section" | "inline";

interface AppLoaderProps {
  label?: string;
  className?: string;
  layout?: AppLoaderLayout;
}

const layoutClasses: Record<AppLoaderLayout, string> = {
  page: "flex min-h-screen items-center justify-center",
  section: "flex min-h-[40vh] items-center justify-center",
  inline: "flex items-center justify-center",
};

function loadingBaseText(label?: string) {
  return (label ?? "Loading").replace(/[.…]+$/, "");
}

export function AppLoader({
  label,
  className,
  layout = "section",
}: AppLoaderProps) {
  const baseText = loadingBaseText(label);
  const statusLabel = `${baseText}...`;

  return (
    <div
      className={cn(layoutClasses[layout], className)}
      role="status"
      aria-live="polite"
      aria-label={statusLabel}
    >
      <p className="text-sm text-muted-foreground">
        {baseText}
        <span
          className="loader-ellipsis inline-block w-[3ch] text-left"
          aria-hidden="true"
        />
      </p>
    </div>
  );
}
