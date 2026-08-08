import {
  getHomeResult,
  getNavigationResult,
  getSiteSettingsResult,
  listCategoriesResult,
} from "../payload/loaders.ts";
import type {
  StorefrontDataSource,
  StorefrontDiagnostic,
} from "../payload/contract/diagnostics.ts";
import { STOREFRONT_CONTRACT_VERSION } from "../payload/contract/version.ts";
import { type ResolvedHome, resolveHome } from "./resolveHome.ts";

type CacheEntry = {
  expiresAt: number;
  staleUntil: number;
  value: ResolvedHome;
};

type FetchResult = {
  value: ResolvedHome;
  unavailable: boolean;
};

const caches = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<ResolvedHome>>();

function positiveIntegerEnv(name: string, fallback: number): number {
  const parsed = Number(Deno.env.get(name));
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function cacheTTL(): number {
  return positiveIntegerEnv("ESMERA_HOME_CACHE_TTL_MS", 5_000);
}

function staleTTL(): number {
  return positiveIntegerEnv("ESMERA_HOME_STALE_TTL_MS", 300_000);
}

function cacheKey(): string {
  const mode = Deno.env.get("ESMERA_PREVIEW_MODE") === "true"
    ? "preview"
    : "public";
  return `${STOREFRONT_CONTRACT_VERSION}:${mode}`;
}

function staleSource(source: StorefrontDataSource): StorefrontDataSource {
  return source === "payload_override" ? "stale_payload" : source;
}

function staleSnapshot(
  value: ResolvedHome,
  diagnostics: StorefrontDiagnostic[],
): ResolvedHome {
  return {
    ...value,
    stale: true,
    diagnostics: [...value.diagnostics, ...diagnostics],
    sources: {
      header: staleSource(value.sources.header),
      hero: staleSource(value.sources.hero),
      manifesto: staleSource(value.sources.manifesto),
      selectedObjects: staleSource(value.sources.selectedObjects),
      matter: staleSource(value.sources.matter),
      signature: staleSource(value.sources.signature),
      matterInterlude: staleSource(value.sources.matterInterlude),
      provenance: staleSource(value.sources.provenance),
      privateInvitation: staleSource(value.sources.privateInvitation),
      footer: staleSource(value.sources.footer),
    },
  };
}

async function fetchResolvedHome(): Promise<FetchResult> {
  const [home, navigation, siteSettings, categories] = await Promise.all([
    getHomeResult(),
    getNavigationResult(),
    getSiteSettingsResult(),
    listCategoriesResult(),
  ]);

  const results = [home, navigation, siteSettings, categories];
  const diagnostics = results.flatMap((result) => result.diagnostics);
  // The Home document is the authority for Home editorial content. An
  // unavailable auxiliary source (navigation, settings or categories) must not
  // freeze Hero/Selected Objects behind an old aggregate snapshot.
  const unavailable = home.source === "unavailable";

  if (results.some((result) => result.source === "unavailable")) {
    console.warn(JSON.stringify({
      event: "payload_home_fallback",
      unavailable: {
        home: home.source === "unavailable",
        navigation: navigation.source === "unavailable",
        siteSettings: siteSettings.source === "unavailable",
        categories: categories.source === "unavailable",
      },
      fallbackUsed: true,
      contractVersion: STOREFRONT_CONTRACT_VERSION,
    }));
  }

  return {
    unavailable,
    value: resolveHome({
      home: home.data,
      navigation: navigation.data,
      siteSettings: siteSettings.data,
      categories: categories.data ?? [],
      sources: {
        home: home.source,
        navigation: navigation.source,
        siteSettings: siteSettings.source,
        categories: categories.source,
      },
      diagnostics,
      stale: results.some((result) => result.stale),
    }),
  };
}

export async function loadResolvedHome(): Promise<ResolvedHome> {
  const key = cacheKey();
  const now = Date.now();
  const cached = caches.get(key);
  if (cached && cached.expiresAt > now) return cached.value;

  const inFlight = inFlightRequests.get(key);
  if (inFlight) return await inFlight;

  const request = (async () => {
    const fetched = await fetchResolvedHome();
    const current = caches.get(key);

    if (fetched.unavailable && current && current.staleUntil > Date.now()) {
      const staleValue = staleSnapshot(
        current.value,
        fetched.value.diagnostics,
      );
      console.warn(JSON.stringify({
        event: "payload_home_stale_snapshot",
        contractVersion: STOREFRONT_CONTRACT_VERSION,
        expiresAt: current.staleUntil,
      }));
      caches.set(key, {
        value: staleValue,
        expiresAt: Date.now() + Math.min(cacheTTL(), 2_000),
        staleUntil: current.staleUntil,
      });
      return staleValue;
    }

    const entry: CacheEntry = {
      value: fetched.value,
      expiresAt: Date.now() + cacheTTL(),
      staleUntil: Date.now() + staleTTL(),
    };
    caches.set(key, entry);
    return fetched.value;
  })();

  inFlightRequests.set(key, request);
  try {
    return await request;
  } finally {
    if (inFlightRequests.get(key) === request) inFlightRequests.delete(key);
  }
}

export function clearResolvedHomeCache() {
  caches.clear();
  inFlightRequests.clear();
}

export type { ResolvedHome } from "./resolveHome.ts";
