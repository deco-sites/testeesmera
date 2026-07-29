export interface MatterPanel {
  /** @format image-uri */
  image: string;
  alt: string;
}

export interface Props {
  sectionLabel?: string;
  panels?: MatterPanel[];
}

const defaultPanels: MatterPanel[] = [
  {
    image:
      "https://images.unsplash.com/photo-1767433200326-f554d1f745eb?auto=format&fit=crop&w=1800&q=90",
    alt: "Escultura mineral com superfície irregular e volumes orgânicos",
  },
  {
    image:
      "https://images.unsplash.com/photo-1771862956454-ad43adc3c19e?auto=format&fit=crop&w=1800&q=90",
    alt: "Objetos escultóricos apresentados em contexto de interior contemporâneo",
  },
  {
    image:
      "https://images.unsplash.com/photo-1526198049595-f32cde2a219d?auto=format&fit=crop&w=1800&q=90",
    alt: "Vaso azul fotografado isoladamente para leitura de forma e escala",
  },
];

export default function Matter({
  sectionLabel = "Matéria, objeto e contexto",
  panels = defaultPanels,
}: Props) {
  return (
    <section
      id="matter"
      class="esv-matter esv-matter-gallery"
      aria-labelledby="esv-matter-title"
    >
      <h2 id="esv-matter-title" class="esv-sr-only">{sectionLabel}</h2>
      <div class="esv-matter-spacer" aria-hidden="true" />
      <div class="esv-matter-gallery-track" aria-label="Matéria, objeto e contexto">
        {panels.slice(0, 3).map((panel) => (
          <figure class="esv-matter-gallery-item" key={panel.image}>
            <img
              src={panel.image}
              alt={panel.alt}
              loading="lazy"
              decoding="async"
              width="1200"
              height="1500"
            />
          </figure>
        ))}
      </div>
    </section>
  );
}
