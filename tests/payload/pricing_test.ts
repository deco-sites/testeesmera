import { assertEquals } from "@std/assert";
import { resolveProductPrice } from "../../lib/payload/pricing.ts";
import type { PayloadProduct } from "../../lib/payload/types.ts";

const product = {
  id: 1,
  title: "Objeto",
  slug: "objeto",
  code: "OBJ",
  priceMode: "fixed",
  basePriceCents: 1490000,
} satisfies PayloadProduct;
Deno.test("uses integer cents and variant price overrides", () => {
  assertEquals(resolveProductPrice(product).priceCents, 1490000);
  assertEquals(
    resolveProductPrice(product, {
      sku: "A",
      priceMode: "fixed",
      priceCents: 990000,
    }).priceCents,
    990000,
  );
  assertEquals(
    resolveProductPrice(product, { sku: "B", priceMode: "inquiry" }).priceCents,
    null,
  );
});
