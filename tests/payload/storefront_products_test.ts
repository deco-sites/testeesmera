import { assertEquals } from "@std/assert";
import {
  fetchStorefrontProducts,
  type StorefrontProductsV2,
} from "../../lib/esmera/storefront.ts";

Deno.test("requests the enriched root catalog with filters", async () => {
  const previous = Deno.env.get("PAYLOAD_API_URL");
  let requested = "";
  try {
    Deno.env.set("PAYLOAD_API_URL", "https://cms.example.com");
    const response: StorefrontProductsV2 = {
      version: 2,
      revision: "catalog-revision",
      catalog: { title: "Coleções", visibleFilters: ["material", "price"] },
      items: [],
      pagination: {
        page: 2,
        limit: 24,
        totalDocs: 0,
        totalPages: 0,
        hasNextPage: false,
        nextPage: null,
        hasPrevPage: false,
        prevPage: null,
      },
      facets: {},
      applied: {},
    };
    const params = new URLSearchParams({
      page: "2",
      limit: "24",
      piece_type: "pulseiras",
    });

    const result = await fetchStorefrontProducts(params, {
      fetcher: (input) => {
        requested = String(input);
        return Promise.resolve(Response.json(response));
      },
    });

    assertEquals(result.revision, "catalog-revision");
    assertEquals(
      requested,
      "https://cms.example.com/api/storefront/products?page=2&limit=24&piece_type=pulseiras",
    );
  } finally {
    if (previous === undefined) Deno.env.delete("PAYLOAD_API_URL");
    else Deno.env.set("PAYLOAD_API_URL", previous);
  }
});

Deno.test("ObjectCard consumes Storefront and keeps the resolved Home fallback", async () => {
  const source = await Deno.readTextFile(
    new URL("../../components/esmera/ObjectCard.tsx", import.meta.url),
  );
  assertEquals(source.includes("toProductCardViewModel(item)"), true);
  assertEquals(source.includes("esmeraObjectToCardViewModel(item)"), true);
});
