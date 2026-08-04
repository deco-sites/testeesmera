import type { Handlers } from "$fresh/server.ts";
import { payloadGet } from "../../lib/payload/client.ts";
import {
  STOREFRONT_CONTRACT_HEADER,
  STOREFRONT_CONTRACT_VERSION,
  isSupportedStorefrontContractVersion,
} from "../../lib/payload/contract/version.ts";
import { validatePayloadContract } from "../../lib/payload/contract/validate.ts";
import { whereEquals } from "../../lib/payload/query.ts";
import type {
  PayloadCategory,
  PayloadHome,
  PayloadPaginated,
  PayloadProduct,
  PayloadPublicationMetadata,
} from "../../lib/payload/types.ts";

export type ProbeKind = "product" | "category" | "home";

export type StorefrontProbeRequest = {
  kind: ProbeKind;
  id?: string | number;
  slug?: string;
  expectedRevision: string;
  contractVersion: string;
};

export type StorefrontVerification = {
  status: "compatible" | "incompatible" | "revision_mismatch" | "unavailable";
  expectedRevision: string;
  observedRevision?: string;
  contractVersion: string;
  checkedAt: string;
  publicUrl?: string;
  issues?: Array<{
    code: string;
    path?: string;
    message: string;
  }>;
  compatible: boolean;
};

type ProbeIssue = NonNullable<StorefrontVerification["issues"]>[number];

type ProbeDependencies = {
  configuredToken?: string;
  fetchDocument?: (input: StorefrontProbeRequest) => Promise<unknown>;
  now?: () => Date;
};

type LegacyProbeBody = Partial<StorefrontProbeRequest> & { revision?: unknown };

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

function issue(code: string, message: string, path?: string): ProbeIssue {
  return { code, message, ...(path ? { path } : {}) };
}

function jsonResponse(
  body: StorefrontVerification & Record<string, unknown>,
  status = 200,
) {
  const diagnostics = (body.issues || []).map((entry) => ({
    id: entry.code,
    severity: "blocker",
    kind: body.kind,
    path: entry.path ?? null,
    message: entry.message,
    source: entry.code.startsWith("probe.payload") ? "integration" : "contract",
  }));
  return Response.json({ ...body, diagnostics }, { status, headers: responseHeaders });
}

function verification(
  input: {
    status: StorefrontVerification["status"];
    expectedRevision: string;
    observedRevision?: string;
    contractVersion: string;
    checkedAt: string;
    issues?: ProbeIssue[];
    kind?: ProbeKind;
    ok?: boolean;
  },
): StorefrontVerification & Record<string, unknown> {
  return {
    ok: input.ok ?? input.status !== "unavailable",
    kind: input.kind,
    status: input.status,
    compatible: input.status === "compatible",
    expectedRevision: input.expectedRevision,
    ...(input.observedRevision ? { observedRevision: input.observedRevision } : {}),
    contractVersion: input.contractVersion,
    checkedAt: input.checkedAt,
    ...(input.issues?.length ? { issues: input.issues } : {}),
  };
}

function invalidRequest(message: string, checkedAt: string, status = 400) {
  return jsonResponse(verification({
    status: "incompatible",
    expectedRevision: "",
    contractVersion: STOREFRONT_CONTRACT_VERSION,
    checkedAt,
    issues: [issue("probe.invalid_request", message)],
    ok: false,
  }), status);
}

function nonEmptyText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validIdentifier(value: unknown): value is string | number {
  return (typeof value === "number" && Number.isFinite(value)) || nonEmptyText(value);
}

function validateRequest(body: LegacyProbeBody):
  | { ok: true; input: StorefrontProbeRequest }
  | { ok: false; message: string } {
  if ("revision" in body) {
    return { ok: false, message: "O campo legado revision não é aceito. Use expectedRevision." };
  }
  if (!body.kind || !["product", "category", "home"].includes(body.kind)) {
    return { ok: false, message: "Tipo de documento não reconhecido." };
  }
  if (!nonEmptyText(body.expectedRevision)) {
    return { ok: false, message: "expectedRevision é obrigatório." };
  }
  if (!nonEmptyText(body.contractVersion)) {
    return { ok: false, message: "contractVersion é obrigatório." };
  }
  if (
    (body.kind === "product" || body.kind === "category") &&
    !validIdentifier(body.id) &&
    !nonEmptyText(body.slug)
  ) {
    return { ok: false, message: `${body.kind === "product" ? "Product" : "Category"} exige id ou slug.` };
  }

  return {
    ok: true,
    input: {
      kind: body.kind,
      ...(validIdentifier(body.id) ? { id: body.id } : {}),
      ...(nonEmptyText(body.slug) ? { slug: body.slug.trim() } : {}),
      expectedRevision: body.expectedRevision.trim(),
      contractVersion: body.contractVersion.trim(),
    },
  };
}

async function fetchPublicDocument(input: StorefrontProbeRequest): Promise<unknown> {
  if (input.kind === "home") {
    return await payloadGet<PayloadHome>("globals/home", {
      depth: 2,
      cache: "no-store",
      dedupe: false,
    });
  }

  const where = validIdentifier(input.id)
    ? whereEquals("id", input.id)
    : whereEquals("slug", input.slug as string);

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

function publicationRevision(document: unknown): string | undefined {
  if (!document || typeof document !== "object" || Array.isArray(document)) return undefined;
  const value = (document as PayloadPublicationMetadata).publicationRevision;
  return nonEmptyText(value) ? value.trim() : undefined;
}

export async function handleStorefrontProbe(
  request: Request,
  dependencies: ProbeDependencies = {},
): Promise<Response> {
  const checkedAt = (dependencies.now?.() ?? new Date()).toISOString();
  const configuredToken = dependencies.configuredToken ??
    Deno.env.get("ESMERA_RENDERABILITY_TOKEN")?.trim() ?? "";

  if (!configuredToken) {
    return jsonResponse(verification({
      status: "unavailable",
      expectedRevision: "",
      contractVersion: STOREFRONT_CONTRACT_VERSION,
      checkedAt,
      issues: [issue("probe.not_configured", "O probe de renderização não está configurado.")],
      ok: false,
    }), 503);
  }

  if (!constantTimeEqual(bearerToken(request), configuredToken)) {
    return invalidRequest("Credencial inválida.", checkedAt, 401);
  }

  let body: LegacyProbeBody;
  try {
    body = await request.json() as LegacyProbeBody;
  } catch {
    return invalidRequest("Corpo JSON inválido.", checkedAt);
  }

  const validated = validateRequest(body);
  if (!validated.ok) return invalidRequest(validated.message, checkedAt);
  const input = validated.input;

  if (!isSupportedStorefrontContractVersion(input.contractVersion)) {
    return jsonResponse(verification({
      status: "incompatible",
      kind: input.kind,
      expectedRevision: input.expectedRevision,
      contractVersion: input.contractVersion,
      checkedAt,
      issues: [issue(
        "probe.contract_version_incompatible",
        `A versão ${input.contractVersion} não é suportada pela Deco.`,
      )],
    }));
  }

  try {
    const document = await (dependencies.fetchDocument ?? fetchPublicDocument)(input);
    if (!document) {
      return jsonResponse(verification({
        status: "incompatible",
        kind: input.kind,
        expectedRevision: input.expectedRevision,
        contractVersion: input.contractVersion,
        checkedAt,
        issues: [issue(`probe.${input.kind}.not_found`, "O documento público não foi encontrado pela Deco.")],
      }));
    }

    const observedRevision = publicationRevision(document);
    if (!observedRevision) {
      return jsonResponse(verification({
        status: "incompatible",
        kind: input.kind,
        expectedRevision: input.expectedRevision,
        contractVersion: input.contractVersion,
        checkedAt,
        issues: [issue("legacy_revision_missing", "O documento público ainda não possui publicationRevision.")],
      }));
    }

    const validation = validatePayloadContract(input.kind, document);
    if (!validation.compatible) {
      return jsonResponse(verification({
        status: "incompatible",
        kind: input.kind,
        expectedRevision: input.expectedRevision,
        observedRevision,
        contractVersion: input.contractVersion,
        checkedAt,
        issues: validation.diagnostics.map((entry) => issue(
          entry.id,
          entry.message,
          entry.path || undefined,
        )),
      }));
    }

    const status = observedRevision === input.expectedRevision
      ? "compatible"
      : "revision_mismatch";
    return jsonResponse(verification({
      status,
      kind: input.kind,
      expectedRevision: input.expectedRevision,
      observedRevision,
      contractVersion: input.contractVersion,
      checkedAt,
      ...(status === "revision_mismatch"
        ? { issues: [issue("probe.revision_mismatch", "A revisão pública observada difere do snapshot esperado.")] }
        : {}),
    }));
  } catch (error) {
    console.error(JSON.stringify({
      event: "renderability_probe_unavailable",
      kind: input.kind,
      errorType: error instanceof Error ? error.name : "unknown",
      contractVersion: STOREFRONT_CONTRACT_VERSION,
    }));
    return jsonResponse(verification({
      status: "unavailable",
      kind: input.kind,
      expectedRevision: input.expectedRevision,
      contractVersion: input.contractVersion,
      checkedAt,
      issues: [issue("probe.payload_unavailable", "A Deco não conseguiu consultar a fonte pública agora.")],
      ok: false,
    }), 502);
  }
}

export const handler: Handlers = {
  POST(request) {
    return handleStorefrontProbe(request);
  },
};
