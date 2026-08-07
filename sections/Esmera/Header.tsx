import { asset, Head } from "$fresh/runtime.ts";
import type { NavigationNode } from "../../lib/payload/navigation.ts";
import type { NavigationLink } from "../../lib/payload/types.ts";
import {
  loadResolvedHome,
  type ResolvedHome,
} from "../../lib/esmera/homeData.ts";
import DynamicMenu from "../../islands/DynamicMenu.tsx";
import EsmeraHeader from "../../islands/EsmeraHeader.tsx";
import EsmeraMotion from "../../islands/EsmeraMotion.tsx";
import EsmeraScrollScenes from "../../islands/EsmeraScrollScenes.tsx";
import ProductModal from "../../islands/ProductModal.tsx";

export interface Props {
  logo?: string;
  enquiryLabel?: string;
  navigation?: NavigationLink[];
  categories?: NavigationLink[];
  menu?: NavigationNode[];
  whatsappHref?: string;
  instagramHref?: string;
}

export const loader = async (props: Props) => ({
  ...props,
  resolvedHome: await loadResolvedHome(),
});

export default function Header(
  props: Props & { resolvedHome?: ResolvedHome },
) {
  const source = props.resolvedHome?.header ?? props;
  const {
    logo = "ESMÉRA",
    enquiryLabel = "Carrinho",
    navigation = [],
    categories = [],
    whatsappHref = "",
  } = source;
  const menu = props.menu ?? [];

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossorigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href={asset("/esmera-master.css")} />
        <link rel="stylesheet" href={asset("/esmera-finish.css")} />
        <link rel="stylesheet" href={asset("/esmera-motion-v2.css")} />
        <link rel="stylesheet" href={asset("/esmera-structure-guard.css")} />
        <link rel="stylesheet" href={asset("/esmera-commerce-refine.css")} />
        <link
          rel="stylesheet"
          href={asset("/esmera-hotfix-product-modal.css")}
        />
        <link
          rel="stylesheet"
          href={asset("/esmera-product-modal-v2.css")}
        />
        <link
          rel="stylesheet"
          href={asset("/esmera-matter-interaction.css")}
        />
        <link rel="stylesheet" href={asset("/esmera-catalog-v2.css")} />
        <meta name="theme-color" content="#111210" />
      </Head>
      <a class="esv-skip" href="#main-content">Pular para o conteúdo</a>
      <EsmeraHeader
        logo={logo}
        enquiryLabel={enquiryLabel}
        navigation={navigation}
        categories={categories}
        whatsappHref={whatsappHref}
      />
      {menu.length > 0 && (
        <DynamicMenu
          items={menu}
          whatsappHref={whatsappHref}
          instagramHref={props.instagramHref}
        />
      )}
      <ProductModal />
      <EsmeraMotion />
      <EsmeraScrollScenes />
    </>
  );
}
