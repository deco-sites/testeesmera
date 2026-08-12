import type { Handlers, PageProps } from "$fresh/server.ts";
import StorefrontLayout from "../../components/esmera/StorefrontLayout.tsx";
import { getDedicatedEditorialPath } from "../../lib/esmera/canonicalRoutes.ts";
import { toSEO } from "../../lib/payload/adapters.ts";
import { getStorefrontCategoryBySlug } from "../../lib/payload/navigationLoader.ts";
import { getPageChrome } from "../../lib/payload/pageData.ts";
import type { SEOModel } from "../../lib/payload/types.ts";

interface Data {
  category: Awaited<ReturnType<typeof getStorefrontCategoryBySlug>>;
  chrome: Awaited<ReturnType<typeof getPageChrome>>;
  seo: SEOModel;
}

export const handler: Handlers<Data> = {
  async GET(req, ctx) {
    const dedicatedPath = getDedicatedEditorialPath(ctx.params.slug);
    if (dedicatedPath) {
      return Response.redirect(new URL(dedicatedPath, req.url), 308);
    }
    const [category, chrome] = await Promise.all([
      getStorefrontCategoryBySlug(ctx.params.slug),
      getPageChrome(),
    ]);
    if (!category || category.nodeType !== "editorial") {
      return ctx.render({
        category: null,
        chrome,
        seo: { title: "Página não encontrada", description: "", noindex: true },
      }, { status: 404 });
    }
    const url = new URL(req.url);
    const seo = toSEO(category.seo, chrome.settings);
    return ctx.render({
      category,
      chrome,
      seo: {
        ...seo,
        title: seo.title || category.title,
        description: seo.description || category.description,
        canonical: seo.canonical || `${url.origin}${url.pathname}`,
      },
    });
  },
};

export default function EditorialPage({ data }: PageProps<Data>) {
  const category = data.category;
  return (
    <StorefrontLayout {...data.chrome} seo={data.seo}>
      {category
        ? (
          <article class="esv-editorial-page esv-section">
            <header class="esv-shell esv-editorial-page-head">
              <nav aria-label="Navegação estrutural">
                <a href="/">Início</a>
                <span aria-hidden="true">/</span>
                <span aria-current="page">{category.title}</span>
              </nav>
              <p class="esv-kicker">A Esméra</p>
              <h1>{category.title}</h1>
              {category.description && <p>{category.description}</p>}
            </header>
            {category.image && (
              <figure class="esv-shell esv-editorial-page-media">
                <img
                  src={category.image.url}
                  alt={category.image.alt}
                  width="1600"
                  height="1000"
                  loading="eager"
                />
              </figure>
            )}
            {category.highlights.length > 0 && (
              <section class="esv-shell esv-editorial-page-links">
                {category.highlights.map((highlight) => (
                  <a
                    key={highlight.title}
                    href={highlight.href || undefined}
                    target={highlight.external ? "_blank" : undefined}
                    rel={highlight.external ? "noopener noreferrer" : undefined}
                  >
                    {highlight.image && (
                      <img src={highlight.image} alt={highlight.alt ?? ""} />
                    )}
                    <strong>{highlight.title}</strong>
                    {highlight.copy && <span>{highlight.copy}</span>}
                  </a>
                ))}
              </section>
            )}
          </article>
        )
        : (
          <section class="esv-shell esv-section">
            <h1>Página não encontrada</h1>
          </section>
        )}
    </StorefrontLayout>
  );
}
