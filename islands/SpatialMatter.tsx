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

/**
 * Legacy island kept for Deco manifest/backwards compatibility.
 * The current Matter section is intentionally static and does not hydrate this island.
 */
export default function SpatialMatter({
  eyebrow,
  title,
  text,
  panels,
  ctaLabel,
  ctaHref,
}: Props) {
  return (
    <section class="esv-matter esv-matter-gallery" aria-label={eyebrow}>
      <div class="esv-shell esv-matter-intro">
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      <div class="esv-matter-gallery-track">
        {panels.slice(0, 3).map((panel) => (
          <figure class="esv-matter-gallery-item" key={panel.image}>
            <img src={panel.image} alt={panel.alt} loading="lazy" decoding="async" />
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
