import { selectedObjects, type EsmeraObject } from "../../components/esmera/data.ts";
import ProductActions from "../../islands/ProductActions.tsx";

export interface Props {
  product?: EsmeraObject;
  eyebrow?: string;
  /** @format textarea */
  editorialText?: string;
  dimensions?: string;
}

export default function SignatureObject({
  product = selectedObjects[0],
  eyebrow = "Objeto assinatura / peça única",
  editorialText =
    "Uma peça recebe tempo editorial para que forma, matéria e construção possam ser percebidas antes da decisão de aquisição.",
  dimensions = "Dimensões disponíveis na ficha da peça",
}: Props) {
  return (
    <section
      id="signature"
      class="esv-signature"
      aria-labelledby="esv-signature-title"
    >
      <div class="esv-shell esv-signature-grid">
        <figure class="esv-signature-media">
          <img
            class="esv-signature-image-primary"
            src={product.image}
            alt={product.alt}
            loading="lazy"
            decoding="async"
            width="1400"
            height="1750"
          />
          <img
            class="esv-signature-image-detail"
            src={product.detailImage}
            alt=""
            loading="lazy"
            decoding="async"
            width="1400"
            height="1750"
          />
        </figure>

        <div class="esv-signature-copy">
          <p class="esv-kicker">{eyebrow}</p>
          <h2 id="esv-signature-title">{product.title}</h2>
          <p class="esv-signature-subtitle">{product.subtitle}</p>
          <p class="esv-signature-text">{editorialText}</p>

          <dl class="esv-signature-facts">
            <div>
              <dt>Matéria</dt>
              <dd>{product.material}</dd>
            </div>
            <div>
              <dt>Escala</dt>
              <dd>{dimensions}</dd>
            </div>
            <div>
              <dt>Estado</dt>
              <dd>{product.availability}</dd>
            </div>
          </dl>

          <div class="esv-signature-value">{product.price}</div>
          <ProductActions
            productId={product.id}
            productTitle={product.title}
            product={product}
            compact
          />
        </div>
      </div>
    </section>
  );
}
