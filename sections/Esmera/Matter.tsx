import Arrow from "../../components/esmera/Arrow.tsx";

export interface MatterPanel {
  /** @format image-uri */
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  /** @format textarea */
  text?: string;
  href?: string;
}

export interface Props {
  panels?: MatterPanel[];
}

const defaultPanels: MatterPanel[] = [
  {
    image:
      "https://images.unsplash.com/photo-1767433200326-f554d1f745eb?auto=format&fit=crop&w=1800&q=90",
    alt: "Superfície mineral em detalhe, com textura e irregularidade visíveis",
    eyebrow: "01 — Esculturas",
    title: "Presença mineral.",
    text: "Massa, superfície e matéria como gesto escultórico.",
    href: "#objects",
  },
  {
    image:
      "https://images.unsplash.com/photo-1613424777445-f93a2a48e285?auto=format&fit=crop&w=1800&q=90",
    alt: "Superfície terrosa de objeto sob luz lateral",
    eyebrow: "02 — Vasos",
    title: "Forma em silêncio.",
    text: "Proporção, textura e presença para ocupar o espaço com contenção.",
    href: "#objects",
  },
  {
    image:
      "https://images.unsplash.com/photo-1777810831386-4a46314e5ece?auto=format&fit=crop&w=1800&q=90",
    alt: "Detalhe de objeto escultórico escuro revelando contorno e acabamento",
    eyebrow: "03 — Objetos",
    title: "Luz e contorno.",
    text: "Peças de pequena escala definidas pelo desenho, sombra e acabamento.",
    href: "#objects",
  },
];

export default function Matter({ panels = defaultPanels }: Props) {
  return (
    <section
      id="matter"
      class="esv-matter esv-matter-gallery"
      aria-label="Categorias Esméra"
    >
      <div class="esv-matter-gallery-track">
        {panels.slice(0, 3).map((panel) => (
          <a class="esv-matter-category" href={panel.href ?? "#objects"}>
            <figure class="esv-matter-gallery-item" key={panel.image}>
              <img src={panel.image} alt={panel.alt} loading="lazy" decoding="async" width="1200" height="1500" />
              <div class="esv-matter-category-shade" aria-hidden="true" />
              <figcaption class="esv-matter-category-copy">
                <small>{panel.eyebrow}</small>
                <h2>{panel.title}</h2>
                {panel.text && <p>{panel.text}</p>}
                <span>Explorar <Arrow size={13} /></span>
              </figcaption>
            </figure>
          </a>
        ))}
      </div>
    </section>
  );
}
