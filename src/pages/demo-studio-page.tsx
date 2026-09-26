import { Link } from "react-router-dom";
import { ImagePlus, Plus } from "lucide-react";
import { DemoStudioBanner } from "@/components/demo-studio-banner";
import { StudioCatalogue } from "@/components/studio/studio-catalogue";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DEMO_SLUG, getDemoStudioData } from "@/data/demo-exhibition";
import { showDemoOnlyToast } from "@/lib/public-demo";
import { getRoomTemplateMeta } from "@/rooms/room-config";

const { exhibitions, artworks } = getDemoStudioData();

export function DemoStudioPage() {
  return (
    <>
      <DemoStudioBanner />

      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl italic">Your exhibitions</h1>
            <p className="mt-2 text-muted-foreground">
              Catalogue your works and turn them into exhibitions you can share.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              render={<Link to="/studio/demo/artworks/bulk" />}
            >
              Bulk import
            </Button>
            <Button render={<Link to="/studio/demo/artworks/new" />}>
              <ImagePlus className="size-4" />
              Add artwork
            </Button>
          </div>
        </div>

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
              render={<Link to="/studio/demo/exhibitions/new" />}
            >
              <Plus className="size-4" />
              New exhibition
            </Button>
          </div>

          <ul className="mt-6 divide-y rounded-xl border bg-card">
            {exhibitions.map((ex) => (
              <li
                key={ex.id}
                className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
              >
                <div>
                  <button
                    type="button"
                    className="font-medium text-left hover:underline"
                    onClick={() => showDemoOnlyToast()}
                  >
                    {ex.title}
                  </button>
                  <p className="text-sm text-muted-foreground">
                    {ex.is_published ? "Open" : "Draft"} ·{" "}
                    {getRoomTemplateMeta(ex.room_template_id).name}
                  </p>
                </div>
                <Link
                  to={`/show/${DEMO_SLUG}`}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Open demo exhibition
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14">
          <div>
            <h2 className="font-serif text-2xl italic">Catalogue</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your works in one place: titles, images, dimensions, and status.
            </p>
          </div>

          <StudioCatalogue
            artworks={artworks}
            onArtworksChange={() => undefined}
            readOnly
          />
        </section>

        <Card className="mt-14 border-dashed">
          <CardHeader>
            <CardTitle className="font-serif text-xl italic">
              Want to save changes?
            </CardTitle>
            <CardDescription>
              The live demo is browse-only. Clone the repo and run the full
              studio locally with your own Supabase project (see SETUP.md on
              GitHub).
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button render={<Link to={`/show/${DEMO_SLUG}`} />}>
              Demo exhibition
            </Button>
            <Button
              variant="outline"
              render={
                <a
                  href="https://github.com/JaseStrauss/on-view"
                  target="_blank"
                  rel="noreferrer"
                />
              }
            >
              View on GitHub
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
