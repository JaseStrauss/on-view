import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  GALLERY_VIEWPORT_CLASS,
  LazyGalleryRoom,
} from '@/components/gallery/lazy-gallery-room'
import { ExhibitionEditorActionBar } from '@/components/editor/exhibition-editor-action-bar'
import { PageBackLink } from '@/components/page-back-link'
import { WallEditor } from '@/components/editor/wall-editor'
import { ExhibitionEditorSkeleton } from '@/components/loading-skeletons'
import { DeleteExhibitionControl } from '@/components/studio/delete-exhibition-control'
import { DuplicateExhibitionControl } from '@/components/studio/duplicate-exhibition-control'
import { useAuth } from '@/contexts/auth-context'
import {
  copyPublicExhibitionLink,
  getPublicExhibitionUrl,
} from '@/lib/copy-to-clipboard'
import { filterExhibitionPaletteArtworks } from '@/services/exhibition-catalogue'
import { fetchArtworks } from '@/services/artworks'
import { useExhibitionDetail, useExhibitions } from '@/hooks/use-exhibitions'
import { ExhibitionDetailsPanel } from '@/components/editor/exhibition-details-panel'
import { RoomConfigPanel } from '@/components/editor/room-config-panel'
import { buildRoomTemplate } from '@/rooms/templates'
import { getDefaultRoomConfig, type RoomConfig } from '@/rooms/room-config'
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
  const [previewTemplateId, setPreviewTemplateId] = useState('white-cube')
  const [previewRoomConfig, setPreviewRoomConfig] = useState<RoomConfig>({})

  useEffect(() => {
    fetchArtworks().then(setArtworks).catch(console.error)
  }, [])

  useEffect(() => {
    if (exhibition) {
      setPreviewTemplateId(exhibition.room_template_id)
      setPreviewRoomConfig(exhibition.room_config)
    }
  }, [exhibition])

  const room = useMemo(() => {
    if (!exhibition) {
      return buildRoomTemplate('white-cube')
    }
    return buildRoomTemplate(previewTemplateId, previewRoomConfig)
  }, [exhibition, previewTemplateId, previewRoomConfig])

  function handlePreviewTemplateChange(templateId: string) {
    setPreviewTemplateId(templateId)
    setPreviewRoomConfig(getDefaultRoomConfig(templateId))
  }

  const placedArtworkIds = useMemo(
    () => new Set(placements.map((p) => p.artwork_id)),
    [placements],
  )

  const catalogueIsScoped = catalogueArtworkIds.length > 0

  const catalogueArtworks = useMemo(
    () =>
      catalogueIsScoped
        ? artworks.filter((artwork) => catalogueArtworkIds.includes(artwork.id))
        : [],
    [artworks, catalogueArtworkIds, catalogueIsScoped],
  )

  const availableArtworks = filterExhibitionPaletteArtworks(
    artworks,
    new Set(catalogueArtworkIds),
    placedArtworkIds,
  )

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
    <div className="mx-auto max-w-6xl px-6 pb-12">
      <div className="pt-12">
        <PageBackLink to="/studio" className="mb-2">
          Exhibitions
        </PageBackLink>
        <h1 className="font-serif text-4xl italic">{exhibition.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {room.name} · {exhibition.is_published ? 'Open' : 'Draft'}
        </p>
      </div>

      <div className="mt-6">
        <ExhibitionEditorActionBar
          exhibition={exhibition}
          placements={placements}
          room={room}
          catalogueArtworks={catalogueArtworks}
          publishing={publishing}
          onPublish={handlePublish}
          onPreview={handlePreview}
        />
      </div>

      <div className="mt-8 space-y-8">
        <section className="space-y-3" id="hang-works">
          <div>
            <h2 className="font-serif text-2xl italic">Hang works</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Drag works from your catalogue onto a wall. Changes appear in the
              preview below.
            </p>
          </div>
          <WallEditor
            room={room}
            exhibitionId={exhibition.id}
            placements={placements}
            availableArtworks={availableArtworks}
            onPlacementAdd={addPlacement}
            onPlacementUpdate={updatePlacement}
            onPlacementRemove={removePlacement}
          />
        </section>

        <section className="space-y-3" id="preview-your-show">
          <h2 className="font-serif text-2xl italic">Preview your show</h2>
          <LazyGalleryRoom
            room={room}
            placements={placements}
            className={GALLERY_VIEWPORT_CLASS}
            showWallPresets
          />
          <p className="text-center text-xs text-muted-foreground">
            Use wall buttons to jump views · drag to orbit · scroll to zoom
          </p>
        </section>

        <ExhibitionDetailsPanel
          exhibition={exhibition}
          catalogueArtworks={catalogueArtworks}
          catalogueIsScoped={catalogueIsScoped}
          placements={placements}
          onSave={updateExhibition}
          collapsible
          defaultExpanded={false}
        />

        <RoomConfigPanel
          templateId={previewTemplateId}
          savedTemplateId={exhibition.room_template_id}
          value={exhibition.room_config}
          onChange={setPreviewRoomConfig}
          onTemplateChange={handlePreviewTemplateChange}
          showTemplatePicker
          onApply={applyRoomSettings}
          applyLabel="Save gallery space"
          showApplyButton
          collapsible
          defaultExpanded={false}
        />

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
      </div>
    </div>
  )
}
