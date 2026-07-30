export function responsiveSrcSet(
  src: string,
  widths: number[] = [480, 768, 1200, 1800],
) {
  if (!src.includes("images.unsplash.com")) return undefined;

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
