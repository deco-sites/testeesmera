import { whereAnd, whereContains, whereEquals } from "./query.ts";

export type CatalogFilter = "category" | "material" | "availability" | "sort";

const availabilityValues = new Set([
  "unique",
  "available",
  "made_to_order",
  "limited",
  "archive",
]);
const sortValues = new Set([
  "title",
  "-title",
  "basePriceCents",
  "-basePriceCents",
  "createdAt",
  "-createdAt",
]);

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
  sort: string;
  category: string;
  material: string;
  availability: string;
  where?: Record<string, unknown>;
}

export function buildCatalogQuery(
  url: URL,
  visibleFilters: CatalogFilter[],
  categories: CatalogCategory[],
  fixedCategoryID?: string,
): CatalogQueryState {
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
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
  const sortCandidate = visibleFilters.includes("sort")
    ? (url.searchParams.get("sort")?.trim() ?? "")
    : "";
  const sort = sortValues.has(sortCandidate) ? sortCandidate : "title";
  const conditions = [
    categoryID ? whereContains("categories", categoryID) : null,
    material ? whereContains("material", material) : null,
    availability ? whereEquals("availability", availability) : null,
  ].filter((condition): condition is Record<string, unknown> =>
    Boolean(condition)
  );
  return {
    page,
    sort,
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
