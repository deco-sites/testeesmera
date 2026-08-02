import { assertEquals, assertRejects, assertThrows } from "@std/assert";
import {
  normalizePayloadBaseURL,
  payloadGet,
} from "../../lib/payload/client.ts";
import { PayloadAPIError } from "../../lib/payload/errors.ts";

Deno.test("normalizes the Payload base URL without /api", () => {
  assertEquals(
    normalizePayloadBaseURL("https://cms.example.com/"),
    "https://cms.example.com",
  );
  assertThrows(
    () => normalizePayloadBaseURL("https://cms.example.com/api"),
    PayloadAPIError,
  );
});

Deno.test("builds GET requests and parses JSON", async () => {
  let requested = "";
  const result = await payloadGet<{ ok: boolean }>("products", {
    baseURL: "https://cms.example.com",
    depth: 2,
    limit: 12,
    page: 2,
    sort: "title",
    fetcher: (input) => {
      requested = String(input);
      return Promise.resolve(Response.json({ ok: true }));
    },
  });
  assertEquals(result.ok, true);
  assertEquals(
    requested,
    "https://cms.example.com/api/products?depth=2&limit=12&page=2&sort=title",
  );
});

Deno.test("classifies HTTP and invalid JSON responses", async () => {
  await assertRejects(
    () =>
      payloadGet("products", {
        baseURL: "https://cms.example.com",
        fetcher: () => Promise.resolve(new Response("no", { status: 500 })),
      }),
    PayloadAPIError,
    "HTTP 500",
  );
  await assertRejects(
    () =>
      payloadGet("products", {
        baseURL: "https://cms.example.com",
        fetcher: () =>
          Promise.resolve(
            new Response("{", {
              headers: { "content-type": "application/json" },
            }),
          ),
      }),
    PayloadAPIError,
    "JSON inválido",
  );
});

Deno.test("aborts slow requests", async () => {
  await assertRejects(
    () =>
      payloadGet("products", {
        baseURL: "https://cms.example.com",
        timeoutMs: 5,
        fetcher: (_input, init) =>
          new Promise((_resolve, reject) =>
            init?.signal?.addEventListener("abort", () =>
              reject(new DOMException("aborted", "AbortError")))
          ),
      }),
    PayloadAPIError,
    "tempo limite",
  );
});
