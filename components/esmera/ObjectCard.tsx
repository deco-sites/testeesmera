import ProductActions from "../../islands/ProductActions.tsx";
import type { EsmeraObject } from "./data.ts";

export interface Props {
  item: EsmeraObject;
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
          <small>{item.category} · {item.material}</small>
          <small>{item.availability}</small>
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
