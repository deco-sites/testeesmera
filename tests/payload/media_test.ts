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
  const withTerritory = resolvePayloadMedia({
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
  }, "https://cms.example.com", "territory");

  assertEquals(withTerritory?.url, "https://cms.example.com/media/panel-1200x2160.jpg");
  assertEquals(withTerritory?.width, 1200);
  assertEquals(withTerritory?.height, 2160);

  const legacyUpload = resolvePayloadMedia({
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
  }, "https://cms.example.com", "territory");

  assertEquals(legacyUpload?.url, "https://cms.example.com/media/original-vertical.jpg");
  assertEquals(legacyUpload?.width, 1200);
  assertEquals(legacyUpload?.height, 2160);
});
