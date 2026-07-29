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
    text:
      "Seleção individual para residências, coleções e projetos de interiores.",
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=88",
    imageAlt: "Interior sofisticado preparado para curadoria privada",
    href: "mailto:contact@esmera.com?subject=Curadoria%20privada",
  },
  {
    title: "Proveniência",
    text: "Informações de matéria, edição e origem acompanham cada peça.",
    image:
      "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=800&q=88",
    imageAlt: "Detalhe de cristal verde autêntico",
    href: "#matter",
  },
  {
    title: "Entrega assegurada",
    text:
      "Acompanhamento próximo e transporte adequado à singularidade do objeto.",
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=88",
    imageAlt: "Objeto em interior de arquitetura contemporânea",
    href: "mailto:contact@esmera.com?subject=Entrega%20assegurada",
  },
];

export default function Process({
  image =
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1500&q=90",
  imageAlt = "Paisagem mineral em grande escala",
  eyebrow = "06 — A experiência Esméra",
  title = "O que esperar.",
  text =
    "Da primeira conversa à entrega, a Esméra conduz cada aquisição com atenção à origem, à matéria e ao contexto do espaço.",
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
