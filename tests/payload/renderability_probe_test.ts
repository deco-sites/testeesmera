import {
  assert,
  assertEquals,
  assertExists,
} from "@std/assert";
import {
  handleStorefrontProbe,
  type ProbeKind,
  type StorefrontProbeRequest,
} from "../../routes/api/esmera-renderability.ts";

type Fixture = {
  name: string;
  entity: ProbeKind;
  document: Record<string, unknown>;
  expectedRevision: string;
};

const fixturesURL = new URL("../fixtures/public-revision.fixtures.json", import.meta.url);
const fixtures = JSON.parse(await Deno.readTextFile(fixturesURL)) as Fixture[];
const fixture = (entity: ProbeKind) => fixtures.find((entry) => entry.entity === entity)!;
const TOKEN = "probe-secret";
const NOW = new Date("2026-08-04T12:00:00.000Z");

function bodyFor(kind: ProbeKind, overrides: Record<string, unknown> = {}) {
  return {
    kind,
    ...(kind === "home" ? {} : { id: fixture(kind).document.id }),
    expectedRevision: fixture(kind).expectedRevision,
    contractVersion: "1",
    ...overrides,
  };
}

function request(
  body: unknown,
  options: { token?: string; raw?: boolean } = {},
) {
  return new Request("https://example.com/api/esmera-renderability", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${options.token ?? TOKEN}`,
    },
    body: options.raw ? String(body) : JSON.stringify(body),
  });
}

async function probe(
  body: unknown,
  document: unknown = fixture("product").document,
  options: { token?: string; configuredToken?: string; raw?: boolean; fail?: boolean } = {},
) {
  const response = await handleStorefrontProbe(request(body, options), {
    configuredToken: options.configuredToken ?? TOKEN,
    now: () => NOW,
    fetchDocument: options.fail
      ? () => Promise.reject(new Error("offline"))
      : () => Promise.resolve(document),
  });
  return { response, json: await response.json() as Record<string, unknown> };
}

Deno.test("probe não configurado retorna unavailable", async () => {
  const { response, json } = await probe(bodyFor("product"), null, { configuredToken: "" });
  assertEquals(response.status, 503);
  assertEquals(json.status, "unavailable");
  assertEquals(json.compatible, false);
});

Deno.test("token inválido retorna 401", async () => {
  const { response, json } = await probe(bodyFor("product"), null, { token: "wrong" });
  assertEquals(response.status, 401);
  assertEquals(json.status, "incompatible");
});

Deno.test("JSON inválido retorna 400", async () => {
  const { response } = await probe("{", null, { raw: true });
  assertEquals(response.status, 400);
});

Deno.test("expectedRevision ausente retorna 400", async () => {
  const body = bodyFor("product");
  delete (body as Partial<StorefrontProbeRequest>).expectedRevision;
  const { response } = await probe(body);
  assertEquals(response.status, 400);
});

Deno.test("contractVersion ausente retorna 400", async () => {
  const body = bodyFor("product");
  delete (body as Partial<StorefrontProbeRequest>).contractVersion;
  const { response } = await probe(body);
  assertEquals(response.status, 400);
});

Deno.test("formato legado com revision retorna 400", async () => {
  const { response, json } = await probe({
    kind: "product",
    id: 101,
    revision: "legacy",
    contractVersion: "1",
  });
  assertEquals(response.status, 400);
  assertEquals(json.status, "incompatible");
});

Deno.test("tipo desconhecido retorna 400", async () => {
  const { response } = await probe({
    kind: "unknown",
    expectedRevision: "rev",
    contractVersion: "1",
  });
  assertEquals(response.status, 400);
});

for (const kind of ["product", "category"] as const) {
  Deno.test(`${kind} sem id ou slug retorna 400`, async () => {
    const { response } = await probe({
      kind,
      expectedRevision: "rev",
      contractVersion: "1",
    });
    assertEquals(response.status, 400);
  });
}

Deno.test("versão incompatível não consulta documento", async () => {
  let called = false;
  const response = await handleStorefrontProbe(request(bodyFor("home", { contractVersion: "999" })), {
    configuredToken: TOKEN,
    now: () => NOW,
    fetchDocument: () => {
      called = true;
      return Promise.resolve(null);
    },
  });
  const json = await response.json();
  assertEquals(json.status, "incompatible");
  assertEquals(called, false);
});

Deno.test("documento ausente retorna issue not_found", async () => {
  const { json } = await probe(bodyFor("category"), null);
  assertEquals(json.status, "incompatible");
  assertEquals((json.issues as Array<{ code: string }>)[0].code, "probe.category.not_found");
});

Deno.test("documento sem revisão retorna legacy_revision_missing", async () => {
  const document = structuredClone(fixture("product").document);
  delete document.publicationRevision;
  const { json } = await probe(bodyFor("product"), document);
  assertEquals(json.status, "incompatible");
  assertEquals(json.observedRevision, undefined);
  assertEquals((json.issues as Array<{ code: string }>)[0].code, "legacy_revision_missing");
});

Deno.test("contrato inválido preserva observedRevision real", async () => {
  const document = structuredClone(fixture("product").document);
  document.title = "";
  const { json } = await probe(bodyFor("product"), document);
  assertEquals(json.status, "incompatible");
  assertEquals(json.observedRevision, fixture("product").expectedRevision);
});

Deno.test("revisão diferente retorna revision_mismatch", async () => {
  const { json } = await probe(
    bodyFor("product", { expectedRevision: "esperada" }),
    { ...fixture("product").document, publicationRevision: "observada" },
  );
  assertEquals(json.status, "revision_mismatch");
  assertEquals(json.expectedRevision, "esperada");
  assertEquals(json.observedRevision, "observada");
  assert(json.observedRevision !== json.expectedRevision);
});

Deno.test("revisão igual retorna compatible", async () => {
  const product = fixture("product");
  const { json } = await probe(bodyFor("product"), product.document);
  assertEquals(json.status, "compatible");
  assertEquals(json.compatible, true);
  assertEquals(json.observedRevision, product.expectedRevision);
});

Deno.test("falha de rede retorna unavailable", async () => {
  const { response, json } = await probe(bodyFor("product"), null, { fail: true });
  assertEquals(response.status, 502);
  assertEquals(json.status, "unavailable");
});

Deno.test("checkedAt está presente e determinístico", async () => {
  const { json } = await probe(bodyFor("home"), fixture("home").document);
  assertExists(json.checkedAt);
  assertEquals(json.checkedAt, NOW.toISOString());
});

for (const entry of fixtures) {
  Deno.test(`fixture ${entry.entity}: match e mismatch usam somente a revisão do documento`, async () => {
    const matching = await probe(bodyFor(entry.entity), entry.document);
    assertEquals(matching.json.status, "compatible");
    assertEquals(matching.json.observedRevision, entry.expectedRevision);

    const mismatching = await probe(
      bodyFor(entry.entity, { expectedRevision: "outra-revisao" }),
      entry.document,
    );
    assertEquals(mismatching.json.status, "revision_mismatch");
    assertEquals(mismatching.json.observedRevision, entry.expectedRevision);
    assertEquals(mismatching.json.expectedRevision, "outra-revisao");
  });
}
