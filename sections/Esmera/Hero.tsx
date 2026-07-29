import Arrow from "../../components/esmera/Arrow.tsx";

export interface Props {
  /** @format image-uri @description Imagem horizontal para desktop */
  desktopImage?: string;
  /** @format image-uri @description Imagem vertical opcional para mobile */
  mobileImage?: string;
  /** @description Marca exibida na primeira dobra */
  title?: string;
  /** @description Categoria principal da marca */
  contextLabel?: string;
  /** @format textarea @description Promessa curta, com no máximo duas linhas */
  statement?: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** @description Intensidade do overlay para legibilidade */
  overlay?: 10 | 20 | 30 | 40;
  /** @description Ponto focal da fotografia */
  focalPoint?: "left" | "center" | "right";
  /** @description Movimento de entrada da imagem */
  motion?: "none" | "subtle";
}

export default function Hero({
  desktopImage =
    "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=2400&q=90",
  mobileImage,
  title = "ESMÉRA",
  contextLabel = "Objetos raros para colecionadores",
  statement =
    "Natureza, matéria e design reunidos em peças escolhidas para permanecer.",
  ctaLabel = "Explorar a coleção",
  ctaHref = "#selection",
  overlay = 20,
  focalPoint = "center",
  motion = "subtle",
}: Props) {
  return (
    <section
      id="main-content"
      class={`esv-hero esv-hero-${motion}`}
      style={{
        "--hero-overlay": overlay / 100,
        "--hero-position": focalPoint,
      }}
      aria-labelledby="esv-hero-title"
    >
      <picture class="esv-hero-picture">
        {mobileImage && (
          <source media="(max-width: 767px)" srcset={mobileImage} />
        )}
        <img
          {...{ fetchPriority: "high" }}
          src={desktopImage}
          alt="Objetos minerais raros sobre pedestais de pedra"
          loading="eager"
          decoding="async"
          width="2400"
          height="1500"
        />
      </picture>
      <div class="esv-hero-overlay" />

      <div class="esv-shell esv-hero-content">
        <h1 id="esv-hero-title">{title}</h1>
        <p class="esv-hero-context">{contextLabel}</p>
        <p class="esv-hero-statement">{statement}</p>
        <a class="esv-hero-cta" href={ctaHref}>
          {ctaLabel} <Arrow size={14} />
        </a>
      </div>
    </section>
  );
}
