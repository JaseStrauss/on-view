import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ExhibitionEditorView } from '@/components/editor/exhibition-editor-view'
import { ExhibitionEditorSkeleton } from '@/components/loading-skeletons'
import { DeleteExhibitionControl } from '@/components/studio/delete-exhibition-control'
import { DuplicateExhibitionControl } from '@/components/studio/duplicate-exhibition-control'
import { useAuth } from '@/contexts/auth-context'
import {
  copyPublicExhibitionLink,
  getPublicExhibitionUrl,
} from '@/lib/copy-to-clipboard'
import { fetchArtworks } from '@/services/artworks'
import { useExhibitionDetail, useExhibitions } from '@/hooks/use-exhibitions'
import type { Artwork } from '@/types/artwork'

export function ExhibitionEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { deleteExhibition, duplicateExhibition } = useExhibitions(user?.id)
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const {
    exhibition,
    placements,
    catalogueArtworkIds,
    loading,
    updateExhibition,
    applyRoomSettings,
    addPlacement,
    updatePlacement,
    removePlacement,
  } = useExhibitionDetail(id)

  const [publishing, setPublishing] = useState(false)

  useEffect(() => {
    fetchArtworks().then(setArtworks).catch(console.error)
  }, [])

  if (loading || !exhibition) {
    return <ExhibitionEditorSkeleton />
  }

  async function handlePublish() {
    if (!exhibition) return
    const wasPublished = exhibition.is_published
    setPublishing(true)
    try {
      await updateExhibition({ is_published: !wasPublished })

      if (!wasPublished) {
        const publicUrl = getPublicExhibitionUrl(exhibition.slug)
        toast.success('Your exhibition is open', {
          description: 'Share the link with visitors and collectors.',
          action: {
            label: 'Copy link',
            onClick: () => {
              void copyPublicExhibitionLink(exhibition.slug, 'Link copied to clipboard')
            },
          },
          cancel: {
            label: 'Open',
            onClick: () => window.open(publicUrl, '_blank', 'noopener,noreferrer'),
          },
        })
      } else {
        toast('Exhibition closed', {
          description: 'Visitors can no longer view this show.',
        })
      }
    } finally {
      setPublishing(false)
    }
  }

  function handlePreview() {
    if (!exhibition) return

    if (exhibition.is_published) {
      window.open(getPublicExhibitionUrl(exhibition.slug), '_blank', 'noopener,noreferrer')
      return
    }

    document
      .getElementById('preview-your-show')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <ExhibitionEditorView
      exhibition={exhibition}
      placements={placements}
      catalogueArtworkIds={catalogueArtworkIds}
      artworks={artworks}
      backTo="/studio"
      publishing={publishing}
      onPublish={handlePublish}
      onPreview={handlePreview}
      onSaveExhibition={async (patch) => {
        await updateExhibition(patch);
      }}
      onApplyRoomSettings={applyRoomSettings}
      onPlacementAdd={addPlacement}
      onPlacementUpdate={updatePlacement}
      onPlacementRemove={removePlacement}
      footer={
        <>
          <DuplicateExhibitionControl
            exhibitionId={exhibition.id}
            exhibitionTitle={exhibition.title}
            onDuplicate={duplicateExhibition}
            onDuplicated={(copy) => navigate(`/studio/exhibitions/${copy.id}`)}
          />

          <DeleteExhibitionControl
            exhibitionId={exhibition.id}
            exhibitionTitle={exhibition.title}
            onDelete={deleteExhibition}
            onDeleted={() => navigate('/studio')}
          />
        </>
      }
    />
  )
}
