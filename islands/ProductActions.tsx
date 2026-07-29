import Arrow from "../components/esmera/Arrow.tsx";
import type { EsmeraObject } from "../components/esmera/data.ts";

export interface Props {
  productId: string;
  productTitle: string;
  product?: EsmeraObject;
  compact?: boolean;
}

export default function ProductActions(
  { productId, productTitle, product, compact = false }: Props,
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
          aria-label={`Ver detalhes de ${productTitle}`}
          onClick={() => dispatch("esmera:view-object")}
        >
          Ver objeto <Arrow size={13} />
        </button>
      </div>
    );
  }

  return (
    <div class="esv-product-actions">
      <button
        type="button"
        aria-label={`Ver detalhes de ${productTitle}`}
        onClick={() => dispatch("esmera:view-object")}
      >
        Ver objeto <Arrow size={13} />
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
