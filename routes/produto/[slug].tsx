import type { Handlers, PageProps } from "$fresh/server.ts";
import StorefrontLayout from "../../components/esmera/StorefrontLayout.tsx";
import { getProductBySlug } from "../../lib/payload/loaders.ts";
import { getPageChrome } from "../../lib/payload/pageData.ts";
import type { EsmeraObject, SEOModel } from "../../lib/payload/types.ts";
import SignatureObject from "../../sections/Esmera/SignatureObject.tsx";

interface Data {
  product: EsmeraObject | null;
  chrome: Awaited<ReturnType<typeof getPageChrome>>;
  seo: SEOModel;
}
export const handler: Handlers<Data> = {
  async GET(_req, ctx) {
    const [product, chrome] = await Promise.all([
      getProductBySlug(ctx.params.slug),
      getPageChrome(),
    ]);
    if (!product) {
      return ctx.render({
        product: null,
        chrome,
        seo: { title: "", description: "", noindex: true },
      }, { status: 404 });
    }
    return ctx.render({
      product,
      chrome,
      seo: {
        ...product.seo,
        title: product.seo.title || product.title,
        description: product.seo.description || product.description || "",
        image: product.seo.image || product.image,
      },
    });
  },
};
export default function ProductRoute({ data }: PageProps<Data>) {
  return (
    <StorefrontLayout {...data.chrome} seo={data.seo}>
      {data.product
        ? (
          <SignatureObject
            product={data.product}
            editorialText={data.product.description}
            showFullDetails
          />
        )
        : (
          <section class="esv-shell esv-section">
            <h1>Objeto não encontrado</h1>
          </section>
        )}
    </StorefrontLayout>
  );
}
