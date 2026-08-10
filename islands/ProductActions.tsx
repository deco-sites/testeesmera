import Arrow from "../components/esmera/Arrow.tsx";
import type { EsmeraObject } from "../lib/payload/types.ts";

export interface Props {
  productId: string;
  productTitle: string;
  product?: EsmeraObject;
  compact?: boolean;
  emphasized?: boolean;
  presentation?: "actions" | "media" | "title";
}

export default function ProductActions(
  {
    productId,
    productTitle,
    product,
    compact = false,
    emphasized = false,
    presentation = "actions",
  }: Props,
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

    const eventProduct =
      name === "esmera:open-product" && product && cachedSource
        ? { ...product, image: cachedSource }
        : product;

    globalThis.dispatchEvent(
      new CustomEvent(name, {
        detail: {
          productId,
          product: eventProduct,
          trigger,
        },
      }),
    );
  };

  const commonWarmup = {
    onPointerEnter: warmDetailImage,
    onFocus: warmDetailImage,
  };

  if (presentation === "media") {
    return (
      <button
        class="esv-product-modal-trigger esv-product-modal-trigger-media"
        type="button"
        aria-label={`Conhecer a peça ${productTitle}`}
        {...commonWarmup}
        onClick={(event) =>
          dispatch("esmera:open-product", event.currentTarget)}
      />
    );
  }

  if (presentation === "title") {
    return (
      <button
        class="esv-product-modal-trigger esv-product-modal-trigger-title"
        type="button"
        aria-label={`Conhecer a peça ${productTitle}`}
        {...commonWarmup}
        onClick={(event) =>
          dispatch("esmera:open-product", event.currentTarget)}
      >
        {productTitle}
      </button>
    );
  }

  if (compact) {
    return (
      <div
        class={`esv-product-actions is-compact${
          emphasized ? " is-emphasized" : ""
        }`}
      >
        <button
          type="button"
          aria-label={`Conhecer a peça ${productTitle}`}
          {...commonWarmup}
          onClick={(event) =>
            dispatch("esmera:open-product", event.currentTarget)}
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
        onClick={(event) =>
          dispatch("esmera:open-product", event.currentTarget)}
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
