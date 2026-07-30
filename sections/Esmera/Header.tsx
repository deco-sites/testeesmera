import { asset, Head } from "$fresh/runtime.ts";
import EsmeraHeader from "../../islands/EsmeraHeader.tsx";
import EsmeraMotion from "../../islands/EsmeraMotion.tsx";
import EsmeraScrollScenes from "../../islands/EsmeraScrollScenes.tsx";

export interface Props {
  logo?: string;
  /** @description Backwards-compatible field; rendered as the cart label. */
  enquiryLabel?: string;
}

export default function Header({
  logo = "ESMÉRA",
  enquiryLabel = "Carrinho",
}: Props) {
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
        <meta name="theme-color" content="#111210" />
      </Head>

      <a class="esv-skip" href="#main-content">Pular para o conteúdo</a>
      <EsmeraHeader logo={logo} enquiryLabel={enquiryLabel} />
      <EsmeraMotion />
      <EsmeraScrollScenes />
    </>
  );
}
