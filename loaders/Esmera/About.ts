import { getAbout } from "../../lib/payload/loaders.ts";

export const cache = { maxAge: 300 };
export const cacheKey = () => "about";
export default async function About() {
  return await getAbout();
}
