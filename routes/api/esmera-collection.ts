import type { Handlers } from "$fresh/server.ts";
import {
  buildCatalogQuery,
  normalizeVisibleFilters,
} from "../../lib/payload/catalog.ts";
import {
  getCategoryBySlug,
  getCollectionPage,
  listProducts,
  listProductsByCategory,
} from "../../lib/payload/loaders.ts";
import { getPageChrome } from "../../lib/payload/pageData.ts";

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug")?.trim() ?? "";
    try {
      const [chrome, collectionPage, category] = await Promise.all([
        getPageChrome(),
        getCollectionPage(),
        slug ? getCategoryBySlug(slug) : Promise.resolve(null),
      ]);
      if (slug && !category) {
        return Response.json({ error: "collection_not_found" }, {
          status: 404,
          headers: { "cache-control": "no-store" },
        });
      }
      const visibleFilters = normalizeVisibleFilters(
        collectionPage?.visibleFilters,
      )
        .filter((filter) => !slug || filter !== "category");
      const query = buildCatalogQuery(url, visibleFilters, chrome.categories);
      const common = {
        limit: 24,
        page: query.page,
        sort: query.payloadSort,
        q: query.q.length >= 2 ? query.q : undefined,
        category: query.category || undefined,
        material: query.materials.length
          ? query.materials.join(",")
          : undefined,
        availability: query.availability || undefined,
      };
      const result = category
        ? await listProductsByCategory(category.slug, common)
        : await listProducts({
          ...common,
        });

      return Response.json({
        items: result.docs,
        pagination: {
          page: result.page,
          totalPages: result.totalPages,
          totalDocs: result.totalDocs,
          hasNextPage: result.hasNextPage,
          nextPage: result.nextPage,
        },
        applied: {
          q: query.q,
          category: query.category,
          materials: query.materials,
          availability: query.availability,
          sort: query.sort,
        },
      }, {
        headers: {
          "cache-control":
            "public, max-age=15, s-maxage=45, stale-while-revalidate=120",
          "content-type": "application/json; charset=utf-8",
        },
      });
    } catch {
      return Response.json({ error: "collection_unavailable" }, {
        status: 502,
        headers: { "cache-control": "no-store" },
      });
    }
  },
};
