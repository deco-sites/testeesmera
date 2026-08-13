import { assertAlmostEquals, assertEquals } from "@std/assert";
import {
  buildGalleryPlates,
  cellSizes,
  classifyOrientation,
  FALLBACK_MEDIA_RATIO,
  mediaIndexForKeys,
  orderGalleryMedia,
} from "../../lib/esmera/gallery.ts";

Deno.test("gallery keeps stable editorial role order", () => {
  const ordered = orderGalleryMedia([
    { key: "scale-1", role: "scale" },
    { key: "detail-1", role: "detail" },
    { key: "cover-1", role: "cover" },
    { key: "detail-2", role: "detail" },
    { key: "context-1", role: "context" },
    { key: "other-1", role: "other" },
  ]);
  assertEquals(ordered.map((item) => item.key), [
    "cover-1",
    "detail-1",
    "detail-2",
    "context-1",
    "scale-1",
    "other-1",
  ]);
});

Deno.test("one landscape becomes one full editorial plate", () => {
  assertEquals(
    buildGalleryPlates([{ width: 1500, height: 1000 }], "editorial"),
    [
      { indices: [0], columns: 1, mount: "full" },
    ],
  );
});

Deno.test("two portraits become one two-column diptych", () => {
  assertEquals(
    buildGalleryPlates([
      { width: 900, height: 1200 },
      { width: 900, height: 1200 },
    ], "editorial"),
    [
      { indices: [0, 1], columns: 2, mount: "full" },
    ],
  );
});

Deno.test("three portraits leave the last one centered as mounted", () => {
  assertEquals(
    buildGalleryPlates([
      { width: 900, height: 1200 },
      { width: 900, height: 1200 },
      { width: 900, height: 1200 },
    ], "editorial"),
    [
      { indices: [0, 1], columns: 2, mount: "full" },
      { indices: [2], columns: 1, mount: "mounted" },
    ],
  );
});

Deno.test("four portraits become two diptychs", () => {
  const portrait = { width: 900, height: 1200 };
  assertEquals(
    buildGalleryPlates(
      [portrait, portrait, portrait, portrait],
      "editorial",
    ),
    [
      { indices: [0, 1], columns: 2, mount: "full" },
      { indices: [2, 3], columns: 2, mount: "full" },
    ],
  );
});

Deno.test("portrait landscape portrait become three editorial plates", () => {
  assertEquals(
    buildGalleryPlates([
      { width: 900, height: 1200 },
      { width: 1500, height: 1000 },
      { width: 900, height: 1200 },
    ], "editorial"),
    [
      { indices: [0], columns: 1, mount: "mounted" },
      { indices: [1], columns: 1, mount: "full" },
      { indices: [2], columns: 1, mount: "mounted" },
    ],
  );
});

Deno.test("two square images form a diptych", () => {
  assertEquals(
    buildGalleryPlates([
      { width: 1000, height: 1000 },
      { width: 1000, height: 1000 },
    ], "editorial"),
    [
      { indices: [0, 1], columns: 2, mount: "full" },
    ],
  );
});

Deno.test("missing dimensions stay full and use the canonical 3/2 fallback", () => {
  assertEquals(classifyOrientation({}), "unknown");
  assertAlmostEquals(FALLBACK_MEDIA_RATIO, 3 / 2);
  assertEquals(buildGalleryPlates([{}], "editorial"), [
    { indices: [0], columns: 1, mount: "full" },
  ]);
});

Deno.test("compact format always creates one image per plate", () => {
  assertEquals(
    buildGalleryPlates([
      { width: 900, height: 1200 },
      { width: 900, height: 1200 },
      { width: 1500, height: 1000 },
    ], "compact"),
    [
      { indices: [0], columns: 1, mount: "full" },
      { indices: [1], columns: 1, mount: "full" },
      { indices: [2], columns: 1, mount: "full" },
    ],
  );
});

Deno.test("mediaIndexForKeys returns -1 without a matching media key", () => {
  assertEquals(
    mediaIndexForKeys([{ key: "cover" }, { key: "detail" }], ["missing"]),
    -1,
  );
});

Deno.test("diptych cellSizes requests half of the stage width", () => {
  assertEquals(
    cellSizes({ indices: [0, 1], columns: 2, mount: "full" }),
    "(max-width: 1023px) 50vw, 50vw",
  );
});
