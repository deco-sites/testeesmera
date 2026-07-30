import ProductActions from "../../islands/ProductActions.tsx";
import { getAvailabilityMeta } from "./availability.ts";
import type { EsmeraObject } from "./data.ts";
import { EsmeraImage } from "./ResponsiveMedia.tsx";

export interface Props {
  item: EsmeraObject;
  motionOrder?: number;
}

export default function ObjectCard({ item, motionOrder = 0 }: Props) {
  const availability = getAvailabilityMeta(item.availability);
  const meta = [availability.compactLabel, item.material]
    .filter(Boolean)
    .join(" · ");

  return (
    <article
      class={`esv-product-card${item.detailImage ? " has-detail" : ""}`}
      role="listitem"
      data-product-id={item.id}
    >
      <figure
        class="esv-product-media"
        data-motion="media-reveal"
        data-motion-order={String(motionOrder)}
      >
        <EsmeraImage
          class={item.detailImage
            ? "esv-product-image-primary"
            : "esv-product-image-static"}
          src={item.image}
          alt={item.alt}
          loading="lazy"
          decoding="async"
          width={960}
          height={1200}
          sizes="(max-width: 429px) calc(100vw - 36px), (max-width: 767px) calc(100vw - 44px), (max-width: 1023px) 46vw, 24vw"
        />
        {item.detailImage && (
          <EsmeraImage
            class="esv-product-image-detail"
            src={item.detailImage}
            alt=""
            loading="lazy"
            decoding="async"
            width={960}
            height={1200}
            sizes="(max-width: 429px) calc(100vw - 36px), (max-width: 767px) calc(100vw - 44px), (max-width: 1023px) 46vw, 24vw"
          />
        )}
      </figure>

      <div
        class="esv-product-card-copy"
        data-motion="reveal"
        data-motion-order={String(motionOrder + 2)}
      >
        <p class="esv-product-meta-line" style={{ minHeight: "2.7em" }}>{meta}</p>
        <h3>{item.title}</h3>
        {item.subtitle && (
          <p class="esv-product-subtitle" style={{ marginBottom: "6px" }}>
            {item.subtitle}
          </p>
        )}

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
          emphasized
        />
      </div>
    </article>
  );
}
