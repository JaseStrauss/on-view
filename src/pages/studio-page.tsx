import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ImagePlus, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'
import { GettingStartedChecklist } from '@/components/getting-started-checklist'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DeleteExhibitionControl } from '@/components/studio/delete-exhibition-control'
import { DuplicateExhibitionControl } from '@/components/studio/duplicate-exhibition-control'
import { StudioCatalogue } from '@/components/studio/studio-catalogue'
import { fetchArtworks } from '@/services/artworks'
import { seedDemoForUser } from '@/services/demo'
import { useExhibitions } from '@/hooks/use-exhibitions'
import {
  StudioArtworkGridSkeleton,
  StudioExhibitionsSkeleton,
} from '@/components/loading-skeletons'
import {
  buildOnboardingProgress,
  dismissOnboarding,
  fetchUserHasPlacements,
  getPrimaryExhibitionId,
  getPublishTargetExhibitionId,
  isOnboardingComplete,
  isOnboardingDismissed,
} from '@/lib/studio-onboarding'
import {
  getDefaultRoomConfig,
  getRoomTemplateMeta,
  listRoomTemplateMeta,
} from '@/rooms/room-config'
import type { Artwork } from '@/types/artwork'

export function StudioPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const {
    exhibitions,
    loading: exhibitionsLoading,
    createExhibition,
    deleteExhibition,
    duplicateExhibition,
    refresh: refreshExhibitions,
  } = useExhibitions(user?.id)
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showExhibitionForm, setShowExhibitionForm] = useState(false)
  const [exTitle, setExTitle] = useState('')
  const [roomId, setRoomId] = useState('white-cube')
  const [creating, setCreating] = useState(false)
  const [seedingDemo, setSeedingDemo] = useState(false)
  const [hasPlacements, setHasPlacements] = useState(false)
  const [onboardingDismissed, setOnboardingDismissed] = useState(false)

  async function loadStudioData() {
    const nextArtworks = await fetchArtworks()
    setArtworks(nextArtworks)
    return nextArtworks
  }

  useEffect(() => {
    const userId = user?.id
    if (!userId) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function initStudio(activeUserId: string) {
      setLoading(true)
      setError(null)

      try {
        const nextArtworks = await loadStudioData()

        if (
          !cancelled &&
          nextArtworks.length === 0 &&
          !exhibitionsLoading &&
          exhibitions.length === 0
        ) {
          setSeedingDemo(true)
          await seedDemoForUser(activeUserId)
          await loadStudioData()
          await refreshExhibitions()
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load exhibitions')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
          setSeedingDemo(false)
        }
      }
    }

    if (!exhibitionsLoading) {
      initStudio(userId)
    }

    return () => {
      cancelled = true
    }
  }, [user?.id, exhibitionsLoading, exhibitions.length, refreshExhibitions])

  useEffect(() => {
    if (!user?.id) return
    setOnboardingDismissed(isOnboardingDismissed(user.id))
  }, [user?.id])

  useEffect(() => {
    if (searchParams.get('new-exhibition') !== '1') return
    setShowExhibitionForm(true)
    setSearchParams({}, { replace: true })
  }, [searchParams, setSearchParams])

  useEffect(() => {
    if (exhibitionsLoading || exhibitions.length === 0) {
      setHasPlacements(false)
      return
    }

    let cancelled = false

    fetchUserHasPlacements(exhibitions.map((exhibition) => exhibition.id))
      .then((result) => {
        if (!cancelled) setHasPlacements(result)
      })
      .catch(() => {
        if (!cancelled) setHasPlacements(false)
      })

    return () => {
      cancelled = true
    }
  }, [exhibitions, exhibitionsLoading])

  const onboardingProgress = useMemo(
    () =>
      buildOnboardingProgress(artworks.length, exhibitions, hasPlacements),
    [artworks.length, exhibitions, hasPlacements],
  )

  const showOnboardingChecklist =
    Boolean(user?.id) &&
    !onboardingDismissed &&
    !isOnboardingComplete(onboardingProgress) &&
    !loading &&
    !exhibitionsLoading &&
    !seedingDemo

  function handleDismissOnboarding() {
    if (!user?.id) return
    dismissOnboarding(user.id)
    setOnboardingDismissed(true)
  }

  async function handleCreateExhibition(e: React.FormEvent) {
    e.preventDefault()
    if (!exTitle.trim()) return
    setCreating(true)
    try {
      const ex = await createExhibition(
        exTitle.trim(),
        roomId,
        undefined,
        getDefaultRoomConfig(roomId),
      )
      toast.success(`"${ex.title}" created`)
      navigate(`/studio/exhibitions/${ex.id}`)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl italic">Your exhibitions</h1>
          <p className="mt-2 text-muted-foreground">
            Catalogue your works and turn them into exhibitions you can share.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" render={<Link to="/studio/artworks/bulk" />}>
            Bulk import
          </Button>
          <Button render={<Link to="/studio/artworks/new" />}>
            <ImagePlus className="size-4" />
            Add artwork
          </Button>
        </div>
      </div>

      {showOnboardingChecklist && (
        <GettingStartedChecklist
          progress={onboardingProgress}
          exhibitionId={getPrimaryExhibitionId(exhibitions)}
          publishTargetExhibitionId={getPublishTargetExhibitionId(exhibitions)}
          onDismiss={handleDismissOnboarding}
        />
      )}

      {/* Exhibitions */}
      <section className="mt-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl italic">Exhibitions</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Shows you&apos;re building. Hang works, then open and share.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowExhibitionForm(!showExhibitionForm)}
          >
            <Plus className="size-4" />
            {showExhibitionForm ? 'Cancel' : 'New exhibition'}
          </Button>
        </div>

        {showExhibitionForm && (
          <Card className="mt-4">
            <CardContent className="pt-6">
              <form onSubmit={handleCreateExhibition} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Start with a title and gallery space. You can fine-tune the
                  room and hang works after creating the show.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ex-title">Exhibition title</Label>
                    <Input
                      id="ex-title"
                      value={exTitle}
                      onChange={(e) => setExTitle(e.target.value)}
                      placeholder="Summer group show"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="room">Gallery space</Label>
                    <select
                      id="room"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      className="flex h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm"
                    >
                      {listRoomTemplateMeta().map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground">
                      {getRoomTemplateMeta(roomId).description}
                    </p>
                  </div>
                </div>
                <Button type="submit" disabled={creating}>
                  {creating ? 'Creating…' : 'Create exhibition'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {exhibitionsLoading || seedingDemo ? (
          seedingDemo ? (
            <p className="mt-6 text-muted-foreground">
              Setting up your sample exhibition…
            </p>
          ) : (
            <StudioExhibitionsSkeleton />
          )
        ) : exhibitions.length === 0 ? (
          <Card className="mt-6 border-dashed">
            <CardHeader className="text-center">
              <CardTitle className="font-serif text-xl italic">
                No exhibitions yet
              </CardTitle>
              <CardDescription>
                Create a show and hang works in a 3D gallery space, or{' '}
                <Link to="/show/demo" className="underline">
                  explore the demo exhibition
                </Link>
                .
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <ul className="mt-6 divide-y rounded-xl border bg-card">
            {exhibitions.map((ex) => (
              <li
                key={ex.id}
                className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
              >
                <div>
                  <Link
                    to={`/studio/exhibitions/${ex.id}`}
                    className="font-medium hover:underline"
                  >
                    {ex.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {ex.is_published ? 'Open' : 'Draft'} ·{' '}
                    {getRoomTemplateMeta(ex.room_template_id).name}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {ex.is_published && (
                    <Link
                      to={`/show/${ex.slug}`}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      View exhibition
                    </Link>
                  )}
                  <DuplicateExhibitionControl
                    variant="icon"
                    exhibitionId={ex.id}
                    exhibitionTitle={ex.title}
                    onDuplicate={duplicateExhibition}
                    onDuplicated={(copy) =>
                      navigate(`/studio/exhibitions/${copy.id}`)
                    }
                  />
                  <DeleteExhibitionControl
                    variant="icon"
                    exhibitionId={ex.id}
                    exhibitionTitle={ex.title}
                    onDelete={deleteExhibition}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Catalogue */}
      <section className="mt-14">
        <div>
          <h2 className="font-serif text-2xl italic">Catalogue</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your works in one place: titles, images, dimensions, and status.
          </p>
        </div>

        {loading || seedingDemo ? (
          seedingDemo ? (
            <p className="mt-6 text-muted-foreground">
              Adding sample works to your catalogue…
            </p>
          ) : (
            <StudioArtworkGridSkeleton />
          )
        ) : null}
        {error && <p className="mt-6 text-sm text-destructive">{error}</p>}

        {!loading && !seedingDemo && !error && (
          <StudioCatalogue
            artworks={artworks}
            onArtworksChange={setArtworks}
          />
        )}
      </section>
    </div>
  )
}
