import { getNavigation, getSiteSettings } from "./loaders.ts";
import { listStorefrontCategories } from "./navigationLoader.ts";

export async function getPageChrome() {
  const [navigation, settings, categories] = await Promise.allSettled([
    getNavigation(),
    getSiteSettings(),
    listStorefrontCategories(),
  ]);
  return {
    navigation: navigation.status === "fulfilled" ? navigation.value : null,
    settings: settings.status === "fulfilled" ? settings.value : null,
    categories: categories.status === "fulfilled" ? categories.value : [],
    unavailable: [
      navigation.status === "rejected" ? "navigation" : null,
      settings.status === "rejected" ? "site-settings" : null,
      categories.status === "rejected" ? "categories" : null,
    ].filter((value): value is string => Boolean(value)),
  };
}
