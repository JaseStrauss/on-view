import { cn } from "@/lib/utils";
import type { PlacementWithArtwork } from "@/types";

interface PublicShowNavProps {
  placements: PlacementWithArtwork[];
  showVirtualView?: boolean;
  className?: string;
}

export function PublicShowNav({
  placements,
  showVirtualView = true,
  className,
}: PublicShowNavProps) {
  const showWorkDropdown = placements.length > 6;

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <nav
      className={cn(
        "sticky top-0 z-20 border-b border-border/60 bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80",
        className,
      )}
      aria-label="Exhibition sections"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-6 py-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {showVirtualView && (
            <NavLink onClick={() => scrollToSection("virtual-view")}>
              Virtual view
            </NavLink>
          )}
          {placements.length > 0 && (
            <NavLink onClick={() => scrollToSection("catalogue")}>
              Catalogue
            </NavLink>
          )}
          {!showWorkDropdown &&
            placements.map((placement, index) => (
              <NavLink
                key={placement.id}
                onClick={() => scrollToSection(`work-${placement.id}`)}
                className="hidden sm:inline-flex"
              >
                {String(index + 1).padStart(2, "0")}
              </NavLink>
            ))}
        </div>

        {placements.length > 0 && (
          <label className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
            <span className="hidden sm:inline">Jump to work</span>
            <select
              className="h-8 max-w-[11rem] rounded-lg border border-input bg-background px-2 text-sm text-foreground sm:max-w-xs"
              defaultValue=""
              onChange={(event) => {
                const value = event.target.value;
                if (value) scrollToSection(value);
                event.target.value = "";
              }}
              aria-label="Jump to work"
            >
              <option value="" disabled>
                Select…
              </option>
              {placements.map((placement, index) => (
                <option key={placement.id} value={`work-${placement.id}`}>
                  {String(index + 1).padStart(2, "0")} · {placement.artwork.title}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </nav>
  );
}

function NavLink({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3 py-1.5 text-xs tracking-wide text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}
