export type PayloadWhere = Record<string, unknown>;

export function whereEquals(
  field: string,
  value: string | number | boolean,
): PayloadWhere {
  return { [field]: { equals: value } };
}

export function whereContains(
  field: string,
  value: string | number,
): PayloadWhere {
  return { [field]: { contains: value } };
}

export function whereAnd(...conditions: PayloadWhere[]): PayloadWhere {
  return { and: conditions };
}

export function whereOr(...conditions: PayloadWhere[]): PayloadWhere {
  return { or: conditions };
}

function appendValue(
  params: URLSearchParams,
  path: string,
  value: unknown,
): void {
  if (value === undefined || value === null) return;
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      appendValue(params, `${path}[${index}]`, item)
    );
    return;
  }
  if (typeof value === "object") {
    for (
      const [key, child] of Object.entries(value as Record<string, unknown>)
    ) {
      appendValue(params, `${path}[${key}]`, child);
    }
    return;
  }
  params.set(path, String(value));
}

export interface QueryOptions {
  depth?: number;
  limit?: number;
  page?: number;
  sort?: string;
  where?: PayloadWhere;
}

export function buildPayloadQuery(options: QueryOptions = {}): URLSearchParams {
  const params = new URLSearchParams();
  if (options.depth !== undefined) params.set("depth", String(options.depth));
  if (options.limit !== undefined) params.set("limit", String(options.limit));
  if (options.page !== undefined) params.set("page", String(options.page));
  if (options.sort) params.set("sort", options.sort);
  if (options.where) appendValue(params, "where", options.where);
  return params;
}
