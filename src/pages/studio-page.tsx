import { Link } from 'react-router-dom'
import { ImagePlus } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { GettingStartedChecklist } from '@/components/getting-started-checklist'
import { StudioExhibitionsSection } from '@/components/studio/studio-exhibitions-section'
import { StudioCatalogue } from '@/components/studio/studio-catalogue'
import { StudioArtworkGridSkeleton } from '@/components/loading-skeletons'
import { useExhibitions } from '@/hooks/use-exhibitions'
import { useStudioDashboard } from '@/hooks/use-studio-dashboard'
import {
  dismissOnboarding,
  getPrimaryExhibitionId,
  getPublishTargetExhibitionId,
} from '@/lib/studio-onboarding'
import { Button } from '@/components/ui/button'

export function StudioPage() {
  const { user } = useAuth()
  const {
    exhibitions,
    loading: exhibitionsLoading,
    createExhibition,
    deleteExhibition,
    duplicateExhibition,
    refresh: refreshExhibitions,
  } = useExhibitions(user?.id)

  const {
    artworks,
    setArtworks,
    loading,
    error,
    seedingDemo,
    setOnboardingDismissed,
    showExhibitionForm,
    setShowExhibitionForm,
    onboardingProgress,
    showOnboardingChecklist,
  } = useStudioDashboard({
    userId: user?.id,
    exhibitions,
    exhibitionsLoading,
    refreshExhibitions,
  })

  function handleDismissOnboarding() {
    if (!user?.id) return
    dismissOnboarding(user.id)
    setOnboardingDismissed(true)
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

      <StudioExhibitionsSection
        exhibitions={exhibitions}
        exhibitionsLoading={exhibitionsLoading}
        seedingDemo={seedingDemo}
        showExhibitionForm={showExhibitionForm}
        onToggleExhibitionForm={() => setShowExhibitionForm(!showExhibitionForm)}
        onCreateExhibition={(title, roomId, roomConfig) =>
          createExhibition(title, roomId, undefined, roomConfig)
        }
        onDuplicateExhibition={duplicateExhibition}
        onDeleteExhibition={deleteExhibition}
      />

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
