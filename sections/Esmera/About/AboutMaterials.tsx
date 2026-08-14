import { ImageWidget } from "apps/admin/widgets.ts";
import { EsmeraImage } from "../../../components/esmera/ResponsiveMedia.tsx";

export type PrincipleIcon = "stone" | "handmade" | "care" | "unique";

export interface Principle {
  /** @description Título do princípio, ex.: "Pedras naturais" */
  title?: string;
  /** @description Descrição breve do princípio */
  text?: string;
  /** @description Ícone linear associado */
  icon?: PrincipleIcon;
}

export interface Props {
  /** @description Rótulo curto, ex.: "MATERIAIS E CUIDADOS" */
  eyebrow?: string;
  /** @description Título da seção */
  title?: string;
  /** @description Fotografia editorial de peças/minerais */
  image?: ImageWidget;
  /** @description Texto alternativo da imagem */
  imageAlt?: string;
  /** @description Princípios de material/cuidado (até 4) */
  principles?: Principle[];
}

function PrincipleIconGlyph({ icon }: { icon?: PrincipleIcon }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "1.3",
    "stroke-linecap": "round" as const,
    "stroke-linejoin": "round" as const,
    "aria-hidden": true,
  };
  if (icon === "handmade") {
    return (
      <svg {...common}>
        <path d="M12 3v3M6.5 5.5l1.8 1.8M17.5 5.5l-1.8 1.8" />
        <path d="M12 10.5 13.4 14 17 15.4 13.4 16.8 12 20.4 10.6 16.8 7 15.4 10.6 14z" />
      </svg>
    );
  }
  if (icon === "care") {
    return (
      <svg {...common}>
        <path d="M12 3.5 19 6.5v5c0 5-3 8.2-7 9.5-4-1.3-7-4.5-7-9.5v-5z" />
      </svg>
    );
  }
  if (icon === "unique") {
    return (
      <svg {...common}>
        <path d="M12 20.5c-4-2.4-7.5-5.6-7.5-9.7A4.8 4.8 0 0 1 12 8a4.8 4.8 0 0 1 7.5 2.8c0 4.1-3.5 7.3-7.5 9.7Z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M8 3.5h8l4 5.5-8 11.5-8-11.5Z" />
      <path d="M8 3.5 12 9l4-5.5M4 9h16M12 9l-2.5 11M12 9l2.5 11" />
    </svg>
  );
}

export default function AboutMaterials({
  eyebrow = "MATERIAIS E CUIDADOS",
  title = "",
  image,
  imageAlt = "",
  principles = [],
}: Props) {
  const visiblePrinciples = principles.slice(0, 4);
  if (!title && !image && visiblePrinciples.length === 0) return null;

  return (
    <section
      class="esv-about-materials"
      aria-labelledby="esv-about-materials-title"
    >
      <div class="esv-shell esv-about-materials-grid">
        {image && (
          <figure
            class="esv-about-materials-media"
            data-motion="media-reveal"
          >
            <EsmeraImage
              src={image}
              alt={imageAlt}
              loading="lazy"
              decoding="async"
              width={900}
              height={1150}
              sizes="(max-width: 767px) 100vw, 48vw"
            />
          </figure>
        )}
        <div class="esv-about-materials-copy">
          {eyebrow && (
            <p class="esv-kicker" data-motion="reveal" data-motion-order="0">
              {eyebrow}
            </p>
          )}
          {title && (
            <h2
              id="esv-about-materials-title"
              data-motion="reveal"
              data-motion-order="1"
            >
              {title}
            </h2>
          )}
          {visiblePrinciples.length > 0 && (
            <ul class="esv-about-materials-list">
              {visiblePrinciples.map((principle, index) => (
                <li key={`${principle.title}-${index}`}>
                  <PrincipleIconGlyph icon={principle.icon} />
                  {principle.title && <strong>{principle.title}</strong>}
                  {principle.text && <p>{principle.text}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
