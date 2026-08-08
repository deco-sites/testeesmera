import { assertFalse, assertStringIncludes } from "@std/assert";
import { renderToString } from "preact-render-to-string";
import DynamicMenu from "../../islands/DynamicMenu.tsx";
import EsmeraHeader from "../../islands/EsmeraHeader.tsx";
import type { NavigationNode } from "../../lib/payload/navigation.ts";

const menu: NavigationNode[] = [
  {
    id: "home",
    label: "HOME",
    href: "/",
    external: false,
    visibility: "both",
    highlights: [],
    children: [],
  },
  {
    id: "pieces",
    label: "PEÇAS",
    href: "/colecao",
    external: false,
    visibility: "both",
    highlights: [],
    children: [],
  },
];

Deno.test("shell renders the header controls and DynamicMenu as the sole navigation", () => {
  const html = renderToString(
    <>
      <EsmeraHeader
        logo="ESMÉRA"
        enquiryLabel="Carrinho"
        whatsappHref="https://wa.me/5500000000000"
      />
      <DynamicMenu
        items={menu}
        whatsappHref="https://wa.me/5500000000000"
      />
    </>,
  );

  assertStringIncludes(html, 'class="esv-header"');
  assertStringIncludes(html, '<nav class="esv-nav-v2-desktop"');
  assertStringIncludes(html, 'href="/"');
  assertStringIncludes(html, 'href="/colecao"');
  assertStringIncludes(html, 'aria-label="Abrir menu"');
  assertStringIncludes(html, 'aria-label="Buscar objetos"');
  assertStringIncludes(html, "Carrinho");
  assertStringIncludes(html, "<svg");
  assertFalse(html.includes('class="esv-header-nav"'));
  assertFalse(html.includes("☰"));
  assertFalse(html.includes("⌕"));
});

Deno.test("shell stylesheets match the new navigation and interactive markup contracts", async () => {
  const commerceCss = await Deno.readTextFile("static/esmera-commerce-refine.css");
  const catalogCss = await Deno.readTextFile("static/esmera-catalog-v2.css");
  const headerIsland = await Deno.readTextFile("islands/EsmeraHeader.tsx");
  const menuIsland = await Deno.readTextFile("islands/DynamicMenu.tsx");

  assertStringIncludes(catalogCss, ".esv-nav-v2-desktop");
  assertStringIncludes(catalogCss, ".esv-nav-v2-mobile-trigger");
  assertStringIncludes(catalogCss, ".esv-nav-v2-drawer");
  assertStringIncludes(commerceCss, "body.esv-overlay-open");
  assertStringIncludes(commerceCss, "overflow-anchor: none");
  assertStringIncludes(commerceCss, ".esv-cart-quantity");
  assertStringIncludes(commerceCss, ".esv-search-field");

  assertStringIncludes(headerIsland, 'body.style.position = "fixed"');
  assertStringIncludes(headerIsland, "globalThis.scrollTo");
  assertStringIncludes(headerIsland, "setIsScrolled");
  assertStringIncludes(headerIsland, 'class="esv-cart-quantity"');
  assertStringIncludes(headerIsland, 'class="esv-cart-remove"');
  assertStringIncludes(menuIsland, 'class="esv-nav-v2-mobile-trigger"');
});

Deno.test("hero preserves grid layout despite the main-content shell selector", async () => {
  const hero = await Deno.readTextFile("sections/Esmera/Hero.tsx");
  const carousel = await Deno.readTextFile("islands/HeroCarousel.tsx");

  assertStringIncludes(hero, 'style={{ display: "grid" }}');
  assertStringIncludes(carousel, 'style={{ display: "grid" }}');
});
