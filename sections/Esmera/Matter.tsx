export interface MatterPanel {
  /** @format image-uri */
  image: string;
  alt: string;
}

export interface Props {
  title?: string;
  /** @format textarea */
  text?: string;
  panels?: MatterPanel[];
}

const defaultPanels: MatterPanel[] = [
  {
    image:
      "https://images.unsplash.com/photo-1767433200326-f554d1f745eb?auto=format&fit=crop&w=1800&q=90",
    alt: "Superfície mineral em detalhe, com textura e irregularidade visíveis",
  },
  {
    image:
      "https://images.unsplash.com/photo-1613424777445-f93a2a48e285?auto=format&fit=crop&w=1800&q=90",
    alt: "Superfície terrosa de objeto sob luz lateral",
  },
  {
    image:
      "https://images.unsplash.com/photo-1777810831386-4a46314e5ece?auto=format&fit=crop&w=1800&q=90",
    alt: "Detalhe de objeto escultórico escuro revelando contorno e acabamento",
  },
];

export default function Matter({
  title = "Antes da forma, a matéria.",
  text = "Textura, transparência, corte, peso e luz tornam cada objeto irrepetível.",
  panels = defaultPanels,
}: Props) {
  return (
    <section
      id="matter"
      class="esv-matter esv-matter-gallery"
      aria-labelledby="esv-matter-title"
    >
      <div class="esv-matter-gallery-track" aria-label="Estudos de matéria">
        {panels.slice(0, 3).map((panel) => (
          <figure class="esv-matter-gallery-item" key={panel.image}>
            <img src={panel.image} alt={panel.alt} loading="lazy" decoding="async" width="1200" height="1500" />
          </figure>
        ))}
      </div>
      <div class="esv-shell esv-matter-copy">
        <h2 id="esv-matter-title">{title}</h2>
        <p>{text}</p>
      </div>
    </section>
  );
}
