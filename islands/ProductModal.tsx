import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import Icon from "../components/ui/Icon.tsx";
import ProductMediaViewer from "../components/esmera/ProductMediaViewer.tsx";
import { getAvailabilityMeta } from "../components/esmera/availability.ts";
import {
  buildGalleryPlates,
  cellSizes,
  type GalleryPlate,
  mediaIndexForKeys,
  orderGalleryMedia,
  plateIndexOfMedia,
  plateLabel,
} from "../lib/esmera/gallery.ts";
import { buildInstallmentFromPriceCents } from "../lib/esmera/productCard.ts";
import type { EsmeraObject, EsmeraVariant } from "../lib/payload/types.ts";
import WishlistButton from "./WishlistButton.tsx";

interface ProductModalImage {
  src: string;
  fullSrc?: string;
  alt: string;
  key?: string;
  role?: string;
  width?: number;
  height?: number;
  fullWidth?: number;
  fullHeight?: number;
}

interface ProductFact {
  label: string;
  value: string;
}

interface OpenProductDetail {
  product?: EsmeraObject;
  trigger?: HTMLElement;
}

type ModalPhase = "unmounted" | "opening" | "open" | "closing";
type RecommendationState = "idle" | "loading" | "ready" | "hidden";

const MODAL_TRANSITION_TIMEOUT_MS = 300;

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

function toModalImage(
  media: EsmeraObject["gallery"][number],
  product: EsmeraObject,
): ProductModalImage {
  const src = normalized(media.url);
  return {
    src,
    fullSrc: normalized(media.fullUrl) || src,
    alt: normalized(media.alt) || `${product.title} — ${media.role}`,
    key: media.key,
    role: media.role,
    width: media.width,
    height: media.height,
    fullWidth: media.fullWidth,
    fullHeight: media.fullHeight,
  };
}

export function getProductModalImages(
  product: EsmeraObject,
): ProductModalImage[] {
  const ordered = orderGalleryMedia(product.gallery);
  const candidates = ordered.map((media) => toModalImage(media, product));

  if (candidates.length === 0) {
    const primarySrc = normalized(product.image);
    candidates.push({
      src: primarySrc,
      fullSrc: primarySrc,
      alt: normalized(product.alt),
      role: "cover",
    });
    if (product.detailImage) {
      const detailSrc = normalized(product.detailImage);
      candidates.push({
        src: detailSrc,
        fullSrc: detailSrc,
        alt: `${product.title} — detalhe`,
        role: "detail",
      });
    }
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

function modalImageSrcSet(image: ProductModalImage): string | undefined {
  const candidates = [
    image.width && `${image.src} ${image.width}w`,
    image.fullWidth && image.fullSrc && image.fullSrc !== image.src &&
    `${image.fullSrc} ${image.fullWidth}w`,
  ].filter((candidate): candidate is string => Boolean(candidate));
  return candidates.length > 1 ? candidates.join(", ") : undefined;
}

const DIACRITICS_PATTERN = new RegExp("[\\u0300-\\u036f]", "g");

function normalizeFactLabel(label: string): string {
  return label
    .normalize("NFD")
    .replace(DIACRITICS_PATTERN, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

/**
 * Builds a product-specific WhatsApp deep link from the number already
 * rendered in the footer's sticky CTA, instead of duplicating that number
 * here. Returns null when the footer hasn't mounted its WhatsApp link (no
 * channel configured in the CMS), which hides the modal's "Fale conosco".
 */
function buildWhatsAppHref(product: EsmeraObject): string | null {
  if (typeof document === "undefined") return null;
  const sticky = document.querySelector<HTMLAnchorElement>(
    ".esv-whatsapp-sticky",
  );
  const base = sticky?.getAttribute("href")?.split("?")[0];
  if (!base) return null;
  const message = `Olá! Gostaria de saber mais sobre a peça "${product.title}"${
    product.code ? ` — código ${product.code}` : ""
  }.`;
  return `${base}?text=${encodeURIComponent(message)}`;
}

interface GalleryFrameProps {
  view: "desktop" | "compact";
  plates: GalleryPlate[];
  activeIndex: number;
  images: ProductModalImage[];
  galleryRef: { current: HTMLDivElement | null };
  onActiveIndexChange: (index: number) => void;
  onOpenViewer: (index: number, trigger: HTMLElement) => void;
}

function GalleryFrame({
  view,
  plates,
  activeIndex,
  images,
  galleryRef,
  onActiveIndexChange,
  onOpenViewer,
}: GalleryFrameProps) {
  const positionLabel = plateLabel(activeIndex, plates.length);
  const changeSlide = (delta: number) => {
    onActiveIndexChange(
      (activeIndex + delta + plates.length) % plates.length,
    );
  };
  const preloadPlate = (index: number) => {
    if (plates.length === 0 || typeof Image === "undefined") return;
    const normalizedIndex = (index + plates.length) % plates.length;
    const plate = plates[normalizedIndex];
    plate.indices.forEach((imageIndex) => {
      const image = images[imageIndex];
      if (!image?.src) return;
      const preload = new Image();
      const srcSet = modalImageSrcSet(image);
      if (srcSet) preload.srcset = srcSet;
      preload.sizes = cellSizes(plate);
      preload.src = image.src;
    });
  };
  const onGalleryKeyDown = (event: KeyboardEvent) => {
    if (plates.length < 2) return;
    let nextIndex: number | null = null;
    if (event.key === "ArrowLeft") {
      nextIndex = (activeIndex - 1 + plates.length) % plates.length;
    } else if (event.key === "ArrowRight") {
      nextIndex = (activeIndex + 1) % plates.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = plates.length - 1;
    }
    if (nextIndex === null) return;
    event.preventDefault();
    onActiveIndexChange(nextIndex);
  };

  return (
    <div
      class={`esv-product-modal-gallery-frame is-${view}`}
      onKeyDown={onGalleryKeyDown}
    >
      <div ref={galleryRef} class="esv-product-modal-gallery">
        {plates.map((plate, plateIndex) => {
          return (
            <div
              class={`esv-product-modal-slide ${
                plate.mount === "mounted"
                  ? "is-mounted"
                  : plate.columns === 2
                  ? "is-pair"
                  : "is-single"
              }${plateIndex === activeIndex ? " is-active" : ""}`}
              data-gallery-index={plateIndex}
              key={`${plate.mount}-${plate.indices.join("-")}`}
            >
              {plate.indices.map((imageIndex) => {
                const image = images[imageIndex];
                return (
                  <button
                    key={image.src}
                    class="esv-product-modal-image"
                    type="button"
                    aria-label={`Ampliar imagem ${
                      imageIndex + 1
                    } de ${images.length}`}
                    onClick={(event) =>
                      onOpenViewer(imageIndex, event.currentTarget)}
                  >
                    <img
                      src={image.src}
                      srcSet={modalImageSrcSet(image)}
                      sizes={cellSizes(plate)}
                      alt={image.alt}
                      width={image.width ?? image.fullWidth}
                      height={image.height ?? image.fullHeight}
                      loading={plateIndex === 0 ? "eager" : "lazy"}
                      {...{
                        fetchPriority: plateIndex === 0 ? "high" : "auto",
                      }}
                      decoding="async"
                    />
                    <span aria-hidden="true">Ampliar</span>
                  </button>
                );
              })}
            </div>
          );
        })}

        {plates.length > 1 && (
          <div class="esv-product-modal-gallery-controls">
            <button
              type="button"
              aria-label="Slide anterior da galeria"
              onPointerEnter={() => preloadPlate(activeIndex - 1)}
              onClick={() => changeSlide(-1)}
            >
              <ArrowIcon direction="previous" />
            </button>
            <span aria-live="polite">{positionLabel}</span>
            <button
              type="button"
              aria-label="Próximo slide da galeria"
              onPointerEnter={() => preloadPlate(activeIndex + 1)}
              onClick={() => changeSlide(1)}
            >
              <ArrowIcon direction="next" />
            </button>
          </div>
        )}
      </div>

      {plates.length > 1 && (
        <span
          class="esv-product-modal-gallery-mobile-counter"
          aria-hidden="true"
        >
          {positionLabel}
        </span>
      )}
    </div>
  );
}

interface GalleryThumbnailsProps {
  images: ProductModalImage[];
  plates: GalleryPlate[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

function GalleryThumbnails(
  { images, plates, activeIndex, onSelect }: GalleryThumbnailsProps,
) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const active = trackRef.current?.querySelector<HTMLElement>(
      '[aria-selected="true"]',
    );
    active?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }, [activeIndex]);

  if (images.length < 2) return null;

  return (
    <div
      ref={trackRef}
      class="esv-product-modal-thumbs"
      role="listbox"
      aria-label="Miniaturas da galeria"
    >
      {images.map((image, imageIndex) => {
        const plateIndex = plateIndexOfMedia(plates, imageIndex);
        const isActive = plateIndex === activeIndex;
        return (
          <button
            key={image.src}
            type="button"
            class={`esv-product-modal-thumb${isActive ? " is-active" : ""}`}
            role="option"
            aria-selected={isActive}
            aria-label={`Ver imagem ${imageIndex + 1} de ${images.length}`}
            onClick={() => plateIndex >= 0 && onSelect(plateIndex)}
          >
            <img
              src={image.src}
              alt=""
              width={image.width}
              height={image.height}
              loading="lazy"
              decoding="async"
            />
          </button>
        );
      })}
    </div>
  );
}

function UniqueNote() {
  return (
    <div class="esv-product-modal-unique">
      <span class="esv-product-modal-unique-icon" aria-hidden="true">✧</span>
      <div>
        <strong>Peça única</strong>
        <p>
          Cada peça possui veios e tonalidades próprias — não há duas exatamente
          iguais.
        </p>
      </div>
    </div>
  );
}

function TrustBar() {
  return (
    <div class="esv-product-modal-trust">
      <div class="esv-product-modal-trust-item">
        <span aria-hidden="true">◇</span>
        <div>
          <strong>Compra segura</strong>
          <small>Ambiente 100% protegido</small>
        </div>
      </div>
      <div class="esv-product-modal-trust-item">
        <span aria-hidden="true">▢</span>
        <div>
          <strong>Embalagem premium</strong>
          <small>Proteção total da peça</small>
        </div>
      </div>
      <div class="esv-product-modal-trust-item">
        <span aria-hidden="true">↺</span>
        <div>
          <strong>Troca facilitada</strong>
          <small>Até 7 dias após o recebimento</small>
        </div>
      </div>
    </div>
  );
}

export default function ProductModal() {
  const [product, setProduct] = useState<EsmeraObject | null>(null);
  const [phase, setPhase] = useState<ModalPhase>("unmounted");
  const [recommendations, setRecommendations] = useState<EsmeraObject[]>([]);
  const [recommendationState, setRecommendationState] = useState<
    RecommendationState
  >("idle");
  const [selectedVariant, setSelectedVariant] = useState<
    EsmeraVariant | undefined
  >();
  const [activeDesktopIndex, setActiveDesktopIndex] = useState(0);
  const [activeCompactIndex, setActiveCompactIndex] = useState(0);
  const [dimensionsOpen, setDimensionsOpen] = useState(false);
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);
  const zoomIndexRef = useRef<number | null>(null);
  const modalRef = useRef<HTMLElement>(null);
  const desktopGalleryRef = useRef<HTMLDivElement>(null);
  const compactGalleryRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const viewerTriggerRef = useRef<HTMLElement | null>(null);
  const phaseRef = useRef<ModalPhase>("unmounted");
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const afterCloseRef = useRef<(() => void) | null>(null);

  const updatePhase = (next: ModalPhase) => {
    phaseRef.current = next;
    setPhase(next);
  };

  const images = useMemo(
    () => product ? getProductModalImages(product) : [],
    [product],
  );
  const desktopPlates = useMemo(
    () => buildGalleryPlates(images, "editorial"),
    [images],
  );
  const compactPlates = useMemo(
    () => buildGalleryPlates(images, "compact"),
    [images],
  );
  const facts = useMemo(
    () => product ? getProductFacts(product) : [],
    [product],
  );
  const availableVariants = useMemo(
    () => product?.variants.filter((variant) => !variant.disabled) ?? [],
    [product],
  );
  const whatsappHref = useMemo(
    () => product ? buildWhatsAppHref(product) : null,
    [product],
  );

  const updateZoomIndex = (next: number | null) => {
    zoomIndexRef.current = next;
    setZoomIndex(next);
  };

  const openViewer = (index: number, trigger: HTMLElement) => {
    viewerTriggerRef.current = trigger;
    updateZoomIndex(index);
  };

  const closeViewer = () => {
    updateZoomIndex(null);
    globalThis.setTimeout(() => viewerTriggerRef.current?.focus(), 0);
  };

  const chooseVariant = (next: EsmeraVariant | undefined) => {
    setSelectedVariant(next);
    if (!next || next.mediaKeys.length === 0) return;
    const mediaIndex = mediaIndexForKeys(images, next.mediaKeys);
    if (mediaIndex < 0) return;

    const desktopIndex = plateIndexOfMedia(desktopPlates, mediaIndex);
    if (desktopIndex >= 0) setActiveDesktopIndex(desktopIndex);

    const compactIndex = plateIndexOfMedia(compactPlates, mediaIndex);
    if (compactIndex < 0) return;
    setActiveCompactIndex(compactIndex);

    if (
      typeof globalThis.matchMedia === "function" &&
      globalThis.matchMedia("(max-width: 767px)").matches
    ) {
      requestAnimationFrame(() => {
        const gallery = compactGalleryRef.current;
        if (!gallery) return;
        gallery.scrollTo({
          left: compactIndex * gallery.clientWidth,
          behavior: "smooth",
        });
      });
    }
  };

  const finalizeClose = () => {
    if (phaseRef.current !== "closing") return;
    if (closeTimerRef.current !== null) {
      globalThis.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    updateZoomIndex(null);
    updatePhase("unmounted");
    setProduct(null);
    setRecommendations([]);
    setRecommendationState("idle");
    const afterClose = afterCloseRef.current;
    afterCloseRef.current = null;
    if (afterClose) globalThis.setTimeout(afterClose, 0);
  };

  const closeModal = (afterClose?: () => void) => {
    if (
      phaseRef.current === "closing" ||
      phaseRef.current === "unmounted"
    ) return;
    updateZoomIndex(null);
    afterCloseRef.current = afterClose ?? null;
    updatePhase("closing");
    closeTimerRef.current = globalThis.setTimeout(
      finalizeClose,
      MODAL_TRANSITION_TIMEOUT_MS,
    );
  };

  const selectProduct = (next: EsmeraObject) => {
    setActiveDesktopIndex(0);
    setActiveCompactIndex(0);
    setDimensionsOpen(false);
    setProduct(next);
    setSelectedVariant(
      next.variants.find((variant) => !variant.disabled),
    );
    setRecommendations([]);
    setRecommendationState("loading");
    updateZoomIndex(null);
    requestAnimationFrame(() => {
      modalRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
      desktopGalleryRef.current?.scrollTo({ left: 0, behavior: "auto" });
      compactGalleryRef.current?.scrollTo({ left: 0, behavior: "auto" });
    });
  };

  useEffect(() => {
    const open = (event: Event) => {
      const detail = (event as CustomEvent<OpenProductDetail>).detail;
      if (!detail?.product) return;
      if (closeTimerRef.current !== null) {
        globalThis.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      afterCloseRef.current = null;
      triggerRef.current = detail.trigger ?? null;
      viewerTriggerRef.current = null;
      selectProduct(detail.product);
      updatePhase("opening");
    };

    globalThis.addEventListener("esmera:open-product", open);
    return () => globalThis.removeEventListener("esmera:open-product", open);
  }, []);

  useEffect(() => {
    if (phase !== "opening") return;
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => updatePhase("open"));
    });
    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [phase]);

  const isMounted = phase !== "unmounted";

  useEffect(() => {
    if (!isMounted) return;
    const body = document.body;
    const root = document.documentElement;
    const scrollY = globalThis.scrollY || 0;
    const previous = {
      rootOverflow: root.style.overflow,
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
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.left = previous.left;
      body.style.right = previous.right;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      globalThis.scrollTo({ top: scrollY, left: 0, behavior: "auto" });
      globalThis.setTimeout(() => triggerRef.current?.focus(), 0);
    };
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    const dialog = modalRef.current;
    if (!dialog) return;

    const frame = requestAnimationFrame(() => {
      const focusables = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => element.offsetParent !== null);
      const preferred = dialog.querySelector<HTMLElement>("[data-autofocus]");
      (preferred ?? focusables[0])?.focus();
    });

    return () => cancelAnimationFrame(frame);
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted || !product) return;
    const controller = new AbortController();
    setRecommendations([]);
    setRecommendationState("loading");
    const params = new URLSearchParams({ productId: product.id });
    if (product.category) params.set("category", product.category);

    fetch(`/api/esmera-recommendations?${params}`, {
      signal: controller.signal,
      headers: { accept: "application/json" },
    })
      .then((response) => {
        if (!response.ok) throw new Error("recommendations failed");
        return response.json() as Promise<{ items?: EsmeraObject[] }>;
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        const items = Array.isArray(data.items)
          ? data.items.filter((item) => item.id !== product.id).slice(0, 4)
          : [];
        setRecommendations(items);
        setRecommendationState(items.length > 0 ? "ready" : "hidden");
      })
      .catch(() => {
        if (!controller.signal.aborted) setRecommendationState("hidden");
      });

    return () => controller.abort();
  }, [isMounted, product?.id, product?.category]);

  useEffect(() => {
    if (!product || images.length < 2) return;
    const gallery = compactGalleryRef.current;
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
          if (Number.isInteger(nextIndex)) setActiveCompactIndex(nextIndex);
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
      if (zoomIndexRef.current !== null) return;
      const dialog = modalRef.current;
      if (!dialog) return;

      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        closeModal();
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

  if (!isMounted || !product || images.length === 0) return null;

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
  const dimensionsFact = facts.find((fact) =>
    normalizeFactLabel(fact.label) === "dimensoes"
  );
  const otherFacts = dimensionsFact
    ? facts.filter((fact) => fact !== dimensionsFact)
    : facts;
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

    closeModal(() => {
      globalThis.dispatchEvent(
        new CustomEvent("esmera:add-to-enquiry", {
          detail: { product: cartProduct },
        }),
      );
    });
  };

  return (
    <>
      <div
        class="esv-product-modal-backdrop"
        data-phase={phase}
        role="presentation"
        onClick={() => closeModal()}
      >
        <article
          ref={modalRef}
          class="esv-product-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="esv-product-modal-title"
          onClick={(event) => event.stopPropagation()}
          onTransitionEnd={(event) => {
            if (
              event.target === event.currentTarget &&
              event.propertyName === "opacity"
            ) finalizeClose();
          }}
        >
          <button
            class="esv-product-modal-close"
            type="button"
            aria-label="Fechar detalhes da peça"
            onClick={() => closeModal()}
            data-autofocus="true"
          >
            <CloseIcon />
          </button>

          <div class="esv-product-modal-gallery-pane is-desktop">
            <GalleryFrame
              view="desktop"
              plates={desktopPlates}
              activeIndex={activeDesktopIndex}
              images={images}
              galleryRef={desktopGalleryRef}
              onActiveIndexChange={setActiveDesktopIndex}
              onOpenViewer={openViewer}
            />
            <GalleryThumbnails
              images={images}
              plates={desktopPlates}
              activeIndex={activeDesktopIndex}
              onSelect={setActiveDesktopIndex}
            />
            {product.availability === "unique" && <UniqueNote />}
            <TrustBar />
          </div>
          <div class="esv-product-modal-gallery-pane is-compact">
            <GalleryFrame
              view="compact"
              plates={compactPlates}
              activeIndex={activeCompactIndex}
              images={images}
              galleryRef={compactGalleryRef}
              onActiveIndexChange={setActiveCompactIndex}
              onOpenViewer={openViewer}
            />
            <GalleryThumbnails
              images={images}
              plates={compactPlates}
              activeIndex={activeCompactIndex}
              onSelect={setActiveCompactIndex}
            />
          </div>

          <div class="esv-product-modal-buybox">
            <div class="esv-product-modal-buybox-scroll">
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
                  {otherFacts.map((fact) => (
                    <div key={fact.label}>
                      <dt>{fact.label}</dt>
                      <dd>{fact.value}</dd>
                    </div>
                  ))}
                  {dimensionsFact && (
                    <div class="esv-product-modal-facts-row">
                      <dt>{dimensionsFact.label}</dt>
                      <dd>
                        <button
                          type="button"
                          class="esv-product-modal-facts-toggle"
                          aria-expanded={dimensionsOpen}
                          onClick={() => setDimensionsOpen((open) => !open)}
                        >
                          Ver detalhes
                          <span aria-hidden="true">⌄</span>
                        </button>
                      </dd>
                    </div>
                  )}
                </dl>
              )}

              {dimensionsFact && dimensionsOpen && (
                <div class="esv-product-modal-facts-details">
                  <p>{dimensionsFact.value}</p>
                </div>
              )}

              {availableVariants.length > 0 && (
                <label class="esv-product-modal-variant">
                  <span>Variação</span>
                  <select
                    value={selectedVariant?.sku}
                    onChange={(event) =>
                      chooseVariant(
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

              {(recommendationState === "loading" ||
                recommendationState === "ready") && (
                <section
                  class="esv-product-modal-recommendations"
                  aria-busy={recommendationState === "loading"}
                >
                  <h3>VOCÊ TAMBÉM VAI GOSTAR</h3>
                  <div class="esv-product-modal-related-grid">
                    {recommendationState === "loading"
                      ? Array.from({ length: 4 }, (_, index) => (
                        <div
                          class="esv-product-modal-related-skeleton"
                          aria-hidden="true"
                          key={index}
                        >
                          <span />
                          <i />
                          <i />
                        </div>
                      ))
                      : recommendations.map((item) => (
                        <button
                          class="esv-product-modal-related-card"
                          type="button"
                          key={item.id}
                          onClick={() => selectProduct(item)}
                        >
                          <span class="esv-product-modal-related-media">
                            <img
                              src={item.image}
                              alt={item.alt}
                              width="360"
                              height="450"
                              loading="lazy"
                              decoding="async"
                            />
                          </span>
                          <strong>{item.title}</strong>
                          <small>{item.formattedPrice}</small>
                        </button>
                      ))}
                  </div>
                </section>
              )}
            </div>

            <div class="esv-product-modal-buybox-footer">
              <button
                class="esv-product-modal-add"
                type="button"
                onClick={addToCart}
              >
                <span>Adicionar ao carrinho</span>
                <span aria-hidden="true">↗</span>
              </button>

              <div class="esv-product-modal-secondary-actions">
                <div class="esv-product-modal-save">
                  <WishlistButton
                    productId={product.id}
                    productTitle={product.title}
                  />
                  <span aria-hidden="true">Salvar</span>
                </div>
                {whatsappHref && (
                  <a
                    class="esv-product-modal-contact"
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon id="WhatsApp" size={16} aria-hidden="true" />
                    <span>Fale conosco</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </article>
      </div>

      {zoomIndex !== null && images[zoomIndex] && (
        <ProductMediaViewer
          images={images}
          index={zoomIndex}
          title={product.title}
          onIndexChange={updateZoomIndex}
          onClose={closeViewer}
        />
      )}
    </>
  );
}
