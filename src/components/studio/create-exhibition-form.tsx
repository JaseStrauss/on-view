import { useState } from "react";
import { toast } from "sonner";
import {
  getDefaultRoomConfig,
  getRoomTemplateMeta,
  listRoomTemplateMeta,
} from "@/rooms/room-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RoomConfig } from "@/rooms/room-config";
import type { Exhibition } from "@/types";

interface CreateExhibitionFormProps {
  onCreate: (
    title: string,
    roomId: string,
    roomConfig: RoomConfig,
  ) => Promise<Exhibition>;
  onCreated: (exhibition: Exhibition) => void;
}

export function CreateExhibitionForm({
  onCreate,
  onCreated,
}: CreateExhibitionFormProps) {
  const [exTitle, setExTitle] = useState("");
  const [roomId, setRoomId] = useState("white-cube");
  const [creating, setCreating] = useState(false);

  async function handleCreateExhibition(event: React.FormEvent) {
    event.preventDefault();
    if (!exTitle.trim()) return;
    setCreating(true);
    try {
      const ex = await onCreate(
        exTitle.trim(),
        roomId,
        getDefaultRoomConfig(roomId),
      );
      toast.success(`"${ex.title}" created`);
      onCreated(ex);
    } finally {
      setCreating(false);
    }
  }

  return (
    <Card className="mt-4">
      <CardContent className="pt-6">
        <form onSubmit={handleCreateExhibition} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Start with a title and gallery space. You can fine-tune the room and
            hang works after creating the show.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ex-title">Exhibition title</Label>
              <Input
                id="ex-title"
                value={exTitle}
                onChange={(e) => setExTitle(e.target.value)}
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
          </div>
          <Button type="submit" disabled={creating}>
            {creating ? "Creating…" : "Create exhibition"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
