import Arrow from "../components/esmera/Arrow.tsx";
import type { EsmeraObject } from "../components/esmera/data.ts";

export interface Props {
  productId: string;
  productTitle: string;
  product?: EsmeraObject;
  compact?: boolean;
  emphasized?: boolean;
}

export default function ProductActions(
  { productId, productTitle, product, compact = false, emphasized = false }: Props,
) {
  const findSourceImage = (trigger: HTMLElement) => {
    const scope = trigger.closest(".esv-product-card, .esv-signature");
    return scope?.querySelector<HTMLImageElement>(
      ".esv-product-image-primary, .esv-product-image-static, .esv-signature-image-primary",
    ) ?? null;
  };

  const warmDetailImage = () => {
    if (!product?.detailImage || typeof globalThis.Image !== "function") return;
    const image = new globalThis.Image();
    image.decoding = "async";
    image.src = product.detailImage;
  };

  const dispatch = (name: string, trigger: HTMLElement) => {
    const sourceImage = findSourceImage(trigger);
    const cachedSource = sourceImage?.currentSrc || sourceImage?.src;

    // Product cards already display a responsive/optimized image. Reuse that decoded
    // browser resource for the modal instead of requesting the original CMS PNG again.
    // The modal opens immediately; the heavier detail image can continue loading after.
    const eventProduct = name === "esmera:view-object" && product && cachedSource
      ? { ...product, image: cachedSource }
      : product;

    globalThis.dispatchEvent(
      new CustomEvent(name, {
        detail: {
          productId,
          product: eventProduct,
          trigger,
          // Do not gate modal opening behind the View Transition snapshot cycle.
          // The cached source above provides the visual continuity without delaying UI.
          sourceImage: null,
        },
      }),
    );
  };

  const commonWarmup = {
    onPointerEnter: warmDetailImage,
    onFocus: warmDetailImage,
  };

  if (compact) {
    return (
      <div class="esv-product-actions is-compact">
        <button
          type="button"
          aria-label={`Conhecer a peça ${productTitle}`}
          {...commonWarmup}
          onClick={(event) =>
            dispatch("esmera:view-object", event.currentTarget)}
          style={emphasized
            ? {
              width: "100%",
              minHeight: "46px",
              justifyContent: "space-between",
              padding: "0 2px",
              borderTop: "1px solid var(--line)",
              borderBottom: "1px solid rgba(38, 39, 36, .48)",
              fontWeight: 500,
            }
            : undefined}
        >
          Conhecer a peça <Arrow size={14} />
        </button>
      </div>
    );
  }

  return (
    <div class="esv-product-actions">
      <button
        type="button"
        aria-label={`Conhecer a peça ${productTitle}`}
        {...commonWarmup}
        onClick={(event) => dispatch("esmera:view-object", event.currentTarget)}
      >
        Conhecer a peça <Arrow size={13} />
      </button>
      <button
        type="button"
        aria-label={`Adicionar ${productTitle} ao carrinho`}
        onClick={(event) =>
          dispatch("esmera:add-to-enquiry", event.currentTarget)}
      >
        Adicionar ao carrinho
      </button>
    </div>
  );
}
