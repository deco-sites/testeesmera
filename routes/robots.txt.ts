import type { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  GET(req) {
    const url = new URL(req.url);
    const body = [
      "User-agent: *",
      "Disallow: /deco/render",
      "Disallow: /live/invoke",
      "Disallow: /api/",
      "Disallow: /admin/",
      "Allow: /",
      "",
      `Sitemap: ${new URL("/sitemap.xml", url.origin).toString()}`,
      "",
    ].join("\n");
    return new Response(body, {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "public, max-age=300, s-maxage=300",
      },
    });
  },
};
