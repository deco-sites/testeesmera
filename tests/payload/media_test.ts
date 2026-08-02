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
