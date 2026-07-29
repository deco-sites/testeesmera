export interface Props {
  eyebrow?: string;
  title?: string;
  /** @format textarea */
  text?: string;
  /** @format image-uri */
  image?: string;
  imageAlt?: string;
}

export default function Context({
  eyebrow = "07 — Objeto em contexto",
  title = "Presença em escala real.",
  text =
    "O ambiente existe para tornar escala, luz e proporção legíveis. A peça permanece o foco; o espaço apenas revela como ela ocupa o mundo.",
  image =
    "https://images.unsplash.com/photo-1771862956454-ad43adc3c19e?auto=format&fit=crop&w=2200&q=90",
  imageAlt = "Objetos escultóricos apresentados em contexto espacial sob luz natural",
}: Props) {
  return (
    <section
      id="context"
      class="esv-context"
      aria-labelledby="esv-context-title"
    >
      <figure class="esv-context-media">
        <img
          src={image}
          alt={imageAlt}
          loading="lazy"
          decoding="async"
          width="2200"
          height="1500"
        />
        <div class="esv-context-shade" aria-hidden="true" />
      </figure>
      <div class="esv-shell esv-context-copy">
        <p class="esv-kicker esv-kicker-light">{eyebrow}</p>
        <h2 id="esv-context-title">{title}</h2>
        <p>{text}</p>
      </div>
    </section>
  );
}
