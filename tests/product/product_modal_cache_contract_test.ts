import { assert, assertStringIncludes } from "@std/assert";

Deno.test("product modal styles are revisioned and media fidelity layer loads last", async () => {
  const app = await Deno.readTextFile("routes/_app.tsx");
  const guard = await Deno.readTextFile(
    "static/esmera-product-modal-frame-fix.css",
  );
  const fidelity = await Deno.readTextFile(
    "static/esmera-product-media-v16.css",
  );

  assertStringIncludes(
    app,
    'const storefrontStyleRevision = "2026-08-12-responsive-modal-header-v19";',
  );
  assertStringIncludes(
    app,
    "/esmera-product-modal-v2.css?v=${storefrontStyleRevision}",
  );
  assertStringIncludes(
    app,
    "/esmera-product-modal-frame-fix.css?v=${storefrontStyleRevision}",
  );
  assertStringIncludes(
    app,
    "/esmera-product-media-v16.css?v=${storefrontStyleRevision}",
  );

  const modalStyles = app.indexOf("/esmera-product-modal-v2.css");
  const frameGuard = app.indexOf("/esmera-product-modal-frame-fix.css");
  const mediaFidelity = app.indexOf("/esmera-product-media-v16.css");
  assert(modalStyles >= 0);
  assert(frameGuard > modalStyles);
  assert(mediaFidelity > frameGuard);

  assertStringIncludes(guard, ".esv-product-modal-gallery-frame");
  assertStringIncludes(guard, "width: 100%;");
  assertStringIncludes(guard, "height: auto;");
  assertStringIncludes(guard, "--esv-modal-gallery-ratio: 6 / 5;");
  assertStringIncludes(guard, "--esv-modal-gallery-ratio: 1 / 1;");
  assertStringIncludes(guard, "--esv-modal-gallery-ratio: 4 / 5;");
  assertStringIncludes(guard, "aspect-ratio: var(--esv-modal-gallery-ratio);");
  assertStringIncludes(guard, "align-self: stretch;");
  assertStringIncludes(guard, "justify-self: stretch;");
  assertStringIncludes(fidelity, "object-fit: cover !important");
  assertStringIncludes(fidelity, ".esv-product-viewer-stage");
  assertStringIncludes(fidelity, "touch-action: none;");
});
