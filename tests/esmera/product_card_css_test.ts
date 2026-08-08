import { assert, assertFalse, assertStringIncludes } from "@std/assert";

Deno.test("product card stylesheet is the only owner of card presentation", async () => {
  const [catalog, finish, master, card, app] = await Promise.all([
    Deno.readTextFile("static/esmera-catalog-v2.css"),
    Deno.readTextFile("static/esmera-finish.css"),
    Deno.readTextFile("static/esmera-master.css"),
    Deno.readTextFile("static/esmera-product-card.css"),
    Deno.readTextFile("routes/_app.tsx"),
  ]);

  for (const legacy of [catalog, finish, master]) {
    assertFalse(legacy.includes(".esv-product-card"));
    assertFalse(legacy.includes(".esv-product-card-copy"));
  }
  assertFalse(finish.includes(".esv-product-actions button"));
  assertFalse(/(^|,)\s*\.esv-product-actions button/m.test(master));

  assertStringIncludes(
    card,
    ".esv-collection-v2-grid > .esv-product-card",
  );
  assertStringIncludes(card, ".esv-product-shelf > .esv-product-card");
  assertStringIncludes(card, ".esv-collection-v2-grid .esv-card-cta");
  assertStringIncludes(card, ".esv-product-shelf .esv-card-cta");
  assertStringIncludes(card, "background: transparent");
  assertStringIncludes(card, "background: var(--product-card-cta)");

  const cardIndex = app.indexOf(
    "/esmera-product-card.css?revision=${revision}",
  );
  const headerIndex = app.indexOf("/esmera-header.css");
  assert(cardIndex > headerIndex);
});
