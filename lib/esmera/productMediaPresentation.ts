export interface MediaDimensions {
  width?: number;
  height?: number;
  fullWidth?: number;
  fullHeight?: number;
}

export type Orientation = "portrait" | "landscape" | "unknown";

export interface GallerySlide {
  kind: "single" | "pair";
  indices: number[];
  ratio: number;
}

export type GalleryLayout = "desktop" | "compact";

export interface ViewerTransform {
  scale: number;
  x: number;
  y: number;
}

export const MIN_VIEWER_SCALE = 1;
export const MAX_VIEWER_SCALE = 3;
export const PORTRAIT_MAX_RATIO = 0.95;
export const PAIR_GAP_PX = 0;
export const FALLBACK_MEDIA_RATIO = 4 / 5;
export const DESKTOP_MIN_FRAME_RATIO = 4 / 5;
export const COMPACT_MIN_FRAME_RATIO = 3 / 4;
export const MAX_FRAME_RATIO = 16 / 9;

function positive(value: number | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function mediaAspectRatio(media: MediaDimensions): number | null {
  const width = positive(media.fullWidth) ? media.fullWidth : media.width;
  const height = positive(media.fullHeight) ? media.fullHeight : media.height;
  if (!positive(width) || !positive(height)) return null;
  return width / height;
}

export function classifyOrientation(media: MediaDimensions): Orientation {
  const ratio = mediaAspectRatio(media);
  if (ratio === null) return "unknown";
  return ratio <= PORTRAIT_MAX_RATIO ? "portrait" : "landscape";
}

function ratioOrFallback(media: MediaDimensions): number {
  return mediaAspectRatio(media) ?? FALLBACK_MEDIA_RATIO;
}

export function buildGallerySlides(
  images: readonly MediaDimensions[],
  layout: GalleryLayout,
): GallerySlide[] {
  if (layout === "compact") {
    return images.map((image, index) => ({
      kind: "single",
      indices: [index],
      ratio: ratioOrFallback(image),
    }));
  }

  const slides: GallerySlide[] = [];
  let index = 0;
  while (index < images.length) {
    const image = images[index];
    if (classifyOrientation(image) !== "portrait") {
      slides.push({
        kind: "single",
        indices: [index],
        ratio: ratioOrFallback(image),
      });
      index += 1;
      continue;
    }

    const next = images[index + 1];
    const pairIndices = next && classifyOrientation(next) === "portrait"
      ? [index, index + 1]
      : [index];
    const pairRatios = pairIndices.map((mediaIndex) =>
      ratioOrFallback(images[mediaIndex])
    );
    slides.push({
      kind: "pair",
      indices: pairIndices,
      ratio: 2 * Math.min(...pairRatios),
    });
    index += pairIndices.length;
  }
  return slides;
}

export function calculateGalleryFrameRatio(
  slides: readonly GallerySlide[],
  layout: GalleryLayout,
): number {
  const minimum = layout === "desktop"
    ? DESKTOP_MIN_FRAME_RATIO
    : COMPACT_MIN_FRAME_RATIO;
  const raw = slides.length > 0
    ? Math.min(...slides.map((slide) => slide.ratio))
    : FALLBACK_MEDIA_RATIO;
  return Math.min(MAX_FRAME_RATIO, Math.max(minimum, raw));
}

export function clampViewerScale(scale: number): number {
  if (!Number.isFinite(scale)) return MIN_VIEWER_SCALE;
  return Math.min(MAX_VIEWER_SCALE, Math.max(MIN_VIEWER_SCALE, scale));
}

export function fittedMediaSize(
  stageWidth: number,
  stageHeight: number,
  mediaWidth: number,
  mediaHeight: number,
): { width: number; height: number } {
  if (
    stageWidth <= 0 || stageHeight <= 0 ||
    mediaWidth <= 0 || mediaHeight <= 0
  ) {
    return { width: 0, height: 0 };
  }

  const ratio = Math.min(stageWidth / mediaWidth, stageHeight / mediaHeight);
  return {
    width: mediaWidth * ratio,
    height: mediaHeight * ratio,
  };
}

export function clampViewerTransform(
  transform: ViewerTransform,
  stageWidth: number,
  stageHeight: number,
  mediaWidth: number,
  mediaHeight: number,
): ViewerTransform {
  const scale = clampViewerScale(transform.scale);
  if (scale === 1) return { scale: 1, x: 0, y: 0 };

  const fitted = fittedMediaSize(
    stageWidth,
    stageHeight,
    mediaWidth,
    mediaHeight,
  );
  const overflowX = Math.max(0, (fitted.width * scale - stageWidth) / 2);
  const overflowY = Math.max(0, (fitted.height * scale - stageHeight) / 2);

  return {
    scale,
    x: Math.max(-overflowX, Math.min(overflowX, transform.x)),
    y: Math.max(-overflowY, Math.min(overflowY, transform.y)),
  };
}
