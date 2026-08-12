import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const BASE_URL = (process.env.BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
const DIR = "full-frontend-followup-artifacts";
await mkdir(`${DIR}/screenshots`, { recursive: true });
const result = { cases: [], findings: [], startedAt: new Date().toISOString() };
const add = (name, data) => result.cases.push({ name, ...data });
const finding = (severity, title, data) => result.findings.push({ severity, title, ...data });

async function shot(page, name) {
  const file = `${DIR}/screenshots/${name}.png`;
  await page.screenshot({ path: file, fullPage: false, animations: "disabled" });
  return `screenshots/${name}.png`;
}
async function stable(page, ms = 400) {
  await page.waitForLoadState("domcontentloaded").catch(() => {});
  await page.waitForTimeout(ms);
}
async function waitCollectionIdle(page, timeout = 10000) {
  await page.waitForFunction(() => document.querySelector(".esv-collection-v2")?.getAttribute("aria-busy") === "false", null, { timeout }).catch(() => {});
  await page.waitForTimeout(250);
}
async function openFirstRealProduct(page) {
  await page.goto(`${BASE_URL}/colecao`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await stable(page, 1200);
  const trigger = page.getByRole("button", { name: /conhecer a peça/i }).first();
  await trigger.click();
  await page.waitForSelector(".esv-product-modal", { state: "visible" });
  await page.waitForTimeout(500);
}

const browser = await chromium.launch({ headless: true });
try {
  // Desktop: collection search with robust completion wait.
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: "pt-BR" });
    const page = await ctx.newPage();
    await page.goto(`${BASE_URL}/colecao`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await stable(page, 1200);
    const initialCount = await page.locator(".esv-product-card").count();
    const input = page.locator(".esv-collection-v2-search input").first();
    await input.fill("esmeralda");
    await page.waitForFunction(() => new URL(location.href).searchParams.get("q") === "esmeralda", null, { timeout: 12000 }).catch(() => {});
    await waitCollectionIdle(page, 12000);
    const finalCount = await page.locator(".esv-product-card").count();
    const countLabel = (await page.locator(".esv-collection-v2-count").textContent().catch(() => ""))?.trim();
    const url = page.url();
    const titles = (await page.locator(".esv-card-title").allTextContents()).map((x) => x.trim());
    const screenshot = await shot(page, "desktop-search-esmeralda-settled");
    const synced = new URL(url).searchParams.get("q") === "esmeralda";
    add("collection-search-settled", { initialCount, finalCount, countLabel, url, titles, synced, screenshot });
    if (!synced) finding("medium", "Busca da coleção não sincroniza a URL mesmo após estabilização", { url });

    // Category taxonomy: test a clearly non-product/navigation label if present.
    await input.fill("");
    await page.waitForTimeout(350);
    await waitCollectionIdle(page, 8000);
    const filter = page.locator(".esv-collection-v2-filter-trigger").first();
    await filter.click();
    const category = page.getByRole("button", { name: /categoria/i }).first();
    await category.click();
    const options = page.getByRole("option");
    const optionLabels = (await options.allTextContents()).map((x) => x.trim());
    const targetIndex = optionLabels.findIndex((x) => /^Contato$/i.test(x));
    let categoryResult = null;
    if (targetIndex >= 0) {
      await options.nth(targetIndex).click();
      await waitCollectionIdle(page, 12000);
      categoryResult = {
        label: optionLabels[targetIndex],
        count: await page.locator(".esv-product-card").count(),
        countLabel: (await page.locator(".esv-collection-v2-count").textContent().catch(() => ""))?.trim(),
        emptyVisible: await page.locator(".esv-collection-v2-empty").isVisible().catch(() => false),
        url: page.url(),
        screenshot: await shot(page, "desktop-category-contato-result"),
      };
      if (categoryResult.count === 0) finding("high", "Filtro Categoria expõe opção sem produto (Contato)", categoryResult);
      else finding("medium", "Filtro Categoria mistura taxonomia de navegação/conteúdo com produtos", categoryResult);
    }
    add("category-taxonomy", { optionCount: optionLabels.length, suspicious: optionLabels.filter((x) => /Contato|Dúvidas frequentes|Solicitar orçamento|Falar com a Esméra|Como funciona|Sobre a Esméra/i.test(x)), categoryResult });

    // Infinite scroll in clean state.
    await page.goto(`${BASE_URL}/colecao`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await stable(page, 1000);
    const before = await page.locator(".esv-product-card").count();
    const beforeLabel = (await page.locator(".esv-collection-v2-count").textContent())?.trim();
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(900);
      await waitCollectionIdle(page, 4000);
    }
    const after = await page.locator(".esv-product-card").count();
    const afterLabel = (await page.locator(".esv-collection-v2-count").textContent())?.trim();
    add("infinite-scroll-unfiltered", { before, beforeLabel, after, afterLabel, url: page.url(), screenshot: await shot(page, "desktop-infinite-scroll-end") });
    if (after <= before && /de\s+\d+\s+peças/i.test(beforeLabel || "")) finding("high", "Infinite scroll não acrescentou produtos apesar de haver mais páginas", { before, beforeLabel, after, afterLabel });

    await ctx.close();
  }

  // Desktop: exact active slide viewer / zoom.
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: "pt-BR" });
    const page = await ctx.newPage();
    await openFirstRealProduct(page);
    const active = page.locator(".esv-product-modal-image.is-active").first();
    const activeLabel = await active.getAttribute("aria-label");
    await active.click();
    const viewerVisible = await page.locator(".esv-product-viewer").waitFor({ state: "visible", timeout: 5000 }).then(() => true).catch(() => false);
    let viewer = null;
    if (viewerVisible) {
      await page.waitForTimeout(350);
      viewer = await page.locator(".esv-product-viewer-stage").evaluate((stage) => {
        const img = stage.querySelector(".esv-product-viewer-image");
        return img instanceof HTMLImageElement ? {
          scale: stage.getAttribute("data-viewer-scale"),
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          objectFit: getComputedStyle(img).objectFit,
        } : null;
      });
      const zoomIn = page.getByRole("button", { name: /aumentar zoom/i });
      await zoomIn.click();
      await page.waitForTimeout(220);
      viewer.afterZoomScale = await page.locator(".esv-product-viewer-stage").getAttribute("data-viewer-scale");
    }
    const screenshot = await shot(page, "desktop-real-viewer-followup");
    add("desktop-real-viewer-exact-active", { activeLabel, viewerVisible, viewer, screenshot });
    if (!viewerVisible) finding("high", "Viewer real desktop não abre ao clicar no slide ativo", { activeLabel });
    await ctx.close();
  }

  // Desktop: wishlist hydration/state robust wait.
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: "pt-BR" });
    const page = await ctx.newPage();
    await page.goto(`${BASE_URL}/colecao`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await stable(page, 1500);
    const wishlist = page.locator(".esv-product-card").first().getByRole("button", { name: /favorit/i }).first();
    const before = await wishlist.getAttribute("aria-pressed");
    await wishlist.click();
    await page.waitForFunction((beforeValue) => document.querySelector(".esv-product-card .esv-card-wishlist")?.getAttribute("aria-pressed") !== beforeValue, before, { timeout: 4000 }).catch(() => {});
    const after = await wishlist.getAttribute("aria-pressed");
    const stored = await page.evaluate(() => localStorage.getItem("esmera:wishlist"));
    add("wishlist-state-settled", { before, after, stored, screenshot: await shot(page, "desktop-wishlist-settled") });
    if (before === after) finding("medium", "Favorito não atualiza estado acessível após espera de hidratação", { before, after, stored });
    await ctx.close();
  }

  // Mobile: filters closed with CTA, then all sort options tested.
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: "pt-BR" });
    const page = await ctx.newPage();
    await page.goto(`${BASE_URL}/colecao`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await stable(page, 1300);
    const filter = page.locator(".esv-collection-v2-filter-trigger").first();
    await filter.click();
    await page.waitForTimeout(180);
    const apply = page.getByRole("button", { name: /Ver \d+ peç|Ver \d+ peça/i }).first();
    if (await apply.count()) await apply.click();
    await page.waitForTimeout(220);
    const filtersStillOpen = await page.locator(".esv-collection-v2-filters.is-open").count() > 0;
    const sort = page.getByRole("button", { name: /ordenar coleção/i }).first();
    const labels = [];
    const states = [];
    for (let index = 0; index < 5; index++) {
      await sort.click();
      const options = page.getByRole("option");
      if (index === 0) labels.push(...(await options.allTextContents()).map((x) => x.trim()));
      if (index >= await options.count()) break;
      const label = (await options.nth(index).textContent())?.trim();
      await options.nth(index).click();
      await waitCollectionIdle(page, 10000);
      states.push({ label, url: page.url(), count: await page.locator(".esv-product-card").count() });
    }
    add("mobile-sort-after-closing-filters", { filtersStillOpen, labels, states, screenshot: await shot(page, "mobile-sort-followup") });
    if (filtersStillOpen) finding("medium", "CTA do drawer mobile não fecha filtros", {});
    if (states.length !== 5) finding("high", "Ordenação mobile não permite percorrer todas as opções", { labels, states });
    await ctx.close();
  }

  // Lazy media: force scroll through Home and Collection and wait for image load.
  for (const route of ["/", "/colecao"]) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: "pt-BR" });
    const page = await ctx.newPage();
    const failedResponses = [];
    page.on("response", (response) => {
      if (response.status() >= 400 && response.request().resourceType() === "image") failedResponses.push({ status: response.status(), url: response.url() });
    });
    await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await stable(page, 900);
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y <= height; y += 700) {
      await page.evaluate((nextY) => scrollTo(0, nextY), y);
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(1000);
    const broken = await page.evaluate(() => Array.from(document.images).filter((img) => {
      const style = getComputedStyle(img);
      return style.display !== "none" && style.visibility !== "hidden" && img.currentSrc && img.naturalWidth <= 0;
    }).map((img) => ({ src: img.currentSrc || img.src, alt: img.alt, loading: img.loading })));
    add(`forced-media-load-${route === "/" ? "home" : "collection"}`, { broken, failedResponses, imageCount: await page.locator("img").count(), screenshot: await shot(page, route === "/" ? "desktop-home-after-media-load" : "desktop-collection-after-media-load") });
    if (broken.length || failedResponses.length) finding("critical", "Imagem realmente quebrada após forçar lazy-load", { route, broken, failedResponses });
    await ctx.close();
  }
} finally {
  await browser.close();
}
result.finishedAt = new Date().toISOString();
await writeFile(`${DIR}/followup.json`, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ cases: result.cases.length, findings: result.findings }, null, 2));
