import Arrow from "../../components/esmera/Arrow.tsx";

export interface Props {
  eyebrow?: string;
  title?: string;
  /** @format textarea */
  text?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export default function PrivateInvitation({
  eyebrow = "08 — Private Client",
  title = "Encontrar a peça certa é parte da curadoria.",
  text =
    "Converse com a Esméra para uma seleção orientada, disponibilidade, encomendas ou apresentação privada de peças.",
  ctaLabel = "Iniciar uma consulta",
  ctaHref = "",
}: Props) {
  if (!ctaHref) return null;
  return (
    <section
      id="private"
      class="esv-private"
      aria-labelledby="esv-private-title"
    >
      <div class="esv-shell esv-private-grid">
        <p
          class="esv-kicker esv-kicker-light"
          data-motion="reveal"
          data-motion-order="0"
        >
          {eyebrow}
        </p>
        <div
          class="esv-private-copy"
          data-motion="reveal"
          data-motion-order="1"
        >
          <h2 id="esv-private-title">{title}</h2>
          {text && <p>{text}</p>}
          {ctaLabel && (
            <a class="esv-private-cta" href={ctaHref}>
              {ctaLabel} <Arrow size={14} />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
