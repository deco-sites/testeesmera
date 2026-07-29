import { asset, Head } from "$fresh/runtime.ts";
import EsmeraHeader from "../../islands/EsmeraHeader.tsx";

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
        <meta name="theme-color" content="#0F1115" />
      </Head>

      <a class="esv-skip" href="#main-content">Pular para o conteúdo</a>
      <EsmeraHeader logo={logo} enquiryLabel={enquiryLabel} />
    </>
  );
}
