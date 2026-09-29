import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  GALLERY_VIEWPORT_CLASS,
  LazyGalleryRoom,
} from "@/components/gallery/lazy-gallery-room";
import { ExhibitionEditorActionBar } from "@/components/editor/exhibition-editor-action-bar";
import { PageBackLink } from "@/components/page-back-link";
import { WallEditor } from "@/components/editor/wall-editor";
import { ExhibitionDetailsPanel } from "@/components/editor/exhibition-details-panel";
import { RoomConfigPanel } from "@/components/editor/room-config-panel";
import { buildRoomTemplate } from "@/rooms/templates";
import { getDefaultRoomConfig, type RoomConfig } from "@/rooms/room-config";
import { filterExhibitionPaletteArtworks } from "@/services/exhibition-catalogue";
import type { Artwork } from "@/types/artwork";
import type { Exhibition, PlacementWithArtwork } from "@/types";
import type { PlacementPatch } from "@/components/editor/wall-canvas";

interface ExhibitionEditorViewProps {
  exhibition: Exhibition;
  placements: PlacementWithArtwork[];
  catalogueArtworkIds: string[];
  artworks: Artwork[];
  backTo: string;
  backLabel?: string;
  publishing: boolean;
  onPublish: () => void;
  onPreview: () => void;
  onSaveExhibition: (patch: Partial<Exhibition>) => Promise<void>;
  onApplyRoomSettings: (
    templateId: string,
    config: RoomConfig,
  ) => void | Promise<void>;
  onPlacementAdd: (
    artworkId: string,
    wallId: string,
    positionX: number,
    positionY: number,
  ) => void | Promise<void>;
  onPlacementUpdate: (
    placementId: string,
    patch: PlacementPatch,
  ) => void | Promise<void>;
  onPlacementRemove: (placementId: string) => void | Promise<void>;
  studioBasePath?: string;
  previewFirst?: boolean;
  footer?: ReactNode;
  statusNote?: string;
}

export function ExhibitionEditorView({
  exhibition,
  placements,
  catalogueArtworkIds,
  artworks,
  backTo,
  backLabel = "Exhibitions",
  publishing,
  onPublish,
  onPreview,
  onSaveExhibition,
  onApplyRoomSettings,
  onPlacementAdd,
  onPlacementUpdate,
  onPlacementRemove,
  studioBasePath = "/studio",
  previewFirst = false,
  footer,
  statusNote,
}: ExhibitionEditorViewProps) {
  const [previewTemplateId, setPreviewTemplateId] = useState(
    exhibition.room_template_id,
  );
  const [previewRoomConfig, setPreviewRoomConfig] = useState<RoomConfig>(
    exhibition.room_config,
  );

  useEffect(() => {
    setPreviewTemplateId(exhibition.room_template_id);
    setPreviewRoomConfig(exhibition.room_config);
  }, [
    exhibition.id,
    exhibition.room_template_id,
    exhibition.room_config,
  ]);

  const room = useMemo(
    () => buildRoomTemplate(previewTemplateId, previewRoomConfig),
    [previewTemplateId, previewRoomConfig],
  );

  function handlePreviewTemplateChange(templateId: string) {
    setPreviewTemplateId(templateId);
    setPreviewRoomConfig(getDefaultRoomConfig(templateId));
  }

  const placedArtworkIds = useMemo(
    () => new Set(placements.map((p) => p.artwork_id)),
    [placements],
  );

  const catalogueIsScoped = catalogueArtworkIds.length > 0;

  const catalogueArtworks = useMemo(
    () =>
      catalogueIsScoped
        ? artworks.filter((artwork) => catalogueArtworkIds.includes(artwork.id))
        : [],
    [artworks, catalogueArtworkIds, catalogueIsScoped],
  );

  const availableArtworks = filterExhibitionPaletteArtworks(
    artworks,
    new Set(catalogueArtworkIds),
    placedArtworkIds,
  );

  const previewSection = (
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
  );

  const hangSection = (
    <section className="space-y-3" id="hang-works">
      <div>
        <h2 className="font-serif text-2xl italic">Hang works</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Drag works from your catalogue onto a wall. Changes appear in the
          preview{previewFirst ? " above" : " below"}.
        </p>
      </div>
      <WallEditor
        room={room}
        exhibitionId={exhibition.id}
        placements={placements}
        availableArtworks={availableArtworks}
        onPlacementAdd={onPlacementAdd}
        onPlacementUpdate={onPlacementUpdate}
        onPlacementRemove={onPlacementRemove}
      />
    </section>
  );

  return (
    <div className="mx-auto max-w-6xl px-6 pb-12">
      <div className="pt-12">
        <PageBackLink to={backTo} className="mb-2">
          {backLabel}
        </PageBackLink>
        <h1 className="font-serif text-4xl italic">{exhibition.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {room.name} · {exhibition.is_published ? "Open" : "Draft"}
          {statusNote ? ` · ${statusNote}` : null}
        </p>
      </div>

      <div className="mt-6">
        <ExhibitionEditorActionBar
          exhibition={exhibition}
          placements={placements}
          room={room}
          catalogueArtworks={catalogueArtworks}
          publishing={publishing}
          onPublish={onPublish}
          onPreview={onPreview}
          studioBasePath={studioBasePath}
        />
      </div>

      <div className="mt-8 space-y-8">
        {previewFirst ? (
          <>
            {previewSection}
            {hangSection}
          </>
        ) : (
          <>
            {hangSection}
            {previewSection}
          </>
        )}

        <ExhibitionDetailsPanel
          exhibition={exhibition}
          catalogueArtworks={catalogueArtworks}
          catalogueIsScoped={catalogueIsScoped}
          placements={placements}
          onSave={onSaveExhibition}
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
          onApply={onApplyRoomSettings}
          applyLabel="Save gallery space"
          showApplyButton
          collapsible
          defaultExpanded={false}
        />

        {footer}
      </div>
    </div>
  );
}
