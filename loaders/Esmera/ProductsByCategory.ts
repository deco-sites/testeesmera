import { listProductsByCategory } from "../../lib/payload/loaders.ts";

export interface Props {
  categoryID: string;
  limit?: number;
  page?: number;
  sort?: string;
}
export const cache = { maxAge: 60 };
export const cacheKey = (props: Props) => JSON.stringify(props);
export default async function ProductsByCategory(
  { categoryID, ...input }: Props,
) {
  return await listProductsByCategory(categoryID, input);
}
