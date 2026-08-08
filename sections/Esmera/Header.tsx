import type { HeaderVariant } from "../../lib/esmera/shellData.ts";
import type { NavigationNode } from "../../lib/payload/navigation.ts";
import type { NavigationLink } from "../../lib/payload/types.ts";
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
  variant?: HeaderVariant;
}

export default function Header({
  logo = "ESMÉRA",
  enquiryLabel = "Carrinho",
  menu = [],
  whatsappHref = "",
  instagramHref = "",
  variant = "solid",
}: Props) {
  return (
    <>
      <a class="esv-skip" href="#main-content">Pular para o conteúdo</a>
      <EsmeraHeader
        logo={logo.trim() || "ESMÉRA"}
        enquiryLabel={enquiryLabel}
        whatsappHref={whatsappHref}
        variant={variant}
      />
      <DynamicMenu
        items={menu}
        whatsappHref={whatsappHref}
        instagramHref={instagramHref}
      />
      <ProductModal />
      <EsmeraMotion />
      <EsmeraScrollScenes />
    </>
  );
}
