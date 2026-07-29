import ObjectCard from "../../components/esmera/ObjectCard.tsx";
import {
  type EsmeraObject,
  selectedObjects,
} from "../../components/esmera/data.ts";

export interface Props {
  title?: string;
  /** @format textarea */
  text?: string;
  products?: EsmeraObject[];
}

export default function SelectedObjects({
  title = "Objetos de\npresença singular.",
  text =
    "Uma seleção curta de peças concretas, reunidas por matéria, presença e permanência. Cada objeto apresenta status, material e condição de aquisição sem perder o ritmo editorial da maison.",
  products = selectedObjects,
}: Props) {
  return (
    <section
      id="selection"
      class="esv-selected"
      aria-labelledby="esv-selected-title"
    >
      <div class="esv-shell esv-selected-head">
        <h2 id="esv-selected-title">{title}</h2>
        <p>{text}</p>
      </div>

      <div id="objects" class="esv-shell esv-product-shelf" role="list">
        {products.slice(0, 4).map((item) => (
          <ObjectCard item={item} />
        ))}
      </div>
    </section>
  );
}
