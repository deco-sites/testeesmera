import type { Handlers, PageProps } from "$fresh/server.ts";
import StorefrontLayout from "../components/esmera/StorefrontLayout.tsx";
import { institutionalBaseline } from "../lib/esmera/institutionalBaseline.ts";
import { getPayloadBaseURL } from "../lib/payload/client.ts";
import { resolvePayloadMedia } from "../lib/payload/media.ts";
import { lexicalToText } from "../lib/payload/richText.ts";
import { resolveCallToAction, toSEO } from "../lib/payload/adapters.ts";
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
  async GET(req, ctx) {
    const [page, chrome] = await Promise.all([getAbout(), getPageChrome()]);
    const url = new URL(req.url);
    const seo = toSEO(page?.seo, chrome.settings);
    return ctx.render({
      page,
      chrome,
      seo: {
        ...seo,
        title: seo.title || "A Esméra",
        description: seo.description || institutionalBaseline.about.text,
        canonical: seo.canonical || `${url.origin}${url.pathname}`,
      },
    });
  },
};

export default function AboutRoute({ data }: PageProps<Data>) {
  const page = data.page;
  const image = page
    ? resolvePayloadMedia(page.image, getPayloadBaseURL(), "wide")
    : null;
  const cta = resolveCallToAction(page?.callToAction) ?? {
    label: institutionalBaseline.about.ctaLabel,
    href: institutionalBaseline.about.ctaHref,
    external: false,
  };
  const text = lexicalToText(page?.content) || institutionalBaseline.about.text;
  const title = page?.title?.trim() || institutionalBaseline.about.title;
  const eyebrow = page?.eyebrow?.trim() || institutionalBaseline.about.eyebrow;

  return (
    <StorefrontLayout {...data.chrome} seo={data.seo}>
      {image && page?.title
        ? (
          <Manifesto
            eyebrow={eyebrow}
            title={title}
            text={text}
            mainImage={image.url}
            mainImageAlt={image.alt}
            ctaLabel={cta.label}
            ctaHref={cta.href}
          />
        )
        : (
          <section class="esv-shell esv-section esv-editorial-page-head">
            <p class="esv-kicker">{eyebrow}</p>
            <h1>{title}</h1>
            <p>{text}</p>
            <a class="esv-text-link" href={cta.href}>{cta.label}</a>
          </section>
        )}
    </StorefrontLayout>
  );
}
