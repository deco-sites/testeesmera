import type { Handlers, PageProps } from "$fresh/server.ts";
import StorefrontLayout from "../components/esmera/StorefrontLayout.tsx";
import { getPayloadBaseURL } from "../lib/payload/client.ts";
import { lexicalToText } from "../lib/payload/richText.ts";
import {
  resolveCallToAction,
  sanitizePublicHref,
  toSEO,
} from "../lib/payload/adapters.ts";
import { resolvePayloadMedia } from "../lib/payload/media.ts";
import { getContact } from "../lib/payload/loaders.ts";
import { getPageChrome } from "../lib/payload/pageData.ts";
import type { PayloadContact, SEOModel } from "../lib/payload/types.ts";
import Manifesto from "../sections/Esmera/Manifesto.tsx";

type ContactChannel = NonNullable<PayloadContact["channels"]>[number];

function channelHref(channel: ContactChannel): string {
  if (channel.url) return sanitizePublicHref(channel.url);
  const value = channel.value?.trim() ?? "";
  if (!value) return "";
  if (channel.kind === "email") return sanitizePublicHref(`mailto:${value}`);
  if (channel.kind === "phone") {
    return sanitizePublicHref(`tel:${value.replace(/[^\d+]/g, "")}`);
  }
  if (channel.kind === "whatsapp") {
    const phone = value.replace(/\D/g, "");
    return phone ? sanitizePublicHref(`https://wa.me/${phone}`) : "";
  }
  return "";
}

interface Data {
  page: PayloadContact | null;
  chrome: Awaited<ReturnType<typeof getPageChrome>>;
  seo: SEOModel;
}
export const handler: Handlers<Data> = {
  async GET(_req, ctx) {
    const [page, chrome] = await Promise.all([getContact(), getPageChrome()]);
    return ctx.render({
      page,
      chrome,
      seo: toSEO(page?.seo, chrome.settings),
    });
  },
};
export default function ContactRoute({ data }: PageProps<Data>) {
  const page = data.page;
  const image = page
    ? resolvePayloadMedia(page.image, getPayloadBaseURL(), "wide")
    : null;
  const cta = resolveCallToAction(page?.callToAction);
  const hasEditorialFeature = Boolean(page?.title && image);
  const channels = (page?.channels ?? []).filter((channel) =>
    channel.active !== false && channelHref(channel)
  );
  return (
    <StorefrontLayout {...data.chrome} seo={data.seo}>
      {page && image && hasEditorialFeature && (
        <Manifesto
          eyebrow={page.eyebrow ?? ""}
          title={page.title ?? ""}
          text={lexicalToText(page.content)}
          mainImage={image.url}
          mainImageAlt={image.alt}
          ctaLabel={cta?.label}
          ctaHref={cta?.href}
        />
      )}
      <section class="esv-shell esv-section">
        {page
          ? (
            <>
              {!hasEditorialFeature && (
                <>
                  {page.eyebrow && <p class="esv-kicker">{page.eyebrow}</p>}
                  <h1>{page.title}</h1>
                  <p>{lexicalToText(page.content)}</p>
                  {cta && (
                    <a class="esv-text-link" href={cta.href}>{cta.label}</a>
                  )}
                </>
              )}
              {page.hours && <p>{page.hours}</p>}
              {channels.length > 0 && (
                <ul>
                  {channels.map((channel) => (
                    <li key={`${channel.kind}-${channel.value}`}>
                      <a href={channelHref(channel)}>
                        {channel.label || channel.value}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )
          : <h1>Conteúdo não disponível</h1>}
      </section>
    </StorefrontLayout>
  );
}
