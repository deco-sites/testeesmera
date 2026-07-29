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
    title: "Curadoria",
    text:
      "A seleção parte da matéria, da singularidade e da relação que cada objeto estabelece com o espaço.",
    image:
      "https://images.unsplash.com/photo-1771862956454-ad43adc3c19e?auto=format&fit=crop&w=800&q=88",
    imageAlt: "Objetos escultóricos reunidos em composição curatorial",
    href: "mailto:contact@esmera.com?subject=Curadoria%20privada",
  },
  {
    title: "Proveniência",
    text:
      "Material, características naturais, edição e origem verificável passam a fazer parte da ficha da peça.",
    image:
      "https://images.unsplash.com/photo-1767433200326-f554d1f745eb?auto=format&fit=crop&w=800&q=88",
    imageAlt: "Superfície de escultura mineral em detalhe",
    href: "#matter",
  },
  {
    title: "Serviço",
    text:
      "Consulta privada, embalagem, transporte, instalação quando aplicável e acompanhamento pós-venda.",
    image:
      "https://images.unsplash.com/photo-1526198049595-f32cde2a219d?auto=format&fit=crop&w=800&q=88",
    imageAlt: "Vaso apresentado isoladamente para leitura precisa de forma",
    href: "mailto:contact@esmera.com?subject=Atendimento%20Esm%C3%A9ra",
  },
];

export default function Process({
  image =
    "https://images.unsplash.com/photo-1767433200326-f554d1f745eb?auto=format&fit=crop&w=1500&q=90",
  imageAlt = "Escultura mineral com textura e volume claramente visíveis",
  eyebrow = "06 — Curadoria, proveniência e serviço",
  title = "O valor também está no que se prova.",
  text =
    "Da escolha à entrega, a Esméra reduz incerteza com informação de matéria, singularidade e serviço. A confiança faz parte da apresentação do objeto.",
  pillars = defaultPillars,
}: Props) {
  return (
    <section
      id="experience"
      class="esv-experience esv-section"
      aria-labelledby="esv-experience-title"
    >
      <div class="esv-shell esv-experience-grid">
        <figure class="esv-experience-main">
          <img
            src={image}
            alt={imageAlt}
            loading="lazy"
            decoding="async"
            width="1000"
            height="1300"
          />
        </figure>

        <div class="esv-experience-copy">
          <p class="esv-kicker">{eyebrow}</p>
          <h2 id="esv-experience-title">{title}</h2>
          <p class="esv-experience-text">{text}</p>
          <div class="esv-experience-pillars">
            {pillars.map((pillar, index) => (
              <article>
                <img
                  src={pillar.image}
                  alt={pillar.imageAlt}
                  loading="lazy"
                  decoding="async"
                  width="560"
                  height="420"
                />
                <small>0{index + 1}</small>
                <h3>{pillar.title}</h3>
                <p>{pillar.text}</p>
                {pillar.href && (
                  <a href={pillar.href} aria-label={pillar.title}>
                    Saiba mais <Arrow size={12} />
                  </a>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
