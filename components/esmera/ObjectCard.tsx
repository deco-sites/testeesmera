import ProductActions from "../../islands/ProductActions.tsx";
import WishlistButton from "../../islands/WishlistButton.tsx";
import BuyButton from "../../islands/BuyButton.tsx";
import type { EsmeraObject } from "../../lib/payload/types.ts";
import type { StorefrontProductV2 } from "../../lib/esmera/storefront.ts";
import {
  esmeraObjectToCardViewModel,
  formatPriceCents,
  toProductCardViewModel,
} from "../../lib/esmera/productCard.ts";
import { EsmeraImage } from "./ResponsiveMedia.tsx";

export interface Props {
  item: StorefrontProductV2 | EsmeraObject;
  motionOrder?: number;
}

function isEsmeraObject(
  item: StorefrontProductV2 | EsmeraObject,
): item is EsmeraObject {
  return typeof item.image === "string";
}

export default function ObjectCard({ item, motionOrder = 0 }: Props) {
  const legacyItem = isEsmeraObject(item);
  const vm = legacyItem
    ? esmeraObjectToCardViewModel(item)
    : toProductCardViewModel(item);

  // Compatibilidade temporária apenas com o modal legado; a apresentação do
  // card usa o contrato Storefront quando disponível e preserva o objeto já
  // resolvido pela Home como fallback se o enriquecimento público falhar.
  const modalProduct: EsmeraObject = legacyItem ? item : {
    id: item.id,
    slug: item.slug,
    code: item.code ?? "",
    title: item.identity?.name ?? item.title,
    image: item.image?.url ?? "",
    alt: item.image?.alt ?? item.title,
    availability: item.availability === "unique"
      ? "unique"
      : item.state ?? "available",
    category: item.pieceType ?? undefined,
    material: item.material ?? undefined,
    subtitle: item.subtitle ?? undefined,
    detailImage: item.hoverImage?.url ?? undefined,
    gallery: [],
    attributes: [],
    priceMode: item.pricing?.mode ?? "inquiry",
    priceCents: item.pricing?.priceCents ?? item.price ?? null,
    formattedPrice: formatPriceCents(
      item.pricing?.priceCents ?? item.price ?? null,
    ) ?? "",
    isInquiry: item.pricing?.mode !== "fixed",
    variants: [],
    seo: { title: "", description: "", noindex: false },
  };

  return (
    <article
      class={`esv-product-card${vm.hoverImage ? " has-detail" : ""}`}
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
            class={vm.hoverImage
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
          product={modalProduct}
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
            product={modalProduct}
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
              product={modalProduct}
            />
          )
          : (
            <ProductActions
              productId={vm.id}
              productTitle={vm.title}
              product={modalProduct}
              compact
              emphasized
            />
          )}
      </div>
    </article>
  );
}
