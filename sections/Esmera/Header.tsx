import type { HeaderVariant } from "../../lib/esmera/shellData.ts";
import type { NavigationNode } from "../../lib/payload/navigation.ts";
import EsmeraHeader from "../../islands/EsmeraHeader.tsx";
import EsmeraMotion from "../../islands/EsmeraMotion.tsx";
import EsmeraScrollScenes from "../../islands/EsmeraScrollScenes.tsx";
import ProductModal from "../../islands/ProductModal.tsx";

export interface Props {
  logo?: string;
  enquiryLabel?: string;
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
        menu={menu}
        whatsappHref={whatsappHref}
        instagramHref={instagramHref}
        variant={variant}
      />
      <ProductModal />
      <EsmeraMotion />
      <EsmeraScrollScenes />
    </>
  );
}
