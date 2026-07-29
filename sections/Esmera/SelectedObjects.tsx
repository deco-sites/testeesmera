import {
  type EsmeraObject,
  selectedObjects,
} from "../../components/esmera/data.ts";
import ProductActions from "../../islands/ProductActions.tsx";

export interface Props {
  title?: string;
  /** @format textarea */
  text?: string;
  products?: EsmeraObject[];
}

export default function SelectedObjects({
  title = "Objetos de\npresença singular.",
  text =
    "Peças disponíveis, edições limitadas e objetos sob consulta, reunidos por matéria, raridade e permanência.",
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

      <div class="esv-shell esv-product-shelf" role="list">
        {products.slice(0, 4).map((item) => (
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
