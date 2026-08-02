import type { Handlers, PageProps } from "$fresh/server.ts";
import StorefrontLayout from "../components/esmera/StorefrontLayout.tsx";
import { resolvePayloadMedia } from "../lib/payload/media.ts";
import { getPayloadBaseURL } from "../lib/payload/client.ts";
import { lexicalToText } from "../lib/payload/richText.ts";
import { toSEO } from "../lib/payload/adapters.ts";
import { getAbout } from "../lib/payload/loaders.ts";
import { getPageChrome } from "../lib/payload/pageData.ts";
import type { PayloadAbout, SEOModel } from "../lib/payload/types.ts";
import Manifesto from "../sections/Esmera/Manifesto.tsx";

interface Data {
  page: PayloadAbout | null;
  chrome: Awaited<ReturnType<typeof getPageChrome>>;
  seo: SEOModel;
}
export const handler: Handlers<Data> = {
  async GET(_req, ctx) {
    const [page, chrome] = await Promise.all([getAbout(), getPageChrome()]);
    return ctx.render({
      page,
      chrome,
      seo: toSEO(page?.seo, chrome.settings),
    });
  },
};
export default function AboutRoute({ data }: PageProps<Data>) {
  const image = data.page
    ? resolvePayloadMedia(data.page.image, getPayloadBaseURL(), "wide")
    : null;
  return (
    <StorefrontLayout {...data.chrome} seo={data.seo}>
      {data.page && image
        ? (
          <Manifesto
            eyebrow={data.page.eyebrow ?? ""}
            title={data.page.title ?? ""}
            text={lexicalToText(data.page.content)}
            mainImage={image.url}
            mainImageAlt={image.alt}
            ctaLabel={data.page.callToAction?.label ?? ""}
            ctaHref={data.page.callToAction?.href ?? ""}
          />
        )
        : (
          <section class="esv-shell esv-section">
            <h1>Conteúdo não disponível</h1>
          </section>
        )}
    </StorefrontLayout>
  );
}
