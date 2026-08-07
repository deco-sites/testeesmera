import type { Handlers } from "$fresh/server.ts";
import { payloadGet } from "../../lib/payload/client.ts";
import {
  isSupportedStorefrontContractVersion,
  STOREFRONT_CONTRACT_HEADER,
  STOREFRONT_CONTRACT_VERSION,
} from "../../lib/payload/contract/version.ts";
import { validatePayloadContract } from "../../lib/payload/contract/validate.ts";
import { whereEquals } from "../../lib/payload/query.ts";
import type {
  PayloadCategory,
  PayloadHome,
  PayloadPaginated,
  PayloadProduct,
} from "../../lib/payload/types.ts";

type ProbeKind = "product" | "category" | "home";

type ProbeRequest = {
  kind?: ProbeKind;
  id?: string | number;
  slug?: string;
  expectedRevision?: string;
  /** Alias legado: o CMS atual envia `expectedRevision`. Mantido para consumidores antigos. */
  revision?: string;
  contractVersion?: string;
};

/**
 * O CMS envia `expectedRevision` e exige `expectedRevision` + `checkedAt` de volta.
 * Resolvemos aceitando o alias legado `revision` quando `expectedRevision` não vier.
 */
function resolveExpectedRevision(input: ProbeRequest): string | null {
  const value = input.expectedRevision ?? input.revision;
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed ? trimmed : null;
}

const responseHeaders = {
  "cache-control": "no-store",
  [STOREFRONT_CONTRACT_HEADER]: STOREFRONT_CONTRACT_VERSION,
};

function bearerToken(request: Request): string {
  const authorization = request.headers.get("authorization") || "";
  if (authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.slice(7).trim();
  }
  return request.headers.get("x-esmera-renderability-token")?.trim() || "";
}

function constantTimeEqual(first: string, second: string): boolean {
  const firstBytes = new TextEncoder().encode(first);
  const secondBytes = new TextEncoder().encode(second);
  const maxLength = Math.max(firstBytes.length, secondBytes.length);
  let difference = firstBytes.length ^ secondBytes.length;
  for (let index = 0; index < maxLength; index += 1) {
    difference |= (firstBytes[index] || 0) ^ (secondBytes[index] || 0);
  }
  return difference === 0;
}

function invalidRequest(message: string, status = 400) {
  return Response.json({
    ok: false,
    status: "invalid_request",
    compatible: false,
    contractVersion: STOREFRONT_CONTRACT_VERSION,
    diagnostics: [{
      id: "probe.invalid_request",
      severity: "blocker",
      kind: "probe",
      message,
      source: "integration",
    }],
  }, { status, headers: responseHeaders });
}

async function fetchDocument(input: ProbeRequest): Promise<unknown> {
  if (input.kind === "home") {
    return await payloadGet<PayloadHome>("globals/home", {
      depth: 2,
      cache: "no-store",
      dedupe: false,
    });
  }

  const where = input.id !== undefined && input.id !== null
    ? whereEquals("id", input.id)
    : input.slug?.trim()
    ? whereEquals("slug", input.slug.trim())
    : null;
  if (!where) return null;

  if (input.kind === "product") {
    const response = await payloadGet<PayloadPaginated<PayloadProduct>>(
      "products",
      {
        depth: 2,
        limit: 1,
        page: 1,
        where,
        cache: "no-store",
        dedupe: false,
      },
    );
    return response.docs[0] ?? null;
  }

  const response = await payloadGet<PayloadPaginated<PayloadCategory>>(
    "categories",
    {
      depth: 2,
      limit: 1,
      page: 1,
      where,
      cache: "no-store",
      dedupe: false,
    },
  );
  return response.docs[0] ?? null;
}

export const handler: Handlers = {
  async POST(request) {
    const configuredToken =
      Deno.env.get("ESMERA_RENDERABILITY_TOKEN")?.trim() || "";
    if (!configuredToken) {
      return Response.json({
        ok: false,
        status: "unavailable",
        compatible: false,
        contractVersion: STOREFRONT_CONTRACT_VERSION,
        diagnostics: [{
          id: "probe.not_configured",
          severity: "blocker",
          kind: "probe",
          message: "O probe de renderização não está configurado.",
          source: "integration",
        }],
      }, { status: 503, headers: responseHeaders });
    }

    if (!constantTimeEqual(bearerToken(request), configuredToken)) {
      return invalidRequest("Credencial inválida.", 401);
    }

    let input: ProbeRequest;
    try {
      input = await request.json() as ProbeRequest;
    } catch {
      return invalidRequest("Corpo JSON inválido.");
    }

    const expectedRevision = resolveExpectedRevision(input);

    if (!input.kind || !["product", "category", "home"].includes(input.kind)) {
      return invalidRequest("Tipo de documento não reconhecido.");
    }
    if (
      input.contractVersion &&
      !isSupportedStorefrontContractVersion(input.contractVersion)
    ) {
      return Response.json({
        ok: true,
        status: "incompatible",
        compatible: false,
        kind: input.kind,
        expectedRevision,
        revision: expectedRevision,
        checkedAt: new Date().toISOString(),
        contractVersion: STOREFRONT_CONTRACT_VERSION,
        diagnostics: [{
          id: "probe.contract_version_incompatible",
          severity: "blocker",
          kind: input.kind,
          message:
            `A versão ${input.contractVersion} não é suportada pela Deco.`,
          source: "contract",
        }],
      }, { headers: responseHeaders });
    }

    try {
      const document = await fetchDocument(input);
      if (!document) {
        return Response.json({
          ok: true,
          status: "incompatible",
          compatible: false,
          kind: input.kind,
          expectedRevision,
          revision: expectedRevision,
          checkedAt: new Date().toISOString(),
          contractVersion: STOREFRONT_CONTRACT_VERSION,
          diagnostics: [{
            id: `probe.${input.kind}.not_found`,
            severity: "blocker",
            kind: input.kind,
            message: "O documento público não foi encontrado pela Deco.",
            source: "payload",
          }],
        }, { headers: responseHeaders });
      }

      const validation = validatePayloadContract(input.kind, document);
      return Response.json({
        ok: true,
        status: validation.compatible ? "compatible" : "incompatible",
        compatible: validation.compatible,
        kind: input.kind,
        expectedRevision,
        revision: expectedRevision,
        checkedAt: new Date().toISOString(),
        contractVersion: validation.contractVersion,
        diagnostics: validation.diagnostics,
      }, { headers: responseHeaders });
    } catch (error) {
      console.error(JSON.stringify({
        event: "renderability_probe_unavailable",
        kind: input.kind,
        errorType: error instanceof Error ? error.name : "unknown",
        contractVersion: STOREFRONT_CONTRACT_VERSION,
      }));
      return Response.json({
        ok: false,
        status: "unavailable",
        compatible: false,
        kind: input.kind,
        expectedRevision,
        revision: expectedRevision,
        checkedAt: new Date().toISOString(),
        contractVersion: STOREFRONT_CONTRACT_VERSION,
        diagnostics: [{
          id: "probe.payload_unavailable",
          severity: "blocker",
          kind: input.kind,
          message: "A Deco não conseguiu consultar a fonte pública agora.",
          source: "integration",
        }],
      }, { status: 502, headers: responseHeaders });
    }
  },
};
