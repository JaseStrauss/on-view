import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { DemoStudioBanner } from "@/components/demo-studio-banner";
import { ExhibitionEditorView } from "@/components/editor/exhibition-editor-view";
import { ExhibitionEditorSkeleton } from "@/components/loading-skeletons";
import { Button } from "@/components/ui/button";
import {
  createEmptySandboxState,
  createSampleSandboxState,
  DEMO_BUILDER_SLUG,
  getDemoSandboxArtworks,
} from "@/lib/demo-sandbox";
import { DEMO_STUDIO_PATH } from "@/lib/public-demo";
import {
  copyPublicExhibitionLink,
  getPublicExhibitionUrl,
} from "@/lib/copy-to-clipboard";
import {
  type DemoSandboxInit,
  useDemoSandbox,
} from "@/hooks/use-demo-sandbox";

function parseBuilderInit(searchParams: URLSearchParams): DemoSandboxInit {
  const init = searchParams.get("init");
  if (init === "sample") return "sample";
  if (init === "fresh") return "default";
  return "preserve";
}

export function DemoSandboxEditorPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const init = useMemo(
    () => parseBuilderInit(searchParams),
    [searchParams],
  );

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
    resetSandbox,
  } = useDemoSandbox(init);

  const [publishing, setPublishing] = useState(false);
  const artworks = useMemo(() => getDemoSandboxArtworks(), []);

  useEffect(() => {
    if (!searchParams.has("init")) return;
    const next = new URLSearchParams(searchParams);
    next.delete("init");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  if (loading || !exhibition) {
    return (
      <>
        <DemoStudioBanner />
        <ExhibitionEditorSkeleton />
      </>
    );
  }

  const activeExhibition = exhibition;

  async function handlePublish() {
    const wasPublished = activeExhibition.is_published;
    setPublishing(true);
    try {
      await updateExhibition({ is_published: !wasPublished });

      if (!wasPublished) {
        toast.success("Preview is open", {
          description:
            "Share this link in the same browser session. Sign up to publish a real show.",
          action: {
            label: "Copy link",
            onClick: () => {
              void copyPublicExhibitionLink(
                DEMO_BUILDER_SLUG,
                "Preview link copied",
              );
            },
          },
          cancel: {
            label: "Open",
            onClick: () =>
              window.open(
                getPublicExhibitionUrl(DEMO_BUILDER_SLUG),
                "_blank",
                "noopener,noreferrer",
              ),
          },
        });
      } else {
        toast("Preview closed", {
          description: "The preview link will not load until you open again.",
        });
      }
    } finally {
      setPublishing(false);
    }
  }

  function handlePreview() {
    if (activeExhibition.is_published) {
      window.open(
        getPublicExhibitionUrl(DEMO_BUILDER_SLUG),
        "_blank",
        "noopener,noreferrer",
      );
      return;
    }

    document
      .getElementById("preview-your-show")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleResetSample() {
    resetSandbox(() => createSampleSandboxState());
    toast.message("Loaded the sample hang");
  }

  function handleStartFresh() {
    resetSandbox(() =>
      createEmptySandboxState("My demo show", "white-cube"),
    );
    toast.message("Started a new demo show");
  }

  return (
    <>
      <DemoStudioBanner />
      <ExhibitionEditorView
        exhibition={exhibition}
        placements={placements}
        catalogueArtworkIds={catalogueArtworkIds}
        artworks={artworks}
        backTo={DEMO_STUDIO_PATH}
        backLabel="Demo studio"
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
        studioBasePath="/studio/demo"
        previewFirst
        statusNote="Saved in this browser tab"
        footer={
          <div className="flex flex-wrap gap-3 border-t border-border/60 pt-8">
            <Button type="button" variant="outline" onClick={handleResetSample}>
              Load sample hang
            </Button>
            <Button type="button" variant="outline" onClick={handleStartFresh}>
              Start new show
            </Button>
          </div>
        }
      />
    </>
  );
}
