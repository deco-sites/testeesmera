import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import {
  collectionObjects,
  type EsmeraObject,
  selectedObjects,
} from "../components/esmera/data.ts";
import { getAvailabilityMeta } from "../components/esmera/availability.ts";

type Overlay = "menu" | "search" | "enquiry" | null;
type IconName = "menu" | "search" | "close" | "arrow";

type EsmeraEventDetail = {
  productId: string;
  product?: EsmeraObject;
  trigger?: HTMLElement;
  sourceImage?: HTMLElement | null;
};

type ViewTransitionDocument = Document & {
  startViewTransition?: (
    callback: () => void | Promise<void>,
  ) => { finished: Promise<void> };
};

type CartItem = {
  product: EsmeraObject;
  quantity: number;
};

export interface Props {
  logo: string;
  /** @description Label kept for backwards compatibility with existing Deco data. */
  enquiryLabel: string;
}

const navigation = [
  { label: "Seleção", href: "#selection" },
  { label: "Objetos", href: "#objects" },
  { label: "Maison", href: "#about" },
];

const collectionNavigation = [
  "Kit Lavabo",
  "Bandejas",
  "Vasos",
  "Esculturas",
  "Coleções",
  "Presentes",
];

const catalog = [...selectedObjects, ...collectionObjects];
const CART_STORAGE_KEY = "esmera-cart-v1";
const prefersReducedMotion = () =>
  globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

const parseBRL = (price?: string) => {
  if (!price || !price.toLocaleLowerCase("pt-BR").includes("r$")) return null;
  const normalized = price
    .replace(/[^\d.,]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) ? value : null;
};

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths = name === "menu"
    ? <><path d="M3 7h18M3 17h18" /></>
    : name === "search"
    ? <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>
    : name === "close"
    ? <><path d="m5 5 14 14M19 5 5 19" /></>
    : <><path d="M5 19 19 5M8 5h11v11" /></>;

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
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartReady, setCartReady] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [overlayClosing, setOverlayClosing] = useState(false);
  const [modalClosing, setModalClosing] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalCloseRef = useRef<HTMLButtonElement>(null);
  const lastTriggerRef = useRef<HTMLElement | null>(null);
  const overlayTimerRef = useRef<number | null>(null);
  const modalTimerRef = useRef<number | null>(null);

  const searchResults = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-BR");
    if (!normalized) return catalog.slice(0, 4);

    return catalog.filter((item) => {
      const availability = getAvailabilityMeta(item.availability);
      const index = [
        item.title,
        item.subtitle,
        item.category,
        item.material,
        availability.label,
        ...(item.searchTerms ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("pt-BR");

      return index.includes(normalized);
    }).slice(0, 8);
  }, [query]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => {
    const value = parseBRL(item.product.price);
    return value === null ? total : total + value * item.quantity;
  }, 0);
  const hasUnpricedItems = cart.some((item) => parseBRL(item.product.price) === null);
  const cartMessage = [
    "Olá, gostaria de finalizar este carrinho Esméra:",
    "",
    ...cart.map(({ product, quantity }) =>
      `${quantity}x ${product.title}${product.price ? ` — ${product.price}` : ""}`
    ),
    cartSubtotal > 0 ? `\nSubtotal estimado: ${formatBRL(cartSubtotal)}` : "",
    hasUnpricedItems
      ? "Peças sob consulta podem ser confirmadas separadamente."
      : "",
    "\nPodem confirmar disponibilidade e próximos passos?",
  ].filter(Boolean).join("\n");
  const cartWhatsAppHref = `https://wa.me/?text=${encodeURIComponent(cartMessage)}`;

  const clearOverlayTimer = () => {
    if (overlayTimerRef.current === null) return;
    globalThis.clearTimeout(overlayTimerRef.current);
    overlayTimerRef.current = null;
  };

  const clearModalTimer = () => {
    if (modalTimerRef.current === null) return;
    globalThis.clearTimeout(modalTimerRef.current);
    modalTimerRef.current = null;
  };

  const openOverlay = (next: Exclude<Overlay, null>, trigger?: HTMLElement) => {
    clearOverlayTimer();
    if (trigger) lastTriggerRef.current = trigger;
    setOverlayClosing(false);
    setOverlay(next);
  };

  const closeOverlay = (
    afterClose?: () => void,
    returnFocus = true,
  ) => {
    if (!overlay) {
      afterClose?.();
      return;
    }

    clearOverlayTimer();
    const finish = () => {
      setOverlay(null);
      setOverlayClosing(false);
      afterClose?.();
      if (returnFocus) {
        globalThis.setTimeout(() => lastTriggerRef.current?.focus(), 0);
      }
    };

    if (prefersReducedMotion()) {
      finish();
      return;
    }

    setOverlayClosing(true);
    overlayTimerRef.current = globalThis.setTimeout(finish, 260);
  };

  const closeModal = (afterClose?: () => void, returnFocus = true) => {
    if (!selected) {
      afterClose?.();
      return;
    }

    clearModalTimer();
    const finish = () => {
      setSelected(null);
      setModalClosing(false);
      afterClose?.();
      if (returnFocus) {
        globalThis.setTimeout(() => lastTriggerRef.current?.focus(), 0);
      }
    };

    if (prefersReducedMotion()) {
      finish();
      return;
    }

    setModalClosing(true);
    modalTimerRef.current = globalThis.setTimeout(finish, 260);
  };

  const addToCart = (product: EsmeraObject) => {
    setCart((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (!existing) return [...current, { product, quantity: 1 }];
      return current.map((item) =>
        item.product.id === product.id
          ? { product, quantity: item.quantity + 1 }
          : item
      );
    });
  };

  const changeQuantity = (productId: string, delta: number) => {
    setCart((current) => current.flatMap((item) => {
      if (item.product.id !== productId) return [item];
      const quantity = item.quantity + delta;
      return quantity > 0 ? [{ ...item, quantity }] : [];
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart((current) => current.filter((item) => item.product.id !== productId));
  };

  useEffect(() => {
    try {
      const stored = globalThis.localStorage?.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Array<Partial<CartItem>>;
        if (Array.isArray(parsed)) {
          const restored = parsed.filter((item): item is CartItem =>
            Boolean(item?.product?.id) &&
            typeof item.quantity === "number" &&
            item.quantity > 0
          );
          setCart(restored);
        }
      }
    } catch {
      // Storage is a progressive enhancement; cart remains functional in memory.
    } finally {
      setCartReady(true);
    }
  }, []);

  useEffect(() => {
    if (!cartReady) return;
    try {
      globalThis.localStorage?.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore storage quota/privacy errors.
    }
  }, [cart, cartReady]);

  useEffect(() => {
    const hero = document.getElementById("main-content");
    if (!hero || !("IntersectionObserver" in globalThis)) return;

    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0, rootMargin: `-${60}px 0px 0px 0px` },
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const active = Boolean(overlay || selected);
    document.documentElement.classList.toggle("esv-lock", active);
    if (overlay === "search" && !overlayClosing) {
      globalThis.setTimeout(() => searchInputRef.current?.focus(), 40);
    }
    if (selected && !modalClosing) {
      globalThis.setTimeout(() => modalCloseRef.current?.focus(), 40);
    }
    return () => document.documentElement.classList.remove("esv-lock");
  }, [overlay, selected, overlayClosing, modalClosing]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (selected) closeModal();
      else if (overlay) closeOverlay();
    };

    globalThis.addEventListener("keydown", onKeyDown);
    return () => globalThis.removeEventListener("keydown", onKeyDown);
  }, [selected, overlay]);

  useEffect(() => {
    const getDetail = (event: Event) =>
      (event as CustomEvent<EsmeraEventDetail>).detail;

    const getObject = (event: Event) => {
      const { productId, product } = getDetail(event);
      return product ?? catalog.find((item) => item.id === productId);
    };

    const onViewObject = (event: Event) => {
      const item = getObject(event);
      if (!item) return;

      const detail = getDetail(event);
      if (detail.trigger) lastTriggerRef.current = detail.trigger;
      setModalClosing(false);

      const open = () => setSelected(item);
      const sourceImage = detail.sourceImage;
      const transitionDocument = document as ViewTransitionDocument;

      if (
        sourceImage &&
        transitionDocument.startViewTransition &&
        !prefersReducedMotion()
      ) {
        sourceImage.style.setProperty(
          "view-transition-name",
          "esmera-object-image",
        );
        const transition = transitionDocument.startViewTransition(async () => {
          sourceImage.style.removeProperty("view-transition-name");
          open();
          await new Promise<void>((resolve) =>
            requestAnimationFrame(() => resolve())
          );
        });
        transition.finished.catch(() => undefined).finally(() => {
          sourceImage.style.removeProperty("view-transition-name");
        });
        return;
      }

      open();
    };

    const onAddToEnquiry = (event: Event) => {
      const item = getObject(event);
      if (!item) return;
      const detail = getDetail(event);
      if (detail.trigger) lastTriggerRef.current = detail.trigger;
      addToCart(item);
      setOverlayClosing(false);
      setOverlay("enquiry");
    };

    globalThis.addEventListener("esmera:view-object", onViewObject);
    globalThis.addEventListener("esmera:add-to-enquiry", onAddToEnquiry);

    return () => {
      globalThis.removeEventListener("esmera:view-object", onViewObject);
      globalThis.removeEventListener("esmera:add-to-enquiry", onAddToEnquiry);
    };
  }, []);

  useEffect(() => () => {
    clearOverlayTimer();
    clearModalTimer();
  }, []);

  const scrollTo = (href: string) => {
    const id = href.replace(/^#/, "");
    const performScroll = () => {
      document.getElementById(id)?.scrollIntoView({
        block: "start",
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    };

    if (overlay) closeOverlay(performScroll, false);
    else performScroll();
  };

  const addToCartFromModal = (item: EsmeraObject) => {
    addToCart(item);
    closeModal(() => openOverlay("enquiry"), false);
  };

  return (
    <>
      <header class={`esv-header${scrolled ? " is-scrolled" : ""}`}>
        <button
          class="esv-header-menu esv-header-icon"
          type="button"
          aria-label="Abrir menu"
          onClick={(event) => openOverlay("menu", event.currentTarget)}
        >
          <Icon name="menu" />
        </button>

        <nav class="esv-header-nav" aria-label="Navegação principal">
          {navigation.map((link) => (
            <button type="button" onClick={() => scrollTo(link.href)}>
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
            aria-label="Buscar objetos"
            onClick={(event) => openOverlay("search", event.currentTarget)}
          >
            <Icon name="search" />
          </button>
          <button
            class="esv-enquiry-link esv-cart-link"
            type="button"
            aria-label={`${enquiryLabel}, ${cartCount} itens`}
            onClick={(event) => openOverlay("enquiry", event.currentTarget)}
          >
            {enquiryLabel}
            {cartCount > 0 && <sup key={cartCount}>{cartCount}</sup>}
          </button>
        </div>
      </header>

      {overlay && (
        <div
          class={`esv-header-overlay esv-header-overlay-${overlay}${
            overlayClosing ? " is-closing" : ""
          }`}
          role="presentation"
          onClick={() => closeOverlay()}
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
              onClick={() => closeOverlay()}
            >
              <Icon name="close" size={21} />
            </button>

            {overlay === "menu" && (
              <nav class="esv-header-menu-panel esv-menu-v2" aria-label="Navegação">
                <small>Menu</small>
                <div class="esv-menu-collection">
                  <button
                    class="esv-menu-parent"
                    type="button"
                    onClick={() => scrollTo("#objects")}
                  >
                    <span>Coleção</span><sup>01</sup>
                  </button>
                  <div class="esv-menu-subnav" aria-label="Coleção">
                    {collectionNavigation.map((label) => (
                      <button type="button" onClick={() => scrollTo("#objects")}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div class="esv-menu-primary-links">
                  <button type="button" onClick={() => scrollTo("#objects")}>
                    <span>Pronta Entrega</span><sup>02</sup>
                  </button>
                  <button type="button" onClick={() => scrollTo("#objects")}>
                    <span>Sob Encomenda</span><sup>03</sup>
                  </button>
                  <button type="button" onClick={() => scrollTo("#footer")}>
                    <span>Contato</span><sup>04</sup>
                  </button>
                </div>
              </nav>
            )}

            {overlay === "search" && (
              <div class="esv-header-search">
                <p class="esv-kicker">Buscar objetos</p>
                <label class="esv-sr-only" for="esv-search-input">
                  Buscar por nome, tipo, material ou disponibilidade
                </label>
                <input
                  ref={searchInputRef}
                  id="esv-search-input"
                  value={query}
                  onInput={(event) => setQuery(event.currentTarget.value)}
                  placeholder="Nome, material, tipo ou disponibilidade"
                  autocomplete="off"
                />
                <div key={query} class="esv-search-results is-refreshing">
                  {searchResults.map((item) => {
                    const availability = getAvailabilityMeta(item.availability);
                    const meta = [availability.label, item.material]
                      .filter(Boolean)
                      .join(" · ");

                    return (
                      <button
                        type="button"
                        onClick={(event) => {
                          lastTriggerRef.current = event.currentTarget;
                          setOverlay(null);
                          setOverlayClosing(false);
                          setSelected(item);
                        }}
                      >
                        <img
                          src={item.image}
                          alt=""
                          loading="lazy"
                          width="72"
                          height="88"
                        />
                        <span>
                          <small>{meta}</small>
                          <strong>{item.title}</strong>
                        </span>
                      </button>
                    );
                  })}
                  {searchResults.length === 0 && (
                    <div class="esv-search-empty">
                      <p>Nenhum objeto corresponde à busca.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setQuery("");
                          scrollTo("#objects");
                        }}
                      >
                        Ver todos os objetos
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {overlay === "enquiry" && (
              <div class="esv-enquiry-panel esv-cart-panel">
                <p class="esv-kicker">Carrinho</p>
                <h2>Seu carrinho</h2>
                {cart.length === 0
                  ? (
                    <p class="esv-enquiry-empty">
                      Seu carrinho está vazio. Conheça uma peça e adicione-a para continuar.
                    </p>
                  )
                  : (
                    <>
                      <div class="esv-enquiry-list esv-cart-list">
                        {cart.map(({ product, quantity }) => {
                          const availability = getAvailabilityMeta(product.availability);
                          const meta = [availability.label, product.material]
                            .filter(Boolean)
                            .join(" · ");

                          return (
                            <div key={product.id} class="esv-cart-item">
                              <img
                                src={product.image}
                                alt=""
                                loading="lazy"
                                width="74"
                                height="90"
                              />
                              <span>
                                <strong>{product.title}</strong>
                                <small>{meta}</small>
                                {product.price && (
                                  <em class="esv-cart-item-price">{product.price}</em>
                                )}
                              </span>
                              <div class="esv-cart-item-actions">
                                <div class="esv-cart-quantity" aria-label={`Quantidade de ${product.title}`}>
                                  <button
                                    type="button"
                                    aria-label={`Diminuir quantidade de ${product.title}`}
                                    onClick={() => changeQuantity(product.id, -1)}
                                  >
                                    −
                                  </button>
                                  <span>{quantity}</span>
                                  <button
                                    type="button"
                                    aria-label={`Aumentar quantidade de ${product.title}`}
                                    onClick={() => changeQuantity(product.id, 1)}
                                  >
                                    +
                                  </button>
                                </div>
                                <button
                                  class="esv-cart-remove"
                                  type="button"
                                  aria-label={`Remover ${product.title}`}
                                  onClick={() => removeFromCart(product.id)}
                                >
                                  Remover
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div class="esv-cart-summary">
                        {cartSubtotal > 0 && (
                          <div>
                            <span>Subtotal estimado</span>
                            <strong>{formatBRL(cartSubtotal)}</strong>
                          </div>
                        )}
                        {hasUnpricedItems && (
                          <p>Itens sob consulta serão confirmados pela curadoria.</p>
                        )}
                      </div>
                      <a
                        class="esv-enquiry-send esv-cart-checkout"
                        href={cartWhatsAppHref}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Finalizar pelo WhatsApp <Icon name="arrow" size={15} />
                      </a>
                    </>
                  )}
              </div>
            )}
          </aside>
        </div>
      )}

      {selected && (() => {
        const availability = getAvailabilityMeta(selected.availability);
        const details = [
          selected.price ? { label: "Valor", value: selected.price } : null,
          selected.category ? { label: "Categoria", value: selected.category } : null,
          { label: "Disponibilidade", value: availability.label },
        ].filter((item): item is { label: string; value: string } => Boolean(item));

        return (
          <div
            class={`esv-object-modal-backdrop${modalClosing ? " is-closing" : ""}`}
            role="presentation"
            onClick={() => closeModal()}
          >
            <article
              class="esv-object-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="esv-object-modal-title"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                ref={modalCloseRef}
                class="esv-panel-close"
                type="button"
                aria-label="Fechar"
                onClick={() => closeModal()}
              >
                <Icon name="close" size={21} />
              </button>
              <div
                class="esv-object-modal-images"
                style={selected.detailImage ? undefined : "grid-template-columns: 1fr;"}
              >
                <img
                  src={selected.image}
                  alt={selected.alt}
                  width="900"
                  height="1125"
                  style="view-transition-name: esmera-object-image;"
                />
                {selected.detailImage && (
                  <img
                    src={selected.detailImage}
                    alt={`Detalhe de ${selected.title}`}
                    width="900"
                    height="1125"
                  />
                )}
              </div>
              <div class="esv-object-modal-copy">
                <p class="esv-kicker">
                  {[availability.compactLabel, selected.material].filter(Boolean).join(" · ")}
                </p>
                <h2 id="esv-object-modal-title">{selected.title}</h2>
                {selected.subtitle && (
                  <p class="esv-object-modal-subtitle">{selected.subtitle}</p>
                )}
                {selected.description && <p>{selected.description}</p>}
                {details.length > 0 && (
                  <dl>
                    {details.map((detail) => (
                      <div><dt>{detail.label}</dt><dd>{detail.value}</dd></div>
                    ))}
                  </dl>
                )}
                {selected.availability !== "archive" && (
                  <button
                    class="esv-enquiry-send"
                    type="button"
                    onClick={() => addToCartFromModal(selected)}
                  >
                    Adicionar ao carrinho <Icon name="arrow" size={15} />
                  </button>
                )}
              </div>
            </article>
          </div>
        );
      })()}
    </>
  );
}
