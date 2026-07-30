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
  const dispatch = (name: string) => {
    globalThis.dispatchEvent(
      new CustomEvent(name, { detail: { productId, product } }),
    );
  };

  if (compact) {
    return (
      <div class="esv-product-actions is-compact">
        <button
          type="button"
          aria-label={`Conhecer a peça ${productTitle}`}
          onClick={() => dispatch("esmera:view-object")}
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
        onClick={() => dispatch("esmera:view-object")}
      >
        Conhecer a peça <Arrow size={13} />
      </button>
      <button
        type="button"
        aria-label={`Adicionar ${productTitle} à consulta`}
        onClick={() => dispatch("esmera:add-to-enquiry")}
      >
        Adicionar à consulta
      </button>
    </div>
  );
}