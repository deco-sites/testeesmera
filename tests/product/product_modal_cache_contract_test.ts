import { assert, assertStringIncludes } from "@std/assert";

Deno.test("product modal styles are revisioned and frame guard loads after modal CSS", async () => {
  const app = await Deno.readTextFile("routes/_app.tsx");
  const guard = await Deno.readTextFile(
    "static/esmera-product-modal-frame-fix.css",
  );

  assertStringIncludes(
    app,
    'const storefrontStyleRevision = "2026-08-11-product-modal-gallery-v15";',
  );
  assertStringIncludes(
    app,
    "/esmera-product-modal-v2.css?v=${storefrontStyleRevision}",
  );
  assertStringIncludes(
    app,
    "/esmera-product-modal-frame-fix.css?v=${storefrontStyleRevision}",
  );

  const modalStyles = app.indexOf("/esmera-product-modal-v2.css");
  const frameGuard = app.indexOf("/esmera-product-modal-frame-fix.css");
  assert(modalStyles >= 0);
  assert(frameGuard > modalStyles);

  assertStringIncludes(guard, ".esv-product-modal-gallery-frame");
  assertStringIncludes(guard, "width: 100%;");
  assertStringIncludes(guard, "height: 100%;");
  assertStringIncludes(guard, "align-self: stretch;");
  assertStringIncludes(guard, "justify-self: stretch;");
});
