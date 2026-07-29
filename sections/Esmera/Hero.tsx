import Arrow from "../../components/esmera/Arrow.tsx";

export interface Props {
  /** @format image-uri @description Objeto Esméra acabado, protagonista do hero */
  desktopImage?: string;
  /** @format image-uri @description Recorte vertical do mesmo objeto para mobile */
  mobileImage?: string;
  /** @description Nome da marca para leitores de tela */
  title?: string;
  /** @format textarea @description Uma única frase de 5 a 12 palavras */
  statement?: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** @description Intensidade do overlay para legibilidade */
  overlay?: 10 | 20 | 30;
  /** @description Ponto focal da fotografia */
  focalPoint?: "left" | "center" | "right";
  /** @description Movimento de entrada da imagem */
  motion?: "none" | "subtle";
}

export default function Hero({
  desktopImage =
    "https://images.unsplash.com/photo-1777810831386-4a46314e5ece?auto=format&fit=crop&w=2400&q=90",
  mobileImage,
  title = "ESMÉRA",
  statement = "Matéria rara. Forma destinada a permanecer.",
  ctaLabel = "Explorar objetos",
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
          alt="Objeto escultórico Esméra apresentado sobre fundo mineral escuro"
          loading="eager"
          decoding="async"
          width="2400"
          height="1500"
        />
      </picture>
      <div class="esv-hero-overlay" />

      <div class="esv-shell esv-hero-content">
        <h1 id="esv-hero-title" class="esv-sr-only">{title}</h1>
        <p class="esv-hero-statement">{statement}</p>
        <a class="esv-hero-cta" href={ctaHref}>
          {ctaLabel} <Arrow size={14} />
        </a>
      </div>
    </section>
  );
}
