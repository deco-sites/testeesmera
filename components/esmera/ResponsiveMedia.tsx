import Image from "apps/website/components/Image.tsx";
import { Picture, Source } from "apps/website/components/Picture.tsx";

const isUnsplashPlaceholder = (src: string) =>
  src.includes("images.unsplash.com");

function unsplashSrcSet(
  src: string,
  widths: number[] = [480, 768, 1200, 1800],
) {
  if (!isUnsplashPlaceholder(src)) return undefined;

  try {
    const url = new URL(src);
    return widths.map((width) => {
      const candidate = new URL(url.toString());
      candidate.searchParams.set("w", String(width));
      return `${candidate.toString()} ${width}w`;
    }).join(", ");
  } catch {
    return undefined;
  }
}

export interface EsmeraImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes?: string;
  class?: string;
  loading?: "lazy" | "eager";
  decoding?: "async" | "auto" | "sync";
}

export function EsmeraImage({
  src,
  alt,
  width,
  height,
  sizes,
  class: className,
  loading = "lazy",
  decoding = "async",
}: EsmeraImageProps) {
  if (isUnsplashPlaceholder(src)) {
    return (
      <img
        class={className}
        src={src}
        srcset={unsplashSrcSet(src, [480, 720, 960, 1200, 1600, 1920])}
        sizes={sizes}
        alt={alt}
        loading={loading}
        decoding={decoding}
        width={width}
        height={height}
      />
    );
  }

  return (
    <Image
      class={className}
      src={src}
      alt={alt}
      loading={loading}
      decoding={decoding}
      width={width}
      height={height}
      sizes={sizes}
    />
  );
}

export interface EsmeraPictureProps {
  class?: string;
  desktopSrc: string;
  mobileSrc?: string;
  alt: string;
  desktopWidth: number;
  desktopHeight: number;
  mobileWidth: number;
  mobileHeight: number;
  loading?: "lazy" | "eager";
  decoding?: "async" | "auto" | "sync";
  preload?: boolean;
  fetchPriority?: "high" | "low" | "auto";
}

export function EsmeraPicture({
  class: className,
  desktopSrc,
  mobileSrc,
  alt,
  desktopWidth,
  desktopHeight,
  mobileWidth,
  mobileHeight,
  loading = "lazy",
  decoding = "async",
  preload = false,
  fetchPriority = "auto",
}: EsmeraPictureProps) {
  const mobileAsset = mobileSrc ?? desktopSrc;
  const placeholder = isUnsplashPlaceholder(desktopSrc) ||
    isUnsplashPlaceholder(mobileAsset);

  if (placeholder) {
    return (
      <picture class={className}>
        <source
          media="(max-width: 767px)"
          srcset={unsplashSrcSet(mobileAsset, [480, 720, 900, 1080]) ?? mobileAsset}
          sizes="100vw"
        />
        <source
          media="(min-width: 768px)"
          srcset={unsplashSrcSet(desktopSrc, [960, 1280, 1600, 1920, 2400]) ?? desktopSrc}
          sizes="100vw"
        />
        <img
          class={className ? `${className}-image` : undefined}
          {...{ fetchPriority }}
          src={desktopSrc}
          alt={alt}
          loading={loading}
          decoding={decoding}
          width={desktopWidth}
          height={desktopHeight}
        />
      </picture>
    );
  }

  return (
    <Picture class={className} preload={preload}>
      <Source
        media="(max-width: 767px)"
        fetchPriority={fetchPriority}
        src={mobileAsset}
        width={mobileWidth}
        height={mobileHeight}
        sizes="100vw"
      />
      <Source
        media="(min-width: 768px)"
        fetchPriority={fetchPriority}
        src={desktopSrc}
        width={desktopWidth}
        height={desktopHeight}
        sizes="100vw"
      />
      <img
        {...{ fetchPriority }}
        src={desktopSrc}
        alt={alt}
        loading={loading}
        decoding={decoding}
        width={desktopWidth}
        height={desktopHeight}
      />
    </Picture>
  );
}
