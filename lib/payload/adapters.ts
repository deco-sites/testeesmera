import { getPayloadBaseURL } from "./client.ts";
import { resolvePayloadMedia } from "./media.ts";
import { resolveProductPrice } from "./pricing.ts";
import { lexicalToText } from "./richText.ts";
import type {
  EsmeraObject,
  EsmeraVariant,
  NavigationLink,
  PayloadCategory,
  PayloadCTA,
  PayloadHome,
  PayloadNavigation,
  PayloadProduct,
  PayloadSEO,
  PayloadSiteSettings,
  Relationship,
  SEOModel,
} from "./types.ts";

function objectRelationship<T>(value: Relationship<T> | undefined): T | null {
  return value && typeof value === "object" ? value : null;
}

export function sanitizePublicHref(value?: string | null): string {
  const href = value?.trim() ?? "";
  if (!href || href.startsWith("//")) return "";
  if (href.startsWith("/") || href.startsWith("#")) return href;
  try {
    const url = new URL(href);
    return ["http:", "https:", "mailto:", "tel:"].includes(url.protocol)
      ? url.toString()
      : "";
  } catch {
    return "";
  }
}

function categoryName(
  categories: PayloadProduct["categories"],
): string | undefined {
  const category = categories?.map(objectRelationship).find(Boolean);
  return category?.title;
}

export function toProductGallery(
  product: PayloadProduct,
  baseURL = getPayloadBaseURL(),
) {
  return (product.gallery ?? []).flatMap((item) => {
    const media = resolvePayloadMedia(item.image, baseURL, "wide", item.alt);
    return media
      ? [{ ...media, key: item.mediaKey ?? "", role: item.role ?? "detail" }]
      : [];
  });
}

export function toProductOptions(product: PayloadProduct): EsmeraVariant[] {
  return (product.variants ?? []).map((variant) => {
    const price = resolveProductPrice(product, variant);
    const labels = (variant.selection ?? []).map((selection) => {
      const option = product.optionDefinitions?.find((item) =>
        item.code === selection.option
      );
      const value = option?.values?.find((item) =>
        item.value === selection.value
      );
      return value?.label || selection.value || "";
    }).filter(Boolean);
    return {
      sku: variant.sku,
      label: labels.join(" / ") || variant.sku,
      ...price,
      disabled: variant.status === "disabled",
      mediaKeys: (variant.mediaKeys ?? []).map((item) => item.key ?? "").filter(
        Boolean,
      ),
    };
  });
}

export function toEsmeraObject(
  product: PayloadProduct,
  baseURL = getPayloadBaseURL(),
): EsmeraObject | null {
  if (product._status !== "published" || product.catalogStatus !== "active") {
    return null;
  }
  const gallery = toProductGallery(product, baseURL);
  const cover = gallery.find((item) => item.role === "cover") ?? gallery[0];
  if (!cover) return null;
  const detail = gallery.find((item) =>
    item.role === "detail" && item.url !== cover.url
  );
  const price = resolveProductPrice(product);
  const availability = product.availability ?? "available";
  return {
    id: String(product.id),
    slug: product.slug,
    code: product.code,
    title: product.title,
    subtitle: product.subtitle ?? undefined,
    image: cover.url,
    detailImage: detail?.url,
    gallery,
    alt: cover.alt,
    availability,
    category: categoryName(product.categories),
    material: product.material ?? undefined,
    description: lexicalToText(product.description),
    edition: product.edition ?? undefined,
    attributes: (product.attributes ?? []).flatMap((item) =>
      item.label && item.value ? [{ label: item.label, value: item.value }] : []
    ),
    searchTerms: (product.searchTerms ?? []).map((item) => item.term ?? "")
      .filter(Boolean),
    ...price,
    price: price.formattedPrice,
    variants: toProductOptions(product),
    seo: toSEO(product.seo, null, baseURL),
  };
}

export function toCategory(
  category: PayloadCategory,
  baseURL = getPayloadBaseURL(),
) {
  if (category._status !== "published" || category.status !== "active") {
    return null;
  }
  return {
    id: String(category.id),
    title: category.title,
    slug: category.slug,
    description: category.description ?? "",
    order: category.order ?? 100,
    image: resolvePayloadMedia(category.image, baseURL, "card"),
    seo: toSEO(category.seo, null, baseURL),
  };
}

export function resolveCallToAction(
  cta?: PayloadCTA | null,
): NavigationLink | null {
  const label = cta?.label?.trim();
  const href = sanitizePublicHref(cta?.href);
  if (!label || !href) return null;
  return {
    label,
    href,
    external: cta?.kind === "external" || /^https?:\/\//i.test(href),
  };
}

export function toNavigation(navigation: PayloadNavigation): NavigationLink[] {
  return [...(navigation.mainLinks ?? []), ...(navigation.utilityLinks ?? [])]
    .filter((link) => link.active !== false)
    .map(resolveCallToAction)
    .filter((link): link is NavigationLink => Boolean(link));
}

export function toCategoryNavigation(
  navigation: PayloadNavigation,
): NavigationLink[] {
  return (navigation.categoryLinks ?? []).filter((link) =>
    link.active !== false
  ).flatMap((link) => {
    const resolved = resolveCallToAction(link);
    if (resolved) return [resolved];
    const category = objectRelationship(link.category);
    return category
      ? [{
        label: link.label || category.title,
        href: `/colecao/${category.slug}`,
        external: false,
      }]
      : [];
  });
}

export function toFooter(settings: PayloadSiteSettings) {
  const channels = (settings.officialChannels ?? []).filter((channel) =>
    channel.active !== false
  );
  const email = channels.find((channel) => channel.kind === "email");
  const whatsapp = channels.find((channel) => channel.kind === "whatsapp");
  const normalizedPhone = whatsapp?.value?.replace(/\D/g, "") ?? "";
  return {
    statement: settings.footerStatement ?? "",
    contactLabel: email?.label || email?.value || "",
    contactHref: sanitizePublicHref(email?.url) ||
      (email?.value ? sanitizePublicHref(`mailto:${email.value.trim()}`) : ""),
    location: settings.locationLabel ?? "",
    privacyLabel: settings.privacyLabel ?? "",
    privacyHref: sanitizePublicHref(settings.privacyHref),
    termsLabel: settings.termsLabel ?? "",
    termsHref: sanitizePublicHref(settings.termsHref),
    whatsappLabel: whatsapp?.label || "WhatsApp",
    whatsappHref: sanitizePublicHref(whatsapp?.url) ||
      (normalizedPhone ? `https://wa.me/${normalizedPhone}` : ""),
  };
}

export function toHero(home: PayloadHome, baseURL = getPayloadBaseURL()) {
  const slides = (home.heroSlides ?? []).filter((slide) =>
    slide.active !== false
  ).flatMap((slide) => {
    const desktop = resolvePayloadMedia(slide.desktopImage, baseURL, "wide");
    if (!desktop || !slide.statement) return [];
    const mobile = resolvePayloadMedia(slide.mobileImage, baseURL, "card");
    return [{
      desktopImage: desktop.url,
      mobileImage: mobile?.url,
      alt: desktop.alt,
      statement: slide.statement,
      cta: resolveCallToAction(slide.callToAction),
    }];
  });
  return {
    mode: home.heroMode ?? "single",
    slides,
    autoplay: home.autoplay === true,
    autoplaySeconds: Math.min(12, Math.max(3, home.autoplaySeconds ?? 6)),
  };
}

export function toManifesto(home: PayloadHome, baseURL = getPayloadBaseURL()) {
  const main = resolvePayloadMedia(home.manifestoPrimaryImage, baseURL, "wide");
  const secondary = resolvePayloadMedia(
    home.manifestoSecondaryImage,
    baseURL,
    "card",
  );
  if (!home.manifestoTitle || !main) return null;
  return {
    eyebrow: home.manifestoEyebrow ?? "",
    title: home.manifestoTitle,
    text: lexicalToText(home.manifestoCopy),
    mainImage: main.url,
    mainImageAlt: main.alt,
    secondaryImage: secondary?.url,
    secondaryImageAlt: secondary?.alt,
  };
}

export function toSelectedObjects(
  home: PayloadHome,
  baseURL = getPayloadBaseURL(),
): EsmeraObject[] {
  return (home.selectedProducts ?? []).flatMap((product) => {
    const resolved = objectRelationship(product);
    const adapted = resolved ? toEsmeraObject(resolved, baseURL) : null;
    return adapted ? [adapted] : [];
  }).slice(0, 4);
}

export function toMatterPanels(
  home: PayloadHome,
  baseURL = getPayloadBaseURL(),
) {
  return (home.matterPanels ?? []).flatMap((panel) => {
    const image = resolvePayloadMedia(panel.image, baseURL, "wide");
    if (!image || !panel.headline) return [];
    const category = objectRelationship(panel.category);
    return [{
      image: image.url,
      alt: image.alt,
      eyebrow: panel.eyebrow ?? "",
      title: panel.headline,
      text: panel.copy ?? "",
      cta: resolveCallToAction(panel.callToAction),
      category: category
        ? {
          label: category.title,
          href: `/colecao/${category.slug}`,
          external: false,
        }
        : null,
    }];
  }).slice(0, 3);
}

export function toSignatureSlides(
  home: PayloadHome,
  baseURL = getPayloadBaseURL(),
) {
  return (home.signatureSlides ?? []).flatMap((slide) => {
    const product = objectRelationship(slide.product);
    const adapted = product ? toEsmeraObject(product, baseURL) : null;
    return adapted
      ? [{
        product: adapted,
        eyebrow: slide.eyebrow ?? "",
        headline: slide.headline ?? adapted.title,
        editorialText: slide.copy ?? adapted.description ?? "",
      }]
      : [];
  }).slice(0, 6);
}

export function toProvenance(home: PayloadHome, baseURL = getPayloadBaseURL()) {
  const overview = resolvePayloadMedia(home.provenanceImage, baseURL, "wide");
  const stages = (home.provenanceSteps ?? []).flatMap((stage) => {
    const image = resolvePayloadMedia(stage.image, baseURL, "wide", stage.alt);
    return stage.title && stage.copy && image
      ? [{
        title: stage.title,
        text: stage.copy,
        image: image.url,
        alt: image.alt,
      }]
      : [];
  });
  return {
    title: home.provenanceTitle ?? "",
    text: lexicalToText(home.provenanceCopy),
    image: overview?.url,
    imageAlt: overview?.alt,
    stages,
    cta: resolveCallToAction(home.provenanceCallToAction),
  };
}

export function toSEO(
  seo: PayloadSEO | null | undefined,
  defaults: PayloadSiteSettings | null = null,
  baseURL = getPayloadBaseURL(),
): SEOModel {
  return {
    title: seo?.title || defaults?.defaultSeoTitle || "",
    description: seo?.description || defaults?.defaultSeoDescription || "",
    image: resolvePayloadMedia(seo?.socialImage, baseURL, "wide")?.url,
    canonical: sanitizePublicHref(seo?.canonical) || undefined,
    noindex: seo?.noindex === true,
  };
}
