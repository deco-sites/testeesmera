import { assertEquals } from "@std/assert";
import { canonicalizeForRevision } from "../../lib/payload/contract/canonicalRevision.ts";

type Fixture = { name: string; input: unknown; canonical: string };

const fixturesURL = new URL("../fixtures/canonical-revision.fixtures.json", import.meta.url);
const fixtures = JSON.parse(await Deno.readTextFile(fixturesURL)) as Fixture[];

for (const fixture of fixtures) {
  Deno.test(`canonicalizeForRevision matches shared fixture: ${fixture.name}`, () => {
    assertEquals(canonicalizeForRevision(fixture.input), fixture.canonical);
  });
}
