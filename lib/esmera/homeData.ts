import {
  getHome,
  getNavigation,
  getSiteSettings,
  listCategories,
} from "../payload/loaders.ts";
import { type ResolvedHome, resolveHome } from "./resolveHome.ts";

let cached: { expiresAt: number; value: ResolvedHome } | null = null;
let inFlight: Promise<ResolvedHome> | null = null;

async function fetchResolvedHome(): Promise<ResolvedHome> {
  const [home, navigation, siteSettings, categories] = await Promise.allSettled(
    [
      getHome(),
      getNavigation(),
      getSiteSettings(),
      listCategories(),
    ],
  );

  const unavailable = [
    home.status === "rejected" ? "home" : null,
    navigation.status === "rejected" ? "navigation" : null,
    siteSettings.status === "rejected" ? "site-settings" : null,
    categories.status === "rejected" ? "categories" : null,
  ].filter((value): value is string => Boolean(value));

  if (unavailable.length > 0) {
    console.warn(JSON.stringify({
      event: "payload_home_fallback",
      unavailable,
      fallbackUsed: true,
    }));
  }

  return resolveHome({
    home: home.status === "fulfilled" ? home.value : null,
    navigation: navigation.status === "fulfilled" ? navigation.value : null,
    siteSettings: siteSettings.status === "fulfilled"
      ? siteSettings.value
      : null,
    categories: categories.status === "fulfilled" ? categories.value : [],
  });
}

export async function loadResolvedHome(): Promise<ResolvedHome> {
  const now = Date.now();
  if (cached && cached.expiresAt > now) return cached.value;
  if (inFlight) return await inFlight;

  inFlight = fetchResolvedHome();
  try {
    const value = await inFlight;
    cached = { value, expiresAt: Date.now() + 1_000 };
    return value;
  } finally {
    inFlight = null;
  }
}

export type { ResolvedHome } from "./resolveHome.ts";
