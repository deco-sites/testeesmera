import Image from "apps/website/components/Image.tsx";
import { getAvailabilityMeta } from "../../components/esmera/availability.ts";
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
  eyebrow = "05 — Peça assinatura",
  editorialText =
    "Uma peça recebe tempo editorial para que forma, matéria e construção possam ser percebidas antes da decisão de aquisição.",
  dimensions = "",
}: Props) {
  const availability = getAvailabilityMeta(product.availability);
  const facts = [
    product.material ? { label: "Matéria", value: product.material } : null,
    dimensions ? { label: "Escala", value: dimensions } : null,
    product.edition ? { label: "Edição", value: product.edition } : null,
    { label: "Estado", value: availability.label },
  ].filter((item): item is { label: string; value: string } => Boolean(item));

  return (
    <section
      id="signature"
      class="esv-signature"
      aria-labelledby="esv-signature-title"
    >
      <div class="esv-shell esv-signature-grid">
        <figure class="esv-signature-media">
          <Image
            class="esv-signature-image-primary"
            src={product.image}
            alt={product.alt}
            loading="lazy"
            decoding="async"
            width={1400}
            height={1050}
            sizes="(max-width: 767px) calc(100vw - 36px), (max-width: 1023px) 62vw, 58vw"
          />
          {product.detailImage && (
            <Image
              class="esv-signature-image-detail"
              src={product.detailImage}
              alt=""
              loading="lazy"
              decoding="async"
              width={1400}
              height={1050}
              sizes="(max-width: 767px) calc(100vw - 36px), (max-width: 1023px) 62vw, 58vw"
            />
          )}
        </figure>

        <div class="esv-signature-copy">
          <p class="esv-kicker">{eyebrow}</p>
          <h2 id="esv-signature-title">{product.title}</h2>
          {product.subtitle && <p class="esv-signature-subtitle">{product.subtitle}</p>}
          <p class="esv-signature-text">{editorialText}</p>

          <dl class="esv-signature-facts">
            {facts.slice(0, 4).map((fact) => (
              <div>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>

          {product.price && <div class="esv-signature-value">{product.price}</div>}
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
