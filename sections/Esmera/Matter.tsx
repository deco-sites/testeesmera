import SpatialMatter, {
  type MatterPanel,
} from "../../islands/SpatialMatter.tsx";

export interface Props {
  eyebrow?: string;
  title?: string;
  /** @format textarea */
  text?: string;
  panels?: MatterPanel[];
}

const defaultPanels: MatterPanel[] = [
  {
    image:
      "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=2200&q=90",
    alt: "Superfície mineral verde em escala ampliada",
    caption: "Cor / profundidade",
  },
  {
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2200&q=90",
    alt: "Paisagem mineral em grande escala",
    caption: "Origem / escala",
  },
  {
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2200&q=90",
    alt: "Objeto mineral inserido em interior contemporâneo",
    caption: "Objeto / espaço",
  },
  {
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=2200&q=90",
    alt: "Arquitetura em tons minerais e luz natural",
    caption: "Matéria / permanência",
  },
];

export default function Matter({
  eyebrow = "04 — Matéria",
  title = "Matéria preciosa. Beleza que permanece.",
  text =
    "Cada pedra, uma história. Cada formação, um instante raro transformado em permanência.",
  panels = defaultPanels,
}: Props) {
  return (
    <div id="matter">
      <SpatialMatter
        eyebrow={eyebrow}
        title={title}
        text={text}
        panels={panels}
      />
    </div>
  );
}
