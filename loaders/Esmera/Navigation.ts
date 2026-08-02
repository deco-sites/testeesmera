import { getNavigation } from "../../lib/payload/loaders.ts";

export const cache = { maxAge: 300 };
export const cacheKey = () => "navigation";
export default async function Navigation() {
  return await getNavigation();
}
