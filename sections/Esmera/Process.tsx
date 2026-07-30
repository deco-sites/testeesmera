import Arrow from "../../components/esmera/Arrow.tsx";

export interface ExperiencePillar {
  title: string;
  text: string;
  /** @format image-uri */
  image: string;
  imageAlt: string;
  href?: string;
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
    text: "Seleção orientada pelo espaço, pela intenção e pelo contexto da coleção.",
    image: "https://images.unsplash.com/photo-1777810831386-4a46314e5ece?auto=format&fit=crop&w=900&q=88",
    imageAlt: "Objeto escultórico apresentado isoladamente em composição curatorial",
    href: "mailto:contact@esmera.com?subject=Curadoria%20privada",
  },
  {
    title: "Proveniência",
    text: "Informações de matéria, origem verificável e documentação acompanham a consulta.",
    image: "https://images.unsplash.com/photo-1767433200326-f554d1f745eb?auto=format&fit=crop&w=900&q=88",
    imageAlt: "Detalhe de matéria mineral em superfície irregular",
    href: "#provenance",
  },
  {
    title: "Entrega assistida",
    text: "Acompanhamento, acondicionamento e instalação quando aplicável à peça e ao espaço.",
    image: "https://images.unsplash.com/photo-1613424777445-f93a2a48e285?auto=format&fit=crop&w=900&q=88",
    imageAlt: "Vaso de superfície terrosa apresentado sob luz natural",
    href: "mailto:contact@esmera.com?subject=Entrega%20assistida",
  },
];

export default function Process({
  image = "",
  imageAlt = "",
  eyebrow = "07 — Experiência de aquisição",
  title = "Da escolha\nà entrega.",
  text =
    "Cada aquisição é conduzida com contexto sobre matéria, procedência, conservação e presença da peça no espaço.",
  pillars = defaultPillars,
}: Props) {
  return (
    <section id="experience" class="esv-experience esv-section" aria-labelledby="esv-experience-title">
      <div class="esv-shell esv-experience-head">
        <p class="esv-kicker">{eyebrow}</p>
        <div class="esv-experience-intro">
          <h2 id="esv-experience-title">{title}</h2>
          <p class="esv-experience-text">{text}</p>
        </div>
      </div>

      {image && (
        <figure class="esv-shell esv-experience-main">
          <img src={image} alt={imageAlt} loading="lazy" decoding="async" width="1800" height="760" />
        </figure>
      )}

      <div class="esv-shell esv-experience-pillars">
        {pillars.slice(0, 3).map((pillar, index) => (
          <article>
            <img src={pillar.image} alt={pillar.imageAlt} loading="lazy" decoding="async" width="720" height="540" />
            <small>0{index + 1}</small>
            <h3>{pillar.title}</h3>
            <p>{pillar.text}</p>
            {pillar.href && <a href={pillar.href} aria-label={pillar.title}>Saiba mais <Arrow size={12} /></a>}
          </article>
        ))}
      </div>
    </section>
  );
}
