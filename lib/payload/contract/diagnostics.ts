export type StorefrontDataSource =
  | "payload_override"
  | "deco_baseline"
  | "disabled"
  | "unavailable"
  | "stale_payload";

export type StorefrontDiagnosticSeverity =
  | "blocker"
  | "warning"
  | "recommendation";

export type StorefrontDiagnostic = {
  id: string;
  severity: StorefrontDiagnosticSeverity;
  kind: string;
  path?: string | null;
  message: string;
  suggestion?: string | null;
  source: "contract" | "payload" | "resolver" | "integration";
  meta?: Record<string, unknown>;
};

export type StorefrontResult<T> = {
  data: T | null;
  source: StorefrontDataSource;
  diagnostics: StorefrontDiagnostic[];
  contractVersion: string;
  stale: boolean;
};

export function storefrontResult<T>(
  data: T | null,
  input: Omit<StorefrontResult<T>, "data">,
): StorefrontResult<T> {
  return { data, ...input };
}

export function emitStorefrontDiagnostic(
  event: string,
  diagnostic: StorefrontDiagnostic | StorefrontDiagnostic[],
  meta: Record<string, unknown> = {},
) {
  const diagnostics = Array.isArray(diagnostic) ? diagnostic : [diagnostic];
  const payload = {
    event,
    diagnostics: diagnostics.map((item) => ({
      id: item.id,
      severity: item.severity,
      kind: item.kind,
      path: item.path ?? null,
      source: item.source,
    })),
    ...meta,
  };
  const hasBlocker = diagnostics.some((item) => item.severity === "blocker");
  (hasBlocker ? console.error : console.warn)(JSON.stringify(payload));
}
