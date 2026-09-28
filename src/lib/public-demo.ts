import { toast } from "sonner";

export const DEMO_STUDIO_PATH = "/studio/demo";

export const DEMO_STUDIO_BANNER =
  "Demo builder: hang works in 3D and preview your show. Saved in this browser tab until you close it.";

export function isPublicDemoOnly(): boolean {
  return import.meta.env.VITE_PUBLIC_DEMO_ONLY === "true";
}

export function showDemoOnlyToast(message = DEMO_STUDIO_BANNER): void {
  toast.message(message);
}
