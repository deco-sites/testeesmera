import Arrow from "../../components/esmera/Arrow.tsx";
import { EsmeraPicture } from "../../components/esmera/ResponsiveMedia.tsx";

export interface Props {
  /** @format image-uri @description Objeto Esméra acabado, protagonista do hero */
  desktopImage?: string;
  /** @format image-uri @description Recorte vertical do mesmo objeto para mobile */
  mobileImage?: string;
  /** @format textarea @description Declaração principal de até 70 caracteres */
  statement?: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** @description Intensidade do overlay para legibilidade */
  overlay?: 10 | 20 | 30;
  /** @description Ponto focal da fotografia */
  focalPoint?: "left" | "center" | "right";
}

export default function Hero({
  desktopImage =
    "https://images.unsplash.com/photo-1777810831386-4a46314e5ece?auto=format&fit=crop&w=2400&q=90",
  mobileImage,
  statement = "Matéria rara. Forma destinada a permanecer.",
  ctaLabel = "Descobrir a seleção",
  ctaHref = "#selection",
  overlay = 20,
  focalPoint = "right",
}: Props) {
  const statementLines = statement.split(/\n+/).filter(Boolean);

  return (
    <section
      id="main-content"
      class={`esv-hero is-overlay-${overlay} is-focal-${focalPoint}`}
      aria-labelledby="esv-hero-title"
      data-motion-scene="hero"
    >
      <EsmeraPicture
        class="esv-hero-picture"
        desktopSrc={desktopImage}
        mobileSrc={mobileImage}
        alt="Objeto escultórico Esméra apresentado sobre fundo mineral escuro"
        desktopWidth={1920}
        desktopHeight={1200}
        mobileWidth={900}
        mobileHeight={1200}
        loading="eager"
        decoding="async"
        preload
        fetchPriority="high"
      />
      <div class="esv-hero-overlay" aria-hidden="true" />

      <div class="esv-shell esv-hero-content">
        <h1 id="esv-hero-title" class="esv-hero-statement">
          {statementLines.map((line, index) => (
            <span
              class="esv-hero-line"
              style={{ animationDelay: `${index * 55}ms` }}
            >
              {line}
            </span>
          ))}
        </h1>
        {ctaLabel && (
          <a class="esv-hero-cta" href={ctaHref}>
            {ctaLabel} <Arrow size={14} />
          </a>
        )}
      </div>
    </section>
  );
}
