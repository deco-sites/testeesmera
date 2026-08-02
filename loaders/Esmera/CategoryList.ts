import { listCategories } from "../../lib/payload/loaders.ts";

export interface Props {
  limit?: number;
}
export const cache = { maxAge: 120 };
export const cacheKey = ({ limit = 100 }: Props) => String(limit);
export default async function CategoryList({ limit = 100 }: Props) {
  return await listCategories(limit);
}
