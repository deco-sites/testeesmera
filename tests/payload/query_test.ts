import { assertEquals } from "@std/assert";
import {
  buildPayloadQuery,
  whereAnd,
  whereContains,
  whereEquals,
} from "../../lib/payload/query.ts";

Deno.test("serializes slug, category, sort and pagination", () => {
  const query = buildPayloadQuery({
    depth: 2,
    limit: 12,
    page: 3,
    sort: "order,title",
    where: whereAnd(
      whereEquals("slug", "esculturas"),
      whereContains("categories", 7),
    ),
  });
  assertEquals(query.get("where[and][0][slug][equals]"), "esculturas");
  assertEquals(query.get("where[and][1][categories][contains]"), "7");
  assertEquals(query.get("sort"), "order,title");
  assertEquals(query.get("page"), "3");
});
