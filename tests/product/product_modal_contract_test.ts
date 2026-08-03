import { assertEquals, assertFalse, assertStringIncludes } from "@std/assert";
import {
  getProductFacts,
  getProductModalImages,
} from "../../islands/ProductModal.tsx";
import type { EsmeraObject } from "../../lib/payload/types.ts";

function product(overrides: Partial<EsmeraObject> = {}): EsmeraObject {
  return {
    id: "object-1",
    slug: "object-1",
    code: "ESM-001",
    title: "Objeto I",
    image: "https://cdn.example.com/object-cover.jpg",
    alt: "Objeto I",
    availability: "available",
    material: "Esmeralda e pedra",
    gallery: [{
      url: "https://origin.example.com/object-cover.jpg",
      alt: "Objeto I",
      key: "cover",
      role: "cover",
    }],
    attributes: [],
    priceMode: "fixed",
    priceCents: 120000,
    formattedPrice: "R$ 1.200,00",
    isInquiry: false,
    variants: [],
    seo: { title: "Objeto I", description: "", noindex: false },
    price: "R$ 1.200,00",
    ...overrides,
  };
}

Deno.test("one available photo occupies the modal gallery alone", () => {
  const images = getProductModalImages(product());
  assertEquals(images.length, 1);
  assertEquals(images[0].src, "https://cdn.example.com/object-cover.jpg");
});

Deno.test("two available photos produce a split gallery without duplicates", () => {
  const detail = "https://cdn.example.com/object-detail.jpg";
  const images = getProductModalImages(product({
    detailImage: detail,
    gallery: [
      {
        url: "https://origin.example.com/object-cover.jpg",
        alt: "Objeto I",
        key: "cover",
        role: "cover",
      },
      {
        url: detail,
        alt: "Detalhe do Objeto I",
        key: "detail",
        role: "detail",
      },
    ],
  }));

  assertEquals(images.map((image) => image.src), [
    "https://cdn.example.com/object-cover.jpg",
    detail,
  ]);
});

Deno.test("buybox includes every populated fact and removes duplicate labels", () => {
  const facts = getProductFacts(product({
    category: "Esculturas",
    edition: "Peça única",
    attributes: [
      { label: "Dimensões", value: "32 × 18 cm" },
      { label: "Material", value: "Valor duplicado" },
    ],
  }));

  assertEquals(facts, [
    { label: "Código", value: "ESM-001" },
    { label: "Categoria", value: "Esculturas" },
    { label: "Material", value: "Esmeralda e pedra" },
    { label: "Edição", value: "Peça única" },
    { label: "Dimensões", value: "32 × 18 cm" },
  ]);
});

Deno.test("cards and Conhecer a peça share the modal and never navigate", async () => {
  const card = await Deno.readTextFile("components/esmera/ObjectCard.tsx");
  const actions = await Deno.readTextFile("islands/ProductActions.tsx");
  const modal = await Deno.readTextFile("islands/ProductModal.tsx");
  const css = await Deno.readTextFile("static/esmera-product-modal-v2.css");

  assertFalse(card.includes("/produto/"));
  assertStringIncludes(card, 'presentation="media"');
  assertStringIncludes(card, 'presentation="title"');
  assertStringIncludes(actions, 'dispatch("esmera:open-product"');
  assertStringIncludes(modal, 'class="esv-product-modal-buybox"');
  assertStringIncludes(
    modal,
    'images.length === 1 ? "is-single" : "is-double"',
  );
  assertStringIncludes(modal, 'class="esv-product-zoom"');
  assertStringIncludes(modal, 'root.style.overflow = "hidden"');
  assertStringIncludes(modal, "root.style.overflow = previous.rootOverflow");
  assertStringIncludes(css, ".esv-product-modal-gallery.is-single");
  assertStringIncludes(css, ".esv-product-modal-gallery.is-double");
});

Deno.test("Matter is a whole-panel category link with stable overlay CSS", async () => {
  const matter = await Deno.readTextFile("sections/Esmera/Matter.tsx");
  const css = await Deno.readTextFile("static/esmera-matter-interaction.css");

  assertStringIncludes(matter, 'class="esv-territory-panel is-clickable"');
  assertStringIncludes(matter, "panel.category ?? panel.cta");
  assertStringIncludes(matter, "baselineCategoryLinks");
  assertStringIncludes(matter, 'href: "/colecao/esculturas"');
  assertStringIncludes(matter, 'href: "/colecao/vasos"');
  assertStringIncludes(matter, 'href: "/colecao/bandejas"');
  assertStringIncludes(matter, 'class="esv-territory-link"');
  assertStringIncludes(css, ".esv-territory-media,");
  assertStringIncludes(css, "position: absolute;");
  assertStringIncludes(css, ".esv-territory-copy {");
  assertStringIncludes(css, "transform: none;");
});
