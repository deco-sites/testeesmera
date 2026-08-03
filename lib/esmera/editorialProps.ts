export function mergeDefined<T extends object>(
  base: T | null | undefined,
  overrides: Partial<T>,
): T {
  const merged = { ...(base ?? {}) } as T;

  for (const [key, value] of Object.entries(overrides)) {
    if (value !== undefined) Reflect.set(merged, key, value);
  }

  return merged;
}
