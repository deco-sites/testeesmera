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
}

export default function SelectedObjects({
  eyebrow = "03 — Seleção",
  title = "Objetos de\npresença singular.",
  text =
    "Uma seleção curta de obras disponíveis, reunidas por matéria, presença e permanência.",
  products = [],
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
      style={{ paddingTop: "clamp(64px, 7vw, 136px)" }}
    >
      <div class="esv-shell esv-selected-head">
        <span class="esv-kicker">{eyebrow}</span>
        <h2 id="esv-selected-title">{title}</h2>
        {text && <p>{text}</p>}
      </div>

      <div id="objects" class="esv-shell esv-product-shelf" role="list">
        {curatedProducts.map((item) => (
          <ObjectCard item={item} />
        ))}
      </div>
    </section>
  );
}