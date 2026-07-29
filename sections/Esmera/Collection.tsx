import ObjectCard from "../../components/esmera/ObjectCard.tsx";
import {
  collectionObjects,
  type EsmeraObject,
} from "../../components/esmera/data.ts";
import Arrow from "../../components/esmera/Arrow.tsx";

export interface Props {
  eyebrow?: string;
  title?: string;
  /** @format textarea */
  text?: string;
  products?: EsmeraObject[];
  ctaLabel?: string;
  ctaHref?: string;
}

export default function Collection({
  eyebrow = "Objetos",
  title = "Objetos raros. Informação precisa.",
  text =
    "Explore peças por matéria e disponibilidade ou fale com a curadoria para uma seleção orientada ao seu contexto.",
  products = collectionObjects,
  ctaLabel = "Falar com a curadoria",
  ctaHref = "mailto:contact@esmera.com?subject=Curadoria%20Esm%C3%A9ra",
}: Props) {
  return (
    <section
      id="catalog"
      class="esv-collection esv-section"
      aria-labelledby="esv-collection-title"
    >
      <div class="esv-shell esv-rule-top esv-shelf-head">
        <p class="esv-kicker">{eyebrow}</p>
        <h2 id="esv-collection-title">{title}</h2>
        <p>{text}</p>
      </div>

      <div class="esv-shell esv-product-shelf" role="list">
        {products.map((item) => <ObjectCard item={item} />)}
      </div>

      <div class="esv-shell esv-collection-end">
        <a class="esv-text-link" href={ctaHref}>
          {ctaLabel} <Arrow size={14} />
        </a>
      </div>
    </section>
  );
}
