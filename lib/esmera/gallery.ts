/**
 * ESMÉRA — lógica de galeria de produto (padrão editorial).
 *
 * Princípio: o formato é da marca, não do arquivo. A chapa (stage) tem
 * proporção constante por breakpoint; cada imagem é montada dentro dela com
 * passe-partout simétrico. Nenhuma imagem é cortada, nenhuma sobra é acidental.
 *
 * Substitui lib/esmera/productMediaPresentation.ts na parte de layout.
 * As funções de zoom/pan (clampViewerTransform, fittedMediaSize) permanecem
 * onde estão — este módulo não trata do visualizador ampliado.
 */

// ---------------------------------------------------------------------------
// Formato canônico
// ---------------------------------------------------------------------------

/** Proporção da chapa. Constante por breakpoint, nunca derivada do produto. */
export const STAGE_RATIO = {
  /** >= 1024px — 3:2, o formato nativo da fotografia da marca. */
  editorial: 3 / 2,
  /** < 1024px — quadrado neutro, trata vertical e horizontal com o mesmo peso. */
  compact: 1,
} as const;

export type StageFormat = keyof typeof STAGE_RATIO;

/**
 * 3:2 divide exatamente em duas células 3:4. É por isso que o par de verticais
 * preenche a chapa sem sobra: a montagem é fechada matematicamente.
 */
export const PAIRED_CELL_RATIO = 3 / 4;

/** Abaixo disto a imagem é emparelhável (retrato ou quadrada). */
export const PAIRABLE_MAX_RATIO = 1.08;

/** Usada quando o Payload não entrega dimensão alguma. */
export const FALLBACK_MEDIA_RATIO = 3 / 2;

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type MediaRole = "cover" | "detail" | "context" | "scale";

export type Orientation = "portrait" | "square" | "landscape" | "unknown";

/** Só o que a galeria precisa saber. Compatível com EsmeraObject["gallery"][n]. */
export interface GalleryMedia {
  key?: string;
  role?: MediaRole | string;
  /** Dimensões do arquivo servido. */
  width?: number;
  height?: number;
  /** Dimensões do original. Preferidas — não sofrem crop de derivativo. */
  fullWidth?: number;
  fullHeight?: number;
}

/**
 * Uma chapa é uma unidade de navegação: o que a pessoa vê entre uma seta e
 * outra. Pode conter uma ou duas imagens.
 */
export interface GalleryPlate {
  /** Índices na lista já ordenada de imagens. */
  indices: number[];
  columns: 1 | 2;
  /**
   * `full`    — a imagem ocupa a largura inteira da chapa (horizontais).
   * `mounted` — meia largura, centrada, passe-partout simétrico dos dois lados
   *             (vertical solitária). Nunca meia chapa vazia à direita.
   */
  mount: "full" | "mounted";
}

// ---------------------------------------------------------------------------
// Classificação
// ---------------------------------------------------------------------------

function positive(value: number | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

/**
 * Proporção real da imagem. Prioriza o original porque derivativos do Payload
 * podem ter crop fixo (width + height na config gera corte, não redimensão).
 */
export function mediaAspectRatio(media: GalleryMedia): number | null {
  const width = positive(media.fullWidth) ? media.fullWidth : media.width;
  const height = positive(media.fullHeight) ? media.fullHeight : media.height;
  if (!positive(width) || !positive(height)) return null;
  return width / height;
}

export function classifyOrientation(media: GalleryMedia): Orientation {
  const ratio = mediaAspectRatio(media);
  if (ratio === null) return "unknown";
  if (ratio < 0.92) return "portrait";
  if (ratio <= PAIRABLE_MAX_RATIO) return "square";
  return "landscape";
}

/** Verticais e quadradas emparelham. Horizontais e desconhecidas, não. */
export function isPairable(media: GalleryMedia): boolean {
  const ratio = mediaAspectRatio(media);
  return ratio !== null && ratio <= PAIRABLE_MAX_RATIO;
}

// ---------------------------------------------------------------------------
// Ordem editorial
// ---------------------------------------------------------------------------

const ROLE_ORDER: readonly string[] = ["cover", "detail", "context", "scale"];

function roleRank(role: string | undefined): number {
  const index = ROLE_ORDER.indexOf(role ?? "");
  return index === -1 ? ROLE_ORDER.length : index;
}

/**
 * Capa, detalhe, contexto, escala. Ordem de leitura de um catálogo, não ordem
 * de upload. Estável dentro de cada papel: quem sobe duas fotos de detalhe
 * mantém a sequência escolhida.
 */
export function orderGalleryMedia<T extends GalleryMedia>(
  media: readonly T[],
): T[] {
  return media
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const delta = roleRank(a.item.role) - roleRank(b.item.role);
      return delta !== 0 ? delta : a.index - b.index;
    })
    .map((entry) => entry.item);
}

// ---------------------------------------------------------------------------
// Plano de chapas
// ---------------------------------------------------------------------------

/**
 * Monta as chapas preservando a ordem editorial.
 *
 * editorial (desktop): duas verticais consecutivas viram um díptico; vertical
 * solitária vira montagem centrada; horizontal ocupa a chapa inteira.
 * compact (tablet/mobile): uma imagem por chapa, sempre.
 */
export function buildGalleryPlates(
  media: readonly GalleryMedia[],
  format: StageFormat,
): GalleryPlate[] {
  if (media.length === 0) return [];

  if (format === "compact") {
    return media.map((_, index) => ({
      indices: [index],
      columns: 1,
      mount: "full",
    }));
  }

  const plates: GalleryPlate[] = [];
  let index = 0;

  while (index < media.length) {
    if (!isPairable(media[index])) {
      plates.push({ indices: [index], columns: 1, mount: "full" });
      index += 1;
      continue;
    }

    const next = media[index + 1];
    if (next && isPairable(next)) {
      plates.push({ indices: [index, index + 1], columns: 2, mount: "full" });
      index += 2;
      continue;
    }

    plates.push({ indices: [index], columns: 1, mount: "mounted" });
    index += 1;
  }

  return plates;
}

// ---------------------------------------------------------------------------
// Consultas
// ---------------------------------------------------------------------------

/** Em que chapa está a imagem N. -1 se não estiver em nenhuma. */
export function plateIndexOfMedia(
  plates: readonly GalleryPlate[],
  mediaIndex: number,
): number {
  return plates.findIndex((plate) => plate.indices.includes(mediaIndex));
}

/**
 * Primeira imagem associada a uma variante, para saltar a galeria quando a
 * pessoa troca de opção. Usa gallery[n].key contra variant.mediaKeys.
 */
export function mediaIndexForKeys(
  media: readonly GalleryMedia[],
  keys: readonly string[],
): number {
  if (keys.length === 0) return -1;
  const wanted = new Set(keys.filter(Boolean));
  return media.findIndex((item) => item.key && wanted.has(item.key));
}

/**
 * Fração da largura da chapa que a célula ocupa. Alimenta o atributo `sizes`:
 * célula de díptico não deve baixar a imagem em largura cheia.
 */
export function cellWidthFraction(plate: GalleryPlate): number {
  return plate.columns === 2 || plate.mount === "mounted" ? 0.5 : 1;
}

/** `sizes` pronto para o <img>, considerando a coluna de mídia do modal. */
export function cellSizes(plate: GalleryPlate): string {
  const fraction = cellWidthFraction(plate);
  const compact = Math.round(100 * fraction);
  const editorial = Math.round(1000 * fraction) / 10;
  return `(max-width: 1023px) ${compact}vw, ${editorial}vw`;
}

/** Rótulo de posição: chapas, não imagens. */
export function plateLabel(current: number, total: number): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(current + 1)} — ${pad(total)}`;
}
