import StorefrontLayout from "../components/esmera/StorefrontLayout.tsx";

export default function NotFoundPage() {
  return (
    <StorefrontLayout
      navigation={null}
      settings={null}
      categories={[]}
      seo={{
        title: "Página não encontrada | Esméra",
        description: "A página solicitada não foi encontrada.",
        noindex: true,
      }}
    >
      <section class="esv-shell esv-section esv-editorial-page-head">
        <p class="esv-kicker">404</p>
        <h1>Página não encontrada</h1>
        <p>
          O endereço pode ter mudado. Continue pela seleção de objetos ou volte
          ao início.
        </p>
        <div class="esv-product-actions">
          <a class="esv-text-link" href="/colecao">Explorar peças</a>
          <a class="esv-text-link" href="/">Voltar ao início</a>
        </div>
      </section>
    </StorefrontLayout>
  );
}
