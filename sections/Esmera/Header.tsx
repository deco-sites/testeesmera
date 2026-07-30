import { asset, Head } from "$fresh/runtime.ts";
import EsmeraHeader from "../../islands/EsmeraHeader.tsx";
import EsmeraMotion from "../../islands/EsmeraMotion.tsx";

export interface Props {
  logo?: string;
  enquiryLabel?: string;
}

export default function Header({
  logo = "ESMÉRA",
  enquiryLabel = "Consulta",
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
        <link rel="stylesheet" href={asset("/esmera.css")} />
        <link rel="stylesheet" href={asset("/esmera-refined.css")} />
        <link rel="stylesheet" href={asset("/esmera-v2.css")} />
        <meta name="theme-color" content="#151515" />
      </Head>

      <a class="esv-skip" href="#main-content">Pular para o conteúdo</a>
      <EsmeraHeader logo={logo} enquiryLabel={enquiryLabel} />
      <EsmeraMotion />
    </>
  );
}
