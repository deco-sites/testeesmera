import Image from "apps/website/components/Image.tsx";

export interface ProvenanceStage {
  title: string;
  /** @format textarea */
  text: string;
  /** @format image-uri */
  image: string;
  alt: string;
  linkLabel?: string;
  linkHref?: string;
}

export interface Props {
  eyebrow?: string;
  title?: string;
  /** @format textarea */
  text?: string;
  stages?: ProvenanceStage[];
}

const defaultStages: ProvenanceStage[] = [
  {
    title: "Origem",
    text:
      "A leitura começa na matéria: características naturais e origem somente quando a informação pode ser verificada.",
    image:
      "https://images.unsplash.com/photo-1767433200326-f554d1f745eb?auto=format&fit=crop&w=1800&q=92",
    alt: "Macro de superfície mineral usada para documentar origem e características naturais",
  },
  {
    title: "Transformação",
    text:
      "Acabamento, montagem, gesto construtivo e variações de superfície registram como a matéria se torna objeto.",
    image:
      "https://images.unsplash.com/photo-1777810831386-4a46314e5ece?auto=format&fit=crop&w=1800&q=92",
    alt: "Objeto escultórico em detalhe, apresentado como registro de gesto e acabamento",
  },
  {
    title: "Registro",
    text:
      "Singularidade, edição e documentação fotográfica acompanham a obra quando esses dados pertencem à ficha da peça.",
    image:
      "https://images.unsplash.com/photo-1613424777445-f93a2a48e285?auto=format&fit=crop&w=1800&q=92",
    alt: "Objeto final apresentado como registro de singularidade e documentação",
  },
];

export default function Provenance({
  eyebrow = "07 — Proveniência",
  title = "Da origem\nao registro.",
  text =
    "Proveniência não é um benefício adicionado depois da escolha. É parte da forma como a obra é apresentada, compreendida e adquirida.",
  stages = defaultStages,
}: Props) {
  const visibleStages = stages.length === 3 ? stages : defaultStages;

  return (
    <section
      id="provenance"
      class="esv-provenance"
      aria-labelledby="esv-provenance-title"
    >
      <div class="esv-shell esv-provenance-intro-grid">
        <p class="esv-kicker">{eyebrow}</p>
        <div class="esv-provenance-intro-copy">
          <h2 id="esv-provenance-title">{title}</h2>
          {text && <p>{text}</p>}
        </div>
      </div>

      <div class="esv-shell esv-provenance-stages">
        {visibleStages.map((stage, index) => {
          const tone = index === 0
            ? "origin"
            : index === 1
            ? "transform"
            : "register";

          return (
            <article class={`esv-provenance-stage esv-provenance-stage-${tone}`}>
              <figure class="esv-provenance-stage-media">
                <Image
                  src={stage.image}
                  alt={stage.alt}
                  loading="lazy"
                  decoding="async"
                  width={1600}
                  height={1200}
                  sizes="(max-width: 767px) calc(100vw - 36px), (max-width: 1023px) 62vw, 58vw"
                />
              </figure>

              <div class="esv-provenance-stage-copy">
                <small>0{index + 1}</small>
                <h3>{stage.title}</h3>
                <p>{stage.text}</p>
                {stage.linkLabel && stage.linkHref && (
                  <a class="esv-text-link" href={stage.linkHref}>{stage.linkLabel}</a>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
