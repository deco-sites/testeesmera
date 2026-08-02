import { getProductBySlug } from "../../lib/payload/loaders.ts";

export interface Props {
  slug: string;
}
export const cache = { maxAge: 60 };
export const cacheKey = ({ slug }: Props) => slug;
export default async function ProductBySlug({ slug }: Props) {
  return await getProductBySlug(slug);
}
