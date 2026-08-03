import { Head } from "$fresh/runtime.ts";
import StorefrontPageData from "../../loaders/Esmera/StorefrontPageData.ts";
import { resolveHome } from "../../lib/esmera/resolveHome.ts";
import { toSEO } from "../../lib/payload/adapters.ts";
import Footer from "./Footer.tsx";
import Header from "./Header.tsx";
import Hero from "./Hero.tsx";
import Manifesto from "./Manifesto.tsx";
import Matter from "./Matter.tsx";
import MatterInterlude from "./MatterInterlude.tsx";
import PrivateInvitation from "./PrivateInvitation.tsx";
import Provenance from "./Provenance.tsx";
import SelectedObjects from "./SelectedObjects.tsx";
import SignatureObject from "./SignatureObject.tsx";

export const loader = async () => ({ data: await StorefrontPageData() });
type Data = Awaited<ReturnType<typeof StorefrontPageData>>;

export default function PayloadHome({ data }: { data: Data }) {
  const settings = data.siteSettings;
  const home = data.home;
  const seo = home ? toSEO(home.seo, settings) : null;
  const resolved = resolveHome({
    home,
    navigation: data.navigation,
    siteSettings: settings,
    categories: data.categories,
  });

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
      <Header {...resolved.header} />
      {resolved.hero && <Hero {...resolved.hero} />}
      {resolved.manifesto && <Manifesto {...resolved.manifesto} />}
      {resolved.selectedObjects && (
        <SelectedObjects {...resolved.selectedObjects} />
      )}
      {resolved.matter && <Matter {...resolved.matter} />}
      {resolved.signature?.map((slide, index) => (
        <SignatureObject
          key={`${slide.product?.id ?? "signature"}-${index}`}
          {...slide}
        />
      ))}
      {resolved.matterInterlude && (
        <MatterInterlude {...resolved.matterInterlude} />
      )}
      {resolved.provenance && <Provenance {...resolved.provenance} />}
      {resolved.privateInvitation && (
        <PrivateInvitation {...resolved.privateInvitation} />
      )}
      <Footer {...resolved.footer} />
    </>
  );
}
