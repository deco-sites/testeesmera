import type {
  PayloadCategory,
  PayloadHome,
  PayloadMedia,
  PayloadProduct,
} from "../types.ts";
import type { StorefrontDiagnostic } from "./diagnostics.ts";
import { STOREFRONT_CONTRACT_VERSION } from "./version.ts";

export type StorefrontContractKind =
  | "product"
  | "category"
  | "home"
  | "navigation"
  | "site-settings";

export type StorefrontContractValidation<T> = {
  contractVersion: typeof STOREFRONT_CONTRACT_VERSION;
  compatible: boolean;
  data: T | null;
  diagnostics: StorefrontDiagnostic[];
};

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function relation<T>(value: unknown): T | null {
  return record(value) ? value as T : null;
}

function validPublicURL(value: unknown): boolean {
  try {
    const parsed = new URL(text(value));
    return parsed.protocol === "https:" ||
      (parsed.protocol === "http:" && parsed.hostname === "localhost");
  } catch {
    return false;
  }
}

function diagnostic(
  kind: string,
  id: string,
  message: string,
  input: Partial<StorefrontDiagnostic> = {},
): StorefrontDiagnostic {
  return {
    id,
    severity: input.severity ?? "blocker",
    kind,
    path: input.path ?? null,
    message,
    suggestion: input.suggestion ?? null,
    source: input.source ?? "contract",
    meta: input.meta,
  };
}

function mediaDiagnostics(
  mediaValue: unknown,
  kind: string,
  path: string,
  alt?: unknown,
): StorefrontDiagnostic[] {
  const media = relation<PayloadMedia>(mediaValue);
  if (!media || !validPublicURL(media.url)) {
    return [diagnostic(
      kind,
      "media.public_url_missing",
      "A mídia não possui URL pública válida.",
      {
        path,
        suggestion:
          "Mantenha o fallback da Deco e revise a publicação da mídia no Payload.",
      },
    )];
  }
  if (!text(alt || media.alt)) {
    return [diagnostic(
      kind,
      "media.alt_missing",
      "A mídia significativa não possui texto alternativo.",
      { path: `${path}.alt`, severity: "warning" },
    )];
  }
  return [];
}

function productDiagnostics(product: PayloadProduct): StorefrontDiagnostic[] {
  const diagnostics: StorefrontDiagnostic[] = [];
  if (!text(product.title)) {
    diagnostics.push(diagnostic(
      "product",
      "product.title_missing",
      "Produto sem título público.",
      { path: "title" },
    ));
  }
  if (!text(product.slug)) {
    diagnostics.push(diagnostic(
      "product",
      "product.slug_missing",
      "Produto sem slug público.",
      { path: "slug" },
    ));
  }
  if (product.catalogStatus !== "active") {
    diagnostics.push(diagnostic(
      "product",
      "product.not_active",
      "Produto fora do catálogo ativo.",
      { path: "catalogStatus" },
    ));
  }
  if (product._status === "draft") {
    diagnostics.push(diagnostic(
      "product",
      "product.not_published",
      "Produto ainda está em rascunho.",
      { path: "_status" },
    ));
  }

  const categories = Array.isArray(product.categories)
    ? product.categories
    : [];
  if (!categories.length) {
    diagnostics.push(diagnostic(
      "product",
      "product.category_missing",
      "Produto sem categoria pública.",
      { path: "categories" },
    ));
  }
  categories.forEach((value, index) => {
    const category = relation<PayloadCategory>(value);
    if (
      category &&
      (category.status !== "active" || category._status === "draft")
    ) {
      diagnostics.push(diagnostic(
        "product",
        "product.category_unavailable",
        `A categoria “${category.title || category.slug || category.id}” não está pública.`,
        { path: `categories.${index}` },
      ));
    }
  });

  const gallery = Array.isArray(product.gallery) ? product.gallery : [];
  if (!gallery.length) {
    diagnostics.push(diagnostic(
      "product",
      "product.gallery_empty",
      "Produto sem galeria pública.",
      { path: "gallery" },
    ));
  }
  let coverCount = 0;
  gallery.forEach((item, index) => {
    if (item.role === "cover") coverCount += 1;
    diagnostics.push(...mediaDiagnostics(
      item.image,
      "product",
      `gallery.${index}.image`,
      item.alt,
    ));
  });
  if (gallery.length && coverCount !== 1) {
    diagnostics.push(diagnostic(
      "product",
      "product.cover_invalid",
      "A galeria precisa de exatamente uma imagem de capa.",
      { path: "gallery" },
    ));
  }

  if (product.priceMode !== "fixed" && product.priceMode !== "inquiry") {
    diagnostics.push(diagnostic(
      "product",
      "product.price_mode_invalid",
      "Modo de preço não reconhecido.",
      { path: "priceMode" },
    ));
  }
  return diagnostics;
}

function categoryDiagnostics(
  category: PayloadCategory,
): StorefrontDiagnostic[] {
  const diagnostics: StorefrontDiagnostic[] = [];
  if (!text(category.title)) {
    diagnostics.push(diagnostic(
      "category",
      "category.title_missing",
      "Categoria sem nome público.",
      { path: "title" },
    ));
  }
  if (!text(category.slug)) {
    diagnostics.push(diagnostic(
      "category",
      "category.slug_missing",
      "Categoria sem slug público.",
      { path: "slug" },
    ));
  }
  if (category.status !== "active" || category._status === "draft") {
    diagnostics.push(diagnostic(
      "category",
      "category.not_public",
      "Categoria não está ativa e publicada.",
      { path: "status" },
    ));
  }
  if (category.image) {
    diagnostics.push(...mediaDiagnostics(
      category.image,
      "category",
      "image",
    ));
  }
  return diagnostics;
}

function homeDiagnostics(home: PayloadHome): StorefrontDiagnostic[] {
  const diagnostics: StorefrontDiagnostic[] = [];
  if (home._status === "draft") {
    diagnostics.push(diagnostic(
      "home",
      "home.not_published",
      "A configuração da Home ainda está em rascunho.",
      { path: "_status" },
    ));
  }

  const slides = Array.isArray(home.heroSlides) ? home.heroSlides : [];
  slides.forEach((slide, index) => {
    if (slide.active === false) return;
    diagnostics.push(...mediaDiagnostics(
      slide.desktopImage,
      "home",
      `heroSlides.${index}.desktopImage`,
    ));
    if (slide.mobileImage) {
      diagnostics.push(...mediaDiagnostics(
        slide.mobileImage,
        "home",
        `heroSlides.${index}.mobileImage`,
      ));
    }
  });
  return diagnostics;
}

export function validatePayloadContract<T>(
  kind: StorefrontContractKind,
  value: T | null | undefined,
): StorefrontContractValidation<T> {
  if (!record(value)) {
    const diagnostics = [diagnostic(
      kind,
      `${kind}.invalid_document`,
      "A API retornou um documento em formato incompatível.",
    )];
    return {
      contractVersion: STOREFRONT_CONTRACT_VERSION,
      compatible: false,
      data: null,
      diagnostics,
    };
  }

  const diagnostics = kind === "product"
    ? productDiagnostics(value as unknown as PayloadProduct)
    : kind === "category"
    ? categoryDiagnostics(value as unknown as PayloadCategory)
    : kind === "home"
    ? homeDiagnostics(value as unknown as PayloadHome)
    : [];

  return {
    contractVersion: STOREFRONT_CONTRACT_VERSION,
    compatible: diagnostics.every((item) => item.severity !== "blocker"),
    data: value,
    diagnostics,
  };
}
