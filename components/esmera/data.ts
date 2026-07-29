export interface EsmeraObject {
  id: string;
  code: string;
  category: string;
  material: string;
  title: string;
  subtitle: string;
  image: string;
  detailImage: string;
  description: string;
  alt: string;
  price: string;
  availability: string;
  searchTerms?: string[];
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
    code: "OBJ—01",
    category: "Escultura",
    material: "Pedra / superfície mineral",
    title: "Nódulo I",
    subtitle: "Escultura de presença mineral",
    image:
      "https://images.unsplash.com/photo-1767433200326-f554d1f745eb?auto=format&fit=crop&w=1400&q=88",
    detailImage:
      "https://images.unsplash.com/photo-1767433200326-f554d1f745eb?auto=format&fit=crop&w=1000&q=92",
    description:
      "Forma escultórica definida pelo peso visual, pela textura e pela irregularidade da superfície mineral.",
    alt: "Escultura abstrata de pedra com volumes orgânicos empilhados",
    price: "Sob consulta",
    availability: "Peça única",
    searchTerms: ["pedra", "mineral", "escultura", "peça única"],
  },
  {
    id: "selected-02",
    code: "OBJ—02",
    category: "Vaso",
    material: "Cerâmica / esmalte azul",
    title: "Íris I",
    subtitle: "Vaso de proporção alongada",
    image:
      "https://images.unsplash.com/photo-1526198049595-f32cde2a219d?auto=format&fit=crop&w=1400&q=88",
    detailImage:
      "https://images.unsplash.com/photo-1526198049595-f32cde2a219d?auto=format&fit=crop&w=1000&q=92",
    description:
      "Vaso de silhueta contínua, apresentado com leitura frontal clara de escala, forma e acabamento.",
    alt: "Vaso azul de silhueta alongada sobre fundo claro",
    price: "R$ 12.600",
    availability: "Pronta entrega",
    searchTerms: ["vaso", "cerâmica", "azul", "pronta entrega"],
  },
  {
    id: "selected-03",
    code: "OBJ—03",
    category: "Objeto",
    material: "Cerâmica / acabamento escuro",
    title: "Umbra I",
    subtitle: "Objeto escultórico de pequena escala",
    image:
      "https://images.unsplash.com/photo-1777810831386-4a46314e5ece?auto=format&fit=crop&w=1400&q=88",
    detailImage:
      "https://images.unsplash.com/photo-1777810831386-4a46314e5ece?auto=format&fit=crop&w=1000&q=92",
    description:
      "Objeto de perfil escultórico em que contorno, sombra e matéria definem a presença no espaço.",
    alt: "Vaso escultórico de acabamento escuro em fundo preto",
    price: "Sob consulta",
    availability: "Sob encomenda",
    searchTerms: ["objeto", "cerâmica", "escuro", "sob encomenda"],
  },
  {
    id: "selected-04",
    code: "OBJ—04",
    category: "Vaso",
    material: "Cerâmica / superfície terrosa",
    title: "Terra I",
    subtitle: "Vaso de presença tátil",
    image:
      "https://images.unsplash.com/photo-1613424777445-f93a2a48e285?auto=format&fit=crop&w=1400&q=88",
    detailImage:
      "https://images.unsplash.com/photo-1613424777445-f93a2a48e285?auto=format&fit=crop&w=1000&q=92",
    description:
      "Vaso de superfície quente e tátil, apresentado em luz lateral para revelar volume e textura.",
    alt: "Vaso de superfície terrosa iluminado por luz lateral quente",
    price: "R$ 7.800",
    availability: "Pronta entrega",
    searchTerms: ["vaso", "cerâmica", "terra", "pronta entrega"],
  },
];

export const collectionObjects: EsmeraObject[] = [
  {
    id: "collection-01",
    code: "COL—01",
    category: "Escultura",
    material: "Pedra / superfície mineral",
    title: "Nódulo II",
    subtitle: "Estudo de forma e densidade",
    image:
      "https://images.unsplash.com/photo-1767433200326-f554d1f745eb?auto=format&fit=crop&w=1600&q=88",
    detailImage:
      "https://images.unsplash.com/photo-1767433200326-f554d1f745eb?auto=format&fit=crop&w=1100&q=92",
    description:
      "Estudo escultórico que evidencia irregularidade, massa e superfície como atributos centrais da peça.",
    alt: "Escultura mineral abstrata de volumes orgânicos",
    price: "Sob consulta",
    availability: "Peça única",
    searchTerms: ["escultura", "pedra", "mineral", "peça única"],
  },
  {
    id: "collection-02",
    code: "COL—02",
    category: "Vaso",
    material: "Cerâmica / esmalte azul",
    title: "Íris II",
    subtitle: "Vaso de perfil contínuo",
    image:
      "https://images.unsplash.com/photo-1526198049595-f32cde2a219d?auto=format&fit=crop&w=1600&q=88",
    detailImage:
      "https://images.unsplash.com/photo-1526198049595-f32cde2a219d?auto=format&fit=crop&w=1100&q=92",
    description:
      "Peça de proporção vertical construída para leitura imediata de silhueta e acabamento.",
    alt: "Vaso azul sobre fundo neutro em fotografia de objeto",
    price: "R$ 14.800",
    availability: "Sob encomenda",
    searchTerms: ["vaso", "cerâmica", "azul", "sob encomenda"],
  },
  {
    id: "collection-03",
    code: "COL—03",
    category: "Objeto",
    material: "Cerâmica / acabamento escuro",
    title: "Umbra II",
    subtitle: "Objeto de luz e sombra",
    image:
      "https://images.unsplash.com/photo-1777810831386-4a46314e5ece?auto=format&fit=crop&w=1600&q=88",
    detailImage:
      "https://images.unsplash.com/photo-1777810831386-4a46314e5ece?auto=format&fit=crop&w=1100&q=92",
    description:
      "Objeto de pequena escala concebido para ser percebido primeiro pela forma e depois pela textura.",
    alt: "Objeto cerâmico escultórico fotografado em fundo escuro",
    price: "Sob consulta",
    availability: "Edição limitada",
    searchTerms: ["objeto", "cerâmica", "escuro", "edição limitada"],
  },
  {
    id: "collection-04",
    code: "COL—04",
    category: "Vaso",
    material: "Cerâmica / superfície terrosa",
    title: "Terra II",
    subtitle: "Vaso de textura natural",
    image:
      "https://images.unsplash.com/photo-1613424777445-f93a2a48e285?auto=format&fit=crop&w=1600&q=88",
    detailImage:
      "https://images.unsplash.com/photo-1613424777445-f93a2a48e285?auto=format&fit=crop&w=1100&q=92",
    description:
      "Vaso de superfície marcada, com luz rasante para tornar a matéria legível antes do contexto.",
    alt: "Vaso terroso em composição de luz natural",
    price: "R$ 9.600",
    availability: "Pronta entrega",
    searchTerms: ["vaso", "cerâmica", "terra", "pronta entrega"],
  },
];

export const journalEntries: JournalEntry[] = [
  {
    category: "Matéria",
    title: "A superfície como origem",
    excerpt:
      "Textura, densidade e variação natural como critérios de escolha e permanência.",
    image:
      "https://images.unsplash.com/photo-1767433200326-f554d1f745eb?auto=format&fit=crop&w=1200&q=88",
    alt: "Detalhe de escultura em pedra com superfície irregular",
  },
  {
    category: "Espaço",
    title: "Como o objeto ocupa o ambiente",
    excerpt:
      "Escala, distância e luz como parte da forma de perceber uma peça rara.",
    image:
      "https://images.unsplash.com/photo-1771862956454-ad43adc3c19e?auto=format&fit=crop&w=1200&q=88",
    alt: "Objetos escultóricos apresentados em prateleira de interior contemporâneo",
  },
  {
    category: "Permanência",
    title: "Escolher para atravessar o tempo",
    excerpt:
      "Uma leitura sobre contenção, materialidade e o valor de objetos que permanecem.",
    image:
      "https://images.unsplash.com/photo-1613424777445-f93a2a48e285?auto=format&fit=crop&w=1200&q=88",
    alt: "Vaso de superfície terrosa sob luz natural",
  },
];
