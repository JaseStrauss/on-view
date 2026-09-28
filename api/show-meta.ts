import { renderShowMetaHtml } from "./_lib/fetch-show-meta.js";

export const config = { runtime: "edge" };

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug")?.trim();

  if (!slug) {
    return new Response("Missing slug", { status: 400 });
  }

  const origin = url.origin;
  const html = await renderShowMetaHtml(slug, origin);

  if (!html) {
    return new Response("Exhibition not found", { status: 404 });
  }

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
