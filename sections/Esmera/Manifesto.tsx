import { ImageWidget } from "apps/admin/widgets.ts";
import Arrow from "../../components/esmera/Arrow.tsx";
import { EsmeraImage } from "../../components/esmera/ResponsiveMedia.tsx";
import { mergeDefined } from "../../lib/esmera/editorialProps.ts";
import {
  loadResolvedHome,
  type ResolvedHome,
} from "../../lib/esmera/homeData.ts";

export interface Props {
  eyebrow?: string;
  title?: string;
  text?: string;
  ctaLabel?: string;
  ctaHref?: string;
  mainImage?: ImageWidget;
  mainImageAlt?: string;
  secondaryImage?: ImageWidget;
  secondaryImageAlt?: string;
}

export const loader = async (props: Props) => ({
  ...props,
  resolvedHome: await loadResolvedHome(),
});

export default function Manifesto(
  props: Props & { resolvedHome?: ResolvedHome },
) {
  if (props.resolvedHome?.manifesto === null) return null;
  const { resolvedHome, ...editorialProps } = props;
  const source = mergeDefined<Props>(resolvedHome?.manifesto, editorialProps);
  if (!source.title || !source.mainImage) return null;
  return (
    <section
      id="about"
      class="esv-maison"
      aria-labelledby="esv-maison-title"
    >
      <div class="esv-shell esv-maison-grid">
        <div class="esv-maison-copy" data-motion="reveal">
          {source.eyebrow && <p class="esv-kicker">{source.eyebrow}</p>}
          <h2 id="esv-maison-title">{source.title}</h2>
          {source.text && <p class="esv-maison-text">{source.text}</p>}
          {source.ctaLabel && source.ctaHref && (
            <a href={source.ctaHref} class="esv-text-link">
              {source.ctaLabel} <Arrow size={13} />
            </a>
          )}
        </div>
        <div class="esv-maison-media">
          <figure class="esv-maison-main">
            <EsmeraImage
              src={source.mainImage}
              alt={source.mainImageAlt ?? ""}
              loading="lazy"
              decoding="async"
              width={1200}
              height={1500}
            />
          </figure>
          {source.secondaryImage && (
            <figure class="esv-maison-secondary">
              <EsmeraImage
                src={source.secondaryImage}
                alt={source.secondaryImageAlt ?? ""}
                loading="lazy"
                decoding="async"
                width={480}
                height={640}
              />
            </figure>
          )}
        </div>
      </div>
    </section>
  );
}
