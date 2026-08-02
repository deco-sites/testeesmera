import type { Handlers, PageProps } from "$fresh/server.ts";
import StorefrontLayout from "../../components/esmera/StorefrontLayout.tsx";
import {
  buildCatalogQuery,
  type CatalogFilter,
  normalizeVisibleFilters,
} from "../../lib/payload/catalog.ts";
import {
  getCategoryBySlug,
  getCollectionPage,
  listProductsByCategory,
} from "../../lib/payload/loaders.ts";
import { getPageChrome } from "../../lib/payload/pageData.ts";
import type { EsmeraObject, SEOModel } from "../../lib/payload/types.ts";
import Collection from "../../sections/Esmera/Collection.tsx";

interface Data {
  category: {
    id: string;
    title: string;
    description: string;
    seo: SEOModel;
  } | null;
  products: EsmeraObject[];
  chrome: Awaited<ReturnType<typeof getPageChrome>>;
  seo: SEOModel;
  visibleFilters: CatalogFilter[];
  query: ReturnType<typeof buildCatalogQuery>;
  totalPages: number;
  baseHref: string;
}
export const handler: Handlers<Data> = {
  async GET(req, ctx) {
    const [category, chrome, collectionPage] = await Promise.all([
      getCategoryBySlug(ctx.params.slug),
      getPageChrome(),
      getCollectionPage(),
    ]);
    if (!category) {
      return ctx.render({
        category: null,
        products: [],
        chrome,
        seo: { title: "", description: "", noindex: true },
        visibleFilters: [],
        query: buildCatalogQuery(new URL(req.url), [], []),
        totalPages: 0,
        baseHref: new URL(req.url).pathname,
      }, { status: 404 });
    }
    const visibleFilters = normalizeVisibleFilters(
      collectionPage?.visibleFilters,
    ).filter((filter) => filter !== "category");
    const url = new URL(req.url);
    const query = buildCatalogQuery(url, visibleFilters, chrome.categories);
    const products = await listProductsByCategory(category.id, {
      limit: 12,
      page: query.page,
      sort: query.sort,
      where: query.where,
    });
    return ctx.render({
      category,
      products: products.docs,
      chrome,
      seo: {
        ...category.seo,
        title: category.seo.title || category.title,
        description: category.seo.description || category.description,
      },
      visibleFilters,
      query,
      totalPages: products.totalPages,
      baseHref: `${url.pathname}?${url.searchParams}`,
    });
  },
};
export default function CategoryRoute({ data }: PageProps<Data>) {
  return (
    <StorefrontLayout {...data.chrome} seo={data.seo}>
      {data.category
        ? (
          <Collection
            title={data.category.title}
            text={data.category.description}
            products={data.products}
            filters={{
              visible: data.visibleFilters,
              categories: [],
              category: "",
              material: data.query.material,
              availability: data.query.availability,
              sort: data.query.sort,
            }}
            pagination={{
              page: data.query.page,
              totalPages: data.totalPages,
              baseHref: data.baseHref,
            }}
          />
        )
        : (
          <section class="esv-shell esv-section">
            <h1>Categoria não encontrada</h1>
          </section>
        )}
    </StorefrontLayout>
  );
}
