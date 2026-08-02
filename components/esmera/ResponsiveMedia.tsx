import Image from "apps/website/components/Image.tsx";
import { Picture, Source } from "apps/website/components/Picture.tsx";

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

export function EsmeraImage(
  {
    src,
    alt,
    width,
    height,
    sizes,
    class: className,
    loading = "lazy",
    decoding = "async",
  }: EsmeraImageProps,
) {
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
