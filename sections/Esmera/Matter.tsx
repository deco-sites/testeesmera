import { EsmeraImage } from "../../components/esmera/ResponsiveMedia.tsx";

export interface TerritoryPanel {
  /** @format image-uri */
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  /** @format textarea */
  text?: string;
}

export interface Props {
  panels?: TerritoryPanel[];
}

const defaultPanels: TerritoryPanel[] = [
  {
    image:
      "https://images.unsplash.com/photo-1767433200326-f554d1f745eb?auto=format&fit=crop&w=1800&q=90",
    alt: "Superfície mineral em detalhe, com textura e irregularidade visíveis",
    eyebrow: "01 — Matéria",
    title: "Presença mineral.",
    text: "Superfície, densidade e variação natural como origem da linguagem Esméra.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1613424777445-f93a2a48e285?auto=format&fit=crop&w=1800&q=90",
    alt: "Objeto de superfície terrosa sob luz lateral",
    eyebrow: "02 — Forma",
    title: "Forma em silêncio.",
    text: "Proporção e gesto reduzidos ao essencial para que a matéria permaneça legível.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1777810831386-4a46314e5ece?auto=format&fit=crop&w=1800&q=90",
    alt: "Objeto escultórico escuro revelando contorno e acabamento",
    eyebrow: "03 — Contexto",
    title: "Luz e contorno.",
    text: "A presença da obra é percebida pela relação entre escala, sombra e espaço.",
  },
];

export default function Matter({ panels = defaultPanels }: Props) {
  return (
    <section
      id="territory"
      class="esv-territory"
      aria-label="04 — Território Esméra"
      data-motion-scene="territory-stack"
    >
      <div class="esv-territory-track">
        {panels.slice(0, 3).map((panel) => (
          <article class="esv-territory-panel">
            <figure class="esv-territory-media">
              <EsmeraImage
                src={panel.image}
                alt={panel.alt}
                loading="lazy"
                decoding="async"
                width={1200}
                height={1500}
                sizes="(max-width: 767px) 100vw, 33vw"
              />
            </figure>
            <div class="esv-territory-shade" aria-hidden="true" />
            <div class="esv-territory-copy">
              <span class="esv-kicker esv-kicker-light">{panel.eyebrow}</span>
              <h2>{panel.title}</h2>
              {panel.text && <p>{panel.text}</p>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
