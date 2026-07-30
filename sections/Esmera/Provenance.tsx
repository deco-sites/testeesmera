export interface Evidence {
  title: string;
  text: string;
}

export interface Props {
  eyebrow?: string;
  title?: string;
  /** @format textarea */
  text?: string;
  /** @format image-uri */
  image?: string;
  imageAlt?: string;
  evidence?: Evidence[];
}

const defaultEvidence: Evidence[] = [
  {
    title: "Origem",
    text:
      "A ficha individual declara matéria principal, características naturais e origem quando a informação é verificável.",
  },
  {
    title: "Transformação",
    text:
      "Acabamento, montagem, variações de superfície e gesto construtivo são registrados como parte da leitura da peça.",
  },
  {
    title: "Registro",
    text:
      "Status de peça única ou edição, documentação e registro fotográfico acompanham a apresentação e a consulta.",
  },
];

export default function Provenance({
  eyebrow = "06 — Proveniência / making",
  title = "Da matéria ao registro.",
  text =
    "Proveniência é parte do valor. A Esméra apresenta o que pode ser documentado sobre matéria, transformação e singularidade antes da aquisição.",
  image =
    "https://images.unsplash.com/photo-1767433200326-f554d1f745eb?auto=format&fit=crop&w=2000&q=90",
  imageAlt = "Superfície mineral em detalhe, revelando textura e irregularidade",
  evidence = defaultEvidence,
}: Props) {
  return (
    <section
      id="provenance"
      class="esv-provenance"
      aria-labelledby="esv-provenance-title"
    >
      <div class="esv-shell esv-provenance-head">
        <p class="esv-kicker esv-kicker-light">{eyebrow}</p>
        <h2 id="esv-provenance-title">{title}</h2>
        <p class="esv-provenance-intro">{text}</p>
      </div>

      <div class="esv-shell esv-provenance-evidence">
        {evidence.slice(0, 3).map((item, index) => (
          <article>
            <small>0{index + 1}</small>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </div>

      <figure class="esv-provenance-strip">
        <img
          src={image}
          alt={imageAlt}
          loading="lazy"
          decoding="async"
          width="2000"
          height="720"
        />
      </figure>
    </section>
  );
}
