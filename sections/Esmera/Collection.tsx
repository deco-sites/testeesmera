import ObjectCard from "../../components/esmera/ObjectCard.tsx";
import type { EsmeraObject } from "../../lib/payload/types.ts";
import Arrow from "../../components/esmera/Arrow.tsx";

export interface Props {
  eyebrow?: string;
  title?: string;
  /** @format textarea */
  text?: string;
  products?: EsmeraObject[];
  ctaLabel?: string;
  ctaHref?: string;
  emptyStateTitle?: string;
  emptyStateCopy?: string;
  filters?: {
    visible: Array<"category" | "material" | "availability" | "sort">;
    categories: Array<{ title: string; slug: string }>;
    category: string;
    material: string;
    availability: string;
    sort: string;
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
  ctaLabel = "",
  ctaHref = "",
  emptyStateTitle = "Nenhum objeto publicado no momento.",
  emptyStateCopy = "",
  filters,
  pagination,
}: Props) {
  return (
    <section
      id="catalog"
      class="esv-collection esv-section"
      aria-labelledby={title ? "esv-collection-title" : undefined}
      aria-label={title ? undefined : "Coleção"}
    >
      {(eyebrow || title || text) && (
        <div class="esv-shell esv-rule-top esv-shelf-head">
          {eyebrow && <p class="esv-kicker">{eyebrow}</p>}
          {title && <h2 id="esv-collection-title">{title}</h2>}
          {text && <p>{text}</p>}
        </div>
      )}

      {filters && filters.visible.length > 0 && (
        <form class="esv-shell esv-rule-top" method="get">
          {filters.visible.includes("category") && (
            <label>
              Categoria
              <select name="category" value={filters.category}>
                <option value="">Todas</option>
                {filters.categories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.title}
                  </option>
                ))}
              </select>
            </label>
          )}
          {filters.visible.includes("material") && (
            <label>
              Matéria
              <input name="material" value={filters.material} maxlength={80} />
            </label>
          )}
          {filters.visible.includes("availability") && (
            <label>
              Disponibilidade
              <select name="availability" value={filters.availability}>
                <option value="">Todas</option>
                <option value="available">Disponível</option>
                <option value="unique">Peça única</option>
                <option value="limited">Edição limitada</option>
                <option value="made_to_order">Sob encomenda</option>
                <option value="archive">Arquivo</option>
              </select>
            </label>
          )}
          {filters.visible.includes("sort") && (
            <label>
              Ordenar
              <select name="sort" value={filters.sort}>
                <option value="title">Nome</option>
                <option value="basePriceCents">Menor preço</option>
                <option value="-basePriceCents">Maior preço</option>
              </select>
            </label>
          )}
          <button type="submit">Aplicar</button>
        </form>
      )}

      {products.length > 0
        ? (
          <div class="esv-shell esv-product-shelf" role="list">
            {products.map((item) => <ObjectCard key={item.id} item={item} />)}
          </div>
        )
        : (
          <div class="esv-shell" role="status">
            <p>{emptyStateTitle}</p>
            {emptyStateCopy && <p>{emptyStateCopy}</p>}
          </div>
        )}

      {ctaLabel && ctaHref && (
        <div class="esv-shell esv-collection-end">
          <a class="esv-text-link" href={ctaHref}>
            {ctaLabel} <Arrow size={14} />
          </a>
        </div>
      )}
      {pagination && pagination.totalPages > 1 && (
        <nav class="esv-shell esv-collection-end" aria-label="Paginação">
          {pagination.page > 1 && (
            <a href={pageHref(pagination.baseHref, pagination.page - 1)}>
              Página anterior
            </a>
          )}
          <span>Página {pagination.page} de {pagination.totalPages}</span>
          {pagination.page < pagination.totalPages && (
            <a href={pageHref(pagination.baseHref, pagination.page + 1)}>
              Próxima página
            </a>
          )}
        </nav>
      )}
    </section>
  );
}
