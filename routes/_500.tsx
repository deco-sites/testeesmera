import StorefrontLayout from "../components/esmera/StorefrontLayout.tsx";

export default function ErrorPage() {
  return (
    <StorefrontLayout
      navigation={null}
      settings={null}
      categories={[]}
      seo={{
        title: "Não foi possível carregar esta página | Esméra",
        description: "Ocorreu um erro temporário ao carregar a página.",
        noindex: true,
      }}
    >
      <section class="esv-shell esv-section esv-editorial-page-head">
        <p class="esv-kicker">ESMÉRA</p>
        <h1>Não foi possível carregar esta página.</h1>
        <p>Tente novamente ou retorne ao início para continuar navegando.</p>
        <a class="esv-text-link" href="/">Voltar ao início</a>
      </section>
    </StorefrontLayout>
  );
}
