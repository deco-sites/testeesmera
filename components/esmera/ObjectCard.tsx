import ProductActions from "../../islands/ProductActions.tsx";
import WishlistButton from "../../islands/WishlistButton.tsx";
import BuyButton from "../../islands/BuyButton.tsx";
import type { EsmeraObject } from "../../lib/payload/types.ts";
import { esmeraObjectToCardViewModel } from "../../lib/esmera/productCard.ts";
import { EsmeraImage } from "./ResponsiveMedia.tsx";

export interface Props {
  item: EsmeraObject;
  motionOrder?: number;
}

export default function ObjectCard({ item, motionOrder = 0 }: Props) {
  const vm = esmeraObjectToCardViewModel(item);

  return (
    <article
      class={`esv-product-card${item.detailImage ? " has-detail" : ""}`}
      role="listitem"
      data-product-id={vm.id}
    >
      <div class="esv-product-media-wrap">
        <figure
          class="esv-product-media"
          style={{ aspectRatio: "3 / 4" }}
          data-motion="media-reveal"
          data-motion-order={String(motionOrder)}
        >
          <EsmeraImage
            class={item.detailImage
              ? "esv-product-image-primary"
              : "esv-product-image-static"}
            src={vm.image ?? ""}
            alt={vm.imageAlt}
            loading="lazy"
            decoding="async"
            width={900}
            height={1200}
            sizes="(max-width: 429px) calc(100vw - 36px), (max-width: 767px) calc(100vw - 44px), (max-width: 1023px) 46vw, 24vw"
          />
          {vm.hoverImage && (
            <EsmeraImage
              class="esv-product-image-detail"
              src={vm.hoverImage}
              alt=""
              loading="lazy"
              decoding="async"
              width={900}
              height={1200}
              sizes="(max-width: 429px) calc(100vw - 36px), (max-width: 767px) calc(100vw - 44px), (max-width: 1023px) 46vw, 24vw"
            />
          )}
        </figure>

        {vm.status && (
          <span
            class="esv-card-status"
            data-unique={vm.status.includes("PEÇA ÚNICA") ? "true" : "false"}
          >
            {vm.status}
          </span>
        )}

        <WishlistButton productId={vm.id} productTitle={vm.title} />

        <ProductActions
          productId={vm.id}
          productTitle={vm.title}
          product={item}
          presentation="media"
        />
      </div>

      <div
        class="esv-product-card-copy"
        data-motion="reveal"
        data-motion-order={String(motionOrder + 2)}
      >
        {vm.eyebrow && <p class="esv-card-eyebrow">{vm.eyebrow}</p>}

        <h3 class="esv-card-title">
          <ProductActions
            productId={vm.id}
            productTitle={vm.title}
            product={item}
            presentation="title"
          />
        </h3>

        {vm.specs && <p class="esv-card-specs">{vm.specs}</p>}

        <hr class="esv-card-divider" aria-hidden="true" />

        {vm.price && (
          <div class="esv-card-pricing">
            <span class="esv-card-price">{vm.price}</span>
            {vm.installment && (
              <p class="esv-card-installment">
                {vm.installment.prefix}
                <strong>{vm.installment.emphasis}</strong>
                {vm.installment.suffix}
              </p>
            )}
          </div>
        )}

        {vm.isPurchasable
          ? (
            <BuyButton
              productId={vm.id}
              productSlug={vm.slug}
              productTitle={vm.title}
              product={item}
            />
          )
          : (
            <ProductActions
              productId={vm.id}
              productTitle={vm.title}
              product={item}
              compact
              emphasized
            />
          )}
      </div>
    </article>
  );
}
