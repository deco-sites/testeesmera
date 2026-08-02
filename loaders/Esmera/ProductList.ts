import { listProducts } from "../../lib/payload/loaders.ts";

export interface Props {
  limit?: number;
  page?: number;
  sort?: string;
}
export const cache = { maxAge: 60 };
export const cacheKey = (props: Props) => JSON.stringify(props);
export default async function ProductList(props: Props) {
  return await listProducts(props);
}
