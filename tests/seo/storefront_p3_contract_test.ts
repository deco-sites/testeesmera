import { assertEquals, assertFalse, assertStringIncludes } from "@std/assert";
import {
  getDedicatedEditorialPath,
  isLegacyEditorialAlias,
} from "../../lib/esmera/canonicalRoutes.ts";

Deno.test("P3 product cards keep list semantics on an allowed host element", async () => {
  const card = (await Deno.readTextFile("components/esmera/ObjectCard.tsx"))
    .replaceAll("\r\n", "\n");

  assertStringIncludes(card, 'role="listitem"');
  assertStringIncludes(card, "<div\n      class={`esv-product-card");
  assertFalse(card.includes("<article\n      class={`esv-product-card"));
});

Deno.test("P3 dedicated editorial routes own their canonical paths", () => {
  assertEquals(getDedicatedEditorialPath("sobre"), "/sobre");
  assertEquals(getDedicatedEditorialPath("contato"), "/contato");
  assertEquals(getDedicatedEditorialPath("colecoes"), null);
  assertEquals(isLegacyEditorialAlias("/pagina/sobre"), true);
  assertEquals(isLegacyEditorialAlias("/pagina/contato/"), true);
  assertEquals(isLegacyEditorialAlias("/pagina/historia"), false);
});

Deno.test("P3 sitemap excludes redirect aliases while keeping canonical routes", async () => {
  const sitemap = await Deno.readTextFile("routes/sitemap.xml.ts");
  const editorialRoute = await Deno.readTextFile("routes/pagina/[slug].tsx");

  assertStringIncludes(
    sitemap,
    'import { isLegacyEditorialAlias } from "../lib/esmera/canonicalRoutes.ts";',
  );
  assertStringIncludes(sitemap, "!isLegacyEditorialAlias(category.href)");
  assertStringIncludes(sitemap, '"/sobre"');
  assertStringIncludes(sitemap, '"/contato"');
  assertStringIncludes(
    editorialRoute,
    'import { getDedicatedEditorialPath } from "../../lib/esmera/canonicalRoutes.ts";',
  );
  assertStringIncludes(
    editorialRoute,
    "const dedicatedPath = getDedicatedEditorialPath(ctx.params.slug);",
  );
});

Deno.test("P3 Home always publishes a canonical fallback", async () => {
  const home = await Deno.readTextFile("sections/Esmera/PayloadHome.tsx");
  const seo = await Deno.readTextFile("components/esmera/StorefrontSEO.tsx");

  assertStringIncludes(
    home,
    "function homeCanonical(frontendURL?: string | null): string",
  );
  assertStringIncludes(home, 'if (!frontendURL) return "/";');
  assertStringIncludes(
    home,
    "const homeURL = homeCanonical(settings?.frontendURL);",
  );
  assertStringIncludes(home, "canonical={homeURL}");
  assertStringIncludes(
    seo,
    '{resolvedCanonical && <link rel="canonical" href={resolvedCanonical} />}',
  );
});
