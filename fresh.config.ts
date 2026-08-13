import { defineConfig } from "$fresh/server.ts";
import { plugins } from "deco/plugins/deco.ts";
import manifest from "./manifest.gen.ts";

export default defineConfig({
  plugins: plugins({
    manifest,
  }),
  // Storefront default document language. Fresh emits <html lang="en">
  // unless the render context language is overridden here.
  render: (ctx, render) => {
    ctx.lang = "pt-BR";
    render();
  },
});
