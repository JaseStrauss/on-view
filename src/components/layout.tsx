import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Palette, Settings } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";
import { Button } from "@/components/ui/button";
import {
  DEMO_STUDIO_PATH,
  isPublicDemoOnly,
} from "@/lib/demo/public-demo";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const publicDemoOnly = isPublicDemoOnly();

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  function navLinkClass(isActive: boolean) {
    return cn(isActive && "bg-muted");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <Palette className="size-5" />
            <span className="font-serif text-2xl italic">On View</span>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            <ThemeToggle />

            {user ? (
              <>
                <Button
                  variant="ghost"
                  className={navLinkClass(pathname.startsWith("/studio") && pathname !== DEMO_STUDIO_PATH)}
                  render={<Link to="/studio" />}
                >
                  Exhibitions
                </Button>
                <Button
                  variant="ghost"
                  className={navLinkClass(pathname.startsWith("/show/"))}
                  render={<Link to="/show/demo" />}
                >
                  Demo exhibition
                </Button>
                <Button
                  variant="ghost"
                  className={navLinkClass(pathname.startsWith("/studio/settings"))}
                  render={<Link to="/studio/settings" />}
                >
                  <Settings className="size-4" />
                  Settings
                </Button>
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut className="size-4" />
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className={navLinkClass(pathname.startsWith("/show/"))}
                  render={<Link to="/show/demo" />}
                >
                  Demo exhibition
                </Button>
                <Button
                  variant={pathname === DEMO_STUDIO_PATH ? "secondary" : "ghost"}
                  className={navLinkClass(pathname === DEMO_STUDIO_PATH)}
                  render={<Link to={DEMO_STUDIO_PATH} />}
                >
                  Demo studio
                </Button>
                {!publicDemoOnly && (
                  <>
                    <Button variant="ghost" render={<Link to="/login" />}>
                      Sign in
                    </Button>
                    <Button render={<Link to="/signup" />}>Get started</Button>
                  </>
                )}
              </>
            )}
          </nav>

          <MobileNav
            user={user}
            onSignOut={signOut}
            publicDemoOnly={publicDemoOnly}
          />
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
