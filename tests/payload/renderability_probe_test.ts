import { assert, assertEquals } from "@std/assert";
import { handler } from "../../routes/api/esmera-renderability.ts";

const TOKEN = "probe-test-token";

function probeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/esmera-renderability", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify(body),
  });
}

async function callProbe(body: Record<string, unknown>) {
  Deno.env.set("ESMERA_RENDERABILITY_TOKEN", TOKEN);
  try {
    // deno-lint-ignore no-explicit-any
    const response = await handler.POST!(probeRequest(body) as any, {} as any);
    return await response.json() as Record<string, unknown>;
  } finally {
    Deno.env.delete("ESMERA_RENDERABILITY_TOKEN");
  }
}

// The contract-version-incompatible branch returns before any network fetch, so it
// is a deterministic surface to assert the request/response contract fields on.
const UNSUPPORTED_VERSION = "999";

Deno.test("probe accepts and echoes expectedRevision", async () => {
  const body = await callProbe({
    kind: "product",
    id: 21,
    expectedRevision: "rev-abc123",
    contractVersion: UNSUPPORTED_VERSION,
  });

  assertEquals(body.expectedRevision, "rev-abc123");
});

Deno.test("probe response includes a valid ISO checkedAt", async () => {
  const body = await callProbe({
    kind: "home",
    expectedRevision: "rev-checkedat",
    contractVersion: UNSUPPORTED_VERSION,
  });

  assertEquals(typeof body.checkedAt, "string");
  const checkedAt = body.checkedAt as string;
  const parsed = new Date(checkedAt);
  assert(!Number.isNaN(parsed.getTime()), "checkedAt must be parseable");
  assertEquals(parsed.toISOString(), checkedAt, "checkedAt must be ISO 8601");
});

Deno.test("probe keeps legacy `revision` alias for expectedRevision", async () => {
  const body = await callProbe({
    kind: "product",
    id: 21,
    revision: "legacy-rev-777",
    contractVersion: UNSUPPORTED_VERSION,
  });

  // The legacy `revision` field resolves into expectedRevision...
  assertEquals(body.expectedRevision, "legacy-rev-777");
  // ...and is still echoed under `revision` for any legacy consumer.
  assertEquals(body.revision, "legacy-rev-777");
});

Deno.test("probe prefers expectedRevision over the legacy alias", async () => {
  const body = await callProbe({
    kind: "category",
    slug: "esculturas",
    expectedRevision: "canonical-rev",
    revision: "legacy-should-lose",
    contractVersion: UNSUPPORTED_VERSION,
  });

  assertEquals(body.expectedRevision, "canonical-rev");
  assertEquals(body.revision, "canonical-rev");
});
