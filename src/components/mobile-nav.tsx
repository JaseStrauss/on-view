import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ImagePlus,
  LogOut,
  Menu,
  MoreHorizontal,
  Palette,
  Settings,
  X,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { DEMO_STUDIO_PATH } from "@/lib/demo/public-demo";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  user: User | null;
  onSignOut: () => Promise<void>;
  publicDemoOnly: boolean;
}

interface NavLinkItem {
  to: string;
  label: string;
  icon?: React.ReactNode;
}

function NavLink({
  item,
  onNavigate,
}: {
  item: NavLinkItem;
  onNavigate: () => void;
}) {
  return (
    <Button
      variant="ghost"
      className="h-11 w-full justify-start gap-3 px-3 text-base"
      render={<Link to={item.to} onClick={onNavigate} />}
    >
      {item.icon}
      {item.label}
    </Button>
  );
}

export function MobileNav({
  user,
  onSignOut,
  publicDemoOnly,
}: MobileNavProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) setMoreOpen(false);
  }, [open]);

  function closeMenu() {
    setOpen(false);
  }

  async function handleSignOut() {
    closeMenu();
    await onSignOut();
    navigate("/");
  }

  const primaryLinks: NavLinkItem[] = user
    ? [
      { to: "/studio", label: "Exhibitions" },
      { to: "/show/demo", label: "Demo exhibition" },
    ]
    : [
      { to: "/show/demo", label: "Demo exhibition" },
      { to: DEMO_STUDIO_PATH, label: "Demo studio" },
      ...(publicDemoOnly
        ? []
        : [
          { to: "/login", label: "Sign in" },
          { to: "/signup", label: "Get started" },
        ]),
    ];

  const moreLinks: NavLinkItem[] = user
    ? [
      {
        to: "/studio/artworks/bulk",
        label: "Bulk import",
        icon: <ImagePlus className="size-4" />,
      },
      {
        to: "/studio/settings",
        label: "Settings",
        icon: <Settings className="size-4" />,
      },
    ]
    : [];

  return (
    <>
      <div className="flex items-center gap-1 md:hidden">
        <ThemeToggle />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!open}
        onClick={closeMenu}
      />

      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-xs flex-col border-l border-border bg-background shadow-xl transition-transform duration-200 ease-out md:hidden",
          open ? "translate-x-0" : "translate-x-full",
        )}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b px-4 py-4">
          <Link
            to="/"
            className="flex items-center gap-2"
            onClick={closeMenu}
          >
            <Palette className="size-5" />
            <span className="font-serif text-xl italic">On View</span>
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close menu"
            onClick={closeMenu}
          >
            <X className="size-5" />
          </Button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {primaryLinks.map((item) => (
            <NavLink key={item.to} item={item} onNavigate={closeMenu} />
          ))}

          {user && moreLinks.length > 0 && (
            <div className="mt-2 border-t border-border pt-2">
              <Button
                type="button"
                variant="ghost"
                className="h-11 w-full justify-start gap-3 px-3 text-base"
                aria-expanded={moreOpen}
                onClick={() => setMoreOpen((current) => !current)}
              >
                <MoreHorizontal className="size-4" />
                More
              </Button>
              {moreOpen && (
                <div className="mt-1 space-y-1 pl-2">
                  {moreLinks.map((item) => (
                    <NavLink key={item.to} item={item} onNavigate={closeMenu} />
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        {user && (
          <div className="border-t p-3">
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full justify-start gap-3"
              onClick={handleSignOut}
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}
