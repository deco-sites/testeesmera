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
    image: "https://images.unsplash.com/photo-1777810831386-4a46314e5ece?auto=format&fit=crop&w=800&q=88",
    imageAlt: "Objeto escultórico apresentado isoladamente em composição curatorial",
    href: "mailto:contact@esmera.com?subject=Curadoria%20privada",
  },
  {
    title: "Proveniência",
    text: "Informações de matéria, origem verificável e documentação acompanham a consulta.",
    image: "https://images.unsplash.com/photo-1767433200326-f554d1f745eb?auto=format&fit=crop&w=800&q=88",
    imageAlt: "Detalhe de matéria mineral em superfície irregular",
    href: "#provenance",
  },
  {
    title: "Entrega assistida",
    text: "Acompanhamento, acondicionamento e instalação quando aplicável à peça e ao espaço.",
    image: "https://images.unsplash.com/photo-1771862956454-ad43adc3c19e?auto=format&fit=crop&w=800&q=88",
    imageAlt: "Objeto apresentado em contexto espacial sob luz natural",
    href: "mailto:contact@esmera.com?subject=Entrega%20assistida",
  },
];

export default function Process({
  image = "https://images.unsplash.com/photo-1767433200326-f554d1f745eb?auto=format&fit=crop&w=1500&q=90",
  imageAlt = "Detalhe de matéria mineral usado como prova de superfície e construção",
  eyebrow = "08 — Experiência de aquisição",
  title = "Da escolha\nà entrega.",
  text =
    "Cada aquisição é conduzida com contexto sobre matéria, procedência, conservação e presença da peça no espaço.",
  pillars = defaultPillars,
}: Props) {
  return (
    <section id="experience" class="esv-experience esv-section" aria-labelledby="esv-experience-title">
      <div class="esv-shell esv-experience-grid">
        <figure class="esv-experience-main">
          <img src={image} alt={imageAlt} loading="lazy" decoding="async" width="1000" height="1300" />
        </figure>

        <div class="esv-experience-copy">
          <p class="esv-kicker">{eyebrow}</p>
          <h2 id="esv-experience-title">{title}</h2>
          <p class="esv-experience-text">{text}</p>
          <div class="esv-experience-pillars">
            {pillars.slice(0, 3).map((pillar, index) => (
              <article>
                <img src={pillar.image} alt={pillar.imageAlt} loading="lazy" decoding="async" width="560" height="420" />
                <small>0{index + 1}</small>
                <h3>{pillar.title}</h3>
                <p>{pillar.text}</p>
                {pillar.href && <a href={pillar.href} aria-label={pillar.title}>Saiba mais <Arrow size={12} /></a>}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
