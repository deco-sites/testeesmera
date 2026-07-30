import Image from "apps/website/components/Image.tsx";
import Arrow from "../../components/esmera/Arrow.tsx";

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
    text: "Uma conversa antecede a escolha.",
    image:
      "https://images.unsplash.com/photo-1777810831386-4a46314e5ece?auto=format&fit=crop&w=1200&q=88",
    imageAlt: "Objeto escultórico apresentado isoladamente em composição curatorial",
    href: "mailto:contact@esmera.com?subject=Curadoria%20privada",
    linkLabel: "Saiba mais",
  },
  {
    title: "Proveniência",
    text: "Cada objeto carrega seu registro.",
    image:
      "https://images.unsplash.com/photo-1767433200326-f554d1f745eb?auto=format&fit=crop&w=1200&q=88",
    imageAlt: "Detalhe de matéria mineral em superfície irregular",
    href: "#provenance",
    linkLabel: "Saiba mais",
  },
  {
    title: "Entrega assistida",
    text: "A chegada também integra a experiência.",
    image:
      "https://images.unsplash.com/photo-1613424777445-f93a2a48e285?auto=format&fit=crop&w=1200&q=88",
    imageAlt: "Objeto de superfície terrosa apresentado sob luz natural",
    href: "mailto:contact@esmera.com?subject=Entrega%20assistida",
    linkLabel: "Saiba mais",
  },
];

export default function Process({
  image = "",
  imageAlt = "",
  eyebrow = "08 — Experiência",
  title = "Da escolha\nà entrega.",
  text =
    "Três rituais acompanham a aquisição: curadoria, registro e chegada da obra ao seu contexto.",
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
          <Image
            src={image}
            alt={imageAlt}
            loading="lazy"
            decoding="async"
            width={1800}
            height={760}
            sizes="100vw"
          />
        </figure>
      )}

      <div class="esv-shell esv-experience-pillars">
        {rituals.map((pillar, index) => (
          <article>
            <Image
              src={pillar.image}
              alt={pillar.imageAlt}
              loading="lazy"
              decoding="async"
              width={900}
              height={675}
              sizes="(max-width: 767px) calc(100vw - 36px), 32vw"
            />
            <small>0{index + 1}</small>
            <h3>{pillar.title}</h3>
            <p>{pillar.text}</p>
            {pillar.href && pillar.linkLabel && (
              <a href={pillar.href} aria-label={`${pillar.linkLabel}: ${pillar.title}`}>
                {pillar.linkLabel} <Arrow size={12} />
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
