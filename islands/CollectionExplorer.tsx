import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import ObjectCard from "../components/esmera/ObjectCard.tsx";
import type { CatalogFilter, CollectionSort } from "../lib/payload/catalog.ts";
import type { EsmeraObject } from "../lib/payload/types.ts";

export interface CollectionExplorerProps {
  initialItems: EsmeraObject[];
  initialTotalDocs: number;
  initialPage: number;
  initialTotalPages: number;
  initialHasNextPage: boolean;
  endpoint: string;
  visibleFilters: CatalogFilter[];
  categories: Array<{ title: string; slug: string }>;
  initial: {
    q: string;
    category: string;
    material: string;
    availability: string;
    sort: CollectionSort;
  };
  emptyStateTitle: string;
  emptyStateCopy: string;
}

interface CollectionResponse {
  items: EsmeraObject[];
  pagination: {
    page: number;
    totalPages: number;
    totalDocs: number;
    hasNextPage: boolean;
  };
}

const availabilityOptions = [
  ["available", "Disponível"],
  ["unique", "Peça única"],
  ["limited", "Edição limitada"],
  ["made_to_order", "Sob encomenda"],
  ["archive", "Arquivo"],
] as const;

const sortOptions: Array<[CollectionSort, string]> = [
  ["editorial", "Seleção editorial"],
  ["newest", "Novidades"],
  ["price-asc", "Menor preço"],
  ["price-desc", "Maior preço"],
  ["name", "Nome"],
];

function paramsFromState(state: {
  q: string;
  category: string;
  material: string;
  availability: string;
  sort: CollectionSort;
  page: number;
}) {
  const params = new URLSearchParams();
  if (state.q.trim().length >= 2) params.set("q", state.q.trim());
  if (state.category) params.set("category", state.category);
  if (state.material) params.set("material", state.material);
  if (state.availability) params.set("availability", state.availability);
  if (state.sort !== "editorial") params.set("sort", state.sort);
  if (state.page > 1) params.set("page", String(state.page));
  return params;
}

export default function CollectionExplorer(props: CollectionExplorerProps) {
  const [items, setItems] = useState(props.initialItems);
  const [totalDocs, setTotalDocs] = useState(props.initialTotalDocs);
  const [page, setPage] = useState(props.initialPage);
  const [totalPages, setTotalPages] = useState(props.initialTotalPages);
  const [hasNextPage, setHasNextPage] = useState(props.initialHasNextPage);
  const [qInput, setQInput] = useState(props.initial.q);
  const [q, setQ] = useState(props.initial.q);
  const [category, setCategory] = useState(props.initial.category);
  const [material, setMaterial] = useState(props.initial.material);
  const [availability, setAvailability] = useState(props.initial.availability);
  const [sort, setSort] = useState<CollectionSort>(props.initial.sort);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const controllerRef = useRef<AbortController | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const firstFilterRun = useRef(true);

  useEffect(() => {
    const timer = globalThis.setTimeout(() => setQ(qInput.trim()), 250);
    return () => globalThis.clearTimeout(timer);
  }, [qInput]);

  const load = async (nextPage: number, append: boolean) => {
    if (append && loading) return;
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);
    setError("");
    const params = paramsFromState({
      q,
      category,
      material,
      availability,
      sort,
      page: nextPage,
    });
    const endpoint = new URL(props.endpoint, globalThis.location.origin);
    params.forEach((value, key) => endpoint.searchParams.set(key, value));

    try {
      const response = await fetch(endpoint.toString(), {
        signal: controller.signal,
        headers: { accept: "application/json" },
      });
      if (!response.ok) throw new Error("collection_unavailable");
      const data = await response.json() as CollectionResponse;
      setItems((current) => {
        const incoming = append ? [...current, ...data.items] : data.items;
        const unique = new Map(incoming.map((item) => [item.id, item]));
        return [...unique.values()];
      });
      setPage(data.pagination.page);
      setTotalPages(data.pagination.totalPages);
      setTotalDocs(data.pagination.totalDocs);
      setHasNextPage(data.pagination.hasNextPage);

      const publicParams = paramsFromState({
        q,
        category,
        material,
        availability,
        sort,
        page: data.pagination.page,
      });
      const serialized = publicParams.toString();
      const nextURL = `${globalThis.location.pathname}${
        serialized ? `?${serialized}` : ""
      }`;
      globalThis.history.replaceState(
        { ...globalThis.history.state, esmeraCollectionPage: data.pagination.page },
        "",
        nextURL,
      );
    } catch {
      if (!controller.signal.aborted) {
        setError("Não foi possível atualizar a coleção agora.");
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    if (firstFilterRun.current) {
      firstFilterRun.current = false;
      return;
    }
    void load(1, false);
    return () => controllerRef.current?.abort();
  }, [q, category, material, availability, sort]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && !loading) void load(page + 1, true);
    }, { rootMargin: "600px 0px" });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [page, hasNextPage, loading, q, category, material, availability, sort]);

  const activeFilters = useMemo(() => {
    const chips: Array<{ key: string; label: string; clear: () => void }> = [];
    if (q.length >= 2) {
      chips.push({ key: "q", label: `Busca: ${q}`, clear: () => setQInput("") });
    }
    if (category) {
      const label = props.categories.find((item) => item.slug === category)?.title ||
        category;
      chips.push({ key: "category", label, clear: () => setCategory("") });
    }
    if (material) {
      chips.push({ key: "material", label: material, clear: () => setMaterial("") });
    }
    if (availability) {
      const label = availabilityOptions.find(([value]) => value === availability)?.[1] ||
        availability;
      chips.push({
        key: "availability",
        label,
        clear: () => setAvailability(""),
      });
    }
    return chips;
  }, [q, category, material, availability, props.categories]);

  const clearAll = () => {
    setQInput("");
    setCategory("");
    setMaterial("");
    setAvailability("");
    setSort("editorial");
  };

  return (
    <div class="esv-collection-v2" aria-busy={loading ? "true" : "false"}>
      <div class="esv-collection-v2-count" aria-live="polite">
        Mostrando {items.length} de {totalDocs} itens
      </div>

      <div class="esv-collection-v2-controls">
        <label class="esv-collection-v2-search">
          <span class="esv-sr-only">Buscar nesta coleção</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18">
            <circle cx="10.5" cy="10.5" r="5.75" fill="none" stroke="currentColor" stroke-width="1.4" />
            <path d="m15 15 4.25 4.25" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.4" />
          </svg>
          <input
            type="search"
            value={qInput}
            placeholder="Buscar peças"
            autocomplete="off"
            onInput={(event) => setQInput(event.currentTarget.value)}
          />
        </label>

        <button
          class="esv-collection-v2-filter-trigger"
          type="button"
          aria-expanded={filtersOpen}
          aria-controls="esv-collection-filters"
          onClick={() => setFiltersOpen((value) => !value)}
        >
          Filtros {activeFilters.length > 0 && <span>{activeFilters.length}</span>}
        </button>

        <label class="esv-collection-v2-sort">
          <span>Ordenar</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.currentTarget.value as CollectionSort)}
          >
            {sortOptions.map(([value, label]) => (
              <option value={value} key={value}>{label}</option>
            ))}
          </select>
        </label>
      </div>

      <div
        id="esv-collection-filters"
        class={`esv-collection-v2-filters${filtersOpen ? " is-open" : ""}`}
      >
        <div class="esv-collection-v2-filter-head">
          <strong>Refinar coleção</strong>
          <button type="button" onClick={() => setFiltersOpen(false)}>Fechar</button>
        </div>
        <div class="esv-collection-v2-filter-fields">
          {props.visibleFilters.includes("category") && (
            <label>
              <span>Categoria</span>
              <select value={category} onChange={(event) => setCategory(event.currentTarget.value)}>
                <option value="">Todas</option>
                {props.categories.map((item) => (
                  <option key={item.slug} value={item.slug}>{item.title}</option>
                ))}
              </select>
            </label>
          )}
          {props.visibleFilters.includes("material") && (
            <label>
              <span>Matéria</span>
              <input
                value={material}
                maxlength={80}
                placeholder="Ex.: pedra, vidro"
                onInput={(event) => setMaterial(event.currentTarget.value)}
              />
            </label>
          )}
          {props.visibleFilters.includes("availability") && (
            <label>
              <span>Disponibilidade</span>
              <select
                value={availability}
                onChange={(event) => setAvailability(event.currentTarget.value)}
              >
                <option value="">Todas</option>
                {availabilityOptions.map(([value, label]) => (
                  <option value={value} key={value}>{label}</option>
                ))}
              </select>
            </label>
          )}
        </div>
        <div class="esv-collection-v2-filter-actions">
          <button type="button" onClick={clearAll}>Limpar tudo</button>
          <button type="button" onClick={() => setFiltersOpen(false)}>Ver resultados</button>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div class="esv-collection-v2-chips" aria-label="Filtros aplicados">
          {activeFilters.map((chip) => (
            <button type="button" key={chip.key} onClick={chip.clear}>
              {chip.label} <span aria-hidden="true">×</span>
            </button>
          ))}
          <button type="button" class="esv-collection-v2-clear" onClick={clearAll}>
            Limpar tudo
          </button>
        </div>
      )}

      {error && <p class="esv-collection-v2-error" role="alert">{error}</p>}

      {items.length > 0
        ? (
          <div class="esv-collection-v2-grid" role="list">
            {items.map((item, index) => (
              <ObjectCard key={item.id} item={item} motionOrder={index % 4} />
            ))}
          </div>
        )
        : !loading && (
          <div class="esv-collection-v2-empty" role="status">
            <p>{props.emptyStateTitle}</p>
            {props.emptyStateCopy && <p>{props.emptyStateCopy}</p>}
          </div>
        )}

      {loading && (
        <div class="esv-collection-v2-grid esv-collection-v2-skeleton-grid" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, index) => (
            <div class="esv-collection-v2-skeleton" key={index}>
              <span />
              <i />
              <i />
            </div>
          ))}
        </div>
      )}

      <div ref={sentinelRef} class="esv-collection-v2-sentinel" aria-hidden="true" />
      {hasNextPage && (
        <div class="esv-collection-v2-more">
          <button type="button" disabled={loading} onClick={() => void load(page + 1, true)}>
            {loading ? "Carregando…" : "Carregar mais"}
          </button>
          <span>Página {page} de {totalPages}</span>
        </div>
      )}
    </div>
  );
}
