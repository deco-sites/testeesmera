import { assert, assertEquals } from "@std/assert";
import {
  clampViewerScale,
  clampViewerTransform,
  fittedMediaSize,
  MAX_VIEWER_SCALE,
  MIN_VIEWER_SCALE,
} from "../../lib/esmera/productMediaPresentation.ts";

Deno.test("viewer scale clamps to the supported interval", () => {
  assertEquals(clampViewerScale(Number.NaN), MIN_VIEWER_SCALE);
  assertEquals(clampViewerScale(0.5), MIN_VIEWER_SCALE);
  assertEquals(clampViewerScale(2), 2);
  assertEquals(clampViewerScale(8), MAX_VIEWER_SCALE);
});

Deno.test("viewer fits media inside the stage without cropping", () => {
  assertEquals(fittedMediaSize(1000, 700, 1600, 900), {
    width: 1000,
    height: 562.5,
  });
  assertEquals(fittedMediaSize(0, 700, 1600, 900), {
    width: 0,
    height: 0,
  });
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
