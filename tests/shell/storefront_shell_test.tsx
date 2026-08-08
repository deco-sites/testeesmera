import {
  assert,
  assertFalse,
  assertStringIncludes,
} from "@std/assert";
import { renderToString } from "preact-render-to-string";
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

Deno.test("shared header owns navigation and preserves Menu → Logo → Search → Cart order", () => {
  const html = renderToString(
    <EsmeraHeader
      logo="ESMÉRA"
      enquiryLabel="Carrinho"
      menu={menu}
      whatsappHref="https://wa.me/5500000000000"
    />,
  );

  const headerStart = html.indexOf('<header class="esv-header');
  const headerEnd = html.indexOf("</header>", headerStart);
  const navStart = html.indexOf('<nav class="esv-nav-v2-desktop"', headerStart);
  const wordmarkStart = html.indexOf('class="esv-wordmark"', headerStart);
  const searchStart = html.indexOf('aria-label="Buscar objetos"', headerStart);
  const cartStart = html.indexOf("Carrinho", searchStart);

  assert(headerStart >= 0);
  assert(headerEnd > headerStart);
  assert(navStart > headerStart && navStart < headerEnd);
  assert(wordmarkStart > navStart && wordmarkStart < headerEnd);
  assert(searchStart > wordmarkStart && searchStart < headerEnd);
  assert(cartStart > searchStart && cartStart < headerEnd);

  assertStringIncludes(html, 'data-header-variant="solid"');
  assertStringIncludes(html, 'data-header-state="solid"');
  assertStringIncludes(html, "is-solid");
  assertStringIncludes(html, 'href="/"');
  assertStringIncludes(html, 'href="/colecao"');
  assertStringIncludes(html, 'aria-label="Abrir menu"');
  assertStringIncludes(html, "<svg");
  assertFalse(html.includes('class="esv-header-nav"'));
  assertFalse(html.includes("☰"));
  assertFalse(html.includes("⌕"));
});

Deno.test("transparent is explicit and solid remains the SSR default", () => {
  const transparent = renderToString(
    <EsmeraHeader
      logo="ESMÉRA"
      enquiryLabel="Carrinho"
      menu={menu}
      whatsappHref=""
      variant="transparent"
    />,
  );

  assertStringIncludes(transparent, 'data-header-variant="transparent"');
  assertStringIncludes(transparent, 'data-header-state="transparent"');
  assertFalse(transparent.includes("is-solid"));
});

Deno.test("unified header stylesheet is authoritative and loaded last", async () => {
  const commerceCss = await Deno.readTextFile("static/esmera-commerce-refine.css");
  const headerCss = await Deno.readTextFile("static/esmera-header.css");
  const app = await Deno.readTextFile("routes/_app.tsx");
  const headerIsland = await Deno.readTextFile("islands/EsmeraHeader.tsx");
  const headerSection = await Deno.readTextFile("sections/Esmera/Header.tsx");
  const shellData = await Deno.readTextFile("lib/esmera/shellData.ts");

  assertStringIncludes(headerCss, ".esv-header.is-solid");
  assertStringIncludes(headerCss, '[data-header-variant="transparent"]');
  assertStringIncludes(headerCss, ".esv-header .esv-nav-v2-desktop");
  assertStringIncludes(headerCss, ".esv-header .esv-nav-v2-mobile-trigger");
  assertStringIncludes(headerCss, ".esv-header .esv-mega-v2");
  assertStringIncludes(headerCss, ".esv-header .esv-nav-v2-drawer");
  assertStringIncludes(headerCss, "position: static;");
  assertFalse(headerCss.includes("body:has("));

  const catalogIndex = app.indexOf("/esmera-catalog-v2.css");
  const headerIndex = app.indexOf("/esmera-header.css");
  assert(catalogIndex >= 0 && headerIndex > catalogIndex);

  assertStringIncludes(commerceCss, "body.esv-overlay-open");
  assertStringIncludes(commerceCss, "overflow-anchor: none");
  assertStringIncludes(commerceCss, ".esv-cart-quantity");
  assertStringIncludes(commerceCss, ".esv-search-field");

  assertStringIncludes(headerIsland, 'body.style.position = "fixed"');
  assertStringIncludes(headerIsland, "globalThis.scrollTo");
  assertStringIncludes(headerIsland, "setIsScrolled");
  assertStringIncludes(headerIsland, 'class="esv-cart-quantity"');
  assertStringIncludes(headerIsland, 'class="esv-cart-remove"');
  assertStringIncludes(headerIsland, "<DynamicMenu");
  assertFalse(headerIsland.includes("is-scrolled"));

  assertFalse(headerSection.includes('import DynamicMenu from'));
  assertFalse(headerSection.includes("navigation?:"));
  assertFalse(headerSection.includes("categories?:"));
  assertStringIncludes(shellData, 'HeaderVariant = "transparent" | "solid"');
  assertFalse(shellData.includes("over-hero"));
});

Deno.test("hero preserves grid layout despite the main-content shell selector", async () => {
  const hero = await Deno.readTextFile("sections/Esmera/Hero.tsx");
  const carousel = await Deno.readTextFile("islands/HeroCarousel.tsx");

  assertStringIncludes(hero, 'style={{ display: "grid" }}');
  assertStringIncludes(carousel, 'style={{ display: "grid" }}');
});
