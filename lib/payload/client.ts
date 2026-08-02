import { PayloadAPIError } from "./errors.ts";
import { buildPayloadQuery, type QueryOptions } from "./query.ts";

const DEFAULT_PAYLOAD_API_URL = "https://esmeracms-green.vercel.app";

export interface PayloadClientOptions extends QueryOptions {
  baseURL?: string;
  timeoutMs?: number;
  fetcher?: typeof fetch;
  cache?: RequestCache;
}

export function normalizePayloadBaseURL(value: string): string {
  const trimmed = value.trim().replace(/\/+$/, "");
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new PayloadAPIError(
      "configuration",
      "PAYLOAD_API_URL deve ser uma URL HTTPS válida.",
    );
  }
  if (parsed.protocol !== "https:" && parsed.hostname !== "localhost") {
    throw new PayloadAPIError(
      "configuration",
      "PAYLOAD_API_URL deve usar HTTPS.",
    );
  }
  if (parsed.pathname !== "/") {
    throw new PayloadAPIError(
      "configuration",
      "PAYLOAD_API_URL não deve incluir /api nem outro caminho.",
    );
  }
  return parsed.origin;
}

export function getPayloadBaseURL(): string {
  return normalizePayloadBaseURL(
    Deno.env.get("PAYLOAD_API_URL") || DEFAULT_PAYLOAD_API_URL,
  );
}

export async function payloadGet<T>(
  path: string,
  options: PayloadClientOptions = {},
): Promise<T> {
  if ("document" in globalThis) {
    throw new PayloadAPIError(
      "configuration",
      "O cliente Payload só pode ser executado no servidor.",
    );
  }

  const baseURL = options.baseURL
    ? normalizePayloadBaseURL(options.baseURL)
    : getPayloadBaseURL();
  const endpoint = path.replace(/^\/+/, "");
  const url = new URL(`/api/${endpoint}`, baseURL);
  url.search = buildPayloadQuery(options).toString();

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? 8_000,
  );
  let response: Response;
  try {
    response = await (options.fetcher ?? fetch)(url, {
      method: "GET",
      headers: { accept: "application/json" },
      signal: controller.signal,
      cache: options.cache,
    });
  } catch {
    if (controller.signal.aborted) {
      throw new PayloadAPIError(
        "timeout",
        "A API de conteúdo excedeu o tempo limite.",
      );
    }
    throw new PayloadAPIError(
      "network",
      "Não foi possível alcançar a API de conteúdo.",
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new PayloadAPIError(
      "http",
      `A API de conteúdo respondeu HTTP ${response.status}.`,
      response.status,
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new PayloadAPIError(
      "invalid-response",
      "A API de conteúdo não retornou JSON.",
    );
  }
  try {
    return await response.json() as T;
  } catch {
    throw new PayloadAPIError(
      "invalid-response",
      "A API de conteúdo retornou JSON inválido.",
    );
  }
}
