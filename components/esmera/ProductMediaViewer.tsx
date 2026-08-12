import type { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import {
  clampViewerScale,
  clampViewerTransform,
  type ViewerTransform,
} from "../../lib/esmera/productMediaPresentation.ts";

export interface ProductViewerMedia {
  src: string;
  fullSrc?: string;
  alt: string;
  width?: number;
  height?: number;
  fullWidth?: number;
  fullHeight?: number;
}

interface Props {
  images: ProductViewerMedia[];
  index: number;
  title: string;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "a[href]",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
      <path
        d="M5 5l14 14M19 5 5 19"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-width="1.25"
      />
    </svg>
  );
}

function ArrowIcon({ direction }: { direction: "previous" | "next" }) {
  const path = direction === "previous"
    ? "M19 12H5m6-6-6 6 6 6"
    : "M5 12h14m-6-6 6 6-6 6";
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22">
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.2"
      />
    </svg>
  );
}

function distance(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

const INITIAL_TRANSFORM: ViewerTransform = { scale: 1, x: 0, y: 0 };

export default function ProductMediaViewer({
  images,
  index,
  title,
  onIndexChange,
  onClose,
}: Props) {
  const [transform, setTransform] = useState<ViewerTransform>(
    INITIAL_TRANSFORM,
  );
  const transformRef = useRef<ViewerTransform>(INITIAL_TRANSFORM);
  const dialogRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const dragRef = useRef<
    | {
      pointerId: number;
      x: number;
      y: number;
      originX: number;
      originY: number;
    }
    | null
  >(null);
  const swipeRef = useRef<
    { pointerId: number; x: number; y: number; startedAt: number } | null
  >(null);
  const pinchRef = useRef<{ distance: number; scale: number } | null>(null);
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(
    null,
  );
  const lastTouchPointerAtRef = useRef(0);
  const current = images[index];

  const clampToStage = (next: ViewerTransform): ViewerTransform => {
    const stage = stageRef.current;
    const image = imageRef.current;
    if (!stage || !image) {
      return {
        scale: clampViewerScale(next.scale),
        x: next.scale <= 1 ? 0 : next.x,
        y: next.scale <= 1 ? 0 : next.y,
      };
    }
    const stageRect = stage.getBoundingClientRect();
    const mediaWidth = current.fullWidth || current.width || image.naturalWidth;
    const mediaHeight = current.fullHeight || current.height ||
      image.naturalHeight;
    return clampViewerTransform(
      next,
      stageRect.width,
      stageRect.height,
      mediaWidth,
      mediaHeight,
    );
  };

  const commitTransform = (next: ViewerTransform): ViewerTransform => {
    const clamped = clampToStage(next);
    transformRef.current = clamped;
    setTransform(clamped);
    return clamped;
  };

  const resetTransform = () => {
    transformRef.current = INITIAL_TRANSFORM;
    setTransform(INITIAL_TRANSFORM);
  };

  const changeIndex = (delta: number) => {
    if (images.length < 2) return;
    resetTransform();
    onIndexChange((index + delta + images.length) % images.length);
  };

  const setScale = (scale: number) => {
    commitTransform({ ...transformRef.current, scale });
  };

  const zoomBy = (delta: number) => {
    setScale(transformRef.current.scale + delta);
  };

  useEffect(() => {
    resetTransform();
    pointersRef.current.clear();
    dragRef.current = null;
    swipeRef.current = null;
    pinchRef.current = null;
  }, [index]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => closeRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (images.length < 2 || typeof Image === "undefined") return;
    const previous = images[(index - 1 + images.length) % images.length];
    const next = images[(index + 1) % images.length];
    for (const media of [previous, next]) {
      const preload = new Image();
      preload.src = media.fullSrc || media.src;
    }
  }, [images, index]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key === "ArrowLeft" && images.length > 1) {
        event.preventDefault();
        changeIndex(-1);
        return;
      }
      if (event.key === "ArrowRight" && images.length > 1) {
        event.preventDefault();
        changeIndex(1);
        return;
      }
      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        zoomBy(0.5);
        return;
      }
      if (event.key === "-") {
        event.preventDefault();
        zoomBy(-0.5);
        return;
      }
      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;
      const items = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => element.offsetParent !== null);
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    globalThis.addEventListener("keydown", onKeyDown);
    return () => globalThis.removeEventListener("keydown", onKeyDown);
  }, [images, index]);

  const handlePointerDown = (
    event: JSX.TargetedPointerEvent<HTMLDivElement>,
  ) => {
    if (event.pointerType === "touch") {
      lastTouchPointerAtRef.current = performance.now();
    }
    event.currentTarget.setPointerCapture?.(event.pointerId);
    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    const currentTransform = transformRef.current;
    if (pointersRef.current.size === 1) {
      dragRef.current = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        originX: currentTransform.x,
        originY: currentTransform.y,
      };
      swipeRef.current = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        startedAt: performance.now(),
      };
    } else if (pointersRef.current.size === 2) {
      const [first, second] = Array.from(pointersRef.current.values());
      pinchRef.current = {
        distance: Math.max(1, distance(first, second)),
        scale: currentTransform.scale,
      };
      swipeRef.current = null;
    }
  };

  const handlePointerMove = (
    event: JSX.TargetedPointerEvent<HTMLDivElement>,
  ) => {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (pointersRef.current.size >= 2 && pinchRef.current) {
      const [first, second] = Array.from(pointersRef.current.values());
      const ratio = distance(first, second) / pinchRef.current.distance;
      const scale = pinchRef.current.scale * ratio;
      commitTransform({ ...transformRef.current, scale });
      return;
    }

    const drag = dragRef.current;
    const currentTransform = transformRef.current;
    if (
      !drag || drag.pointerId !== event.pointerId ||
      currentTransform.scale <= 1
    ) {
      return;
    }

    commitTransform({
      scale: currentTransform.scale,
      x: drag.originX + event.clientX - drag.x,
      y: drag.originY + event.clientY - drag.y,
    });
  };

  const finishPointer = (
    event: JSX.TargetedPointerEvent<HTMLDivElement>,
  ) => {
    const swipe = swipeRef.current;
    const wasSinglePointer = pointersRef.current.size === 1;
    pointersRef.current.delete(event.pointerId);

    if (pointersRef.current.size < 2) pinchRef.current = null;
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;

    const currentTransform = transformRef.current;
    if (
      wasSinglePointer && swipe?.pointerId === event.pointerId &&
      currentTransform.scale === 1
    ) {
      const dx = event.clientX - swipe.x;
      const dy = event.clientY - swipe.y;
      const elapsed = performance.now() - swipe.startedAt;
      if (
        images.length > 1 && elapsed < 700 && Math.abs(dx) >= 56 &&
        Math.abs(dx) > Math.abs(dy) * 1.15
      ) {
        changeIndex(dx < 0 ? 1 : -1);
        swipeRef.current = null;
        return;
      }

      if (
        event.pointerType === "touch" && Math.abs(dx) < 12 &&
        Math.abs(dy) < 12
      ) {
        const now = performance.now();
        const previous = lastTapRef.current;
        if (
          previous && now - previous.time < 320 &&
          Math.hypot(event.clientX - previous.x, event.clientY - previous.y) <
            28
        ) {
          setScale(currentTransform.scale > 1 ? 1 : 2);
          lastTapRef.current = null;
        } else {
          lastTapRef.current = {
            time: now,
            x: event.clientX,
            y: event.clientY,
          };
        }
      }
    }

    swipeRef.current = null;
  };

  const handleWheel = (event: JSX.TargetedWheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const factor = Math.exp(-event.deltaY * 0.0015);
    const currentTransform = transformRef.current;
    commitTransform({
      ...currentTransform,
      scale: currentTransform.scale * factor,
    });
  };

  const handleDoubleClick = () => {
    if (performance.now() - lastTouchPointerAtRef.current < 500) return;
    setScale(transformRef.current.scale > 1 ? 1 : 2);
  };

  return (
    <div
      class="esv-product-zoom esv-product-viewer"
      role="presentation"
      onClick={onClose}
    >
      <section
        ref={dialogRef}
        class="esv-product-zoom-dialog esv-product-viewer-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={`Visualizador de ${title}`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeRef}
          class="esv-product-zoom-close"
          type="button"
          aria-label="Fechar visualizador"
          onClick={onClose}
        >
          <CloseIcon />
        </button>

        <div
          ref={stageRef}
          class={`esv-product-zoom-stage esv-product-viewer-stage ${
            transform.scale > 1 ? "is-zoomed" : ""
          }`}
          data-viewer-scale={transform.scale.toFixed(2)}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishPointer}
          onPointerCancel={finishPointer}
          onWheel={handleWheel}
          onDblClick={handleDoubleClick}
        >
          <img
            ref={imageRef}
            class="esv-product-viewer-image"
            src={current.fullSrc || current.src}
            alt={current.alt}
            draggable={false}
            onError={(event) => {
              if (event.currentTarget.src !== current.src) {
                event.currentTarget.src = current.src;
              }
            }}
            style={{
              transform:
                `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
            }}
          />
        </div>

        <div
          class="esv-product-viewer-toolbar"
          aria-label="Controles de ampliação"
        >
          <button
            type="button"
            aria-label="Reduzir zoom"
            disabled={transform.scale <= 1}
            onClick={() => zoomBy(-0.5)}
          >
            −
          </button>
          <span aria-live="polite">{Math.round(transform.scale * 100)}%</span>
          <button
            type="button"
            aria-label="Aumentar zoom"
            disabled={transform.scale >= 3}
            onClick={() => zoomBy(0.5)}
          >
            +
          </button>
        </div>

        {images.length > 1 && (
          <div class="esv-product-zoom-controls">
            <button
              type="button"
              aria-label="Imagem anterior"
              onClick={() => changeIndex(-1)}
            >
              <ArrowIcon direction="previous" />
            </button>
            <span aria-live="polite">{index + 1} / {images.length}</span>
            <button
              type="button"
              aria-label="Próxima imagem"
              onClick={() => changeIndex(1)}
            >
              <ArrowIcon direction="next" />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
