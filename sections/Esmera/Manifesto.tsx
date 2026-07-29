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
  motion?: "none" | "curtain";
}

export default function Manifesto({
  eyebrow = "02 — A Maison",
  title = "Rara por natureza.\nEscolhida para permanecer.",
  text =
    "A Esméra reúne objetos preciosos, arte e design em uma curadoria destinada a colecionadores e interiores singulares. Peças escolhidas por sua origem, presença e capacidade de atravessar o tempo.",
  ctaLabel = "Sobre a Esméra",
  ctaHref = "#experience",
  mainImage =
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1500&q=90",
  mainImageAlt = "Interior contemporâneo com arte e objetos minerais",
  secondaryImage =
    "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=800&q=90",
  secondaryImageAlt = "Detalhe de matéria mineral verde",
  motion = "curtain",
}: Props) {
  return (
    <section
      id="about"
      class={`esv-maison esv-maison-${motion}`}
      aria-labelledby="esv-maison-title"
    >
      <div class="esv-maison-frame">
        <div class="esv-shell esv-maison-grid">
          <div class="esv-maison-copy">
            <p class="esv-kicker">{eyebrow}</p>
            <h2 id="esv-maison-title">{title}</h2>
            <p class="esv-maison-text">{text}</p>
            <a href={ctaHref} class="esv-text-link">
              {ctaLabel} <Arrow size={13} />
            </a>
          </div>

          <div class="esv-maison-media">
            <figure class="esv-maison-main">
              <img
                src={mainImage}
                alt={mainImageAlt}
                loading="lazy"
                decoding="async"
                width="1200"
                height="1500"
              />
            </figure>
            <figure class="esv-maison-secondary">
              <img
                src={secondaryImage}
                alt={secondaryImageAlt}
                loading="lazy"
                decoding="async"
                width="600"
                height="800"
              />
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
