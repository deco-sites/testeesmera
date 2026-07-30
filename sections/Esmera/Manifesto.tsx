import Arrow from "../../components/esmera/Arrow.tsx";

export interface Props {
  eyebrow?: string;
  title?: string;
  /** @format textarea */
  text?: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** @format image-uri */
  mainImage?: string;
  mainImageAlt?: string;
  /** @format image-uri */
  secondaryImage?: string;
  secondaryImageAlt?: string;
}

export default function Manifesto({
  eyebrow = "02 — A Maison",
  title = "Rara por\nnatureza.\nEscolhida para\npermanecer.",
  text =
    "A Esméra reúne objetos de presença singular, criados ou selecionados a partir de matérias preciosas e concebidos para atravessar o tempo.",
  ctaLabel = "Sobre a Maison",
  ctaHref = "#experience",
  mainImage =
    "https://images.unsplash.com/photo-1777810831386-4a46314e5ece?auto=format&fit=crop&w=1500&q=90",
  mainImageAlt = "Objeto escultórico final apresentado em composição controlada",
  secondaryImage =
    "https://images.unsplash.com/photo-1767433200326-f554d1f745eb?auto=format&fit=crop&w=800&q=90",
  secondaryImageAlt = "Detalhe de matéria mineral com superfície irregular",
}: Props) {
  return (
    <section
      id="about"
      class="esv-maison"
      aria-labelledby="esv-maison-title"
    >
      <div class="esv-shell esv-maison-grid">
        <div class="esv-maison-copy">
          <p class="esv-kicker">{eyebrow}</p>
          <h2 id="esv-maison-title">{title}</h2>
          {text && <p class="esv-maison-text">{text}</p>}
          {ctaLabel && (
            <a href={ctaHref} class="esv-text-link">
              {ctaLabel} <Arrow size={13} />
            </a>
          )}
        </div>

        <div class="esv-maison-media" aria-label="Objeto e matéria Esméra">
          <figure class="esv-maison-main">
            <img
              src={mainImage}
              alt={mainImageAlt}
              loading="lazy"
              decoding="async"
              width="936"
              height="1170"
              sizes="(max-width: 767px) 85vw, (max-width: 1023px) 48vw, 42vw"
            />
          </figure>
          <figure class="esv-maison-secondary">
            <img
              src={secondaryImage}
              alt={secondaryImageAlt}
              loading="lazy"
              decoding="async"
              width="360"
              height="480"
              sizes="(max-width: 767px) 30vw, 16vw"
            />
          </figure>
        </div>
      </div>
    </section>
  );
}
