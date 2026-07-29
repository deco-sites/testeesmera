import SpatialMatter, {
  type MatterPanel,
} from "../../islands/SpatialMatter.tsx";

export interface Props {
  eyebrow?: string;
  title?: string;
  /** @format textarea */
  text?: string;
  panels?: MatterPanel[];
  ctaLabel?: string;
  ctaHref?: string;
}

const defaultPanels: MatterPanel[] = [
  {
    image:
      "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=1800&q=90",
    alt: "Superfície mineral verde em escala ampliada",
    caption: "Cor / profundidade",
  },
  {
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1800&q=90",
    alt: "Objeto mineral inserido em interior contemporâneo",
    caption: "Objeto / espaço",
  },
  {
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1800&q=90",
    alt: "Arquitetura em tons minerais e luz natural",
    caption: "Matéria / permanência",
  },
];

export default function Matter({
  eyebrow = "04 — MATTER / GALLERY",
  title = "Matéria preciosa.\nBeleza que permanece.",
  text =
    "Cada pedra, uma história. Cada formação, um instante raro transformado em permanência. Da natureza para o espaço, a matéria revela sua luz, sua raridade e sua força silenciosa.",
  panels = defaultPanels,
  ctaLabel = "Explorar a galeria",
  ctaHref = "#objects",
}: Props) {
  return (
    <div id="matter">
      <SpatialMatter
        eyebrow={eyebrow}
        title={title}
        text={text}
        panels={panels.slice(0, 3)}
        ctaLabel={ctaLabel}
        ctaHref={ctaHref}
      />
    </div>
  );
}
