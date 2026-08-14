import { ImageWidget } from "apps/admin/widgets.ts";
import { EsmeraImage } from "../../../components/esmera/ResponsiveMedia.tsx";

export interface Props {
  /** @description Rótulo curto, ex.: "NOSSA ESSÊNCIA" */
  eyebrow?: string;
  /** @description Frase de impacto */
  text?: string;
  /** @description Fotografia editorial de pedra/mineral */
  image?: ImageWidget;
  /** @description Texto alternativo da imagem */
  imageAlt?: string;
}

export default function AboutManifesto({
  eyebrow = "NOSSA ESSÊNCIA",
  text = "",
  image,
  imageAlt = "",
}: Props) {
  if (!text) return null;
  return (
    <section
      class="esv-about-manifesto"
      aria-labelledby="esv-about-manifesto-title"
    >
      <div class="esv-shell esv-about-manifesto-grid">
        <div class="esv-about-manifesto-copy">
          {eyebrow && (
            <p
              class="esv-kicker esv-kicker-light"
              data-motion="reveal"
              data-motion-order="0"
            >
              {eyebrow}
            </p>
          )}
          <h2
            id="esv-about-manifesto-title"
            data-motion="reveal"
            data-motion-order="1"
          >
            {text}
          </h2>
        </div>
        {image && (
          <figure class="esv-about-manifesto-media" data-motion="media-reveal">
            <EsmeraImage
              src={image}
              alt={imageAlt}
              loading="lazy"
              decoding="async"
              width={900}
              height={1100}
              sizes="(max-width: 767px) 100vw, 45vw"
            />
          </figure>
        )}
      </div>
    </section>
  );
}
