import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import {
  collectionObjects,
  type EsmeraObject,
  selectedObjects,
} from "../components/esmera/data.ts";

type Overlay = "menu" | "search" | "enquiry" | null;

type IconName = "menu" | "search" | "bag" | "close" | "arrow";

export interface Props {
  logo: string;
  enquiryLabel: string;
}

const navigation = [
  { label: "Seleção", href: "#selection" },
  { label: "Objetos", href: "#objects" },
  { label: "Maison", href: "#about" },
];

const catalog = [...selectedObjects, ...collectionObjects];

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths = name === "menu"
    ? (
      <>
        <path d="M3 7h18M3 17h18" />
      </>
    )
    : name === "search"
    ? (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    )
    : name === "bag"
    ? (
      <>
        <path d="M5 8h14l-1 13H6L5 8Z" />
        <path d="M9 9V6a3 3 0 0 1 6 0v3" />
      </>
    )
    : name === "close"
    ? (
      <>
        <path d="m5 5 14 14M19 5 5 19" />
      </>
    )
    : (
      <>
        <path d="M5 19 19 5M8 5h11v11" />
      </>
    );

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.35"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      {paths}
    </svg>
  );
}

export default function EsmeraHeader({ logo, enquiryLabel }: Props) {
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [selected, setSelected] = useState<EsmeraObject | null>(null);
  const [selection, setSelection] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const searchResults = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return catalog.slice(0, 4);
    return catalog.filter((item) =>
      `${item.title} ${item.subtitle} ${item.category}`
        .toLocaleLowerCase()
        .includes(normalized)
    ).slice(0, 8);
  }, [query]);

  const selectedItems = catalog.filter((item) => selection.includes(item.id));

  useEffect(() => {
    const active = Boolean(overlay || selected);
    document.documentElement.classList.toggle("esv-lock", active);
    if (overlay === "search") {
      globalThis.setTimeout(() => searchInputRef.current?.focus(), 40);
    }
    return () => document.documentElement.classList.remove("esv-lock");
  }, [overlay, selected]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (selected) setSelected(null);
      else setOverlay(null);
    };
    globalThis.addEventListener("keydown", onKeyDown);
    return () => globalThis.removeEventListener("keydown", onKeyDown);
  }, [selected]);

  useEffect(() => {
    const getProduct = (event: Event) => {
      const { productId, product } = (event as CustomEvent<{
        productId: string;
        product?: EsmeraObject;
      }>).detail;
      return product ?? catalog.find((item) => item.id === productId);
    };
    const onViewObject = (event: Event) => {
      const item = getProduct(event);
      if (item) setSelected(item);
    };
    const onAddToEnquiry = (event: Event) => {
      const item = getProduct(event);
      if (!item) return;
      setSelection((current) =>
        current.includes(item.id) ? current : [...current, item.id]
      );
      setOverlay("enquiry");
    };

    globalThis.addEventListener("esmera:view-object", onViewObject);
    globalThis.addEventListener("esmera:add-to-enquiry", onAddToEnquiry);
    return () => {
      globalThis.removeEventListener("esmera:view-object", onViewObject);
      globalThis.removeEventListener("esmera:add-to-enquiry", onAddToEnquiry);
    };
  }, []);

  const scrollTo = (href: string) => {
    setOverlay(null);
    const id = href.replace(/^#/, "");
    globalThis.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 20);
  };

  const addToSelection = (item: EsmeraObject) => {
    setSelection((current) =>
      current.includes(item.id) ? current : [...current, item.id]
    );
    setSelected(null);
    setOverlay("enquiry");
  };

  return (
    <>
      <header class="esv-header">
        <button
          class="esv-header-menu esv-header-icon"
          type="button"
          aria-label="Abrir menu"
          onClick={() => setOverlay("menu")}
        >
          <Icon name="menu" />
        </button>

        <nav class="esv-header-nav" aria-label="Navegação principal">
          {navigation.map((link) => (
            <button
              type="button"
              onClick={() => scrollTo(link.href)}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <button
          type="button"
          class="esv-wordmark"
          aria-label="Esméra — início"
          onClick={() => scrollTo("#main-content")}
        >
          {logo}
        </button>

        <div class="esv-header-actions">
          <button
            class="esv-header-icon"
            type="button"
            aria-label="Buscar"
            onClick={() => setOverlay("search")}
          >
            <Icon name="search" />
          </button>
          <button
            class="esv-header-icon esv-enquiry-trigger"
            type="button"
            aria-label={`${enquiryLabel}, ${selection.length} itens`}
            onClick={() => setOverlay("enquiry")}
          >
            <Icon name="bag" />
            {selection.length > 0 && <span>{selection.length}</span>}
          </button>
        </div>
      </header>

      {overlay && (
        <div
          class="esv-header-overlay"
          role="presentation"
          onClick={() => setOverlay(null)}
        >
          <aside
            class={`esv-header-panel esv-header-panel-${overlay}`}
            role="dialog"
            aria-modal="true"
            aria-label={overlay === "menu"
              ? "Menu"
              : overlay === "search"
              ? "Busca"
              : enquiryLabel}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              class="esv-panel-close"
              type="button"
              aria-label="Fechar"
              onClick={() => setOverlay(null)}
            >
              <Icon name="close" size={21} />
            </button>

            {overlay === "menu" && (
              <nav class="esv-header-menu-panel" aria-label="Navegação">
                <small>Navegação</small>
                {navigation.map((link, index) => (
                  <button
                    type="button"
                    onClick={() => scrollTo(link.href)}
                  >
                    <span>{link.label}</span>
                    <sup>0{index + 1}</sup>
                  </button>
                ))}
              </nav>
            )}

            {overlay === "search" && (
              <div class="esv-header-search">
                <p class="esv-kicker">Buscar na coleção</p>
                <label class="esv-sr-only" for="esv-search-input">Buscar</label>
                <input
                  ref={searchInputRef}
                  id="esv-search-input"
                  value={query}
                  onInput={(event) => setQuery(event.currentTarget.value)}
                  placeholder="Digite um objeto ou categoria"
                  autocomplete="off"
                />
                <div class="esv-search-results">
                  {searchResults.map((item) => (
                    <button
                      type="button"
                      onClick={() => {
                        setOverlay(null);
                        setSelected(item);
                      }}
                    >
                      <img src={item.image} alt="" loading="lazy" />
                      <span>
                        <small>{item.category}</small>
                        <strong>{item.title}</strong>
                      </span>
                    </button>
                  ))}
                  {searchResults.length === 0 && (
                    <p class="esv-search-empty">Nenhum objeto encontrado.</p>
                  )}
                </div>
              </div>
            )}

            {overlay === "enquiry" && (
              <div class="esv-enquiry-panel">
                <p class="esv-kicker">Consulta privada</p>
                <h2>Sua seleção</h2>
                {selectedItems.length === 0
                  ? (
                    <p class="esv-enquiry-empty">
                      Sua seleção está vazia. Use a busca para conhecer uma peça
                      e adicioná-la à consulta privada.
                    </p>
                  )
                  : (
                    <>
                      <div class="esv-enquiry-list">
                        {selectedItems.map((item) => (
                          <div>
                            <img src={item.image} alt="" loading="lazy" />
                            <span>
                              <strong>{item.title}</strong>
                              <small>{item.code}</small>
                            </span>
                            <button
                              type="button"
                              aria-label={`Remover ${item.title}`}
                              onClick={() =>
                                setSelection((current) =>
                                  current.filter((id) => id !== item.id)
                                )}
                            >
                              Remover
                            </button>
                          </div>
                        ))}
                      </div>
                      <a
                        class="esv-enquiry-send"
                        href={`mailto:contact@esmera.com?subject=${
                          encodeURIComponent("Consulta privada — Esméra")
                        }&body=${
                          encodeURIComponent(
                            `Olá, gostaria de consultar: ${
                              selectedItems.map((item) => item.title).join(", ")
                            }.`,
                          )
                        }`}
                      >
                        Enviar consulta <Icon name="arrow" size={15} />
                      </a>
                    </>
                  )}
              </div>
            )}
          </aside>
        </div>
      )}

      {selected && (
        <div
          class="esv-object-modal-backdrop"
          role="presentation"
          onClick={() => setSelected(null)}
        >
          <article
            class="esv-object-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="esv-object-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              class="esv-panel-close"
              type="button"
              aria-label="Fechar"
              onClick={() => setSelected(null)}
            >
              <Icon name="close" size={21} />
            </button>
            <div class="esv-object-modal-images">
              <img src={selected.image} alt={selected.alt} />
              <img
                src={selected.detailImage}
                alt={`Detalhe de ${selected.title}`}
              />
            </div>
            <div class="esv-object-modal-copy">
              <p class="esv-kicker">{selected.code} · {selected.category}</p>
              <h2 id="esv-object-modal-title">{selected.title}</h2>
              <p class="esv-object-modal-subtitle">{selected.subtitle}</p>
              <p>{selected.description}</p>
              <dl>
                <div>
                  <dt>Valor</dt>
                  <dd>{selected.price}</dd>
                </div>
                <div>
                  <dt>Disponibilidade</dt>
                  <dd>{selected.availability}</dd>
                </div>
              </dl>
              <button
                class="esv-enquiry-send"
                type="button"
                onClick={() => addToSelection(selected)}
              >
                {selection.includes(selected.id)
                  ? "Ver seleção"
                  : "Adicionar à consulta"} <Icon name="arrow" size={15} />
              </button>
            </div>
          </article>
        </div>
      )}
    </>
  );
}
