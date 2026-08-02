import { getContact } from "../../lib/payload/loaders.ts";

export const cache = { maxAge: 300 };
export const cacheKey = () => "contact";
export default async function Contact() {
  return await getContact();
}
