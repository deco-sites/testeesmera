export interface Evidence {
  title: string;
  text: string;
  /** @format image-uri */
  image: string;
  alt: string;
}

export interface Props {
  eyebrow?: string;
  title?: string;
  /** @format textarea */
  text?: string;
  ctaLabel?: string;
  ctaHref?: string;
  evidence?: Evidence[];
}

const defaultEvidence: Evidence[] = [
  {
    title: "Origem",
    text: "Matéria / procedência",
    image:
      "https://images.unsplash.com/photo-1767433200326-f554d1f745eb?auto=format&fit=crop&w=1200&q=90",
    alt: "Superfície mineral em detalhe, revelando textura e irregularidade",
  },
  {
    title: "Transformação",
    text: "Gesto / acabamento",
    image:
      "https://images.unsplash.com/photo-1777810831386-4a46314e5ece?auto=format&fit=crop&w=1200&q=90",
    alt: "Objeto escultórico escuro apresentado como estudo de forma e acabamento",
  },
  {
    title: "Registro",
    text: "Peça / documentação",
    image:
      "https://images.unsplash.com/photo-1613424777445-f93a2a48e285?auto=format&fit=crop&w=1200&q=90",
    alt: "Objeto de superfície terrosa apresentado sob luz natural",
  },
];

const archiveStyles = `
  .esv-provenance.esv-provenance-archive {
    display: flex;
    flex-direction: column;
    min-height: 96svh;
    padding: 0;
    overflow: hidden;
    background: var(--color-paper-2, #f8f6f1);
    color: var(--color-ink, #151515);
  }

  .esv-provenance-archive .esv-provenance-head {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 24px;
    align-items: start;
    width: 100%;
    padding-top: clamp(26px, 3vw, 42px);
  }

  .esv-provenance-archive .esv-provenance-head > .esv-kicker {
    grid-column: 1;
    margin: 0;
    color: var(--color-muted, #6f716f);
    font-size: 10px;
    font-weight: 400;
    letter-spacing: .04em;
    text-transform: none;
  }

  .esv-provenance-archive .esv-provenance-head h2 {
    grid-column: 2;
    max-width: none;
    margin: -3px 0 0;
    color: var(--color-ink, #151515);
    font-size: clamp(22px, 2vw, 30px);
    font-weight: 500;
    line-height: 1;
    letter-spacing: -.045em;
    text-align: center;
    white-space: nowrap;
  }

  .esv-provenance-archive-mark {
    grid-column: 3;
    justify-self: end;
    margin: 0;
    color: var(--color-muted, #6f716f);
    font-size: 10px;
    line-height: 1.35;
    text-align: right;
  }

  .esv-provenance-archive .esv-provenance-evidence {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 4px;
    width: min(68vw, 920px);
    margin: clamp(130px, 18vh, 220px) auto 0;
    padding: 0;
    border: 0;
  }

  .esv-provenance-archive .esv-provenance-evidence article,
  .esv-provenance-archive .esv-provenance-evidence article + article {
    min-width: 0;
    min-height: 0;
    padding: 0;
    border: 0;
  }

  .esv-provenance-archive-media {
    position: relative;
    aspect-ratio: 1.08 / 1;
    margin: 0;
    overflow: hidden;
    background: var(--color-stone, #c3c5c2);
  }

  .esv-provenance-archive-media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: saturate(.72) contrast(.96);
    transform: scale(1.002);
    transition: transform 700ms var(--ease-luxury, cubic-bezier(.22, 1, .36, 1)), filter 500ms ease;
  }

  .esv-provenance-archive .esv-provenance-evidence article:first-child img {
    filter: grayscale(1) contrast(.9);
  }

  .esv-provenance-archive .esv-provenance-evidence article:nth-child(2) img {
    object-position: center 46%;
  }

  .esv-provenance-archive .esv-provenance-evidence article:last-child img {
    filter: saturate(.52) contrast(.94);
  }

  .esv-provenance-archive-caption {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin-top: 9px;
    color: var(--color-muted, #6f716f);
    font-size: 9px;
    line-height: 1.3;
  }

  .esv-provenance-archive-caption strong {
    color: var(--color-ink, #151515);
    font-weight: 400;
  }

  .esv-provenance-archive .esv-provenance-evidence article:nth-child(2) .esv-provenance-archive-caption {
    justify-content: center;
    text-align: center;
  }

  .esv-provenance-archive .esv-provenance-evidence article:last-child .esv-provenance-archive-caption {
    flex-direction: row-reverse;
    text-align: right;
  }

  .esv-provenance-archive-bottom {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: var(--esv-grid-gap, 24px);
    align-items: end;
    width: 100%;
    margin-top: auto;
    padding-bottom: clamp(28px, 3.5vw, 52px);
  }

  .esv-provenance-intro {
    grid-column: 1 / span 4;
    max-width: 45ch;
    margin: clamp(74px, 10vh, 120px) 0 0;
    color: var(--color-muted, #6f716f);
    font-size: 12px;
    font-weight: 300;
    line-height: 1.55;
  }

  .esv-provenance-archive-link {
    display: inline-flex;
    align-items: center;
    min-height: 34px;
    margin-top: 8px;
    color: var(--color-ink, #151515);
    border-bottom: 1px solid color-mix(in srgb, var(--color-ink, #151515) 50%, transparent);
    font-size: 10px;
    text-decoration: none;
  }

  .esv-provenance-archive-note {
    grid-column: 10 / -1;
    justify-self: end;
    margin: 0;
    color: var(--color-muted, #6f716f);
    font-size: 9px;
    line-height: 1.4;
    text-align: right;
  }

  @media (hover: hover) and (pointer: fine) {
    .esv-provenance-archive .esv-provenance-evidence article:hover img {
      filter: none;
      transform: scale(1.018);
    }
  }

  @media (max-width: 899px) {
    .esv-provenance.esv-provenance-archive {
      min-height: auto;
      padding-bottom: 64px;
    }

    .esv-provenance-archive .esv-provenance-head {
      grid-template-columns: 1fr auto;
    }

    .esv-provenance-archive .esv-provenance-head h2 {
      grid-column: 2;
    }

    .esv-provenance-archive-mark {
      display: none;
    }

    .esv-provenance-archive .esv-provenance-evidence {
      width: calc(100% - 2 * var(--esv-page-x, 28px));
      margin-top: 110px;
    }

    .esv-provenance-archive-bottom {
      margin-top: 96px;
    }

    .esv-provenance-intro {
      grid-column: 1 / span 6;
      margin-top: 0;
    }
  }

  @media (max-width: 767px) {
    .esv-provenance-archive .esv-provenance-head {
      display: flex;
      justify-content: space-between;
      gap: 24px;
    }

    .esv-provenance-archive .esv-provenance-head h2 {
      margin-left: auto;
      font-size: 20px;
      text-align: right;
    }

    .esv-provenance-archive .esv-provenance-evidence {
      display: flex;
      width: 100%;
      margin-top: 76px;
      padding-left: var(--esv-page-x, 20px);
      overflow-x: auto;
      scroll-snap-type: x proximity;
      scrollbar-width: none;
    }

    .esv-provenance-archive .esv-provenance-evidence::-webkit-scrollbar {
      display: none;
    }

    .esv-provenance-archive .esv-provenance-evidence article {
      flex: 0 0 76vw;
      scroll-snap-align: start;
    }

    .esv-provenance-archive-bottom {
      display: block;
      margin-top: 72px;
    }

    .esv-provenance-intro {
      max-width: 32ch;
      margin: 0;
      font-size: 12px;
    }

    .esv-provenance-archive-note {
      margin-top: 48px;
      text-align: left;
    }
  }
`;

export default function Provenance({
  eyebrow = "06 — Proveniência",
  title = "Proveniência",
  text =
    "Cada peça é lida a partir de três evidências: a origem da matéria, o gesto de transformação e o registro que acompanha sua permanência.",
  ctaLabel = "Conhecer o processo",
  ctaHref = "#experience",
  evidence = defaultEvidence,
}: Props) {
  return (
    <section
      id="provenance"
      class="esv-provenance esv-provenance-archive"
      aria-labelledby="esv-provenance-title"
    >
      <style>{archiveStyles}</style>

      <div class="esv-shell esv-provenance-head">
        <p class="esv-kicker">{eyebrow}</p>
        <h2 id="esv-provenance-title">{title}</h2>
        <p class="esv-provenance-archive-mark">Arquivo Esméra<br />Matéria · Forma · Registro</p>
      </div>

      <div class="esv-provenance-evidence" aria-label="Estudos de proveniência">
        {evidence.slice(0, 3).map((item) => (
          <article>
            <figure class="esv-provenance-archive-media">
              <img
                src={item.image}
                alt={item.alt}
                loading="lazy"
                decoding="async"
                width="960"
                height="900"
              />
            </figure>
            <div class="esv-provenance-archive-caption">
              <strong>{item.title}</strong>
              <span>{item.text}</span>
            </div>
          </article>
        ))}
      </div>

      <div class="esv-shell esv-provenance-archive-bottom">
        <div class="esv-provenance-intro">
          <p>{text}</p>
          <a class="esv-provenance-archive-link" href={ctaHref}>{ctaLabel}</a>
        </div>
        <p class="esv-provenance-archive-note">Esméra · arquivo de matéria<br />Curadoria e documentação</p>
      </div>
    </section>
  );
}
