import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
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
import { isPublicDemoOnly } from "@/lib/public-demo";
import { cn } from "@/lib/utils";

const { artworks } = getDemoStudioData();
const DEMO_SHOW_PATH = `/show/${DEMO_SLUG}`;

export function DemoStudioPage() {
  const publicDemoOnly = isPublicDemoOnly();

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="max-w-2xl">
        <h1 className="font-serif text-4xl italic">Demo studio</h1>
        <p className="mt-3 text-muted-foreground">
          Hang works in 3D and preview your show. Progress stays in this browser
          tab until you close it.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button size="lg" render={<Link to={DEMO_BUILDER_PATH} />}>
          Open demo builder
          <ArrowRight className="size-4" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          render={<Link to={DEMO_SHOW_PATH} />}
        >
          Walk visitor demo
        </Button>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        <Link
          to={`${DEMO_BUILDER_PATH}?init=sample`}
          className="text-foreground underline-offset-4 hover:underline"
        >
          Start from sample hang
        </Link>
        {!publicDemoOnly && (
          <>
            {" · "}
            <Link
              to="/studio/demo/exhibitions/new"
              className="text-foreground underline-offset-4 hover:underline"
            >
              New exhibition
            </Link>
            {" · "}
            <Link
              to="/studio/demo/artworks/new"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Add artwork
            </Link>
          </>
        )}
      </p>

      <section className="mt-14">
        <h2 className="font-serif text-2xl italic">Shows</h2>
        <ul className="mt-4 divide-y rounded-xl border bg-card">
          <li className="px-5 py-4">
            <Link
              to={DEMO_BUILDER_PATH}
              className="font-medium hover:underline"
            >
              Your demo show
            </Link>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Draft in the builder
            </p>
          </li>
          <li className="px-5 py-4">
            <Link
              to={DEMO_SHOW_PATH}
              className="font-medium hover:underline"
            >
              Visitor demo show
            </Link>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Finished sample exhibition.{" "}
              <Link
                to={`${DEMO_BUILDER_PATH}?init=sample`}
                className="text-foreground/80 underline-offset-4 hover:text-foreground hover:underline"
              >
                Load sample hang
              </Link>
            </p>
          </li>
        </ul>
      </section>

      <details
        className={cn(
          "group mt-14 rounded-xl border bg-card",
          "[&_summary]:list-none [&_summary::-webkit-details-marker]:hidden",
        )}
      >
        <summary className="cursor-pointer px-5 py-4 font-medium select-none">
          Sample works
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({artworks.length} in the demo pool, browse-only)
          </span>
        </summary>
        <div className="border-t px-5 pb-6 pt-2">
          {!publicDemoOnly && (
            <p className="mb-4 text-sm text-muted-foreground">
              <Link
                to="/studio/demo/artworks/bulk"
                className="text-foreground underline-offset-4 hover:underline"
              >
                Bulk import
              </Link>
              {" · "}
              <Link
                to="/studio/demo/artworks/new"
                className="text-foreground underline-offset-4 hover:underline"
              >
                Add artwork
              </Link>
            </p>
          )}
          <StudioCatalogue
            artworks={artworks}
            onArtworksChange={() => undefined}
            readOnly
          />
        </div>
      </details>

      <Card className="mt-14 border-dashed">
        <CardHeader>
          <CardTitle className="font-serif text-xl italic">
            {publicDemoOnly ? "About this project" : "Want to save to the cloud?"}
          </CardTitle>
          <CardDescription>
            {publicDemoOnly
              ? "On View is a side project for curators and small galleries: catalogue, 3D hang, and shareable show links."
              : "Sign up for a full studio with your own catalogue, or run locally with Supabase (see SETUP.md on GitHub)."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {!publicDemoOnly && (
            <Button render={<Link to="/signup" />}>Create account</Button>
          )}
          <Button
            variant={publicDemoOnly ? "default" : "outline"}
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
  );
}
