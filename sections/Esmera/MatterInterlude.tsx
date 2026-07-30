import { responsiveSrcSet } from "../../components/esmera/image.ts";

export interface Props {
  /** @format image-uri */
  image?: string;
  /** @format image-uri */
  mobileImage?: string;
  imageAlt?: string;
  material?: string;
  location?: string;
  /** @format textarea */
  title?: string;
  focalPoint?: "left" | "center" | "right";
}

export default function MatterInterlude({
  image =
    "https://images.unsplash.com/photo-1767433200326-f554d1f745eb?auto=format&fit=crop&w=2400&q=92",
  mobileImage,
  imageAlt = "Macro de superfície mineral revelando textura, densidade e irregularidade",
  material = "Matéria mineral",
  location = "",
  title = "Formada lentamente.\nTransformada uma vez.",
  focalPoint = "center",
}: Props) {
  const meta = ["06 — Matéria", material, location].filter(Boolean).join(" · ");

  return (
    <section
      id="matter"
      class={`esv-matter-interlude is-focal-${focalPoint}`}
      aria-labelledby="esv-matter-interlude-title"
    >
      <picture class="esv-matter-interlude-media">
        {mobileImage && (
          <source
            media="(max-width: 767px)"
            srcset={responsiveSrcSet(mobileImage, [480, 768, 1080, 1440]) ?? mobileImage}
            sizes="100vw"
          />
        )}
        <img
          src={image}
          srcset={responsiveSrcSet(image, [960, 1440, 1920, 2400])}
          alt={imageAlt}
          loading="lazy"
          decoding="async"
          width="2400"
          height="1600"
          sizes="100vw"
        />
      </picture>
      <div class="esv-matter-interlude-shade" aria-hidden="true" />

      <div class="esv-shell esv-matter-interlude-content">
        <p class="esv-matter-interlude-meta">{meta}</p>
        <h2 id="esv-matter-interlude-title" class="esv-matter-interlude-title">
          {title}
        </h2>
      </div>
    </section>
  );
}
