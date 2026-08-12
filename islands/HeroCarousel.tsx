import { useEffect, useState } from "preact/hooks";
import type { HeroSlide } from "../sections/Esmera/Hero.tsx";

export interface Props {
  slides: HeroSlide[];
  autoplay: boolean;
  autoplaySeconds: number;
  overlay: 10 | 20 | 30;
  focalPoint: "left" | "center" | "right";
}

export default function HeroCarousel(
  { slides, autoplay, autoplaySeconds, overlay, focalPoint }: Props,
) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (
      !autoplay || paused ||
      globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) return;
    const timer = globalThis.setInterval(
      () => setActive((value) => (value + 1) % slides.length),
      autoplaySeconds * 1000,
    );
    return () => globalThis.clearInterval(timer);
  }, [autoplay, paused, autoplaySeconds, slides.length]);
  const slide = slides[active];
  return (
    <section
      class={`esv-hero is-overlay-${overlay} is-focal-${focalPoint}`}
      style={{ display: "grid" }}
      aria-roledescription="carousel"
      aria-label="Destaques Esméra"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusIn={() => setPaused(true)}
      onFocusOut={() => setPaused(false)}
    >
      <picture class="esv-hero-picture">
        {slide.mobileImage && (
          <source media="(max-width: 767px)" srcset={slide.mobileImage} />
        )}
        <img
          {...{ fetchPriority: active === 0 ? "high" : "low" }}
          src={slide.desktopImage}
          alt={slide.alt}
          loading={active === 0 ? "eager" : "lazy"}
        />
      </picture>
      <div class="esv-hero-overlay" aria-hidden="true" />
      <div class="esv-shell esv-hero-content">
        <h1 class="esv-hero-statement">
          {slide.statement.split(/\n+/).map((line) => (
            <span class="esv-hero-line">{line}</span>
          ))}
        </h1>
        {slide.cta && (
          <a class="esv-hero-cta" href={slide.cta.href}>{slide.cta.label}</a>
        )}
      </div>
      <div
        class="esv-hero-carousel-controls"
        aria-label="Controles do carrossel"
      >
        <button
          type="button"
          aria-label="Slide anterior"
          onClick={() =>
            setActive((active - 1 + slides.length) % slides.length)}
        >
          ←
        </button>
        <span aria-live="polite">{active + 1} / {slides.length}</span>
        <button
          type="button"
          aria-label="Próximo slide"
          onClick={() => setActive((active + 1) % slides.length)}
        >
          →
        </button>
      </div>
    </section>
  );
}
