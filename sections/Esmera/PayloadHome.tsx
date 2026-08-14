import StorefrontLayout from "../../components/esmera/StorefrontLayout.tsx";
import StorefrontPageData from "../../loaders/Esmera/StorefrontPageData.ts";
import { resolveHome } from "../../lib/esmera/resolveHome.ts";
import { toSEO } from "../../lib/payload/adapters.ts";
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

function homeCanonical(frontendURL?: string | null): string {
  if (!frontendURL) return "/";
  try {
    return new URL("/", frontendURL).toString();
  } catch {
    return "/";
  }
}

function absoluteAsset(
  path: string,
  frontendURL?: string | null,
): string | undefined {
  if (!frontendURL) return undefined;
  try {
    return new URL(path, frontendURL).toString();
  } catch {
    return undefined;
  }
}

export default function PayloadHome({ data }: { data: Data }) {
  const settings = data.siteSettings;
  const home = data.home;
  const seo = toSEO(home?.seo, settings);
  const resolved = resolveHome({
    home,
    navigation: data.navigation,
    siteSettings: settings,
    categories: data.categories,
  });

  const homeURL = homeCanonical(settings?.frontendURL);
  const siteName = settings?.siteName?.trim() || "ESMÉRA";

  // 4.2 — a representative og:image. The CMS social image wins; when it is
  // unset, fall back to the current hero image instead of shipping no image.
  const heroImage = resolved.hero?.slides?.[0]?.desktopImage;
  const seoWithSocial = seo.image || !heroImage
    ? seo
    : { ...seo, image: heroImage };

  // 4.3 — minimal Organization + WebSite structured data for the home.
  const logo = absoluteAsset(
    "/android-chrome-512x512.png",
    settings?.frontendURL,
  );
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteName,
      url: homeURL,
      ...(logo ? { logo } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteName,
      url: homeURL,
    },
  ];

  return (
    <StorefrontLayout
      navigation={data.navigation}
      settings={settings}
      categories={data.categories}
      seo={seoWithSocial}
      canonical={homeURL}
      jsonLd={jsonLd}
      headerVariant={resolved.hero ? "transparent" : "solid"}
    >
      {resolved.hero && <Hero {...resolved.hero} />}
      {resolved.manifesto && <Manifesto {...resolved.manifesto} />}
      {resolved.selectedObjects && (
        <SelectedObjects {...resolved.selectedObjects} />
      )}
      {resolved.matter && <Matter {...resolved.matter} />}
      {resolved.signature?.map((slide, index) => (
        <SignatureObject
          key={`${slide.product?.id ?? "signature"}-${index}`}
          instanceKey={`${slide.product?.id ?? "signature"}-${index}`}
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
    </StorefrontLayout>
  );
}
