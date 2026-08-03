export type PayloadErrorKind =
  | "configuration"
  | "timeout"
  | "network"
  | "http"
  | "invalid-response";

export class PayloadAPIError extends Error {
  constructor(
    public readonly kind: PayloadErrorKind,
    message: string,
    public readonly status?: number,
    public readonly endpoint?: string,
  ) {
    super(message);
    this.name = "PayloadAPIError";
  }
}

export function isPayloadAPIError(error: unknown): error is PayloadAPIError {
  return error instanceof PayloadAPIError;
}
