import {
  collectionObjects,
  type EsmeraObject,
} from "../../components/esmera/data.ts";
import Arrow from "../../components/esmera/Arrow.tsx";
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

export default function Collection({
  eyebrow = "05 — Objetos",
  title = "Objetos para colecionar. Peças para permanecer.",
  text = "Descubra a coleção completa ou solicite uma curadoria privada.",
  products = collectionObjects,
  ctaLabel = "Descobrir a coleção completa",
  ctaHref = "#contact",
}: Props) {
  return (
    <section
      id="objects"
      class="esv-collection esv-section"
      aria-labelledby="esv-collection-title"
    >
      <div class="esv-shell esv-rule-top esv-shelf-head">
        <p class="esv-kicker">{eyebrow}</p>
        <h2 id="esv-collection-title">{title}</h2>
        <p>{text}</p>
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
                width="1000"
                height="1250"
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

      <div class="esv-shell esv-collection-end">
        <a class="esv-outline-cta" href={ctaHref}>
          {ctaLabel} <Arrow size={14} />
        </a>
      </div>
    </section>
  );
}
