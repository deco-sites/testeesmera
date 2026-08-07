import { assertEquals } from "@std/assert";
import { toSelectedObjects } from "../../lib/payload/adapters.ts";
import type { PayloadHome, PayloadProduct } from "../../lib/payload/types.ts";

const BASE_URL = "https://esmeracms.example.com";

type ProductOverrides = Partial<PayloadProduct> & { id: number; slug: string };

// A published, active product with a published cover media — the "valid" baseline.
// `id` and `slug` are always supplied by the spread of `overrides`.
function validProduct(overrides: ProductOverrides): PayloadProduct {
  return {
    title: overrides.title ?? `Objeto ${overrides.id}`,
    code: overrides.code ?? `OBJ-${overrides.id}`,
    catalogStatus: "active",
    _status: "published",
    priceMode: "inquiry",
    availability: "available",
    categories: [{
      id: 8,
      title: "Esculturas",
      slug: "esculturas",
      status: "active",
      _status: "published",
    }],
    gallery: [{
      image: {
        id: 900 + overrides.id,
        url: `https://cdn.example.com/${overrides.slug}.jpg`,
        alt: "Peça em esmeralda",
        _status: "published",
      },
      mediaKey: "capa",
      role: "cover",
      alt: "Peça em esmeralda",
    }],
    ...overrides,
  } as unknown as PayloadProduct;
}

function homeWith(selectedProducts: unknown[]): PayloadHome {
  return { selectedProducts } as unknown as PayloadHome;
}

Deno.test("four valid published products resolve into four adapted objects", () => {
  const home = homeWith([
    validProduct({ id: 55, slug: "porta-cristais-bege-bahia" }),
    validProduct({ id: 60, slug: "porta-sabonete-esmeralda" }),
    validProduct({ id: 61, slug: "difusor-esmeralda" }),
    validProduct({ id: 63, slug: "porta-cristais-esmeralda" }),
  ]);

  const adapted = toSelectedObjects(home, BASE_URL);

  assertEquals(adapted.length, 4);
  assertEquals(adapted.map((product) => product.slug), [
    "porta-cristais-bege-bahia",
    "porta-sabonete-esmeralda",
    "difusor-esmeralda",
    "porta-cristais-esmeralda",
  ]);
});

Deno.test("draft product is rejected", () => {
  const home = homeWith([
    validProduct({ id: 55, slug: "publicado" }),
    validProduct({ id: 56, slug: "rascunho", _status: "draft" }),
  ]);

  const adapted = toSelectedObjects(home, BASE_URL);

  assertEquals(adapted.map((product) => product.slug), ["publicado"]);
});

Deno.test("product with catalogStatus other than active is rejected", () => {
  const home = homeWith([
    validProduct({ id: 55, slug: "ativo" }),
    validProduct({ id: 57, slug: "arquivado", catalogStatus: "archived" }),
  ]);

  const adapted = toSelectedObjects(home, BASE_URL);

  assertEquals(adapted.map((product) => product.slug), ["ativo"]);
});

Deno.test("product whose cover media is a draft is rejected (protection preserved)", () => {
  const draftMedia = validProduct({ id: 58, slug: "midia-em-rascunho" });
  // Same product, but the cover media was never published.
  (draftMedia.gallery![0].image as { _status: string })._status = "draft";

  const home = homeWith([
    validProduct({ id: 55, slug: "com-midia-publica" }),
    draftMedia,
  ]);

  const adapted = toSelectedObjects(home, BASE_URL);

  assertEquals(adapted.map((product) => product.slug), ["com-midia-publica"]);
});

// Regression for the real production shape: when the CMS returns the gallery media
// as an unpopulated relationship (a raw id) — e.g. because the media is not publicly
// readable — the product must stay protected instead of rendering without an image.
Deno.test("product whose cover media is an unpopulated id is rejected", () => {
  const unpopulated = validProduct({ id: 59, slug: "midia-nao-populada" });
  (unpopulated.gallery![0] as { image: unknown }).image = 126;

  const home = homeWith([
    validProduct({ id: 55, slug: "com-midia-publica" }),
    unpopulated,
  ]);

  const adapted = toSelectedObjects(home, BASE_URL);

  assertEquals(adapted.map((product) => product.slug), ["com-midia-publica"]);
});

// Regression: a selectedProducts entry that arrives as a raw id (relationship not
// populated at all) must be dropped, never crash the section.
Deno.test("selected product that arrives as a raw id is dropped", () => {
  const home = homeWith([
    validProduct({ id: 55, slug: "populado" }),
    64,
  ]);

  const adapted = toSelectedObjects(home, BASE_URL);

  assertEquals(adapted.map((product) => product.slug), ["populado"]);
});
