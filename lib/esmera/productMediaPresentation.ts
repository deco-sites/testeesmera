export interface ViewerTransform {
  scale: number;
  x: number;
  y: number;
}

export const MIN_VIEWER_SCALE = 1;
export const MAX_VIEWER_SCALE = 3;

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
