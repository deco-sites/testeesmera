import { getSiteSettings } from "../../lib/payload/loaders.ts";

export const cache = { maxAge: 300 };
export const cacheKey = () => "site-settings";
export default async function SiteSettings() {
  return await getSiteSettings();
}
