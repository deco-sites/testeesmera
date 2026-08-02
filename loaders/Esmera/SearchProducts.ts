import { searchProducts } from "../../lib/payload/loaders.ts";

export interface Props {
  query: string;
  limit?: number;
}
export const cache = "no-cache";
export const cacheKey = ({ query, limit = 8 }: Props) =>
  `${query.trim().toLocaleLowerCase("pt-BR")}:${limit}`;
export default async function SearchProducts({ query, limit = 8 }: Props) {
  return await searchProducts(query, limit);
}
