import { Link, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { CreateExhibitionForm } from "@/components/studio/create-exhibition-form";
import { DeleteExhibitionControl } from "@/components/studio/delete-exhibition-control";
import { DuplicateExhibitionControl } from "@/components/studio/duplicate-exhibition-control";
import { StudioExhibitionsSkeleton } from "@/components/loading-skeletons";
import { getRoomTemplateMeta } from "@/rooms/room-config";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { RoomConfig } from "@/rooms/room-config";
import type { Exhibition } from "@/types";

interface StudioExhibitionsSectionProps {
  exhibitions: Exhibition[];
  exhibitionsLoading: boolean;
  seedingDemo: boolean;
  showExhibitionForm: boolean;
  onToggleExhibitionForm: () => void;
  onCreateExhibition: (
    title: string,
    roomId: string,
    roomConfig: RoomConfig,
  ) => Promise<Exhibition>;
  onDuplicateExhibition: (exhibitionId: string) => Promise<Exhibition>;
  onDeleteExhibition: (exhibitionId: string) => Promise<void>;
}

export function StudioExhibitionsSection({
  exhibitions,
  exhibitionsLoading,
  seedingDemo,
  showExhibitionForm,
  onToggleExhibitionForm,
  onCreateExhibition,
  onDuplicateExhibition,
  onDeleteExhibition,
}: StudioExhibitionsSectionProps) {
  const navigate = useNavigate();

  return (
    <section className="mt-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl italic">Exhibitions</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Shows you&apos;re building. Hang works, then open and share.
          </p>
        </div>
        <Button variant="outline" onClick={onToggleExhibitionForm}>
          <Plus className="size-4" />
          {showExhibitionForm ? "Cancel" : "New exhibition"}
        </Button>
      </div>

      {showExhibitionForm && (
        <CreateExhibitionForm
          onCreate={onCreateExhibition}
          onCreated={(ex) => navigate(`/studio/exhibitions/${ex.id}`)}
        />
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
              Create a show and hang works in a 3D gallery space, or{" "}
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
                  {ex.is_published ? "Open" : "Draft"} ·{" "}
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
                  onDuplicate={onDuplicateExhibition}
                  onDuplicated={(copy) =>
                    navigate(`/studio/exhibitions/${copy.id}`)
                  }
                />
                <DeleteExhibitionControl
                  variant="icon"
                  exhibitionId={ex.id}
                  exhibitionTitle={ex.title}
                  onDelete={onDeleteExhibition}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
