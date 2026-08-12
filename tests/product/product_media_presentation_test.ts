import { assert, assertAlmostEquals, assertEquals } from "@std/assert";
import {
  buildGallerySlides,
  calculateGalleryFrameRatio,
  clampViewerTransform,
  classifyOrientation,
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

Deno.test("original dimensions define orientation even when a rendition was cropped", () => {
  const croppedPortrait = {
    width: 1800,
    height: 1200,
    fullWidth: 1200,
    fullHeight: 1600,
  };
  assertAlmostEquals(mediaAspectRatio(croppedPortrait) ?? 0, 0.75);
  assertEquals(classifyOrientation(croppedPortrait), "portrait");
  assertEquals(buildGallerySlides([croppedPortrait, croppedPortrait], "desktop"), [
    { kind: "pair", indices: [0, 1], ratio: 1.5 },
  ]);
});

Deno.test("one horizontal image keeps its natural desktop ratio", () => {
  const slides = buildGallerySlides([{ width: 1500, height: 1000 }], "desktop");
  assertEquals(slides, [{ kind: "single", indices: [0], ratio: 1.5 }]);
  assertAlmostEquals(calculateGalleryFrameRatio(slides, "desktop"), 1.5);
});

Deno.test("one vertical image uses an editorial half-pair only on desktop", () => {
  const images = [{ width: 800, height: 1000 }];
  const desktop = buildGallerySlides(images, "desktop");
  const compact = buildGallerySlides(images, "compact");
  assertEquals(desktop, [{ kind: "pair", indices: [0], ratio: 1.6 }]);
  assertEquals(compact, [{ kind: "single", indices: [0], ratio: 0.8 }]);
  assertAlmostEquals(calculateGalleryFrameRatio(desktop, "desktop"), 1.6);
  assertAlmostEquals(calculateGalleryFrameRatio(compact, "compact"), 0.8);
});

Deno.test("two vertical images become one continuous diptych", () => {
  const slides = buildGallerySlides(
    [{ width: 800, height: 1000 }, { width: 760, height: 1000 }],
    "desktop",
  );
  assertEquals(slides, [{ kind: "pair", indices: [0, 1], ratio: 1.52 }]);
  assertAlmostEquals(calculateGalleryFrameRatio(slides, "desktop"), 1.52);
});

Deno.test("three vertical images leave the last right cell intentionally empty", () => {
  const slides = buildGallerySlides(
    Array.from({ length: 3 }, () => ({ width: 800, height: 1000 })),
    "desktop",
  );
  assertEquals(slides, [
    { kind: "pair", indices: [0, 1], ratio: 1.6 },
    { kind: "pair", indices: [2], ratio: 1.6 },
  ]);
  assertAlmostEquals(calculateGalleryFrameRatio(slides, "desktop"), 1.6);
});

Deno.test("four vertical images become two diptychs", () => {
  const slides = buildGallerySlides(
    Array.from({ length: 4 }, () => ({ width: 900, height: 1125 })),
    "desktop",
  );
  assertEquals(slides, [
    { kind: "pair", indices: [0, 1], ratio: 1.6 },
    { kind: "pair", indices: [2, 3], ratio: 1.6 },
  ]);
});

Deno.test("interleaved vertical and horizontal media preserve order", () => {
  const slides = buildGallerySlides([
    { width: 800, height: 1000 },
    { width: 1500, height: 1000 },
    { width: 800, height: 1000 },
  ], "desktop");
  assertEquals(slides, [
    { kind: "pair", indices: [0], ratio: 1.6 },
    { kind: "single", indices: [1], ratio: 1.5 },
    { kind: "pair", indices: [2], ratio: 1.6 },
  ]);
  assertAlmostEquals(calculateGalleryFrameRatio(slides, "desktop"), 1.5);
});

Deno.test("unknown dimensions use a single fallback slide", () => {
  assertEquals(classifyOrientation({}), "unknown");
  const slides = buildGallerySlides([{}], "desktop");
  assertEquals(slides, [{ kind: "single", indices: [0], ratio: 0.8 }]);
  assertAlmostEquals(calculateGalleryFrameRatio(slides, "desktop"), 0.8);
});

Deno.test("square media is landscape-oriented and never paired", () => {
  const square = { width: 1000, height: 1000 };
  assertEquals(classifyOrientation(square), "landscape");
  assertEquals(buildGallerySlides([square], "desktop"), [
    { kind: "single", indices: [0], ratio: 1 },
  ]);
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

Deno.test("resolved product media carries rendition dimensions and original high-resolution source", () => {
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
