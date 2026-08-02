import type { Handlers, PageProps } from "$fresh/server.ts";
import StorefrontLayout from "../../components/esmera/StorefrontLayout.tsx";
import {
  buildCatalogQuery,
  type CatalogFilter,
  normalizeVisibleFilters,
} from "../../lib/payload/catalog.ts";
import { lexicalToText } from "../../lib/payload/richText.ts";
import { toSEO } from "../../lib/payload/adapters.ts";
import { getCollectionPage, listProducts } from "../../lib/payload/loaders.ts";
import { getPageChrome } from "../../lib/payload/pageData.ts";
import type {
  EsmeraObject,
  PayloadCollectionPage,
  SEOModel,
} from "../../lib/payload/types.ts";
import Collection from "../../sections/Esmera/Collection.tsx";

interface Data {
  products: EsmeraObject[];
  page: PayloadCollectionPage | null;
  chrome: Awaited<ReturnType<typeof getPageChrome>>;
  seo: SEOModel;
  visibleFilters: CatalogFilter[];
  query: ReturnType<typeof buildCatalogQuery>;
  totalPages: number;
  baseHref: string;
}
export const handler: Handlers<Data> = {
  async GET(req, ctx) {
    const [page, chrome] = await Promise.all([
      getCollectionPage(),
      getPageChrome(),
    ]);
    const visibleFilters = normalizeVisibleFilters(page?.visibleFilters);
    const url = new URL(req.url);
    const query = buildCatalogQuery(url, visibleFilters, chrome.categories);
    const products = await listProducts({
      limit: 12,
      page: query.page,
      sort: query.sort,
      where: query.where,
    });
    return ctx.render({
      products: products.docs,
      page,
      chrome,
      seo: toSEO(page?.seo, chrome.settings),
      visibleFilters,
      query,
      totalPages: products.totalPages,
      baseHref: `${url.pathname}?${url.searchParams}`,
    });
  },
};
export default function CollectionRoute({ data }: PageProps<Data>) {
  return (
    <StorefrontLayout {...data.chrome} seo={data.seo}>
      <Collection
        eyebrow={data.page?.eyebrow ?? ""}
        title={data.page?.title ?? ""}
        text={lexicalToText(data.page?.introduction)}
        products={data.products}
        ctaLabel={data.page?.callToAction?.label ?? ""}
        ctaHref={data.page?.callToAction?.href ?? ""}
        emptyStateTitle={data.page?.emptyStateTitle ?? undefined}
        emptyStateCopy={data.page?.emptyStateCopy ?? ""}
        filters={{
          visible: data.visibleFilters,
          categories: data.chrome.categories,
          category: data.query.category,
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
    </StorefrontLayout>
  );
}
