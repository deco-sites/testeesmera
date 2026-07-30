import ProductActions from "../../islands/ProductActions.tsx";
import type { EsmeraObject } from "./data.ts";

export interface Props {
  item: EsmeraObject;
}

function statusTone(status: string) {
  const normalized = status.toLocaleLowerCase("pt-BR");
  if (normalized.includes("pronta")) return "ready";
  if (normalized.includes("única")) return "unique";
  if (normalized.includes("encomenda")) return "order";
  return "consult";
}

export default function ObjectCard({ item }: Props) {
  return (
    <article class="esv-product-card" role="listitem">
      <figure class="esv-product-media">
        <img
          class="esv-product-image-primary"
          src={item.image}
          alt={item.alt}
          loading="lazy"
          decoding="async"
          width="960"
          height="1200"
        />
        <img
          class="esv-product-image-detail"
          src={item.detailImage}
          alt=""
          loading="lazy"
          decoding="async"
          width="960"
          height="1200"
        />
      </figure>
      <div class="esv-product-card-copy">
        <div class="esv-product-meta">
          <div class="esv-product-taxonomy">
            <span class="esv-product-category">{item.category}</span>
            <span class="esv-product-material">{item.material}</span>
          </div>
          <span class={`esv-product-status esv-product-status-${statusTone(item.availability)}`}>
            {item.availability}
          </span>
        </div>
        <h3>{item.title}</h3>
        <p>{item.subtitle}</p>
        <strong class="esv-product-price">{item.price}</strong>
        <ProductActions
          productId={item.id}
          productTitle={item.title}
          product={item}
          compact
        />
      </div>
    </article>
  );
}
