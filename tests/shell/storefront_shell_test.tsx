import { assertFalse, assertStringIncludes } from "@std/assert";
import { renderToString } from "preact-render-to-string";
import EsmeraHeader from "../../islands/EsmeraHeader.tsx";

const navigation = [
  { label: "Seleção", href: "#selection", external: false },
  { label: "Objetos", href: "/colecao", external: false },
  { label: "Maison", href: "/sobre", external: false },
];

Deno.test("header renders semantic navigation and stable controls", () => {
  const html = renderToString(
    <EsmeraHeader
      logo="ESMÉRA"
      enquiryLabel="Carrinho"
      navigation={navigation}
      categories={[]}
      whatsappHref="https://wa.me/5500000000000"
    />,
  );

  assertStringIncludes(html, 'class="esv-header"');
  assertStringIncludes(html, '<nav class="esv-header-nav"');
  assertStringIncludes(html, 'href="#selection"');
  assertStringIncludes(html, 'aria-label="Abrir menu"');
  assertStringIncludes(html, 'aria-label="Buscar objetos"');
  assertStringIncludes(html, "Carrinho");
  assertStringIncludes(html, "<svg");
  assertFalse(html.includes("☰"));
  assertFalse(html.includes("⌕"));
});

Deno.test("shell stylesheet matches the interactive markup contract", async () => {
  const css = await Deno.readTextFile("static/esmera-commerce-refine.css");
  const island = await Deno.readTextFile("islands/EsmeraHeader.tsx");

  assertStringIncludes(css, ".esv-menu-primary-links > a");
  assertStringIncludes(css, ".esv-menu-subnav a");
  assertStringIncludes(css, "body.esv-overlay-open");
  assertStringIncludes(css, "overflow-anchor: none");
  assertStringIncludes(css, ".esv-cart-quantity");
  assertStringIncludes(css, ".esv-search-field");

  assertStringIncludes(island, 'body.style.position = "fixed"');
  assertStringIncludes(island, "globalThis.scrollTo");
  assertStringIncludes(island, "setIsScrolled");
  assertStringIncludes(island, 'class="esv-cart-quantity"');
  assertStringIncludes(island, 'class="esv-cart-remove"');
});

Deno.test("hero preserves grid layout despite the main-content shell selector", async () => {
  const hero = await Deno.readTextFile("sections/Esmera/Hero.tsx");
  const carousel = await Deno.readTextFile("islands/HeroCarousel.tsx");

  assertStringIncludes(hero, 'style={{ display: "grid" }}');
  assertStringIncludes(carousel, 'style={{ display: "grid" }}');
});
