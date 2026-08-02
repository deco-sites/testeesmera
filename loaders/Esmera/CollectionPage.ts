import { getCollectionPage } from "../../lib/payload/loaders.ts";

export const cache = { maxAge: 300 };
export const cacheKey = () => "collection-page";
export default async function CollectionPage() {
  return await getCollectionPage();
}
