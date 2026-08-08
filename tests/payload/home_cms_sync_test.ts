import { assertEquals } from "@std/assert";
import { validatePayloadContract } from "../../lib/payload/contract/validate.ts";
import type { PayloadHome } from "../../lib/payload/types.ts";

Deno.test("accepts Payload grouped hero media with a public relative URL", () => {
  const home = {
    _status: "published",
    heroMode: "single",
    heroSlides: [{
      active: true,
      statement: "Matéria em estado de presença.",
      desktopImage: {
        image: {
          id: 91,
          url: "/api/media/file/hero.webp",
          alt: "Objeto mineral em composição editorial",
          _status: "published",
        },
        alt: "Objeto mineral em composição editorial",
      },
    }],
  } as PayloadHome;

  const validation = validatePayloadContract("home", home);

  assertEquals(validation.compatible, true);
  assertEquals(validation.diagnostics, []);
});
