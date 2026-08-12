import { ImageWidget } from "apps/admin/widgets.ts";
import Arrow from "../../components/esmera/Arrow.tsx";
import { EsmeraPicture } from "../../components/esmera/ResponsiveMedia.tsx";
import { mergeDefined } from "../../lib/esmera/editorialProps.ts";
import {
  loadResolvedHome,
  type ResolvedHome,
} from "../../lib/esmera/homeData.ts";
import HeroCarousel from "../../islands/HeroCarousel.tsx";

export interface HeroSlide {
  desktopImage: ImageWidget;
  mobileImage?: ImageWidget;
  alt: string;
  statement: string;
  cta?: { label: string; href: string; external?: boolean } | null;
}

export interface Props {
  mode?: "single" | "carousel";
  slides?: HeroSlide[];
  autoplay?: boolean;
  autoplaySeconds?: number;
  overlay?: 10 | 20 | 30;
  focalPoint?: "left" | "center" | "right";
}

export const loader = async (props: Props) => ({
  ...props,
  resolvedHome: await loadResolvedHome(),
});

function Slide(
  { slide, priority = false }: { slide: HeroSlide; priority?: boolean },
) {
  return (
    <>
      <EsmeraPicture
        class="esv-hero-picture"
        desktopSrc={slide.desktopImage}
        mobileSrc={slide.mobileImage}
        alt={slide.alt}
        desktopWidth={1920}
        desktopHeight={1200}
        mobileWidth={900}
        mobileHeight={1200}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        preload={priority}
        fetchPriority={priority ? "high" : "low"}
      />
      <div class="esv-hero-overlay" aria-hidden="true" />
      <div class="esv-shell esv-hero-content">
        <h1 id="esv-hero-title" class="esv-hero-statement">
          {slide.statement.split(/\n+/).filter(Boolean).map((line) => (
            <span class="esv-hero-line">{line}</span>
          ))}
        </h1>
        {slide.cta && (
          <a class="esv-hero-cta" href={slide.cta.href}>
            {slide.cta.label} <Arrow size={14} />
          </a>
        )}
      </div>
    </>
  );
}

export default function Hero(
  props: Props & { resolvedHome?: ResolvedHome },
) {
  if (props.resolvedHome?.hero === null) return null;
  const { resolvedHome, ...editorialProps } = props;
  const payloadControlsHero =
    resolvedHome?.sources.hero === "payload_override" ||
    resolvedHome?.sources.hero === "stale_payload";
  const source = payloadControlsHero
    ? mergeDefined<Props>(editorialProps, resolvedHome?.hero ?? {})
    : mergeDefined<Props>(resolvedHome?.hero, editorialProps);
  const {
    mode = "single",
    slides = [],
    autoplay = false,
    autoplaySeconds = 6,
    overlay = 20,
    focalPoint = "right",
  } = source;
  const activeSlides = slides.slice(0, 5);
  if (activeSlides.length === 0) return null;
  if (mode === "carousel" && activeSlides.length > 1) {
    return (
      <HeroCarousel
        slides={activeSlides}
        autoplay={autoplay}
        autoplaySeconds={autoplaySeconds}
        overlay={overlay}
        focalPoint={focalPoint}
      />
    );
  }
  return (
    <section
      class={`esv-hero is-overlay-${overlay} is-focal-${focalPoint}`}
      style={{ display: "grid" }}
      aria-labelledby="esv-hero-title"
    >
      <Slide slide={activeSlides[0]} priority />
    </section>
  );
}
