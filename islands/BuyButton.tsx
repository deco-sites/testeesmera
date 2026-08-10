import type { EsmeraObject } from "../lib/payload/types.ts";

export interface BuyButtonProps {
  productId: string;
  productSlug: string;
  productTitle: string;
  product?: EsmeraObject;
}

/**
 * CTA transacional do card (plano §15/16). Emite `esmera:buy`; o fluxo real de
 * reserva/checkout é conectado no PR5. O botão só é renderizado para peças
 * compráveis (preço fixo + estado disponível), então nunca promete o que o
 * backend não consegue cumprir.
 */
export default function BuyButton(
  { productId, productSlug, productTitle, product }: BuyButtonProps,
) {
  return (
    <button
      type="button"
      class="esv-card-cta"
      aria-label={`Adquirir ${productTitle}`}
      onClick={(event) =>
        globalThis.dispatchEvent(
          new CustomEvent("esmera:buy", {
            detail: {
              productId,
              productSlug,
              product,
              trigger: event.currentTarget,
            },
          }),
        )}
    >
      <span>Adquirir</span>
      <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true">
        <path d="M3.75 9h10.5M10 4.75 14.25 9 10 13.25" />
      </svg>
    </button>
  );
}
