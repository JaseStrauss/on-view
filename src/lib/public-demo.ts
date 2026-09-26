import { toast } from "sonner";

export const DEMO_STUDIO_PATH = "/studio/demo";

export const DEMO_STUDIO_BANNER =
  "Demo studio: browse the app. Changes are not saved.";

export function isPublicDemoOnly(): boolean {
  return import.meta.env.VITE_PUBLIC_DEMO_ONLY === "true";
}

export function showDemoOnlyToast(message = DEMO_STUDIO_BANNER): void {
  toast.message(message);
}
