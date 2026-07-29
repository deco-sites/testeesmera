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
  eyebrow = "Consulta privada",
  title = "Encontrar a peça certa é parte da curadoria.",
  text =
    "Converse com a Esméra para disponibilidade, encomendas, seleção para um espaço ou apresentação privada de peças.",
  ctaLabel = "Iniciar conversa",
  ctaHref = "mailto:contact@esmera.com?subject=Consulta%20privada%20%E2%80%94%20Esm%C3%A9ra",
}: Props) {
  return (
    <section
      id="private"
      class="esv-private"
      aria-labelledby="esv-private-title"
    >
      <div class="esv-shell esv-private-grid">
        <p class="esv-kicker esv-kicker-light">{eyebrow}</p>
        <div class="esv-private-copy">
          <h2 id="esv-private-title">{title}</h2>
          <p>{text}</p>
          <a class="esv-private-cta" href={ctaHref}>
            {ctaLabel} <Arrow size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
