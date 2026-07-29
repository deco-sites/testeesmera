import Arrow from "../components/esmera/Arrow.tsx";

export interface MatterPanel {
  /** @format image-uri */
  image: string;
  alt: string;
  caption?: string;
}

export interface Props {
  eyebrow: string;
  title: string;
  text: string;
  panels: MatterPanel[];
  ctaLabel: string;
  ctaHref: string;
}

export default function SpatialMatter({
  eyebrow,
  title,
  text,
  panels,
  ctaLabel,
  ctaHref,
}: Props) {
  return (
    <section
      class="esv-matter esv-matter-gallery"
      aria-labelledby="esv-matter-title"
    >
      <div class="esv-shell esv-matter-intro">
        <div class="esv-matter-eyebrow-row">
          <p class="esv-kicker">{eyebrow}</p>
        </div>

        <div class="esv-matter-intro-grid">
          <h2 id="esv-matter-title">{title}</h2>
          <p class="esv-matter-copy">{text}</p>
        </div>
      </div>

      <div class="esv-matter-gallery-track" aria-label="Galeria de matéria">
        {panels.slice(0, 3).map((panel) => (
          <figure class="esv-matter-gallery-item" key={panel.image}>
            <img
              src={panel.image}
              alt={panel.alt}
              loading="lazy"
              decoding="async"
              width="1200"
              height="1400"
            />
            {panel.caption && <figcaption class="esv-sr-only">{panel.caption}</figcaption>}
          </figure>
        ))}
      </div>

      <div class="esv-shell esv-matter-cta-wrap">
        <a class="esv-matter-cta" href={ctaHref}>
          <span>{ctaLabel}</span>
          <Arrow size={14} />
        </a>
      </div>
    </section>
  );
}
