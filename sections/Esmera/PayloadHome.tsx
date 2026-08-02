import { Head } from "$fresh/runtime.ts";
import StorefrontPageData from "../../loaders/Esmera/StorefrontPageData.ts";
import {
  toCategoryNavigation,
  toFooter,
  toHero,
  toManifesto,
  toMatterPanels,
  toNavigation,
  toProvenance,
  toSelectedObjects,
  toSEO,
  toSignatureSlides,
} from "../../lib/payload/adapters.ts";
import Footer from "./Footer.tsx";
import Header from "./Header.tsx";
import Hero from "./Hero.tsx";
import Manifesto from "./Manifesto.tsx";
import Matter from "./Matter.tsx";
import Provenance from "./Provenance.tsx";
import SelectedObjects from "./SelectedObjects.tsx";
import SignatureObject from "./SignatureObject.tsx";

export const loader = async () => ({ data: await StorefrontPageData() });
type Data = Awaited<ReturnType<typeof StorefrontPageData>>;

export default function PayloadHome({ data }: { data: Data }) {
  const settings = data.siteSettings;
  const navigation = data.navigation;
  const home = data.home;
  const footer = settings ? toFooter(settings) : null;
  const categoryLinks = [
    ...(navigation ? toCategoryNavigation(navigation) : []),
    ...data.categories.map((category) => ({
      label: category.title,
      href: `/colecao/${category.slug}`,
      external: false,
    })),
  ].filter((link, index, links) =>
    links.findIndex((candidate) => candidate.href === link.href) === index
  );
  const seo = home ? toSEO(home.seo, settings) : null;
  const selected = home ? toSelectedObjects(home) : [];
  const signature = home ? toSignatureSlides(home) : [];
  const provenance = home ? toProvenance(home) : null;
  const manifesto = home ? toManifesto(home) : null;

  return (
    <>
      {seo && (
        <Head>
          {seo.title && <title>{seo.title}</title>}
          {seo.description && (
            <meta name="description" content={seo.description} />
          )}
          {seo.noindex && <meta name="robots" content="noindex,nofollow" />}
          {seo.canonical && <link rel="canonical" href={seo.canonical} />}
          {seo.image && <meta property="og:image" content={seo.image} />}
        </Head>
      )}
      <Header
        logo={settings?.siteName ?? ""}
        navigation={navigation ? toNavigation(navigation) : []}
        categories={categoryLinks}
        whatsappHref={footer?.whatsappHref}
      />
      {!home && (
        <main id="main-content" class="esv-shell esv-section">
          <p role="status">Conteúdo editorial indisponível.</p>
        </main>
      )}
      {home && (
        <>
          <Hero {...toHero(home)} />
          {manifesto && <Manifesto {...manifesto} />}
          {selected.length === 4 && (
            <SelectedObjects products={selected} collectionHref="/colecao" />
          )}
          <Matter panels={toMatterPanels(home)} />
          {signature.map((slide) => (
            <SignatureObject
              key={slide.product.id}
              product={slide.product}
              eyebrow={slide.eyebrow}
              editorialText={slide.editorialText}
            />
          ))}
          {provenance && (
            <Provenance
              title={provenance.title}
              text={provenance.text}
              image={provenance.image}
              imageAlt={provenance.imageAlt}
              stages={provenance.stages}
              cta={provenance.cta}
            />
          )}
        </>
      )}
      {footer && <Footer siteName={settings?.siteName ?? ""} {...footer} />}
    </>
  );
}
