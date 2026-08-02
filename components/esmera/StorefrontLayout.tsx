import { Head } from "$fresh/runtime.ts";
import type { ComponentChildren } from "preact";
import {
  toCategoryNavigation,
  toFooter,
  toNavigation,
} from "../../lib/payload/adapters.ts";
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
  categories: Array<{ title: string; slug: string }>;
  seo?: SEOModel;
}

export default function StorefrontLayout(
  { children, navigation, settings, categories, seo }: Props,
) {
  const footer = settings ? toFooter(settings) : null;
  const categoryLinks = [
    ...(navigation ? toCategoryNavigation(navigation) : []),
    ...categories.map((category) => ({
      label: category.title,
      href: `/colecao/${category.slug}`,
      external: false,
    })),
  ].filter((link, index, links) =>
    links.findIndex((candidate) => candidate.href === link.href) === index
  );
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
        whatsappHref={footer?.whatsappHref}
      />
      <main id="main-content">{children}</main>
      {footer && <Footer siteName={settings?.siteName ?? ""} {...footer} />}
    </>
  );
}
