// Port of backend's src/server/publication/revision.ts canonicalization rules.
// Must stay byte-identical in behavior — both repos are checked against the
// same tests/fixtures/canonical-revision.fixtures.json. No hash/digest here yet;
// nothing on this side consumes a revision hash until Fase 3 wires the probe.

const VOLATILE_KEYS = new Set(["createdAt", "updatedAt", "publishedAt"]);

function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (!value || typeof value !== "object") return value;

  const source = value as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(source).sort()) {
    if (VOLATILE_KEYS.has(key)) continue;
    const next = source[key];
    if (next === undefined) continue;
    result[key] = canonicalValue(next);
  }
  return result;
}

export function canonicalizeForRevision(value: unknown): string {
  return JSON.stringify(canonicalValue(value));
}
