import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { getAvailabilityMeta } from "../components/esmera/availability.ts";
import { buildInstallmentFromPriceCents } from "../lib/esmera/productCard.ts";
import type { EsmeraObject, EsmeraVariant } from "../lib/payload/types.ts";

interface ProductModalImage {
  src: string;
  alt: string;
}

interface ProductFact {
  label: string;
  value: string;
}

interface OpenProductDetail {
  product?: EsmeraObject;
  trigger?: HTMLElement;
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function normalized(value?: string | null): string {
  return value?.trim() ?? "";
}

function formatImagePosition(value: number): string {
  return String(value).padStart(2, "0");
}

export function getProductModalImages(
  product: EsmeraObject,
): ProductModalImage[] {
  const candidates: ProductModalImage[] = [
    { src: normalized(product.image), alt: normalized(product.alt) },
  ];

  if (product.detailImage) {
    candidates.push({
      src: normalized(product.detailImage),
      alt: `${product.title} — detalhe`,
    });
  }

  for (const media of product.gallery) {
    if (media.role === "cover") continue;
    candidates.push({
      src: normalized(media.url),
      alt: normalized(media.alt) || `${product.title} — ${media.role}`,
    });
  }

  const seen = new Set<string>();
  return candidates.filter((image) => {
    if (!image.src || seen.has(image.src)) return false;
    seen.add(image.src);
    return true;
  });
}

export function getProductFacts(product: EsmeraObject): ProductFact[] {
  const candidates: ProductFact[] = [
    { label: "Código", value: normalized(product.code) },
    { label: "Categoria", value: normalized(product.category) },
    { label: "Material", value: normalized(product.material) },
    { label: "Edição", value: normalized(product.edition) },
    ...product.attributes.map((attribute) => ({
      label: normalized(attribute.label),
      value: normalized(attribute.value),
    })),
  ];

  const labels = new Set<string>();
  return candidates.filter((fact) => {
    const key = fact.label.toLocaleLowerCase("pt-BR");
    if (!fact.label || !fact.value || labels.has(key)) return false;
    labels.add(key);
    return true;
  });
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
      <path
        d="M5 5l14 14M19 5 5 19"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-width="1.25"
      />
    </svg>
  );
}

function ArrowIcon({ direction }: { direction: "previous" | "next" }) {
  const path = direction === "previous"
    ? "M19 12H5m6-6-6 6 6 6"
    : "M5 12h14m-6-6 6 6-6 6";
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22">
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.2"
      />
    </svg>
  );
}

export default function ProductModal() {
  const [product, setProduct] = useState<EsmeraObject | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<
    EsmeraVariant | undefined
  >();
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);
  const zoomIndexRef = useRef<number | null>(null);
  const modalRef = useRef<HTMLElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const images = useMemo(
    () => product ? getProductModalImages(product) : [],
    [product],
  );
  const facts = useMemo(
    () => product ? getProductFacts(product) : [],
    [product],
  );
  const availableVariants = useMemo(
    () => product?.variants.filter((variant) => !variant.disabled) ?? [],
    [product],
  );

  const updateZoomIndex = (next: number | null) => {
    zoomIndexRef.current = next;
    setZoomIndex(next);
  };

  const closeModal = () => {
    updateZoomIndex(null);
    setProduct(null);
  };

  useEffect(() => {
    const open = (event: Event) => {
      const detail = (event as CustomEvent<OpenProductDetail>).detail;
      if (!detail?.product) return;
      triggerRef.current = detail.trigger ?? null;
      setActiveIndex(0);
      setProduct(detail.product);
      setSelectedVariant(
        detail.product.variants.find((variant) => !variant.disabled),
      );
      updateZoomIndex(null);
    };

    globalThis.addEventListener("esmera:open-product", open);
    return () => globalThis.removeEventListener("esmera:open-product", open);
  }, []);

  useEffect(() => {
    if (!product || images.length === 0) return;
    const body = document.body;
    const root = document.documentElement;
    const scrollY = globalThis.scrollY || 0;
    const previous = {
      rootOverflow: root.style.overflow,
      rootScrollbarGutter: root.style.getPropertyValue("scrollbar-gutter"),
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };

    root.classList.add("esv-product-modal-active");
    body.classList.add("esv-product-modal-open");
    root.style.overflow = "hidden";
    root.style.setProperty("scrollbar-gutter", "auto");
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";

    return () => {
      root.classList.remove("esv-product-modal-active");
      body.classList.remove("esv-product-modal-open");
      root.style.overflow = previous.rootOverflow;
      if (previous.rootScrollbarGutter) {
        root.style.setProperty(
          "scrollbar-gutter",
          previous.rootScrollbarGutter,
        );
      } else {
        root.style.removeProperty("scrollbar-gutter");
      }
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.left = previous.left;
      body.style.right = previous.right;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      globalThis.scrollTo({ top: scrollY, left: 0, behavior: "auto" });
      globalThis.setTimeout(() => triggerRef.current?.focus(), 0);
    };
  }, [product, images.length]);

  useEffect(() => {
    if (!product || images.length === 0) return;
    const dialog = zoomIndex === null ? modalRef.current : zoomRef.current;
    if (!dialog) return;

    const frame = requestAnimationFrame(() => {
      const focusables = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => element.offsetParent !== null);
      const preferred = dialog.querySelector<HTMLElement>("[data-autofocus]");
      (preferred ?? focusables[0])?.focus();
    });

    return () => cancelAnimationFrame(frame);
  }, [product, zoomIndex, images.length]);

  useEffect(() => {
    if (!product || images.length < 2) return;
    const gallery = galleryRef.current;
    if (!gallery || typeof globalThis.matchMedia !== "function") return;
    if (typeof IntersectionObserver === "undefined") return;

    const mediaQuery = globalThis.matchMedia("(max-width: 767px)");
    let observer: IntersectionObserver | null = null;

    const connect = () => {
      observer?.disconnect();
      observer = null;
      if (!mediaQuery.matches) return;

      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) =>
              entry.isIntersecting && entry.intersectionRatio >= 0.65
            )
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
          if (!(visible?.target instanceof HTMLElement)) return;
          const nextIndex = Number(visible.target.dataset.galleryIndex);
          if (Number.isInteger(nextIndex)) setActiveIndex(nextIndex);
        },
        { root: gallery, threshold: [0.65, 0.85] },
      );

      gallery.querySelectorAll<HTMLElement>("[data-gallery-index]").forEach(
        (element) => observer?.observe(element),
      );
    };

    connect();
    mediaQuery.addEventListener("change", connect);
    return () => {
      observer?.disconnect();
      mediaQuery.removeEventListener("change", connect);
    };
  }, [product, images.length]);

  useEffect(() => {
    if (!product || images.length === 0) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const dialog = zoomIndexRef.current === null
        ? modalRef.current
        : zoomRef.current;
      if (!dialog) return;

      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        if (zoomIndexRef.current !== null) updateZoomIndex(null);
        else closeModal();
        return;
      }

      if (
        zoomIndexRef.current !== null && images.length > 1 &&
        (event.key === "ArrowLeft" || event.key === "ArrowRight")
      ) {
        event.preventDefault();
        const current = zoomIndexRef.current;
        const delta = event.key === "ArrowLeft" ? -1 : 1;
        updateZoomIndex((current + delta + images.length) % images.length);
        return;
      }

      if (event.key !== "Tab") return;
      const items = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => element.offsetParent !== null);
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    globalThis.addEventListener("keydown", onKeyDown);
    return () => globalThis.removeEventListener("keydown", onKeyDown);
  }, [product, images.length]);

  if (!product || images.length === 0) return null;

  const availability = getAvailabilityMeta(product.availability);
  const activePrice = selectedVariant?.formattedPrice ?? product.formattedPrice;
  const activePriceCents = selectedVariant
    ? selectedVariant.priceCents
    : product.priceCents;
  const activeIsInquiry = selectedVariant
    ? selectedVariant.isInquiry
    : product.isInquiry;
  const installment = activeIsInquiry
    ? null
    : buildInstallmentFromPriceCents(activePriceCents);
  const zoomImage = zoomIndex === null ? null : images[zoomIndex];
  const galleryMode = images.length === 1
    ? "is-single"
    : images.length === 2
    ? "is-double"
    : "is-multiple";
  const positionLabel = `${formatImagePosition(activeIndex + 1)} / ${
    formatImagePosition(images.length)
  }`;

  const addToCart = () => {
    const cartProduct = selectedVariant
      ? {
        ...product,
        variants: product.variants.map((variant) => ({
          ...variant,
          disabled: variant.sku !== selectedVariant.sku,
        })),
      }
      : product;

    closeModal();
    globalThis.setTimeout(() => {
      globalThis.dispatchEvent(
        new CustomEvent("esmera:add-to-enquiry", {
          detail: { product: cartProduct },
        }),
      );
    }, 0);
  };

  return (
    <>
      <div
        class="esv-product-modal-backdrop"
        role="presentation"
        onClick={closeModal}
      >
        <article
          ref={modalRef}
          class="esv-product-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="esv-product-modal-title"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            class="esv-product-modal-close"
            type="button"
            aria-label="Fechar detalhes da peça"
            onClick={closeModal}
            data-autofocus="true"
          >
            <CloseIcon />
          </button>

          <div
            ref={galleryRef}
            class={`esv-product-modal-gallery ${galleryMode}`}
          >
            {images.map((image, index) => (
              <button
                key={image.src}
                class={`esv-product-modal-image ${
                  index === activeIndex ? "is-active" : ""
                }`}
                type="button"
                aria-label={`Ampliar imagem ${index + 1} de ${product.title}`}
                data-gallery-index={index}
                onClick={() => updateZoomIndex(index)}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  width="900"
                  height="1125"
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                />
                <span aria-hidden="true">Ampliar</span>
              </button>
            ))}

            {images.length > 2 && (
              <div class="esv-product-modal-gallery-controls">
                <button
                  type="button"
                  aria-label="Imagem anterior da galeria"
                  onClick={() =>
                    setActiveIndex((current) =>
                      (current - 1 + images.length) % images.length
                    )}
                >
                  <ArrowIcon direction="previous" />
                </button>
                <span aria-live="polite">{positionLabel}</span>
                <button
                  type="button"
                  aria-label="Próxima imagem da galeria"
                  onClick={() =>
                    setActiveIndex((current) => (current + 1) % images.length)}
                >
                  <ArrowIcon direction="next" />
                </button>
              </div>
            )}

            {images.length > 1 && (
              <span
                class="esv-product-modal-gallery-mobile-counter"
                aria-hidden="true"
              >
                {positionLabel}
              </span>
            )}
          </div>

          <div class="esv-product-modal-buybox">
            <div class="esv-product-modal-heading">
              <p class="esv-kicker">{availability.label}</p>
              <h2 id="esv-product-modal-title">{product.title}</h2>
              {product.subtitle && (
                <p class="esv-product-modal-subtitle">{product.subtitle}</p>
              )}
              {activePrice && (
                <strong class="esv-product-modal-price">{activePrice}</strong>
              )}
              {installment && (
                <p class="esv-product-modal-installment">
                  {installment.prefix}
                  <strong>{installment.emphasis}</strong>
                  {installment.suffix}
                </p>
              )}
            </div>

            {product.description && (
              <p class="esv-product-modal-description">
                {product.description}
              </p>
            )}

            {facts.length > 0 && (
              <dl class="esv-product-modal-facts">
                {facts.map((fact) => (
                  <div key={fact.label}>
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {availableVariants.length > 0 && (
              <label class="esv-product-modal-variant">
                <span>Variação</span>
                <select
                  value={selectedVariant?.sku}
                  onChange={(event) =>
                    setSelectedVariant(
                      availableVariants.find((variant) =>
                        variant.sku === event.currentTarget.value
                      ),
                    )}
                >
                  {availableVariants.map((variant) => (
                    <option key={variant.sku} value={variant.sku}>
                      {variant.label} — {variant.formattedPrice}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <button
              class="esv-product-modal-add"
              type="button"
              onClick={addToCart}
            >
              <span>Adicionar ao carrinho</span>
              <span aria-hidden="true">↗</span>
            </button>
          </div>
        </article>
      </div>

      {zoomImage && zoomIndex !== null && (
        <div
          class="esv-product-zoom"
          role="presentation"
          onClick={() => updateZoomIndex(null)}
        >
          <section
            ref={zoomRef}
            class="esv-product-zoom-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={`Imagem ampliada de ${product.title}`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              class="esv-product-zoom-close"
              type="button"
              aria-label="Fechar imagem ampliada"
              onClick={() => updateZoomIndex(null)}
              data-autofocus="true"
            >
              <CloseIcon />
            </button>

            <figure class="esv-product-zoom-stage">
              <img src={zoomImage.src} alt={zoomImage.alt} />
            </figure>

            {images.length > 1 && (
              <div class="esv-product-zoom-controls">
                <button
                  type="button"
                  aria-label="Imagem anterior"
                  onClick={() =>
                    updateZoomIndex(
                      (zoomIndex - 1 + images.length) % images.length,
                    )}
                >
                  <ArrowIcon direction="previous" />
                </button>
                <span>{zoomIndex + 1} / {images.length}</span>
                <button
                  type="button"
                  aria-label="Próxima imagem"
                  onClick={() =>
                    updateZoomIndex((zoomIndex + 1) % images.length)}
                >
                  <ArrowIcon direction="next" />
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
