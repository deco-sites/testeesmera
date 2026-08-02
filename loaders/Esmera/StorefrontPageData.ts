import {
  getHome,
  getNavigation,
  getSiteSettings,
  listCategories,
} from "../../lib/payload/loaders.ts";

export const cache = { maxAge: 300 };
export const cacheKey = () => "storefront-page-data";

export default async function StorefrontPageData() {
  const [home, navigation, siteSettings, categories] = await Promise.allSettled(
    [
      getHome(),
      getNavigation(),
      getSiteSettings(),
      listCategories(),
    ],
  );
  return {
    home: home.status === "fulfilled" ? home.value : null,
    navigation: navigation.status === "fulfilled" ? navigation.value : null,
    siteSettings: siteSettings.status === "fulfilled"
      ? siteSettings.value
      : null,
    categories: categories.status === "fulfilled" ? categories.value : [],
    unavailable: [
      home.status === "rejected" ? "home" : null,
      navigation.status === "rejected" ? "navigation" : null,
      siteSettings.status === "rejected" ? "site-settings" : null,
      categories.status === "rejected" ? "categories" : null,
    ].filter((value): value is string => Boolean(value)),
  };
}
