import {
  fetchStorefrontCollection,
  fetchStorefrontProducts,
} from "../../lib/esmera/storefront.ts";

export interface MaterialFacet {
  value: string;
  label: string;
  count: number;
}

export interface Props {
  slug?: string;
  limit?: number;
}

export const cache = { maxAge: 120 };
export const cacheKey = ({ slug = "", limit = 12 }: Props) =>
  `${slug}:${limit}`;

function normalizeMaterials(value: unknown, limit: number): MaterialFacet[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const facet = item as Record<string, unknown>;
    const material = typeof facet.value === "string" ? facet.value.trim() : "";
    if (!material) return [];
    return [{
      value: material,
      label: typeof facet.label === "string" && facet.label.trim()
        ? facet.label.trim()
        : material,
      count: typeof facet.count === "number" ? facet.count : 0,
    }];
  }).slice(0, Math.max(1, limit));
}

export default async function MaterialFacets({ slug, limit = 12 }: Props = {}) {
  try {
    const params = new URLSearchParams({ page: "1", limit: "1" });
    const response = slug
      ? await fetchStorefrontCollection(slug, params)
      : await fetchStorefrontProducts(params);
    const facets = response.facets as { materials?: unknown };
    return normalizeMaterials(facets.materials, limit);
  } catch {
    return [];
  }
}
