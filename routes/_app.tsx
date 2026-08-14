import { asset, Head } from "$fresh/runtime.ts";
import { defineApp } from "$fresh/server.ts";
import Theme from "../sections/Theme/Theme.tsx";
import { Context } from "@deco/deco";

export default defineApp(async (_req, ctx) => {
  const revision = await Context.active().release?.revision();
  // Static CSS can outlive a branch deploy in Deco's CDN when the release
  // revision remains stable. Keep one storefront token so JSX/CSS that ship
  // together can never be mixed with a stale interaction layer.
  const storefrontStyleRevision = "2026-08-14-motion-system-v34";
  const homeStyleRevision = storefrontStyleRevision;
  return (
    <>
      <Theme colorScheme="any" />

      <Head>
        <link
          href={asset(`/styles.css?revision=${revision}`)}
          rel="stylesheet"
        />

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
        <link
          rel="stylesheet"
          href={asset(`/esmera-master.css?v=${storefrontStyleRevision}`)}
        />
        <link rel="stylesheet" href={asset("/esmera-finish.css")} />
        <link rel="stylesheet" href={asset("/esmera-commerce-refine.css")} />
        <link
          rel="stylesheet"
          href={asset(`/esmera-product-modal.css?v=${storefrontStyleRevision}`)}
        />
        <link
          rel="stylesheet"
          href={asset(`/esmera-matter-interaction.css?v=${homeStyleRevision}`)}
        />
        <link
          rel="stylesheet"
          href={asset(`/esmera-catalog-v2.css?v=${storefrontStyleRevision}`)}
        />
        <link
          rel="stylesheet"
          href={asset(
            `/esmera-collection-filter-v3.css?v=${storefrontStyleRevision}`,
          )}
        />
        <link
          rel="stylesheet"
          href={asset(
            `/esmera-collection-filter-label-fix.css?v=${storefrontStyleRevision}`,
          )}
        />
        <link
          rel="stylesheet"
          href={asset(`/esmera-header.css?v=${storefrontStyleRevision}`)}
        />
        <link
          rel="stylesheet"
          href={asset(
            `/esmera-product-card.css?v=${storefrontStyleRevision}`,
          )}
        />
        <link
          rel="stylesheet"
          href={asset(`/esmera-motion-v2.css?v=${homeStyleRevision}`)}
        />
        <link
          rel="stylesheet"
          href={asset("/esmera-accessibility-p1-v1.css")}
        />
        <link
          rel="stylesheet"
          href={asset(`/esmera-about-page.css?v=${storefrontStyleRevision}`)}
        />

        <link rel="manifest" href={asset("/site.webmanifest")} />
        <link rel="icon" href={asset("/favicon.ico")} />
        <link rel="apple-touch-icon" href={asset("/apple-touch-icon.png")} />
        <meta name="theme-color" content="#111210" />
      </Head>

      <ctx.Component />
    </>
  );
});