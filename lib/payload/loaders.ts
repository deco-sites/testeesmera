import { payloadGet } from "./client.ts";
import { toCategory, toEsmeraObject } from "./adapters.ts";
import { whereAnd, whereContains, whereEquals, whereOr } from "./query.ts";
import type {
  EsmeraObject,
  PayloadAbout,
  PayloadCategory,
  PayloadCollectionPage,
  PayloadContact,
  PayloadHome,
  PayloadNavigation,
  PayloadPaginated,
  PayloadProduct,
  PayloadSiteSettings,
} from "./types.ts";

export async function getPublishedGlobal<T extends { _status?: string | null }>(
  slug: string,
  depth = 1,
) {
  const result = await payloadGet<T>(`globals/${slug}`, { depth });
  return result._status === "published" ? result : null;
}

export const getHome = () => getPublishedGlobal<PayloadHome>("home", 2);
export const getNavigation = () =>
  getPublishedGlobal<PayloadNavigation>("navigation", 2);
export const getSiteSettings = () =>
  getPublishedGlobal<PayloadSiteSettings>("site-settings", 1);
export const getAbout = () => getPublishedGlobal<PayloadAbout>("about", 2);
export const getContact = () =>
  getPublishedGlobal<PayloadContact>("contact", 2);
export const getCollectionPage = () =>
  getPublishedGlobal<PayloadCollectionPage>("collection-page", 2);

export interface ProductListInput {
  limit?: number;
  page?: number;
  sort?: string;
  where?: Record<string, unknown>;
}

export async function listProducts(input: ProductListInput = {}) {
  const response = await payloadGet<PayloadPaginated<PayloadProduct>>(
    "products",
    {
      depth: 2,
      limit: Math.min(48, Math.max(1, input.limit ?? 12)),
      page: Math.max(1, input.page ?? 1),
      sort: input.sort ?? "title",
      where: input.where,
    },
  );
  return {
    ...response,
    docs: response.docs.map((product) => toEsmeraObject(product)).filter((
      item,
    ): item is EsmeraObject => Boolean(item)),
  };
}

export async function getProductBySlug(slug: string) {
  if (!slug.trim()) return null;
  const result = await listProducts({
    limit: 1,
    where: whereEquals("slug", slug.trim()),
  });
  return result.docs[0] ?? null;
}

export async function listCategories(limit = 100) {
  const response = await payloadGet<PayloadPaginated<PayloadCategory>>(
    "categories",
    {
      depth: 2,
      limit: Math.min(100, Math.max(1, limit)),
      page: 1,
      sort: "order,title",
    },
  );
  return response.docs.map((category) => toCategory(category)).filter((
    item,
  ): item is NonNullable<ReturnType<typeof toCategory>> => Boolean(item));
}

export async function getCategoryBySlug(slug: string) {
  if (!slug.trim()) return null;
  const response = await payloadGet<PayloadPaginated<PayloadCategory>>(
    "categories",
    {
      depth: 2,
      limit: 1,
      page: 1,
      sort: "order,title",
      where: whereEquals("slug", slug.trim()),
    },
  );
  return response.docs[0] ? toCategory(response.docs[0]) : null;
}

export async function listProductsByCategory(
  categoryID: string,
  input: ProductListInput = {},
) {
  return await listProducts({
    ...input,
    where: input.where
      ? whereAnd(whereContains("categories", categoryID), input.where)
      : whereContains("categories", categoryID),
  });
}

export async function searchProducts(search: string, limit = 8) {
  const query = search.trim().slice(0, 80);
  if (query.length < 2) return [];
  const result = await listProducts({
    limit: Math.min(12, Math.max(1, limit)),
    sort: "title",
    where: whereOr(
      whereContains("title", query),
      whereContains("subtitle", query),
      whereContains("code", query),
      whereContains("material", query),
    ),
  });
  return result.docs;
}
