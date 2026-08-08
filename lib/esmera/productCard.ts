/**
 * ProductCardViewModel — apresentação do card de produto (plano técnico, §11).
 *
 * A lógica de taxonomia, parcelamento e formatação vive AQUI, fora do JSX. O
 * componente visual (ObjectCard) apenas renderiza este modelo já resolvido.
 */
import type {
  StorefrontAvailabilityStateV2,
  StorefrontProductV2,
} from "./storefront.ts";
import type { EsmeraObject } from "../payload/types.ts";

export interface ProductCardInstallment {
  prefix: string;
  emphasis: string;
  suffix: string;
}

export interface ProductCardViewModel {
  id: string;
  slug: string;
  eyebrow: string;
  title: string;
  status: string;
  specs: string | null;
  price: string | null;
  installment: ProductCardInstallment | null;
  image: string | null;
  imageAlt: string;
  hoverImage: string | null;
  isPurchasable: boolean;
}

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const decimal = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatPriceCents(
  cents: number | null | undefined,
): string | null {
  if (typeof cents !== "number" || !Number.isFinite(cents) || cents < 0) {
    return null;
  }
  // Intl pt-BR insere um espaço não-quebrável entre "R$" e o número. `\s`, em
  // regex JS, cobre o NBSP — normaliza para espaço comum (exibição/testes).
  return currency.format(cents / 100).replace(/\s/g, " ");
}

/** 180 mm → "18 cm"; 185 mm → "18,5 cm". */
export function formatHeight(
  heightMm: number | null | undefined,
): string | null {
  if (
    typeof heightMm !== "number" || !Number.isFinite(heightMm) || heightMm <= 0
  ) {
    return null;
  }
  return `${decimal.format(heightMm / 10)} cm`;
}

/** 1200 g → "1,2 kg"; 1000 g → "1 kg"; 800 g → "800 g". */
export function formatWeight(
  weightGrams: number | null | undefined,
): string | null {
  if (
    typeof weightGrams !== "number" || !Number.isFinite(weightGrams) ||
    weightGrams <= 0
  ) {
    return null;
  }
  if (weightGrams < 1000) return `${decimal.format(weightGrams)} g`;
  return `${decimal.format(weightGrams / 1000)} kg`;
}

const STATE_LABELS: Record<StorefrontAvailabilityStateV2, string> = {
  available: "DISPONÍVEL",
  made_to_order: "SOB ENCOMENDA",
  limited: "EDIÇÃO LIMITADA",
  archive: "INDISPONÍVEL",
};

/** "PEÇA ÚNICA · DISPONÍVEL" | "SOB ENCOMENDA" (plano §19). */
export function buildStatus(
  state: StorefrontAvailabilityStateV2 | undefined,
  isUnique: boolean | undefined,
): string {
  const stateLabel = STATE_LABELS[state ?? "available"] ??
    STATE_LABELS.available;
  return isUnique ? `PEÇA ÚNICA · ${stateLabel}` : stateLabel;
}

/** "GELATO · ROCHA DE ESMERALDA NATURAL" — nome + material, em caixa alta. */
export function buildEyebrow(
  name: string,
  material: string | null | undefined,
): string {
  return [name, material]
    .map((part) => (part ?? "").trim())
    .filter(Boolean)
    .join(" · ")
    .toLocaleUpperCase("pt-BR");
}

/** "18 cm · 1,2 kg" | "18 cm" | null (plano §19: sem peso → só dimensão). */
export function buildSpecs(product: StorefrontProductV2): string | null {
  const parts = [
    formatHeight(product.specs?.heightMm),
    formatWeight(product.specs?.weightGrams),
  ].filter((part): part is string => Boolean(part));
  return parts.length ? parts.join(" · ") : null;
}

/** { prefix:"ou ", emphasis:"12x de R$ 40,83", suffix:" sem juros" }. */
export function buildInstallment(
  product: StorefrontProductV2,
): ProductCardInstallment | null {
  const installment = product.pricing?.installment;
  if (!installment || installment.count < 2) return null;
  const amount = formatPriceCents(installment.amountCents);
  if (!amount) return null;
  return {
    prefix: "ou ",
    emphasis: `${installment.count}x de ${amount}`,
    suffix: installment.interestFree ? " sem juros" : "",
  };
}

function fold(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLocaleLowerCase("pt-BR");
}

function stateFromAvailability(
  availability: string | null | undefined,
): StorefrontAvailabilityStateV2 {
  if (availability === "made_to_order" || availability === "limited") {
    return availability;
  }
  if (availability === "archive") return "archive";
  return "available";
}

function specsFromAttributes(
  attributes: Array<{ label: string; value: string }>,
): string | null {
  const pick = (pattern: RegExp) =>
    attributes.find((attribute) => pattern.test(fold(attribute.label)))?.value
      ?.trim();
  const parts = [pick(/altura|height|dimens/), pick(/peso|weight/)]
    .filter((part): part is string => Boolean(part));
  return parts.length ? parts.join(" · ") : null;
}

/**
 * Ponte a partir do `EsmeraObject` atual (pipeline Payload direto), enquanto a
 * coleção não migra para a Storefront API. Enriquecimento é best-effort: o
 * parcelamento só existe via contrato público (fica nulo aqui).
 */
export function esmeraObjectToCardViewModel(
  item: EsmeraObject,
): ProductCardViewModel {
  const isUnique = item.availability === "unique" ||
    fold(item.edition) === "peca unica";
  const state = stateFromAvailability(item.availability);
  const price = item.isInquiry
    ? null
    : (item.price ?? item.formattedPrice ?? "").replace(/\s/g, " ") || null;

  return {
    id: item.id,
    slug: item.slug,
    // Sem "tipo de peça" confiável no pipeline atual: o título é o NOME da peça
    // e o eyebrow é só o material. A inversão nome↔pieceType só acontece com o
    // contrato público (toProductCardViewModel), onde pieceType é confiável.
    eyebrow: buildEyebrow(item.material ?? "", null),
    title: item.title,
    status: buildStatus(state, isUnique),
    specs: specsFromAttributes(item.attributes ?? []),
    price,
    installment: null,
    image: item.image || null,
    imageAlt: item.alt || item.title,
    hoverImage: item.detailImage || null,
    isPurchasable: !item.isInquiry &&
      (state === "available" || state === "limited"),
  };
}

export function toProductCardViewModel(
  product: StorefrontProductV2,
): ProductCardViewModel {
  const name = product.identity?.name ?? product.title;
  const material = product.identity?.material ?? product.material ?? null;
  const pieceType = product.identity?.pieceType ?? product.pieceType ?? null;
  const priceCents = product.pricing?.priceCents ?? product.price ?? null;
  // Só inclui o nome no eyebrow quando o título é o tipo da peça (nome distinto);
  // senão o eyebrow repetiria o título. Sem tipo → eyebrow = só material.
  const distinctPiece = Boolean(pieceType && pieceType !== name);

  return {
    id: product.id,
    slug: product.slug,
    eyebrow: distinctPiece
      ? buildEyebrow(name, material)
      : buildEyebrow(material ?? "", null),
    // Título é o tipo da peça ("Ponta de Esmeralda"); cai para o nome quando não há.
    title: pieceType || name,
    status: buildStatus(product.state, product.isUnique),
    specs: buildSpecs(product),
    price: product.pricing?.mode === "inquiry"
      ? null
      : formatPriceCents(priceCents),
    installment: buildInstallment(product),
    image: product.image?.url ?? null,
    imageAlt: product.image?.alt ?? name,
    hoverImage: product.hoverImage?.url ?? null,
    isPurchasable: Boolean(product.purchasable),
  };
}
