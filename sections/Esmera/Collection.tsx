import Arrow from "../../components/esmera/Arrow.tsx";
import CollectionExplorer from "../../islands/CollectionExplorer.tsx";
import type {
  CatalogFilter,
  CollectionSort,
} from "../../lib/payload/catalog.ts";
import type { StorefrontProductV2 } from "../../lib/esmera/storefront.ts";
import type { MaterialFacet } from "../../loaders/Esmera/MaterialFacets.ts";

export interface Props {
  eyebrow?: string;
  title?: string;
  /** @format textarea */
  text?: string;
  products?: StorefrontProductV2[];
  totalDocs?: number;
  hasNextPage?: boolean;
  endpoint?: string;
  ctaLabel?: string;
  ctaHref?: string;
  emptyStateTitle?: string;
  emptyStateCopy?: string;
  filters?: {
    visible: CatalogFilter[];
    categories: Array<{ title: string; slug: string }>;
    materials: MaterialFacet[];
    q: string;
    category: string;
    materialValues: string[];
    availability: string;
    sort: CollectionSort;
  };
  pagination?: { page: number; totalPages: number; baseHref: string };
}

function pageHref(baseHref: string, page: number): string {
  const [path, query = ""] = baseHref.split("?");
  const params = new URLSearchParams(query);
  params.set("page", String(page));
  return `${path}?${params}`;
}

export default function Collection({
  eyebrow = "",
  title = "",
  text = "",
  products = [],
  totalDocs = products.length,
  hasNextPage = false,
  endpoint = "/api/esmera-collection",
  ctaLabel = "",
  ctaHref = "",
  emptyStateTitle = "Nenhum objeto publicado no momento.",
  emptyStateCopy = "",
  filters,
  pagination,
}: Props) {
  const collectionFilters = filters ?? {
    visible: [
      "category",
      "material",
      "availability",
      "sort",
    ] as CatalogFilter[],
    categories: [],
    materials: [],
    q: "",
    category: "",
    materialValues: [],
    availability: "",
    sort: "editorial" as CollectionSort,
  };

  return (
    <section
      id="catalog"
      class="esv-collection esv-collection-v2-section esv-section"
      aria-labelledby={title ? "esv-collection-title" : undefined}
      aria-label={title ? undefined : "Coleção"}
    >
      <header class="esv-shell esv-collection-v2-hero">
        <nav aria-label="Navegação estrutural">
          <a href="/">Início</a>
          <span aria-hidden="true">/</span>
          <a href="/colecao">Coleções</a>
          {title && <span aria-hidden="true">/</span>}
          {title && <span aria-current="page">{title}</span>}
        </nav>
        {eyebrow && <p class="esv-kicker">{eyebrow}</p>}
        {title && <h1 id="esv-collection-title">{title}</h1>}
        {text && <p class="esv-collection-v2-intro">{text}</p>}
      </header>

      <div class="esv-shell">
        <CollectionExplorer
          initialItems={products}
          initialTotalDocs={totalDocs}
          initialPage={pagination?.page ?? 1}
          initialTotalPages={pagination?.totalPages ?? 1}
          initialHasNextPage={hasNextPage}
          endpoint={endpoint}
          visibleFilters={collectionFilters.visible}
          categories={collectionFilters.categories}
          materials={collectionFilters.materials}
          initial={{
            q: collectionFilters.q,
            category: collectionFilters.category,
            materials: collectionFilters.materialValues,
            availability: collectionFilters.availability,
            sort: collectionFilters.sort,
          }}
          emptyStateTitle={emptyStateTitle}
          emptyStateCopy={emptyStateCopy}
        />
      </div>

      {ctaLabel && ctaHref && (
        <div class="esv-shell esv-collection-end">
          <a class="esv-text-link" href={ctaHref}>
            {ctaLabel} <Arrow size={14} />
          </a>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <nav
          class="esv-shell esv-collection-v2-pagination"
          aria-label="Paginação da coleção"
        >
          {pagination.page > 1 && (
            <a
              rel="prev"
              href={pageHref(pagination.baseHref, pagination.page - 1)}
            >
              Página anterior
            </a>
          )}
          <span>Página {pagination.page} de {pagination.totalPages}</span>
          {pagination.page < pagination.totalPages && (
            <a
              rel="next"
              href={pageHref(pagination.baseHref, pagination.page + 1)}
            >
              Próxima página
            </a>
          )}
        </nav>
      )}
    </section>
  );
}
