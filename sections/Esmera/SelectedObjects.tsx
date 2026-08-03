import Arrow from "../../components/esmera/Arrow.tsx";
import ObjectCard from "../../components/esmera/ObjectCard.tsx";
import {
  loadResolvedHome,
  type ResolvedHome,
} from "../../lib/esmera/homeData.ts";
import type { EsmeraObject } from "../../lib/payload/types.ts";

export interface Props {
  eyebrow?: string;
  title?: string;
  /** @format textarea */
  text?: string;
  /** @maxItems 4 */
  products?: EsmeraObject[];
  collectionLabel?: string;
  collectionHref?: string;
}

export const loader = async (props: Props) => ({
  ...props,
  resolvedHome: await loadResolvedHome(),
});

export default function SelectedObjects(
  props: Props & { resolvedHome?: ResolvedHome },
) {
  if (props.resolvedHome?.selectedObjects === null) return null;
  const source = props.resolvedHome?.selectedObjects ?? props;
  const {
    eyebrow = "03 — Seleção",
    title = "Objetos de\npresença singular.",
    text =
      "Uma seleção curta de obras disponíveis, reunidas por matéria, presença e permanência.",
    products = [],
    collectionLabel = "Ver coleção",
    collectionHref = "/colecao",
  } = source;
  const curatedProducts = products.filter((product) =>
    Boolean(product.id && product.slug && product.title && product.image)
  ).slice(0, 4);

  return (
    <section
      id="selection"
      class="esv-selected"
      aria-labelledby="esv-selected-title"
      style={{ paddingTop: "clamp(56px, 6vw, 118px)" }}
    >
      <div class="esv-shell esv-selected-head">
        <span class="esv-kicker" data-motion="reveal" data-motion-order="0">
          {eyebrow}
        </span>
        <h2 id="esv-selected-title" data-motion="reveal" data-motion-order="1">
          {title}
        </h2>
        {text && <p data-motion="reveal" data-motion-order="2">{text}</p>}
      </div>

      {curatedProducts.length > 0
        ? (
          <div id="objects" class="esv-shell esv-product-shelf" role="list">
            {curatedProducts.map((item, index) => (
              <ObjectCard key={item.id} item={item} motionOrder={index} />
            ))}
          </div>
        )
        : (
          <div class="esv-shell esv-section" role="status">
            <p>Objetos temporariamente indisponíveis.</p>
          </div>
        )}

      {collectionLabel && collectionHref && (
        <div
          class="esv-shell esv-selected-collection-link"
          style={{ display: "flex", justifyContent: "flex-end" }}
          data-motion="reveal"
          data-motion-order="1"
        >
          <a class="esv-text-link" href={collectionHref}>
            {collectionLabel} <Arrow size={14} />
          </a>
        </div>
      )}
    </section>
  );
}
