import { assertEquals } from "@std/assert";

function emptyObjectPaths(value: unknown, path = "root"): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      emptyObjectPaths(item, `${path}.${index}`)
    );
  }
  if (!value || typeof value !== "object") return [];

  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length === 0) return [path];
  return entries.flatMap(([key, item]) =>
    emptyObjectPaths(item, `${path}.${key}`)
  );
}

Deno.test("Home block does not persist empty or incomplete object overrides", async () => {
  const source = await Deno.readTextFile(".deco/blocks/pages-home.json");
  const block = JSON.parse(source) as {
    sections?: Array<Record<string, unknown>>;
  };

  assertEquals(emptyObjectPaths(block), []);

  const selectedObjects = block.sections?.find((section) =>
    section.__resolveType === "site/sections/Esmera/SelectedObjects.tsx"
  );
  const signature = block.sections?.find((section) =>
    section.__resolveType === "site/sections/Esmera/SignatureObject.tsx"
  );

  assertEquals(Object.hasOwn(selectedObjects || {}, "products"), false);
  assertEquals(Object.hasOwn(signature || {}, "product"), false);
});
