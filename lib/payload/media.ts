import type { PayloadMedia, PayloadMediaSize, Relationship } from "./types.ts";

export interface ResolvedMedia {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  fullUrl?: string;
  fullWidth?: number;
  fullHeight?: number;
}

function absoluteURL(value: string, baseURL: string): string {
  try {
    const url = new URL(value, `${baseURL}/`);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : "";
  } catch {
    return "";
  }
}

export function resolvePayloadMedia(
  relationship: Relationship<PayloadMedia> | undefined,
  baseURL: string,
  preferred:
    | "thumb"
    | "card"
    | "wide"
    | "gallery"
    | "territory"
    | "original" = "original",
  editorialAlt?: string | null,
): ResolvedMedia | null {
  if (!relationship || typeof relationship !== "object") return null;
  if (relationship._status && relationship._status !== "published") return null;

  const size: PayloadMediaSize | null | undefined = preferred === "original"
    ? undefined
    : relationship.sizes?.[preferred];
  const rawURL = size?.url || relationship.url;
  if (!rawURL) return null;
  const url = absoluteURL(rawURL, baseURL);
  if (!url) return null;

  const originalUrl = relationship.url
    ? absoluteURL(relationship.url, baseURL)
    : "";

  return {
    url,
    alt: editorialAlt?.trim() || relationship.alt?.trim() || "",
    width: size?.width ?? relationship.width ?? undefined,
    height: size?.height ?? relationship.height ?? undefined,
    fullUrl: originalUrl || url,
    fullWidth: relationship.width ?? size?.width ?? undefined,
    fullHeight: relationship.height ?? size?.height ?? undefined,
  };
}
