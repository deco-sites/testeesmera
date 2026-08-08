import { listProductsByCategory } from "../../lib/payload/loaders.ts";

export interface Props {
  categorySlug: string;
  limit?: number;
  page?: number;
  sort?: string;
}
export const cache = { maxAge: 60 };
export const cacheKey = (props: Props) => JSON.stringify(props);
export default async function ProductsByCategory(
  { categorySlug, ...input }: Props,
) {
  return await listProductsByCategory(categorySlug, input);
}
