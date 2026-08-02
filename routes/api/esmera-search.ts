import type { Handlers } from "$fresh/server.ts";
import { searchProducts } from "../../lib/payload/loaders.ts";

export const handler: Handlers = {
  async GET(req) {
    const query = new URL(req.url).searchParams.get("q")?.trim() ?? "";
    if (query.length < 2) {
      return Response.json({ items: [] }, {
        headers: { "cache-control": "no-store" },
      });
    }
    try {
      const items = await searchProducts(query, 8);
      return Response.json({ items }, {
        headers: { "cache-control": "public, max-age=15, s-maxage=30" },
      });
    } catch {
      return Response.json({ error: "search_unavailable" }, {
        status: 502,
        headers: { "cache-control": "no-store" },
      });
    }
  },
};
