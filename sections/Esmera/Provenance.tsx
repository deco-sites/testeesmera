import { EsmeraImage } from "../../components/esmera/ResponsiveMedia.tsx";
import {
  loadResolvedHome,
  type ResolvedHome,
} from "../../lib/esmera/homeData.ts";
import type { NavigationLink } from "../../lib/payload/types.ts";

export interface ProvenanceStage {
  title: string;
  text: string;
  image: string;
  alt: string;
  linkLabel?: string;
  linkHref?: string;
}

export interface Props {
  eyebrow?: string;
  title?: string;
  text?: string;
  image?: string;
  imageAlt?: string;
  stages?: ProvenanceStage[];
  cta?: NavigationLink | null;
}

export const loader = async (props: Props) => ({
  ...props,
  resolvedHome: await loadResolvedHome(),
});

export default function Provenance(
  props: Props & { resolvedHome?: ResolvedHome },
) {
  if (props.resolvedHome?.provenance === null) return null;
  const source = props.resolvedHome?.provenance ?? props;
  const {
    eyebrow = "",
    title = "",
    text = "",
    image,
    imageAlt = "",
    stages = [],
    cta,
  } = source;
  const visibleStages = stages.slice(0, 6);
  if (!title && !text && !image && visibleStages.length === 0) return null;
  return (
    <section
      id="provenance"
      class="esv-provenance"
      aria-labelledby="esv-provenance-title"
    >
      <div class="esv-shell esv-provenance-intro-grid">
        {eyebrow && (
          <p class="esv-kicker" data-motion="reveal" data-motion-order="0">
            {eyebrow}
          </p>
        )}
        <div
          class="esv-provenance-intro-copy"
          data-motion="reveal"
          data-motion-order="1"
        >
          {title && <h2 id="esv-provenance-title">{title}</h2>}
          {text && <p>{text}</p>}
        </div>
      </div>
      {image && (
        <figure class="esv-shell" data-motion="media-reveal">
          <EsmeraImage
            src={image}
            alt={imageAlt}
            loading="lazy"
            decoding="async"
            width={1800}
            height={1100}
            sizes="(max-width: 767px) calc(100vw - 36px), 90vw"
          />
        </figure>
      )}
      <div class="esv-shell esv-provenance-stages">
        {visibleStages.map((stage, index) => (
          <article
            class={`esv-provenance-stage esv-provenance-stage-${
              index === 0 ? "origin" : index === 1 ? "transform" : "register"
            }`}
          >
            <figure
              class="esv-provenance-stage-media"
              data-motion="media-reveal"
              data-motion-order="0"
            >
              <EsmeraImage
                src={stage.image}
                alt={stage.alt}
                loading="lazy"
                decoding="async"
                width={1600}
                height={1200}
                sizes="(max-width: 429px) calc(100vw - 36px), (max-width: 767px) calc(100vw - 44px), (max-width: 1023px) 62vw, 58vw"
              />
            </figure>
            <div class="esv-provenance-stage-copy">
              <small data-motion="reveal" data-motion-order="1">
                {String(index + 1).padStart(2, "0")}
              </small>
              <h3 data-motion="reveal" data-motion-order="2">{stage.title}</h3>
              <p data-motion="reveal" data-motion-order="3">{stage.text}</p>
              {stage.linkLabel && stage.linkHref && (
                <a class="esv-text-link" href={stage.linkHref}>
                  {stage.linkLabel}
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
      {cta && (
        <div class="esv-shell esv-collection-end">
          <a class="esv-text-link" href={cta.href}>{cta.label}</a>
        </div>
      )}
    </section>
  );
}
