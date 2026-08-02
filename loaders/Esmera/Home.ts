import { getHome } from "../../lib/payload/loaders.ts";

export const cache = { maxAge: 300 };
export const cacheKey = () => "home";
export default async function Home() {
  return await getHome();
}
