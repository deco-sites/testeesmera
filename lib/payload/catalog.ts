import {
  whereAnd,
  whereContains,
  whereEquals,
  whereOr,
} from "./query.ts";

export type CatalogFilter = "category" | "material" | "availability" | "sort";
export type CollectionSort =
  | "editorial"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "name";

const availabilityValues = new Set([
  "unique",
  "available",
  "made_to_order",
  "limited",
  "archive",
]);

const sortAliases: Record<string, CollectionSort> = {
  editorial: "editorial",
  newest: "newest",
  "price-asc": "price-asc",
  "price-desc": "price-desc",
  name: "name",
  title: "name",
  "-title": "name",
  basePriceCents: "price-asc",
  "-basePriceCents": "price-desc",
  createdAt: "newest",
  "-createdAt": "newest",
};

const payloadSortByCollectionSort: Record<CollectionSort, string> = {
  editorial: "title",
  newest: "-createdAt",
  "price-asc": "basePriceCents,title",
  "price-desc": "-basePriceCents,title",
  name: "title",
};

export function normalizeVisibleFilters(
  filters?: Array<string | { value?: string | null }> | null,
): CatalogFilter[] {
  return (filters ?? []).flatMap<CatalogFilter>((filter) => {
    const value = (typeof filter === "string" ? filter : filter.value)
      ?.toLowerCase();
    if (value === "category" || value === "categories") return ["category"];
    if (value === "material") return ["material"];
    if (value === "availability") return ["availability"];
    if (value === "sort" || value === "sorting") return ["sort"];
    return [];
  }).filter((filter, index, all) => all.indexOf(filter) === index);
}

export interface CatalogCategory {
  id: string;
  title: string;
  slug: string;
}

export interface CatalogQueryState {
  page: number;
  q: string;
  sort: CollectionSort;
  payloadSort: string;
  category: string;
  material: string;
  availability: string;
  where?: Record<string, unknown>;
}

export function normalizeCollectionSort(value?: string | null): CollectionSort {
  return sortAliases[value?.trim() ?? ""] ?? "editorial";
}

export function buildCatalogQuery(
  url: URL,
  visibleFilters: CatalogFilter[],
  categories: CatalogCategory[],
  fixedCategoryID?: string,
): CatalogQueryState {
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const q = url.searchParams.get("q")?.trim().slice(0, 80) ?? "";
  const material = visibleFilters.includes("material")
    ? (url.searchParams.get("material")?.trim().slice(0, 80) ?? "")
    : "";
  const availabilityCandidate = visibleFilters.includes("availability")
    ? (url.searchParams.get("availability")?.trim() ?? "")
    : "";
  const availability = availabilityValues.has(availabilityCandidate)
    ? availabilityCandidate
    : "";
  const categoryCandidate = visibleFilters.includes("category")
    ? (url.searchParams.get("category")?.trim() ?? "")
    : "";
  const category = categories.some((item) => item.slug === categoryCandidate)
    ? categoryCandidate
    : "";
  const categoryID = fixedCategoryID ||
    categories.find((item) => item.slug === category)?.id;
  const sort = visibleFilters.includes("sort")
    ? normalizeCollectionSort(url.searchParams.get("sort"))
    : "editorial";
  const searchCondition = q.length >= 2
    ? whereOr(
      whereContains("title", q),
      whereContains("subtitle", q),
      whereContains("code", q),
      whereContains("material", q),
      whereContains("searchTerms.term", q),
    )
    : null;
  const conditions = [
    categoryID ? whereContains("categories", categoryID) : null,
    material ? whereContains("material", material) : null,
    availability ? whereEquals("availability", availability) : null,
    searchCondition,
  ].filter((condition): condition is Record<string, unknown> =>
    Boolean(condition)
  );
  return {
    page,
    q,
    sort,
    payloadSort: payloadSortByCollectionSort[sort],
    category,
    material,
    availability,
    where: conditions.length === 0
      ? undefined
      : conditions.length === 1
      ? conditions[0]
      : whereAnd(...conditions),
  };
}

export function hasCollectionRefinements(query: CatalogQueryState): boolean {
  return query.page > 1 || query.q.length >= 2 || Boolean(
    query.category || query.material || query.availability ||
      query.sort !== "editorial",
  );
}
