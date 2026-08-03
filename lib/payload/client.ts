import { PayloadAPIError } from "./errors.ts";
import { buildPayloadQuery, type QueryOptions } from "./query.ts";

const DEFAULT_PAYLOAD_API_URL = "https://esmeracms-green.vercel.app";
const DEFAULT_TIMEOUT_MS = 8_000;

const inFlightRequests = new Map<string, Promise<unknown>>();
const fetcherIDs = new WeakMap<object, number>();
let nextFetcherID = 1;

export interface PayloadRequestOptions extends QueryOptions {
  timeoutMs?: number;
  fetcher?: typeof fetch;
  cache?: RequestCache;
  dedupe?: boolean;
}

export interface PayloadClientOptions extends PayloadRequestOptions {
  baseURL?: string;
}

export interface PayloadClientConfig {
  baseURL?: string;
  timeoutMs?: number;
  fetcher?: typeof fetch;
  cache?: RequestCache;
  dedupe?: boolean;
}

export interface PayloadClient {
  get<T>(path: string, options?: PayloadRequestOptions): Promise<T>;
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

function normalizeEndpoint(path: string): string {
  const endpoint = path.trim().replace(/^\/+/, "");
  const segments = endpoint.split("/");
  if (
    !endpoint ||
    endpoint.includes("?") ||
    endpoint.includes("#") ||
    endpoint.includes("\\") ||
    segments.some((segment) => segment === "." || segment === "..")
  ) {
    throw new PayloadAPIError(
      "configuration",
      "O endpoint do Payload deve ser um caminho relativo válido.",
    );
  }
  return endpoint;
}

function getFetcherID(fetcher: typeof fetch): number {
  const key = fetcher as unknown as object;
  const current = fetcherIDs.get(key);
  if (current !== undefined) return current;
  const id = nextFetcherID++;
  fetcherIDs.set(key, id);
  return id;
}

function requestKey(
  url: URL,
  options: PayloadClientOptions,
  fetcher: typeof fetch,
): string {
  return [
    url.href,
    `cache=${options.cache ?? "default"}`,
    `timeout=${options.timeoutMs ?? DEFAULT_TIMEOUT_MS}`,
    `fetcher=${getFetcherID(fetcher)}`,
  ].join("|");
}

async function executePayloadGet<T>(
  url: URL,
  endpoint: string,
  options: PayloadClientOptions,
  fetcher: typeof fetch,
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new PayloadAPIError(
      "configuration",
      `O timeout do cliente Payload é inválido para ${endpoint}.`,
      undefined,
      endpoint,
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  let response: Response;
  try {
    response = await fetcher(url, {
      method: "GET",
      headers: { accept: "application/json" },
      signal: controller.signal,
      cache: options.cache,
    });
  } catch {
    if (controller.signal.aborted) {
      throw new PayloadAPIError(
        "timeout",
        `A API de conteúdo excedeu o tempo limite em ${endpoint}.`,
        undefined,
        endpoint,
      );
    }
    throw new PayloadAPIError(
      "network",
      `Não foi possível alcançar a API de conteúdo em ${endpoint}.`,
      undefined,
      endpoint,
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new PayloadAPIError(
      "http",
      `A API de conteúdo respondeu HTTP ${response.status} em ${endpoint}.`,
      response.status,
      endpoint,
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new PayloadAPIError(
      "invalid-response",
      `A API de conteúdo não retornou JSON em ${endpoint}.`,
      response.status,
      endpoint,
    );
  }

  try {
    return await response.json() as T;
  } catch {
    throw new PayloadAPIError(
      "invalid-response",
      `A API de conteúdo retornou JSON inválido em ${endpoint}.`,
      response.status,
      endpoint,
    );
  }
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
  const relativeEndpoint = normalizeEndpoint(path);
  const endpoint = `/api/${relativeEndpoint}`;
  const url = new URL(endpoint, baseURL);
  url.search = buildPayloadQuery(options).toString();
  const fetcher = options.fetcher ?? fetch;

  const execute = () => executePayloadGet<T>(url, endpoint, options, fetcher);
  if (options.dedupe === false) return await execute();

  const key = requestKey(url, options, fetcher);
  const existing = inFlightRequests.get(key) as Promise<T> | undefined;
  if (existing) return await existing;

  let request!: Promise<T>;
  request = execute().finally(() => {
    if (inFlightRequests.get(key) === request) inFlightRequests.delete(key);
  });
  inFlightRequests.set(key, request);
  return await request;
}

export function createPayloadClient(
  config: PayloadClientConfig = {},
): PayloadClient {
  const baseURL = config.baseURL
    ? normalizePayloadBaseURL(config.baseURL)
    : undefined;

  return {
    get<T>(path: string, options: PayloadRequestOptions = {}) {
      return payloadGet<T>(path, {
        baseURL,
        timeoutMs: options.timeoutMs ?? config.timeoutMs,
        fetcher: options.fetcher ?? config.fetcher,
        cache: options.cache ?? config.cache,
        dedupe: options.dedupe ?? config.dedupe,
        depth: options.depth,
        limit: options.limit,
        page: options.page,
        sort: options.sort,
        where: options.where,
      });
    },
  };
}
