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
      "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=1800&q=90",
    alt: "Diamantes lapidados sobre fundo escuro",
  },
  {
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1800&q=90",
    alt: "Interior contemporâneo com arte e objetos minerais",
  },
  {
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1800&q=90",
    alt: "Arquitetura em tons minerais e luz natural",
  },
];

export default function Matter({
  sectionLabel = "Matéria",
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
      <div class="esv-matter-gallery-track" aria-label="Galeria de matéria">
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
