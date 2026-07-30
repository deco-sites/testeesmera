import Arrow from "../../components/esmera/Arrow.tsx";
import ObjectCard from "../../components/esmera/ObjectCard.tsx";
import {
  type EsmeraObject,
  selectedObjects,
} from "../../components/esmera/data.ts";

/**
 * Optional CMS override for one of the four curated objects.
 * Technical identifiers and fallback content remain owned by the catalogue,
 * so editors can change only the fields they actually need.
 */
export type SelectedObjectOverride = Partial<EsmeraObject>;

export interface Props {
  eyebrow?: string;
  title?: string;
  /** @format textarea */
  text?: string;
  /**
   * @description Optional overrides for the four curated objects. Leave empty to use the catalogue defaults.
   * @maxItems 4
   */
  products?: SelectedObjectOverride[];
  collectionLabel?: string;
  collectionHref?: string;
}

export default function SelectedObjects({
  eyebrow = "03 — Seleção",
  title = "Objetos de\npresença singular.",
  text =
    "Uma seleção curta de obras disponíveis, reunidas por matéria, presença e permanência.",
  products = [],
  collectionLabel = "Ver coleção",
  collectionHref = "#territory",
}: Props) {
  const curatedProducts = selectedObjects.slice(0, 4).map((fallback, index) => ({
    ...fallback,
    ...(products[index] ?? {}),
  }));

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

      <div id="objects" class="esv-shell esv-product-shelf" role="list">
        {curatedProducts.map((item, index) => (
          <ObjectCard item={item} motionOrder={index} />
        ))}
      </div>

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
