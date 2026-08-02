import { useEffect, useRef, useState } from "preact/hooks";
import { getAvailabilityMeta } from "../components/esmera/availability.ts";
import type {
  EsmeraObject,
  EsmeraVariant,
  NavigationLink,
} from "../lib/payload/types.ts";

type Overlay = "menu" | "search" | "enquiry" | null;
type CartItem = {
  product: EsmeraObject;
  quantity: number;
  variant?: EsmeraVariant;
};
type StoredCartItem = {
  id: string;
  slug: string;
  title: string;
  image: string;
  alt: string;
  availability: EsmeraObject["availability"];
  priceMode: "fixed" | "inquiry";
  priceCents: number | null;
  formattedPrice: string;
  quantity: number;
  variant?: {
    sku: string;
    label: string;
    priceMode: "fixed" | "inquiry";
    priceCents: number | null;
    formattedPrice: string;
  };
};

export interface Props {
  logo: string;
  enquiryLabel: string;
  navigation: NavigationLink[];
  categories: NavigationLink[];
  whatsappHref: string;
}

const CART_STORAGE_KEY = "esmera-cart-v2";
const emptyProduct = (item: StoredCartItem): EsmeraObject => ({
  id: item.id,
  slug: item.slug,
  code: "",
  title: item.title,
  image: item.image,
  alt: item.alt,
  gallery: [{
    url: item.image,
    alt: item.alt,
    key: "cart",
    role: "cover",
  }],
  availability: item.availability,
  attributes: [],
  priceMode: item.priceMode,
  priceCents: item.priceCents,
  formattedPrice: item.formattedPrice,
  isInquiry: item.priceMode === "inquiry",
  variants: [],
  seo: { title: "", description: "", noindex: false },
  price: item.formattedPrice,
});

const formatBRL = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    cents / 100,
  );

function checkoutHref(base: string, message: string) {
  if (!base) return "";
  try {
    const url = new URL(base);
    url.searchParams.set("text", message);
    return url.toString();
  } catch {
    return "";
  }
}

export default function EsmeraHeader(
  { logo, enquiryLabel, navigation, categories, whatsappHref }: Props,
) {
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [selected, setSelected] = useState<EsmeraObject | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<
    EsmeraVariant | undefined
  >();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartReady, setCartReady] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<EsmeraObject[]>([]);
  const [searchState, setSearchState] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const searchInput = useRef<HTMLInputElement>(null);
  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      const raw = globalThis.localStorage?.getItem(CART_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) as StoredCartItem[] : [];
      if (Array.isArray(parsed)) {
        setCart(
          parsed.filter((item) => item.id && item.quantity > 0).map((item) => ({
            product: emptyProduct(item),
            quantity: item.quantity,
            variant: item.variant
              ? {
                ...item.variant,
                isInquiry: item.variant.priceMode === "inquiry",
                disabled: false,
                mediaKeys: [],
              }
              : undefined,
          })),
        );
      }
    } catch {
      // Storage is optional progressive enhancement.
    } finally {
      setCartReady(true);
    }
  }, []);

  useEffect(() => {
    if (!cartReady) return;
    const stored: StoredCartItem[] = cart.map((
      { product, quantity, variant },
    ) => ({
      id: product.id,
      slug: product.slug,
      title: product.title,
      image: product.image,
      alt: product.alt,
      availability: product.availability,
      priceMode: product.priceMode,
      priceCents: product.priceCents,
      formattedPrice: product.formattedPrice,
      quantity,
      variant: variant
        ? {
          sku: variant.sku,
          label: variant.label,
          priceMode: variant.priceMode,
          priceCents: variant.priceCents,
          formattedPrice: variant.formattedPrice,
        }
        : undefined,
    }));
    try {
      globalThis.localStorage?.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(stored),
      );
    } catch {
      // Ignore quota/privacy errors.
    }
  }, [cart, cartReady]);

  useEffect(() => {
    const normalized = query.trim();
    requestRef.current?.abort();
    if (normalized.length < 2) {
      setResults([]);
      setSearchState("idle");
      return;
    }
    const controller = new AbortController();
    requestRef.current = controller;
    const timer = globalThis.setTimeout(async () => {
      setSearchState("loading");
      try {
        const response = await fetch(
          `/api/esmera-search?q=${encodeURIComponent(normalized)}`,
          {
            signal: controller.signal,
            headers: { accept: "application/json" },
          },
        );
        if (!response.ok) throw new Error("search failed");
        const data = await response.json() as { items?: EsmeraObject[] };
        setResults(Array.isArray(data.items) ? data.items.slice(0, 8) : []);
        setSearchState("ready");
      } catch {
        if (!controller.signal.aborted) setSearchState("error");
      }
    }, 250);
    return () => {
      globalThis.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    const view = (event: Event) => {
      const product = (event as CustomEvent<{ product?: EsmeraObject }>).detail
        ?.product;
      if (!product) return;
      setSelected(product);
      setSelectedVariant(product.variants.find((variant) => !variant.disabled));
    };
    const add = (event: Event) => {
      const product = (event as CustomEvent<{ product?: EsmeraObject }>).detail
        ?.product;
      if (!product) return;
      addToCart(product, product.variants.find((variant) => !variant.disabled));
      setOverlay("enquiry");
    };
    globalThis.addEventListener("esmera:view-object", view);
    globalThis.addEventListener("esmera:add-to-enquiry", add);
    return () => {
      globalThis.removeEventListener("esmera:view-object", view);
      globalThis.removeEventListener("esmera:add-to-enquiry", add);
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelected(null);
        setOverlay(null);
      }
    };
    globalThis.addEventListener("keydown", onKey);
    return () => globalThis.removeEventListener("keydown", onKey);
  }, []);

  const addToCart = (product: EsmeraObject, variant?: EsmeraVariant) => {
    const key = `${product.id}:${variant?.sku ?? "base"}`;
    setCart((current) => {
      const existing = current.find((item) =>
        `${item.product.id}:${item.variant?.sku ?? "base"}` === key
      );
      if (!existing) return [...current, { product, variant, quantity: 1 }];
      return current.map((item) =>
        `${item.product.id}:${item.variant?.sku ?? "base"}` === key
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    });
  };
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce(
    (total, item) =>
      total +
      ((item.variant?.priceCents ?? item.product.priceCents) ?? 0) *
        item.quantity,
    0,
  );
  const hasInquiry = cart.some((item) =>
    (item.variant?.priceMode ?? item.product.priceMode) === "inquiry"
  );
  const message = [
    "Olá, gostaria de finalizar este carrinho Esméra:",
    ...cart.map(({ product, quantity, variant }) =>
      `${quantity}x ${product.title}${variant ? ` — ${variant.label}` : ""} — ${
        variant?.formattedPrice ?? product.formattedPrice
      }`
    ),
    subtotal > 0 ? `Subtotal estimado: ${formatBRL(subtotal)}` : "",
    hasInquiry ? "Itens sob consulta serão confirmados pela curadoria." : "",
  ].filter(Boolean).join("\n");
  const sendHref = checkoutHref(whatsappHref, message);

  return (
    <>
      <header class="esv-header">
        <button
          class="esv-header-menu esv-header-icon"
          type="button"
          aria-label="Abrir menu"
          onClick={() => setOverlay("menu")}
        >
          ☰
        </button>
        <nav class="esv-header-nav" aria-label="Navegação principal">
          {navigation.slice(0, 3).map((link) => (
            <a
              href={link.href}
              rel={link.external ? "noopener noreferrer" : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <a class="esv-wordmark" aria-label={`${logo} — início`} href="/">
          {logo}
        </a>
        <div class="esv-header-actions">
          <button
            class="esv-header-icon"
            type="button"
            aria-label="Buscar objetos"
            onClick={() => {
              setOverlay("search");
              globalThis.setTimeout(() => searchInput.current?.focus(), 30);
            }}
          >
            ⌕
          </button>
          <button
            class="esv-enquiry-link esv-cart-link"
            type="button"
            aria-label={`${enquiryLabel}, ${cartCount} itens`}
            onClick={() => setOverlay("enquiry")}
          >
            {enquiryLabel}
            {cartCount > 0 && <sup>{cartCount}</sup>}
          </button>
        </div>
      </header>

      {overlay && (
        <div
          class={`esv-header-overlay esv-header-overlay-${overlay}`}
          role="presentation"
          onClick={() => setOverlay(null)}
        >
          <aside
            class={`esv-header-panel esv-header-panel-${overlay}`}
            role="dialog"
            aria-modal="true"
            aria-label={overlay}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              class="esv-panel-close"
              type="button"
              aria-label="Fechar"
              onClick={() => setOverlay(null)}
            >
              ×
            </button>
            {overlay === "menu" && (
              <nav class="esv-header-menu-panel esv-menu-v2" aria-label="Menu">
                <small>Menu</small>
                <div class="esv-menu-primary-links">
                  {navigation.map((link, index) => (
                    <a href={link.href}>
                      <span>{link.label}</span>
                      <sup>{String(index + 1).padStart(2, "0")}</sup>
                    </a>
                  ))}
                </div>
                <div class="esv-menu-subnav">
                  {categories.map((link) => (
                    <a href={link.href}>{link.label}</a>
                  ))}
                </div>
              </nav>
            )}
            {overlay === "search" && (
              <div class="esv-header-search">
                <p class="esv-kicker">Buscar objetos</p>
                <label class="esv-sr-only" for="esv-search-input">
                  Buscar por nome, código ou material
                </label>
                <input
                  ref={searchInput}
                  id="esv-search-input"
                  value={query}
                  onInput={(event) => setQuery(event.currentTarget.value)}
                  autocomplete="off"
                />
                {searchState === "loading" && <p role="status">Buscando…</p>}
                {searchState === "error" && (
                  <p role="alert">Não foi possível buscar agora.</p>
                )}
                <div class="esv-search-results">
                  {results.map((item) => (
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(item);
                        setSelectedVariant(
                          item.variants.find((variant) => !variant.disabled),
                        );
                        setOverlay(null);
                      }}
                    >
                      <img src={item.image} alt="" width="72" height="88" />
                      <span>
                        <small>{item.material}</small>
                        <strong>{item.title}</strong>
                      </span>
                    </button>
                  ))}
                  {searchState === "ready" && results.length === 0 && (
                    <p>Nenhum objeto encontrado.</p>
                  )}
                </div>
              </div>
            )}
            {overlay === "enquiry" && (
              <div class="esv-enquiry-panel esv-cart-panel">
                <p class="esv-kicker">Carrinho</p>
                <h2>Seu carrinho</h2>
                {cart.length === 0
                  ? <p class="esv-enquiry-empty">Seu carrinho está vazio.</p>
                  : (
                    <>
                      <div class="esv-enquiry-list esv-cart-list">
                        {cart.map((item) => (
                          <div class="esv-cart-item">
                            <img
                              src={item.product.image}
                              alt=""
                              width="74"
                              height="90"
                            />
                            <span>
                              <strong>{item.product.title}</strong>
                              <small>{item.variant?.label}</small>
                              <em>
                                {item.variant?.formattedPrice ??
                                  item.product.formattedPrice}
                              </em>
                            </span>
                            <div class="esv-cart-item-actions">
                              <button
                                type="button"
                                onClick={() =>
                                  setCart((current) =>
                                    current.map((candidate) =>
                                      candidate === item
                                        ? {
                                          ...candidate,
                                          quantity: Math.max(
                                            1,
                                            candidate.quantity - 1,
                                          ),
                                        }
                                        : candidate
                                    )
                                  )}
                              >
                                −
                              </button>
                              <span>{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setCart((current) =>
                                    current.map((candidate) =>
                                      candidate === item
                                        ? {
                                          ...candidate,
                                          quantity: candidate.quantity + 1,
                                        }
                                        : candidate
                                    )
                                  )}
                              >
                                +
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setCart((current) =>
                                    current.filter((candidate) =>
                                      candidate !== item
                                    )
                                  )}
                              >
                                Remover
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      {subtotal > 0 && (
                        <div class="esv-cart-summary">
                          <span>Subtotal estimado</span>
                          <strong>{formatBRL(subtotal)}</strong>
                        </div>
                      )}
                      {sendHref && (
                        <a
                          class="esv-enquiry-send esv-cart-checkout"
                          href={sendHref}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Finalizar pelo WhatsApp
                        </a>
                      )}
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
              ×
            </button>
            <div class="esv-object-modal-images">
              <img
                src={selected.image}
                alt={selected.alt}
                width="900"
                height="1125"
              />
              {selected.detailImage && (
                <img
                  src={selected.detailImage}
                  alt=""
                  width="900"
                  height="1125"
                />
              )}
            </div>
            <div class="esv-object-modal-copy">
              <p class="esv-kicker">
                {getAvailabilityMeta(selected.availability).label}
              </p>
              <h2 id="esv-object-modal-title">{selected.title}</h2>
              {selected.description && <p>{selected.description}</p>}
              {selected.variants.filter((variant) => !variant.disabled).length >
                  0 && (
                <label>
                  Variação<select
                    value={selectedVariant?.sku}
                    onChange={(event) =>
                      setSelectedVariant(
                        selected.variants.find((variant) =>
                          variant.sku === event.currentTarget.value
                        ),
                      )}
                  >
                    {selected.variants.filter((variant) => !variant.disabled)
                      .map((variant) => (
                        <option value={variant.sku}>
                          {variant.label} — {variant.formattedPrice}
                        </option>
                      ))}
                  </select>
                </label>
              )}
              <strong>
                {selectedVariant?.formattedPrice ?? selected.formattedPrice}
              </strong>
              <button
                class="esv-enquiry-send"
                type="button"
                onClick={() => {
                  addToCart(selected, selectedVariant);
                  setSelected(null);
                  setOverlay("enquiry");
                }}
              >
                Adicionar ao carrinho
              </button>
              <a class="esv-text-link" href={`/produto/${selected.slug}`}>
                Ver página do objeto
              </a>
            </div>
          </article>
        </div>
      )}
    </>
  );
}
