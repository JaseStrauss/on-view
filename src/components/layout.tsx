import { Link, useNavigate } from 'react-router-dom'
import { ImagePlus, LogOut, Palette } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen">
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to={user ? '/studio' : '/'} className="flex items-center gap-2">
            <Palette className="size-5" />
            <span className="font-serif text-2xl italic">On View</span>
          </Link>

          <nav className="flex items-center gap-2">
            {user ? (
              <>
                <Button variant="ghost" render={<Link to="/studio" />}>
                  Studio
                </Button>
                <Button variant="ghost" render={<Link to="/studio/artworks/new" />}>
                  <ImagePlus className="size-4" />
                  Add artwork
                </Button>
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut className="size-4" />
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" render={<Link to="/login" />}>
                  Sign in
                </Button>
                <Button render={<Link to="/signup" />}>Get started</Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>{children}</main>
    </div>
  )
}
