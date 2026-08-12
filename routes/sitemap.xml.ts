import type { Handlers } from "$fresh/server.ts";
import { isLegacyEditorialAlias } from "../lib/esmera/canonicalRoutes.ts";
import { listProducts } from "../lib/payload/loaders.ts";
import { listStorefrontCategories } from "../lib/payload/navigationLoader.ts";

function escapeXML(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);
    const [productsResult, categories] = await Promise.allSettled([
      listProducts({ limit: 48, page: 1, sort: "title" }),
      listStorefrontCategories(),
    ]);
    const products = productsResult.status === "fulfilled"
      ? productsResult.value.docs
      : [];
    const categoryItems = categories.status === "fulfilled" ? categories.value : [];
    const paths = new Set<string>([
      "/",
      "/colecao",
      "/sobre",
      "/contato",
      "/politica-de-privacidade",
      "/termos",
      ...categoryItems
        .filter((category) =>
          !category.external && category.href.startsWith("/") &&
          !isLegacyEditorialAlias(category.href)
        )
        .map((category) => category.href),
      ...products.map((product) => `/produto/${product.slug}`),
    ]);
    const entries = Array.from(paths).map((path) => {
      const location = new URL(path, url.origin).toString();
      return `  <url><loc>${escapeXML(location)}</loc></url>`;
    }).join("\n");
    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      entries,
      "</urlset>",
    ].join("\n");

    return new Response(xml, {
      headers: {
        "content-type": "application/xml; charset=utf-8",
        "cache-control": "public, max-age=300, s-maxage=300",
      },
    });
  },
};
