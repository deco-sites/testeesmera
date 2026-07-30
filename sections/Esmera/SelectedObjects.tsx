import ObjectCard from "../../components/esmera/ObjectCard.tsx";
import {
  type EsmeraObject,
  selectedObjects,
} from "../../components/esmera/data.ts";

export interface Props {
  eyebrow?: string;
  title?: string;
  /** @format textarea */
  text?: string;
  products?: EsmeraObject[];
}

export default function SelectedObjects({
  eyebrow = "03 — Seleção",
  title = "Objetos de\npresença singular.",
  text =
    "Uma seleção curta de obras disponíveis, reunidas por matéria, presença e permanência.",
  products = selectedObjects,
}: Props) {
  return (
    <section
      id="selection"
      class="esv-selected"
      aria-labelledby="esv-selected-title"
    >
      <div class="esv-shell esv-selected-head">
        <p class="esv-kicker">{eyebrow}</p>
        <h2 id="esv-selected-title">{title}</h2>
        {text && <p>{text}</p>}
      </div>

      <div id="objects" class="esv-shell esv-product-shelf" role="list">
        {products.slice(0, 4).map((item) => (
          <ObjectCard item={item} />
        ))}
      </div>
    </section>
  );
}
