const DEDICATED_EDITORIAL_ROUTES = {
  sobre: "/sobre",
  contato: "/contato",
} as const;

type DedicatedEditorialSlug = keyof typeof DEDICATED_EDITORIAL_ROUTES;

function normalizePathname(pathname: string): string {
  const withoutQuery = pathname.split(/[?#]/, 1)[0] || "/";
  if (withoutQuery === "/") return "/";
  return withoutQuery.replace(/\/+$/, "");
}

export function getDedicatedEditorialPath(slug: string): string | null {
  const normalized = slug.trim().toLowerCase() as DedicatedEditorialSlug;
  return DEDICATED_EDITORIAL_ROUTES[normalized] ?? null;
}

export function isLegacyEditorialAlias(pathname: string): boolean {
  const normalized = normalizePathname(pathname);
  return (Object.keys(DEDICATED_EDITORIAL_ROUTES) as DedicatedEditorialSlug[])
    .some((slug) => normalized === `/pagina/${slug}`);
}
