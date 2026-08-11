export interface MediaDimensions {
  width?: number;
  height?: number;
}

export type TwoImagePresentation = "split" | "stage";

export interface ViewerTransform {
  scale: number;
  x: number;
  y: number;
}

export const MIN_VIEWER_SCALE = 1;
export const MAX_VIEWER_SCALE = 3;
export const TWO_IMAGE_MIN_COVERAGE = 0.66;

function positive(value: number | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function mediaAspectRatio(media: MediaDimensions): number | null {
  if (!positive(media.width) || !positive(media.height)) return null;
  return media.width / media.height;
}

export function getContainCoverage(
  mediaAspect: number,
  panelAspect: number,
): number {
  if (
    !Number.isFinite(mediaAspect) || mediaAspect <= 0 ||
    !Number.isFinite(panelAspect) || panelAspect <= 0
  ) {
    return 0;
  }
  return Math.min(mediaAspect / panelAspect, panelAspect / mediaAspect);
}

export function getTwoImagePresentation(
  images: readonly MediaDimensions[],
  galleryWidth: number,
  galleryHeight: number,
  minCoverage = TWO_IMAGE_MIN_COVERAGE,
): TwoImagePresentation {
  if (images.length !== 2) return "stage";
  if (galleryWidth <= 0 || galleryHeight <= 0) return "stage";

  const panelAspect = (galleryWidth / 2) / galleryHeight;
  const coverages = images.map((image) => {
    const aspect = mediaAspectRatio(image);
    return aspect === null ? 0 : getContainCoverage(aspect, panelAspect);
  });

  return coverages.every((coverage) => coverage >= minCoverage)
    ? "split"
    : "stage";
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
