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
  title = "Rara por natureza.\nEscolhida para permanecer.",
  text =
    "A Esméra escolhe objetos pela matéria, pela presença e pela capacidade de permanecer. Curadoria, procedência e serviço acompanham cada peça antes e depois da aquisição.",
  ctaLabel = "Conhecer a Maison",
  ctaHref = "#experience",
  mainImage =
    "https://images.unsplash.com/photo-1771862956454-ad43adc3c19e?auto=format&fit=crop&w=1500&q=90",
  mainImageAlt = "Objetos escultóricos apresentados em interior contemporâneo",
  secondaryImage =
    "https://images.unsplash.com/photo-1767433200326-f554d1f745eb?auto=format&fit=crop&w=800&q=90",
  secondaryImageAlt = "Detalhe de escultura mineral com superfície irregular",
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
          <p class="esv-maison-text">{text}</p>
          <a href={ctaHref} class="esv-text-link">
            {ctaLabel} <Arrow size={13} />
          </a>
        </div>

        <div class="esv-maison-media" aria-label="Universo Esméra">
          <figure class="esv-maison-main">
            <img
              src={mainImage}
              alt={mainImageAlt}
              loading="lazy"
              decoding="async"
              width="936"
              height="730"
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
            />
          </figure>
        </div>
      </div>
    </section>
  );
}
