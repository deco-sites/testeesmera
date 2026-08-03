import { assertEquals, assertStringIncludes } from "@std/assert";
import { mergeDefined } from "../../lib/esmera/editorialProps.ts";

Deno.test("defined Deco props override the resolved baseline without erasing it", () => {
  const merged = mergeDefined(
    { title: "Baseline", image: "baseline.jpg", enabled: true },
    { title: "Editor", image: undefined },
  );

  assertEquals(merged, {
    title: "Editor",
    image: "baseline.jpg",
    enabled: true,
  });
});

Deno.test("homepage image fields use the native Deco media picker", async () => {
  const contracts = [
    {
      path: "sections/Esmera/Hero.tsx",
      fragments: [
        "desktopImage: ImageWidget",
        "mobileImage?: ImageWidget",
      ],
    },
    {
      path: "sections/Esmera/Manifesto.tsx",
      fragments: [
        "mainImage?: ImageWidget",
        "secondaryImage?: ImageWidget",
      ],
    },
    {
      path: "sections/Esmera/Matter.tsx",
      fragments: ["image: ImageWidget"],
    },
    {
      path: "sections/Esmera/MatterInterlude.tsx",
      fragments: ["image?: ImageWidget", "mobileImage?: ImageWidget"],
    },
    {
      path: "sections/Esmera/Provenance.tsx",
      fragments: ["image: ImageWidget", "image?: ImageWidget"],
    },
  ];

  for (const contract of contracts) {
    const source = await Deno.readTextFile(contract.path);
    assertStringIncludes(source, 'from "apps/admin/widgets.ts"');
    assertStringIncludes(source, "mergeDefined<Props>");
    for (const fragment of contract.fragments) {
      assertStringIncludes(source, fragment);
    }
  }
});
