import { assert, assertStringIncludes } from "@std/assert";

Deno.test("premium footer owns its final visual layer and receives shell channels", async () => {
  const footer = await Deno.readTextFile("sections/Esmera/Footer.tsx");
  const layout = await Deno.readTextFile("components/esmera/StorefrontLayout.tsx");
  const app = await Deno.readTextFile("routes/_app.tsx");
  const css = await Deno.readTextFile("static/esmera-footer.css");

  assertStringIncludes(footer, 'class="esv-footer esv-footer-premium"');
  assertStringIncludes(footer, 'class="esv-footer-newsletter"');
  assertStringIncludes(footer, 'class="esv-footer-grid"');
  assertStringIncludes(footer, 'class="esv-footer-curation-badge"');
  assertStringIncludes(footer, 'class="esv-footer-socials"');
  assertStringIncludes(footer, 'class="esv-footer-bottom-bar"');

  assertStringIncludes(layout, "collectionLinks={shell.categories}");
  assertStringIncludes(layout, "instagramHref={shell.instagramHref}");

  const aboutCss = app.indexOf("/esmera-about-page.css");
  const footerCss = app.indexOf("/esmera-footer.css");
  assert(aboutCss >= 0 && footerCss > aboutCss);
  assertStringIncludes(app, 'footerStyleRevision = "2026-08-14-footer-v1"');

  assertStringIncludes(css, ".esv-footer.esv-footer-premium");
  assertStringIncludes(css, "grid-template-columns:");
  assertStringIncludes(css, "@media (max-width: 767px)");
  assertStringIncludes(css, "@media (prefers-reduced-motion: reduce)");
});
