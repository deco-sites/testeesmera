import type { StorefrontCategory } from "../payload/navigation.ts";

/**
 * Categories exposed as collection facets must be real storefront collections.
 * Navigation can also contain editorial pages, external destinations and
 * grouping nodes; those must never leak into the product filter.
 */
export function collectionFacetCategories(
  categories: StorefrontCategory[],
): StorefrontCategory[] {
  const seen = new Set<string>();
  return categories.filter((category) => {
    const slug = category.slug.trim();
    if (!slug || category.nodeType !== "collection" || category.external) {
      return false;
    }
    if (category.href !== `/colecao/${slug}` || seen.has(slug)) return false;
    seen.add(slug);
    return true;
  });
}
