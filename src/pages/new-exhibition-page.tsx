import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { DemoStudioBanner } from "@/components/demo-studio-banner";
import { PageBackLink } from "@/components/page-back-link";
import { useAuth } from "@/contexts/auth-context";
import { useExhibitions } from "@/hooks/use-exhibitions";
import { showDemoOnlyToast } from "@/lib/public-demo";
import {
  getDefaultRoomConfig,
  getRoomTemplateMeta,
  listRoomTemplateMeta,
} from "@/rooms/room-config";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NewExhibitionPageProps {
  demoMode?: boolean;
}

export function NewExhibitionPage({ demoMode = false }: NewExhibitionPageProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { createExhibition } = useExhibitions(user?.id);
  const [title, setTitle] = useState("");
  const [roomId, setRoomId] = useState("white-cube");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;

    if (demoMode) {
      showDemoOnlyToast();
      return;
    }
    if (!user) return;

    setSubmitting(true);
    setError(null);

    try {
      const exhibition = await createExhibition(
        title.trim(),
        roomId,
        undefined,
        getDefaultRoomConfig(roomId),
      );
      toast.success(`"${exhibition.title}" created`);
      navigate(`/studio/exhibitions/${exhibition.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not create exhibition",
      );
      setSubmitting(false);
    }
  }

  return (
    <>
      {demoMode && <DemoStudioBanner />}

      <div className="mx-auto max-w-2xl px-6 py-12">
        <PageBackLink to="/studio/demo" className="mb-4">
          Exhibitions
        </PageBackLink>
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-4xl italic">
              New exhibition
            </CardTitle>
            <CardDescription>
              Start with a title and gallery space. You can fine-tune the room
              and hang works after creating the show.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="ex-title">Exhibition title</Label>
                <Input
                  id="ex-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={submitting && !demoMode}>
                  {demoMode
                    ? "Create exhibition (demo)"
                    : submitting
                      ? "Creating…"
                      : "Create exhibition"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    navigate(demoMode ? "/studio/demo" : "/studio")
                  }
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
