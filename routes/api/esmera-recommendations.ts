import type { Handlers } from "$fresh/server.ts";
import {
  getProductBySlug,
  listCategories,
  listProducts,
  listProductsByCategory,
} from "../../lib/payload/loaders.ts";

const MAX_RECOMMENDATIONS = 4;
const comparable = (value: string) => value.trim().toLocaleLowerCase("pt-BR");

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);
    const productId = url.searchParams.get("productId")?.trim() ?? "";
    const categoryName = url.searchParams.get("category")?.trim() ?? "";
    if (!productId) {
      return Response.json({ items: [] }, {
        status: 400,
        headers: { "cache-control": "no-store" },
      });
    }

    try {
      const [categories, fallbackResult] = await Promise.all([
        categoryName ? listCategories() : Promise.resolve([]),
        listProducts({
          limit: 12,
          sort: "newest",
          availability: "available",
        }),
      ]);
      const category = categories.find((candidate) =>
        comparable(candidate.title) === comparable(categoryName)
      );
      const preferred = category
        ? (await listProductsByCategory(category.slug, {
          limit: 8,
          sort: "newest",
        })).docs
        : [];
      const fallback = fallbackResult.docs;

      const slugs: string[] = [];
      const seen = new Set([productId]);
      for (const candidate of [...preferred, ...fallback]) {
        if (seen.has(candidate.id) || slugs.includes(candidate.slug)) continue;
        seen.add(candidate.id);
        slugs.push(candidate.slug);
        if (slugs.length === MAX_RECOMMENDATIONS) break;
      }

      const settled = await Promise.allSettled(
        slugs.map((slug) => getProductBySlug(slug)),
      );
      const items = settled.flatMap((result) =>
        result.status === "fulfilled" && result.value &&
          result.value.id !== productId
          ? [result.value]
          : []
      );

      return Response.json({ items }, {
        headers: {
          "cache-control":
            "public, max-age=30, s-maxage=60, stale-while-revalidate=120",
        },
      });
    } catch {
      return Response.json({ error: "recommendations_unavailable" }, {
        status: 502,
        headers: { "cache-control": "no-store" },
      });
    }
  },
};
