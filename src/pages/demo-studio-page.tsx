import { Link } from "react-router-dom";
import { ArrowRight, ImagePlus, Plus } from "lucide-react";
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
import { DEMO_BUILDER_PATH } from "@/lib/demo-sandbox";
import { getRoomTemplateMeta } from "@/rooms/room-config";

const { exhibitions, artworks } = getDemoStudioData();

export function DemoStudioPage() {
  return (
    <>
      <DemoStudioBanner />

      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl italic">Demo studio</h1>
            <p className="mt-2 text-muted-foreground">
              Build a show in the demo builder—hang works in 3D, no account.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button render={<Link to={DEMO_BUILDER_PATH} />}>
              Open demo builder
              <ArrowRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              render={<Link to="/studio/demo/artworks/bulk" />}
            >
              Bulk import
            </Button>
            <Button
              variant="outline"
              render={<Link to="/studio/demo/artworks/new" />}
            >
              <ImagePlus className="size-4" />
              Add artwork
            </Button>
          </div>
        </div>

        <Card className="mt-10 border-primary/20 bg-primary/[0.03]">
          <CardHeader>
            <CardTitle className="font-serif text-2xl italic">
              Demo builder
            </CardTitle>
            <CardDescription>
              Drag works onto walls, walk the 3D room, and open a preview link.
              Your show stays in this tab until you close the browser.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button render={<Link to={DEMO_BUILDER_PATH} />}>
              Continue building
            </Button>
            <Button
              variant="outline"
              render={<Link to={`${DEMO_BUILDER_PATH}?init=sample`} />}
            >
              Start from sample hang
            </Button>
            <Button
              variant="outline"
              render={<Link to="/studio/demo/exhibitions/new" />}
            >
              <Plus className="size-4" />
              New exhibition
            </Button>
          </CardContent>
        </Card>

        <section className="mt-14">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl italic">Exhibitions</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your work in progress vs. the finished visitor demo.
              </p>
            </div>
          </div>

          <ul className="mt-6 divide-y rounded-xl border bg-card">
            <li className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
              <div>
                <Link
                  to={DEMO_BUILDER_PATH}
                  className="font-medium hover:underline"
                >
                  Your demo show
                </Link>
                <p className="text-sm text-muted-foreground">
                  Draft · hang works and preview in the demo builder
                </p>
              </div>
              <Link
                to={DEMO_BUILDER_PATH}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Open builder
              </Link>
            </li>
            {exhibitions.map((ex) => (
              <li
                key={ex.id}
                className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
              >
                <div>
                  <Link
                    to={`${DEMO_BUILDER_PATH}?init=sample`}
                    className="font-medium hover:underline"
                  >
                    {ex.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    Template · {getRoomTemplateMeta(ex.room_template_id).name}{" "}
                    · open in demo builder
                  </p>
                </div>
                <Link
                  to={`/show/${DEMO_SLUG}`}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Visitor demo show
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14">
          <div>
            <h2 className="font-serif text-2xl italic">Catalogue</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sample works you can hang in the demo builder (browse-only here).
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
              Want to save to the cloud?
            </CardTitle>
            <CardDescription>
              Sign up for a full studio with your own catalogue, or run locally
              with Supabase (see SETUP.md on GitHub).
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button render={<Link to="/signup" />}>Create account</Button>
            <Button render={<Link to={`/show/${DEMO_SLUG}`} />} variant="outline">
              Visitor demo show
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
