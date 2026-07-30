import ProductActions from "../../islands/ProductActions.tsx";
import { getAvailabilityMeta } from "./availability.ts";
import type { EsmeraObject } from "./data.ts";

export interface Props {
  item: EsmeraObject;
}

export default function ObjectCard({ item }: Props) {
  const availability = getAvailabilityMeta(item.availability);
  const meta = [availability.compactLabel, item.material]
    .filter(Boolean)
    .join(" · ");

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
          sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1023px) 45vw, 24vw"
        />
        {item.detailImage && (
          <img
            class="esv-product-image-detail"
            src={item.detailImage}
            alt=""
            loading="lazy"
            decoding="async"
            width="960"
            height="1200"
            sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1023px) 45vw, 24vw"
          />
        )}
      </figure>

      <div class="esv-product-card-copy">
        <p class="esv-product-meta-line">{meta}</p>
        <h3>{item.title}</h3>
        {item.subtitle && <p>{item.subtitle}</p>}

        {(item.price || availability.label) && (
          <div class="esv-product-commercial">
            <span class="esv-product-state">{availability.label}</span>
            {item.price && <span class="esv-product-price">{item.price}</span>}
          </div>
        )}

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
