import { Picture, Source } from "apps/website/components/Picture.tsx";

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
  const mobileAsset = mobileImage ?? image;

  return (
    <section
      id="matter"
      class={`esv-matter-interlude is-focal-${focalPoint}`}
      aria-labelledby="esv-matter-interlude-title"
    >
      <Picture class="esv-matter-interlude-media">
        <Source
          media="(max-width: 767px)"
          src={mobileAsset}
          width={900}
          height={1200}
        />
        <Source
          media="(min-width: 768px)"
          src={image}
          width={1920}
          height={1280}
        />
        <img
          src={image}
          alt={imageAlt}
          loading="lazy"
          decoding="async"
          width="1920"
          height="1280"
        />
      </Picture>
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
