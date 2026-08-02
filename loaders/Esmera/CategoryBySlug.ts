import { getCategoryBySlug } from "../../lib/payload/loaders.ts";

export interface Props {
  slug: string;
}
export const cache = { maxAge: 120 };
export const cacheKey = ({ slug }: Props) => slug;
export default async function CategoryBySlug({ slug }: Props) {
  return await getCategoryBySlug(slug);
}
