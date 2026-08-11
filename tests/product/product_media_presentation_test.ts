import { assert, assertAlmostEquals, assertEquals } from "@std/assert";
import {
  clampViewerTransform,
  getContainCoverage,
  getTwoImagePresentation,
  mediaAspectRatio,
} from "../../lib/esmera/productMediaPresentation.ts";
import { resolvePayloadMedia } from "../../lib/payload/media.ts";
import type { PayloadMedia } from "../../lib/payload/types.ts";

Deno.test("media aspect ratio requires real positive dimensions", () => {
  assertAlmostEquals(
    mediaAspectRatio({ width: 1600, height: 900 }) ?? 0,
    16 / 9,
  );
  assertEquals(mediaAspectRatio({ width: 0, height: 900 }), null);
  assertEquals(mediaAspectRatio({}), null);
});

Deno.test("contain coverage reports how much of the stage can be used without crop", () => {
  assertAlmostEquals(getContainCoverage(0.8, 0.568), 0.71, 0.01);
  assert(getContainCoverage(16 / 9, 0.568) < 0.35);
});

Deno.test("two compatible portrait photos keep editorial split", () => {
  assertEquals(
    getTwoImagePresentation(
      [{ width: 900, height: 1125 }, { width: 900, height: 1125 }],
      900,
      792,
    ),
    "split",
  );
});

Deno.test("mixed or unknown ratios fall back to one dominant stage", () => {
  assertEquals(
    getTwoImagePresentation(
      [{ width: 900, height: 1125 }, { width: 1600, height: 900 }],
      900,
      792,
    ),
    "stage",
  );
  assertEquals(
    getTwoImagePresentation(
      [{ width: 900, height: 1125 }, {}],
      900,
      792,
    ),
    "stage",
  );
});

Deno.test("viewer transform resets at 1x and clamps pan at 3x", () => {
  assertEquals(
    clampViewerTransform(
      { scale: 1, x: 400, y: -400 },
      1000,
      700,
      1600,
      900,
    ),
    { scale: 1, x: 0, y: 0 },
  );

  const clamped = clampViewerTransform(
    { scale: 4, x: 9999, y: -9999 },
    1000,
    700,
    1600,
    900,
  );
  assertEquals(clamped.scale, 3);
  assert(clamped.x < 9999);
  assert(clamped.y > -9999);
});

Deno.test("resolved product media carries wide dimensions and original high-resolution source", () => {
  const media: PayloadMedia = {
    id: "media-1",
    url: "/media/original.jpg",
    width: 2400,
    height: 1600,
    alt: "Peça completa",
    _status: "published",
    sizes: {
      wide: {
        url: "/media/wide.jpg",
        width: 1200,
        height: 800,
      },
    },
  };

  const resolved = resolvePayloadMedia(
    media,
    "https://cms.example.com",
    "wide",
  );
  assert(resolved);
  assertEquals(resolved.url, "https://cms.example.com/media/wide.jpg");
  assertEquals(resolved.width, 1200);
  assertEquals(resolved.height, 800);
  assertEquals(resolved.fullUrl, "https://cms.example.com/media/original.jpg");
  assertEquals(resolved.fullWidth, 2400);
  assertEquals(resolved.fullHeight, 1600);
});
