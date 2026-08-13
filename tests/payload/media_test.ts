import { assertEquals } from "@std/assert";
import { resolvePayloadMedia } from "../../lib/payload/media.ts";

Deno.test("resolves absolute, relative, missing and draft media", () => {
  assertEquals(
    resolvePayloadMedia({
      id: 1,
      url: "https://r2.example/a.jpg",
      alt: "A",
      _status: "published",
    }, "https://cms.example.com")?.url,
    "https://r2.example/a.jpg",
  );
  assertEquals(
    resolvePayloadMedia({
      id: 1,
      url: "/media/a.jpg",
      alt: "A",
      _status: "published",
    }, "https://cms.example.com")?.url,
    "https://cms.example.com/media/a.jpg",
  );
  assertEquals(resolvePayloadMedia(null, "https://cms.example.com"), null);
  assertEquals(
    resolvePayloadMedia(
      { id: 1, url: "javascript:alert(1)", _status: "published" },
      "https://cms.example.com",
    ),
    null,
  );
  assertEquals(
    resolvePayloadMedia(
      { id: 1, url: "/draft.jpg", _status: "draft" },
      "https://cms.example.com",
    ),
    null,
  );
});

Deno.test("prefers territory media and falls back to original for legacy uploads", () => {
  const withTerritory = resolvePayloadMedia(
    {
      id: 2,
      url: "/media/original.jpg",
      width: 2400,
      height: 4320,
      alt: "Painel",
      _status: "published",
      sizes: {
        wide: {
          url: "/media/panel-1800x1200.jpg",
          width: 1800,
          height: 1200,
        },
        territory: {
          url: "/media/panel-1200x2160.jpg",
          width: 1200,
          height: 2160,
        },
      },
    },
    "https://cms.example.com",
    "territory",
  );

  assertEquals(
    withTerritory?.url,
    "https://cms.example.com/media/panel-1200x2160.jpg",
  );
  assertEquals(withTerritory?.width, 1200);
  assertEquals(withTerritory?.height, 2160);

  const legacyUpload = resolvePayloadMedia(
    {
      id: 3,
      url: "/media/original-vertical.jpg",
      width: 1200,
      height: 2160,
      alt: "Painel legado",
      _status: "published",
      sizes: {
        wide: {
          url: "/media/panel-1800x1200.jpg",
          width: 1800,
          height: 1200,
        },
      },
    },
    "https://cms.example.com",
    "territory",
  );

  assertEquals(
    legacyUpload?.url,
    "https://cms.example.com/media/original-vertical.jpg",
  );
  assertEquals(legacyUpload?.width, 1200);
  assertEquals(legacyUpload?.height, 2160);
});

Deno.test("gallery rendition preserves derivative and original dimensions", () => {
  const resolved = resolvePayloadMedia(
    {
      id: 4,
      url: "/media/original-portrait.jpg",
      width: 1200,
      height: 1600,
      alt: "Retrato",
      _status: "published",
      sizes: {
        gallery: {
          url: "/media/portrait-gallery.jpg",
          width: 1350,
          height: 1800,
        },
      },
    },
    "https://cms.example.com",
    "gallery",
  );
  assertEquals(
    resolved?.url,
    "https://cms.example.com/media/portrait-gallery.jpg",
  );
  assertEquals(resolved?.width, 1350);
  assertEquals(resolved?.height, 1800);
  assertEquals(
    resolved?.fullUrl,
    "https://cms.example.com/media/original-portrait.jpg",
  );
  assertEquals(resolved?.fullWidth, 1200);
  assertEquals(resolved?.fullHeight, 1600);
});

Deno.test("gallery falls back to the original when the derivative is missing", () => {
  const resolved = resolvePayloadMedia(
    {
      id: 5,
      url: "/media/legacy-portrait.jpg",
      width: 1000,
      height: 1500,
      alt: "Legado",
      _status: "published",
      sizes: {
        wide: { url: "/media/legacy-wide.jpg", width: 1800, height: 1200 },
      },
    },
    "https://cms.example.com",
    "gallery",
  );
  assertEquals(
    resolved?.url,
    "https://cms.example.com/media/legacy-portrait.jpg",
  );
  assertEquals(resolved?.width, 1000);
  assertEquals(resolved?.height, 1500);
  assertEquals(resolved?.fullWidth, 1000);
  assertEquals(resolved?.fullHeight, 1500);
});
