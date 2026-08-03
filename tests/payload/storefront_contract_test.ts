import { assertEquals } from "@std/assert";
import { defaultHome } from "../../lib/esmera/homeBaseline.ts";
import { resolveHome } from "../../lib/esmera/resolveHome.ts";
import { validatePayloadContract } from "../../lib/payload/contract/validate.ts";
import type { PayloadHome, PayloadProduct } from "../../lib/payload/types.ts";

function validProduct(): PayloadProduct {
  return {
    id: 21,
    title: "Nódulo I",
    slug: "nodulo-i",
    code: "OBJ-021",
    catalogStatus: "active",
    categories: [{
      id: 8,
      title: "Esculturas",
      slug: "esculturas",
      status: "active",
      _status: "published",
    }],
    gallery: [{
      image: {
        id: 91,
        url: "https://cdn.example.com/nodulo.jpg",
        alt: "Escultura em esmeralda",
        _status: "published",
      },
      mediaKey: "principal",
      role: "cover",
      alt: "Escultura em esmeralda",
    }],
    availability: "unique",
    priceMode: "inquiry",
    optionDefinitions: [],
    variants: [],
    _status: "published",
  };
}

Deno.test("accepts a renderable product contract", () => {
  const validation = validatePayloadContract("product", validProduct());
  assertEquals(validation.compatible, true);
  assertEquals(validation.diagnostics, []);
});

Deno.test("rejects incomplete product data before adaptation", () => {
  const validation = validatePayloadContract("product", {
    ...validProduct(),
    title: "",
    categories: [],
    gallery: [],
  });
  assertEquals(validation.compatible, false);
  assertEquals(
    validation.diagnostics.map((item) => item.path),
    ["title", "categories", "gallery"],
  );
});

Deno.test("records source metadata without changing resolved section props", () => {
  const home = {
    _status: "published",
    manifestoTitle: "Título do Payload",
  } as PayloadHome;
  const resolved = resolveHome({
    home,
    sources: { home: "payload_override" },
  });

  assertEquals(resolved.manifesto?.title, "Título do Payload");
  assertEquals(resolved.sources.manifesto, "payload_override");
  assertEquals(resolved.sources.hero, "deco_baseline");
  assertEquals(
    resolved.hero?.slides?.[0].desktopImage,
    defaultHome.hero.slides?.[0].desktopImage,
  );
});

Deno.test("explicitly disabled sections win over Payload and baseline", () => {
  const home = {
    _status: "published",
    disabledSections: ["hero"],
    heroSlides: [],
  } as PayloadHome & { disabledSections: string[] };
  const resolved = resolveHome({ home });

  assertEquals(resolved.hero, null);
  assertEquals(resolved.sources.hero, "disabled");
});
