import type { Handlers, PageProps } from "$fresh/server.ts";
import StorefrontLayout from "../../components/esmera/StorefrontLayout.tsx";
import {
  buildCatalogQuery,
  type CatalogFilter,
  hasCollectionRefinements,
  normalizeVisibleFilters,
} from "../../lib/payload/catalog.ts";
import { lexicalToText } from "../../lib/payload/richText.ts";
import { toSEO } from "../../lib/payload/adapters.ts";
import { getCollectionPage, listProducts } from "../../lib/payload/loaders.ts";
import { getPageChrome } from "../../lib/payload/pageData.ts";
import type { StorefrontProductV2 } from "../../lib/esmera/storefront.ts";
import type {
  PayloadCollectionPage,
  SEOModel,
} from "../../lib/payload/types.ts";
import MaterialFacets, {
  type MaterialFacet,
} from "../../loaders/Esmera/MaterialFacets.ts";
import Collection from "../../sections/Esmera/Collection.tsx";

interface Data {
  products: StorefrontProductV2[];
  page: PayloadCollectionPage | null;
  chrome: Awaited<ReturnType<typeof getPageChrome>>;
  seo: SEOModel;
  visibleFilters: CatalogFilter[];
  query: ReturnType<typeof buildCatalogQuery>;
  totalDocs: number;
  totalPages: number;
  hasNextPage: boolean;
  baseHref: string;
  materials: MaterialFacet[];
}

export const handler: Handlers<Data> = {
  async GET(req, ctx) {
    const [page, chrome, materials] = await Promise.all([
      getCollectionPage(),
      getPageChrome(),
      MaterialFacets({}),
    ]);
    const visibleFilters = normalizeVisibleFilters(page?.visibleFilters);
    const url = new URL(req.url);
    const query = buildCatalogQuery(url, visibleFilters, chrome.categories);
    const products = await listProducts({
      limit: 24,
      page: query.page,
      sort: query.payloadSort,
      q: query.q.length >= 2 ? query.q : undefined,
      category: query.category || undefined,
      material: query.material || undefined,
      availability: query.availability || undefined,
    });
    const seo = toSEO(page?.seo, chrome.settings);
    return ctx.render({
      products: products.docs,
      page,
      chrome,
      seo: {
        ...seo,
        canonical: seo.canonical || `${url.origin}${url.pathname}`,
        noindex: seo.noindex || hasCollectionRefinements(query),
      },
      visibleFilters,
      query,
      totalDocs: products.totalDocs,
      totalPages: products.totalPages,
      hasNextPage: products.hasNextPage,
      baseHref: `${url.pathname}${url.search}`,
      materials,
    });
  },
};

export default function CollectionRoute({ data }: PageProps<Data>) {
  return (
    <StorefrontLayout {...data.chrome} seo={data.seo}>
      <Collection
        eyebrow={data.page?.eyebrow ?? ""}
        title={data.page?.title ?? "Coleções"}
        text={lexicalToText(data.page?.introduction)}
        products={data.products}
        totalDocs={data.totalDocs}
        hasNextPage={data.hasNextPage}
        endpoint="/api/esmera-collection"
        ctaLabel={data.page?.callToAction?.label ?? ""}
        ctaHref={data.page?.callToAction?.href ?? ""}
        emptyStateTitle={data.page?.emptyStateTitle ?? undefined}
        emptyStateCopy={data.page?.emptyStateCopy ?? ""}
        filters={{
          visible: data.visibleFilters,
          categories: data.chrome.categories,
          materials: data.materials,
          q: data.query.q,
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
