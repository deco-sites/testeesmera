import { EsmeraPicture } from "../../components/esmera/ResponsiveMedia.tsx";
import {
  loadResolvedHome,
  type ResolvedHome,
} from "../../lib/esmera/homeData.ts";

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

export const loader = async (props: Props) => ({
  ...props,
  resolvedHome: await loadResolvedHome(),
});

export default function MatterInterlude(
  props: Props & { resolvedHome?: ResolvedHome },
) {
  if (props.resolvedHome?.matterInterlude === null) return null;
  const source = props.resolvedHome?.matterInterlude ?? props;
  const {
    image = "",
    mobileImage,
    imageAlt =
      "Macro de superfície mineral revelando textura, densidade e irregularidade",
    material = "Matéria mineral",
    location = "",
    title = "Formada lentamente.\nTransformada uma vez.",
    focalPoint = "center",
  } = source;
  if (!image) return null;
  const meta = ["06 — Matéria", material, location].filter(Boolean).join(" · ");

  return (
    <section
      id="matter"
      class={`esv-matter-interlude is-focal-${focalPoint}`}
      aria-labelledby="esv-matter-interlude-title"
      data-motion-scene="interlude"
    >
      <EsmeraPicture
        class="esv-matter-interlude-media"
        desktopSrc={image}
        mobileSrc={mobileImage}
        alt={imageAlt}
        desktopWidth={1920}
        desktopHeight={1280}
        mobileWidth={900}
        mobileHeight={1200}
        loading="lazy"
        decoding="async"
      />
      <div class="esv-matter-interlude-shade" aria-hidden="true" />

      <div class="esv-shell esv-matter-interlude-content">
        <p
          class="esv-matter-interlude-meta"
          data-motion="reveal"
          data-motion-order="0"
        >
          {meta}
        </p>
        <h2
          id="esv-matter-interlude-title"
          class="esv-matter-interlude-title"
          data-motion="reveal"
          data-motion-order="1"
        >
          {title}
        </h2>
      </div>
    </section>
  );
}
