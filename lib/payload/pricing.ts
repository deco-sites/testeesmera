import type { PayloadProduct, PayloadProductVariant } from "./types.ts";

export function formatPriceCents(
  value: number | null | undefined,
  locale = "pt-BR",
): string {
  if (!Number.isInteger(value) || (value ?? -1) < 0) return "Sob consulta";
  return new Intl.NumberFormat(locale, { style: "currency", currency: "BRL" })
    .format((value ?? 0) / 100);
}

export function resolveProductPrice(
  product: PayloadProduct,
  variant?: PayloadProductVariant | null,
) {
  const variantMode = variant?.priceMode;
  const priceMode = variantMode === "fixed" || variantMode === "inquiry"
    ? variantMode
    : product.priceMode === "fixed"
    ? "fixed"
    : "inquiry";
  const priceCents = priceMode === "fixed"
    ? (variantMode === "fixed"
      ? variant?.priceCents
      : product.basePriceCents) ?? null
    : null;
  const isInquiry = priceMode === "inquiry" || priceCents === null;
  return {
    priceMode: isInquiry ? "inquiry" as const : "fixed" as const,
    priceCents: isInquiry ? null : priceCents,
    formattedPrice: isInquiry ? "Sob consulta" : formatPriceCents(priceCents),
    isInquiry,
  };
}
