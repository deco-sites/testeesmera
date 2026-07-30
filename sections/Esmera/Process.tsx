import Arrow from "../../components/esmera/Arrow.tsx";
import { responsiveSrcSet } from "../../components/esmera/image.ts";

export interface ExperiencePillar {
  title: string;
  /** @format textarea */
  text: string;
  /** @format image-uri */
  image: string;
  imageAlt: string;
  href?: string;
  linkLabel?: string;
}

export interface Props {
  /** @format image-uri */
  image?: string;
  imageAlt?: string;
  eyebrow?: string;
  title?: string;
  /** @format textarea */
  text?: string;
  pillars?: ExperiencePillar[];
}

const defaultPillars: ExperiencePillar[] = [
  {
    title: "Curadoria privada",
    text:
      "Uma conversa precede a escolha. A seleção considera residência, coleção, projeto e intenção de permanência.",
    image:
      "https://images.unsplash.com/photo-1777810831386-4a46314e5ece?auto=format&fit=crop&w=1200&q=88",
    imageAlt: "Objeto escultórico apresentado isoladamente em composição curatorial",
    href: "mailto:contact@esmera.com?subject=Curadoria%20privada",
    linkLabel: "Falar com a curadoria",
  },
  {
    title: "Proveniência",
    text:
      "Toda peça carrega as informações verificáveis sobre matéria, origem, transformação e registro.",
    image:
      "https://images.unsplash.com/photo-1767433200326-f554d1f745eb?auto=format&fit=crop&w=1200&q=88",
    imageAlt: "Detalhe de matéria mineral em superfície irregular",
    href: "#provenance",
    linkLabel: "Rever a proveniência",
  },
  {
    title: "Entrega assistida",
    text:
      "A chegada também pertence à experiência: acompanhamento, acondicionamento e orientação quando aplicável.",
    image:
      "https://images.unsplash.com/photo-1613424777445-f93a2a48e285?auto=format&fit=crop&w=1200&q=88",
    imageAlt: "Objeto de superfície terrosa apresentado sob luz natural",
    href: "mailto:contact@esmera.com?subject=Entrega%20assistida",
    linkLabel: "Consultar o serviço",
  },
];

export default function Process({
  image = "",
  imageAlt = "",
  eyebrow = "08 — Experiência",
  title = "Da escolha\nà entrega.",
  text =
    "A aquisição é conduzida como uma sequência de rituais discretos: curadoria, prova e chegada da obra ao seu contexto.",
  pillars = defaultPillars,
}: Props) {
  const rituals = pillars.length === 3 ? pillars : defaultPillars;

  return (
    <section
      id="experience"
      class="esv-experience"
      aria-labelledby="esv-experience-title"
    >
      <div class="esv-shell esv-experience-head">
        <p class="esv-kicker">{eyebrow}</p>
        <div class="esv-experience-intro">
          <h2 id="esv-experience-title">{title}</h2>
          {text && <p class="esv-experience-text">{text}</p>}
        </div>
      </div>

      {image && (
        <figure class="esv-experience-main">
          <img
            src={image}
            srcset={responsiveSrcSet(image, [960, 1440, 1800])}
            alt={imageAlt}
            loading="lazy"
            decoding="async"
            width="1800"
            height="760"
            sizes="100vw"
          />
        </figure>
      )}

      <div class="esv-shell esv-experience-pillars">
        {rituals.map((pillar, index) => (
          <article>
            <img
              src={pillar.image}
              srcset={responsiveSrcSet(pillar.image, [480, 720, 900, 1200])}
              alt={pillar.imageAlt}
              loading="lazy"
              decoding="async"
              width="900"
              height="1100"
              sizes="(max-width: 767px) calc(100vw - 40px), 32vw"
            />
            <small>0{index + 1}</small>
            <h3>{pillar.title}</h3>
            <p>{pillar.text}</p>
            {pillar.href && pillar.linkLabel && (
              <a href={pillar.href} aria-label={pillar.linkLabel}>
                {pillar.linkLabel} <Arrow size={12} />
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
