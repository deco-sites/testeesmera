import { assert, assertFalse, assertStringIncludes } from "@std/assert";

Deno.test("product card stylesheet is the only owner of card presentation", async () => {
  const [catalog, finish, master, card, app, component] = await Promise.all([
    Deno.readTextFile("static/esmera-catalog-v2.css"),
    Deno.readTextFile("static/esmera-finish.css"),
    Deno.readTextFile("static/esmera-master.css"),
    Deno.readTextFile("static/esmera-product-card.css"),
    Deno.readTextFile("routes/_app.tsx"),
    Deno.readTextFile("components/esmera/ObjectCard.tsx"),
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
  assertStringIncludes(card, "background: var(--product-card-ground)");
  assertStringIncludes(card, "border-radius: var(--product-card-radius)");
  assertStringIncludes(card, "aspect-ratio: 4 / 3");
  assertStringIncludes(card, ".esv-card-footer");
  assertStringIncludes(card, ".esv-card-status::before");
  assertFalse(card.includes(".esv-card-cta"));

  assertStringIncludes(component, 'style={{ aspectRatio: "4 / 3" }}');
  assertStringIncludes(component, 'class="esv-card-footer"');
  assertStringIncludes(component, "compactCardStatus(vm.status)");
  assertFalse(component.includes("BuyButton"));

  const cardIndex = app.indexOf(
    "/esmera-product-card.css?revision=${revision}",
  );
  const headerIndex = app.indexOf("/esmera-header.css");
  assert(cardIndex > headerIndex);
});
