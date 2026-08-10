import { asset, Head } from "$fresh/runtime.ts";
import { defineApp } from "$fresh/server.ts";
import Theme from "../sections/Theme/Theme.tsx";
import { Context } from "@deco/deco";

export default defineApp(async (_req, ctx) => {
  const revision = await Context.active().release?.revision();
  // Static CSS can outlive a branch deploy in Deco's CDN when the release
  // revision remains stable. Bump this token whenever the storefront chrome
  // changes so preview environments cannot mix new JSX with stale styles.
  const storefrontStyleRevision = "2026-08-10-brand-mobile-v7";
  return (
    <>
      <Theme colorScheme="any" />

      <Head>
        <style>{`@view-transition { navigation: auto; }`}</style>

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
        <link rel="stylesheet" href={asset("/esmera-master.css")} />
        <link rel="stylesheet" href={asset("/esmera-finish.css")} />
        <link rel="stylesheet" href={asset("/esmera-motion-v2.css")} />
        <link rel="stylesheet" href={asset("/esmera-structure-guard.css")} />
        <link rel="stylesheet" href={asset("/esmera-commerce-refine.css")} />
        <link
          rel="stylesheet"
          href={asset("/esmera-hotfix-product-modal.css")}
        />
        <link
          rel="stylesheet"
          href={asset(
            `/esmera-product-modal-v2.css?v=${storefrontStyleRevision}`,
          )}
        />
        <link
          rel="stylesheet"
          href={asset("/esmera-matter-interaction.css")}
        />
        <link rel="stylesheet" href={asset("/esmera-catalog-v2.css")} />
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

        <link rel="manifest" href={asset("/site.webmanifest")} />
        <link rel="icon" href={asset("/favicon.ico")} />
        <link rel="apple-touch-icon" href={asset("/apple-touch-icon.png")} />
        <meta name="theme-color" content="#111210" />
      </Head>

      <ctx.Component />
    </>
  );
});
