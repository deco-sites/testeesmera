export interface EsmeraObject {
  id: string;
  code: string;
  category: string;
  title: string;
  subtitle: string;
  image: string;
  detailImage: string;
  description: string;
  alt: string;
  price: string;
  availability: string;
}

export interface JournalEntry {
  category: string;
  title: string;
  excerpt: string;
  image: string;
  alt: string;
}

export const selectedObjects: EsmeraObject[] = [
  {
    id: "selected-01",
    code: "01",
    category: "Objeto",
    title: "Esméra Signet I",
    subtitle: "Diamante / ouro rosé / cravação única",
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=88",
    detailImage:
      "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=1200&q=90",
    description:
      "Anel de presença escultórica em que matéria preciosa, proporção e luz são tratados como uma única composição.",
    alt: "Anel com diamante em composição de luxo sobre fundo escuro",
    price: "R$ 18.900",
    availability: "Disponível",
  },
  {
    id: "selected-02",
    code: "02",
    category: "Arte",
    title: "Interior Composition I",
    subtitle: "Arte / objeto / composição espacial",
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=88",
    detailImage:
      "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=1200&q=88",
    description:
      "Peça de parede apresentada como estudo de proporção, superfície e materialidade mineral.",
    alt: "Interior contemporâneo com arte e objetos selecionados",
    price: "Sob consulta",
    availability: "Peça única",
  },
  {
    id: "selected-03",
    code: "03",
    category: "Objeto",
    title: "Brilliant Study I",
    subtitle: "Diamante / transparência / luz",
    image:
      "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=1200&q=90",
    detailImage:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=90",
    description:
      "Um estudo de objeto em que volume, transparência e luz constroem a percepção da matéria.",
    alt: "Diamantes lapidados sobre fundo escuro",
    price: "R$ 12.600",
    availability: "Sob encomenda",
  },
  {
    id: "selected-04",
    code: "04",
    category: "Acessório",
    title: "Sapphire Drop I",
    subtitle: "Safira / diamante / ouro branco",
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=90",
    detailImage:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=88",
    description:
      "Objeto de pequena escala pensado como gesto preciso entre função, equilíbrio e presença material.",
    alt: "Brincos de safira e diamantes sobre folha verde",
    price: "R$ 7.800",
    availability: "Disponível",
  },
];

export const collectionObjects: EsmeraObject[] = [
  {
    id: "collection-01",
    code: "OBJ—01",
    category: "Objetos",
    title: "Brilliant Composition",
    subtitle: "Seleção de diamantes / curadoria privada",
    image:
      "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=1400&q=90",
    detailImage:
      "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=1200&q=90",
    description:
      "Objeto escultórico apresentado como estudo de forma, densidade e matéria preciosa.",
    alt: "Seleção de diamantes lapidados sobre fundo escuro",
    price: "R$ 16.400",
    availability: "Disponível",
  },
  {
    id: "collection-02",
    code: "ART—02",
    category: "Arte",
    title: "Esméra Signet II",
    subtitle: "Diamante / ouro rosé / peça de assinatura",
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1400&q=88",
    detailImage:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=90",
    description:
      "Composição de parede que investiga cor, superfície e presença mineral no espaço.",
    alt: "Anel de diamante em fundo escuro",
    price: "Sob consulta",
    availability: "Peça única",
  },
  {
    id: "collection-03",
    code: "ACC—03",
    category: "Acessórios",
    title: "Collected Interior",
    subtitle: "Arte / objetos / composição espacial",
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1400&q=88",
    detailImage:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=88",
    description:
      "Acessório de caráter escultórico em que utilidade e materialidade são tratadas com a mesma precisão.",
    alt: "Interior arquitetônico em tons minerais",
    price: "R$ 6.900",
    availability: "Disponível",
  },
  {
    id: "collection-04",
    code: "LIM—04",
    category: "Edições limitadas",
    title: "Sapphire Drop II",
    subtitle: "Safira / diamante / estudo limitado",
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1400&q=88",
    detailImage:
      "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=1200&q=90",
    description:
      "Estudo para uma peça especial concebida a partir de textura, luz e singularidade da matéria.",
    alt: "Brincos de safira e diamantes em composição editorial",
    price: "R$ 22.800",
    availability: "Edição de 8",
  },
];

export const journalEntries: JournalEntry[] = [
  {
    category: "Matter",
    title: "The language of emerald",
    excerpt:
      "Cor, transparência e irregularidade como elementos de presença no espaço contemporâneo.",
    image:
      "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=1200&q=90",
    alt: "Pedra verde preciosa em detalhe",
  },
  {
    category: "Spaces",
    title: "Objects in space",
    excerpt:
      "Escala, distância e luz como parte da forma de perceber um objeto precioso.",
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=88",
    alt: "Interior contemporâneo com mobiliário e objetos",
  },
  {
    category: "Stories",
    title: "Nature, edited",
    excerpt:
      "Uma reflexão sobre contenção, composição e a permanência da matéria natural.",
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=88",
    alt: "Interior arquitetônico em tons minerais",
  },
];
