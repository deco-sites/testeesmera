import { Head } from "$fresh/runtime.ts";
import type { ComponentChildren } from "preact";
import {
  sanitizePublicHref,
  toCategoryNavigation,
  toFooter,
  toNavigation,
} from "../../lib/payload/adapters.ts";
import {
  buildNavigationTree,
  type StorefrontCategory,
} from "../../lib/payload/navigation.ts";
import type {
  PayloadNavigation,
  PayloadSiteSettings,
  SEOModel,
} from "../../lib/payload/types.ts";
import Footer from "../../sections/Esmera/Footer.tsx";
import Header from "../../sections/Esmera/Header.tsx";

export interface Props {
  children: ComponentChildren;
  navigation: PayloadNavigation | null;
  settings: PayloadSiteSettings | null;
  categories: StorefrontCategory[];
  seo?: SEOModel;
}

export default function StorefrontLayout(
  { children, navigation, settings, categories, seo }: Props,
) {
  const footer = settings ? toFooter(settings) : null;
  const categoryLinks = [
    ...(navigation ? toCategoryNavigation(navigation) : []),
    ...categories.map((category) => ({
      label: category.label,
      href: category.href || `/colecao/${category.slug}`,
      external: category.external,
    })),
  ].filter((link, index, links) =>
    links.findIndex((candidate) => candidate.href === link.href) === index
  );
  const menu = buildNavigationTree(categories, navigation);
  const instagram = settings?.officialChannels?.find((channel) =>
    channel.active !== false && channel.kind === "instagram"
  );
  const instagramHref = sanitizePublicHref(instagram?.url) ||
    sanitizePublicHref(instagram?.value);

  return (
    <>
      <Head>
        {seo?.title && <title>{seo.title}</title>}
        {seo?.description && (
          <meta name="description" content={seo.description} />
        )}
        {seo?.noindex && <meta name="robots" content="noindex,nofollow" />}
        {seo?.canonical && <link rel="canonical" href={seo.canonical} />}
        {seo?.image && <meta property="og:image" content={seo.image} />}
      </Head>
      <Header
        logo={settings?.siteName ?? ""}
        navigation={navigation ? toNavigation(navigation) : []}
        categories={categoryLinks}
        menu={menu}
        whatsappHref={footer?.whatsappHref}
        instagramHref={instagramHref}
      />
      <main id="main-content">{children}</main>
      {footer && <Footer siteName={settings?.siteName ?? ""} {...footer} />}
    </>
  );
}
