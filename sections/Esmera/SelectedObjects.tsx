import {
  type EsmeraObject,
  selectedObjects,
} from "../../components/esmera/data.ts";
import ProductActions from "../../islands/ProductActions.tsx";

export interface Props {
  eyebrow?: string;
  title?: string;
  /** @format textarea */
  text?: string;
  products?: EsmeraObject[];
  ctaLabel?: string;
  ctaHref?: string;
}

export default function SelectedObjects({
  eyebrow = "03 — A seleção Esméra",
  title = "Objetos de presença singular.",
  text =
    "Peças disponíveis, edições limitadas e objetos sob consulta, reunidos por matéria, raridade e permanência.",
  products = selectedObjects,
  ctaLabel = "Ver todos os objetos",
  ctaHref = "#objects",
}: Props) {
  return (
    <section
      id="selection"
      class="esv-selected esv-section"
      aria-labelledby="esv-selected-title"
    >
      <div class="esv-shell esv-rule-top esv-shelf-head">
        <p class="esv-kicker">{eyebrow}</p>
        <h2 id="esv-selected-title">{title}</h2>
        <div>
          <p>{text}</p>
          <a href={ctaHref} class="esv-text-link">{ctaLabel}</a>
        </div>
      </div>

      <div class="esv-shell esv-product-shelf" role="list">
        {products.map((item) => (
          <article class="esv-product-card" role="listitem">
            <figure>
              <img
                src={item.image}
                alt={item.alt}
                loading="lazy"
                decoding="async"
                width="960"
                height="1200"
              />
            </figure>
            <div class="esv-product-card-copy">
              <div class="esv-product-meta">
                <small>{item.code} / {item.category}</small>
                <small>{item.availability}</small>
              </div>
              <h3>{item.title}</h3>
              <p>{item.subtitle}</p>
              <strong class="esv-product-price">{item.price}</strong>
              <ProductActions
                productId={item.id}
                productTitle={item.title}
                product={item}
                compact
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
