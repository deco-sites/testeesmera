import Arrow from "../../components/esmera/Arrow.tsx";
import { EsmeraImage } from "../../components/esmera/ResponsiveMedia.tsx";

export interface Props {
  eyebrow?: string;
  title?: string;
  text?: string;
  ctaLabel?: string;
  ctaHref?: string;
  mainImage?: string;
  mainImageAlt?: string;
  secondaryImage?: string;
  secondaryImageAlt?: string;
}

export default function Manifesto(props: Props) {
  if (!props.title || !props.mainImage) return null;
  return (
    <section
      id="about"
      class="esv-maison"
      aria-labelledby="esv-maison-title"
      data-motion-scene="maison"
    >
      <div class="esv-shell esv-maison-grid">
        <div class="esv-maison-copy" data-motion="reveal">
          {props.eyebrow && <p class="esv-kicker">{props.eyebrow}</p>}
          <h2 id="esv-maison-title">{props.title}</h2>
          {props.text && <p class="esv-maison-text">{props.text}</p>}
          {props.ctaLabel && props.ctaHref && (
            <a href={props.ctaHref} class="esv-text-link">
              {props.ctaLabel} <Arrow size={13} />
            </a>
          )}
        </div>
        <div class="esv-maison-media">
          <figure class="esv-maison-main">
            <EsmeraImage
              src={props.mainImage}
              alt={props.mainImageAlt ?? ""}
              loading="lazy"
              decoding="async"
              width={1200}
              height={1500}
            />
          </figure>
          {props.secondaryImage && (
            <figure class="esv-maison-secondary">
              <EsmeraImage
                src={props.secondaryImage}
                alt={props.secondaryImageAlt ?? ""}
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
