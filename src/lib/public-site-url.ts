/**
 * Canonical public site origin for share links, embed URLs, and inquiry mailto.
 * Falls back to the current browser origin when unset (e.g. production without env).
 */

/** Hosted demo; used for share/mailto links during local dev unless overridden. */
export const DEFAULT_PUBLIC_SITE_ORIGIN = "https://on-view-seven.vercel.app";

export function normalizePublicSiteOrigin(
  value: string | null | undefined,
): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  try {
    const withScheme = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    return new URL(withScheme).origin;
  } catch {
    return null;
  }
}

function isLocalDevHost(origin: string): boolean {
  try {
    const { hostname } = new URL(origin);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

export function resolvePublicSiteOrigin(options?: {
  envSiteUrl?: string | null;
  windowOrigin?: string | null;
}): string | null {
  const fromEnv = normalizePublicSiteOrigin(
    options?.envSiteUrl ?? import.meta.env.VITE_PUBLIC_SITE_URL,
  );
  if (fromEnv) return fromEnv;

  const browserOrigin =
    options?.windowOrigin ??
    (typeof window !== "undefined" ? window.location.origin : null);

  if (browserOrigin && import.meta.env.DEV && isLocalDevHost(browserOrigin)) {
    return DEFAULT_PUBLIC_SITE_ORIGIN;
  }

  if (browserOrigin) return browserOrigin;

  return null;
}

export function getPublicExhibitionUrl(slug: string): string {
  const path = `/show/${slug}`;
  const origin = resolvePublicSiteOrigin();
  if (!origin) return path;
  return `${origin}${path}`;
}
