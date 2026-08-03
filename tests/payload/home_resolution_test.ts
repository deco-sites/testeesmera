import { assert, assertEquals } from "@std/assert";
import { defaultHome } from "../../lib/esmera/homeBaseline.ts";
import { resolveHome } from "../../lib/esmera/resolveHome.ts";
import { toHero } from "../../lib/payload/adapters.ts";
import type { PayloadHome } from "../../lib/payload/types.ts";

Deno.test("keeps the complete editorial baseline when Payload is unavailable", () => {
  const resolved = resolveHome({});
  assertEquals(
    resolved.hero?.slides?.[0].desktopImage,
    defaultHome.hero.slides?.[0].desktopImage,
  );
  assertEquals(resolved.manifesto?.title, defaultHome.manifesto.title);
  assertEquals(resolved.matter?.panels?.length, 3);
  assertEquals(resolved.provenance?.stages?.length, 3);
  assertEquals(resolved.selectedObjects?.products, []);
  assertEquals(resolved.signature, []);
});

Deno.test("a partial CMS document overrides only populated fields", () => {
  const home = {
    _status: "published",
    manifestoTitle: "Teste",
    heroSlides: [],
    matterPanels: [],
  } as PayloadHome;
  const resolved = resolveHome({ home });
  assertEquals(resolved.manifesto?.title, "Teste");
  assertEquals(
    resolved.manifesto?.mainImage,
    defaultHome.manifesto.mainImage,
  );
  assertEquals(
    resolved.hero?.slides?.[0].desktopImage,
    defaultHome.hero.slides?.[0].desktopImage,
  );
  assertEquals(resolved.matter?.panels?.length, 3);
});

Deno.test("sections disappear only through explicit disabledSections", () => {
  const home = {
    _status: "published",
    disabledSections: ["hero", "matter", "privateInvitation"],
  } as PayloadHome & { disabledSections: string[] };
  const resolved = resolveHome({ home });
  assertEquals(resolved.hero, null);
  assertEquals(resolved.matter, null);
  assertEquals(resolved.privateInvitation, null);
  assert(resolved.manifesto);
  assert(resolved.footer);
});

Deno.test("grouped Payload image fields produce valid hero slides", () => {
  const home = {
    _status: "published",
    heroMode: "single",
    heroSlides: [{
      desktopImage: {
        image: {
          id: 1,
          url: "/media/hero.jpg",
          alt: "Alt da mídia",
          _status: "published",
        },
        alt: "Alt editorial",
      },
      statement: "Forma e matéria",
      active: true,
    }],
  } as unknown as PayloadHome;
  const hero = toHero(home, "https://cms.example.com");
  assertEquals(hero.slides[0].desktopImage, "https://cms.example.com/media/hero.jpg");
  assertEquals(hero.slides[0].alt, "Alt editorial");
});
