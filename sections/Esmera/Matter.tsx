import { EsmeraImage } from "../../components/esmera/ResponsiveMedia.tsx";
import type { NavigationLink } from "../../lib/payload/types.ts";

export interface TerritoryPanel {
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  text?: string;
  category?: NavigationLink | null;
  cta?: NavigationLink | null;
}

export interface Props {
  panels?: TerritoryPanel[];
}

export default function Matter({ panels = [] }: Props) {
  if (panels.length === 0) return null;
  return (
    <section
      id="territory"
      class="esv-territory"
      aria-label="Território Esméra"
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
              {panel.category && (
                <a class="esv-text-link" href={panel.category.href}>
                  {panel.category.label}
                </a>
              )}
              {panel.cta && (
                <a class="esv-text-link" href={panel.cta.href}>
                  {panel.cta.label}
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
