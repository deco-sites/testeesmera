import { getNavigation, getSiteSettings, listCategories } from "./loaders.ts";

export async function getPageChrome() {
  const [navigation, settings, categories] = await Promise.allSettled([
    getNavigation(),
    getSiteSettings(),
    listCategories(),
  ]);
  return {
    navigation: navigation.status === "fulfilled" ? navigation.value : null,
    settings: settings.status === "fulfilled" ? settings.value : null,
    categories: categories.status === "fulfilled" ? categories.value : [],
  };
}
