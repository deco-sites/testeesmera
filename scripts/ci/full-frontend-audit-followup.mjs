import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const BASE_URL = (process.env.BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
const DIR = "full-frontend-followup-artifacts";
await mkdir(`${DIR}/screenshots`, { recursive: true });

const result = {
  startedAt: new Date().toISOString(),
  cases: [],
  findings: [],
  console: [],
  network: [],
};

const finding = (severity, title, data = {}) => result.findings.push({ severity, title, ...data });
const add = (name, status, data = {}) => result.cases.push({ name, status, ...data });

async function shot(page, name) {
  const path = `${DIR}/screenshots/${name}.png`;
  await page.screenshot({ path, fullPage: false, animations: "disabled", timeout: 30000 });
  return `screenshots/${name}.png`;
}

async function stable(page, ms = 600) {
  await page.waitForLoadState("domcontentloaded").catch(() => {});
  await page.waitForLoadState("networkidle", { timeout: 2500 }).catch(() => {});
  await page.waitForTimeout(ms);
}

async function idle(page, timeout = 12000) {
  await page.waitForFunction(
    () => document.querySelector(".esv-collection-v2")?.getAttribute("aria-busy") === "false",
    null,
    { timeout },
  ).catch(() => {});
  await page.waitForTimeout(300);
}

function observe(page, label) {
  page.on("console", (message) => {
    if (["warning", "error"].includes(message.type())) {
      result.console.push({ case: label, type: message.type(), text: message.text(), url: page.url() });
    }
  });
  page.on("response", (response) => {
    if (response.status() >= 400) {
      result.network.push({
        case: label,
        status: response.status(),
        url: response.url(),
        resourceType: response.request().resourceType(),
      });
    }
  });
  page.on("requestfailed", (request) => {
    const error = request.failure()?.errorText || "unknown";
    if (!/ABORTED|AbortError/i.test(error)) {
      result.network.push({ case: label, error, url: request.url(), resourceType: request.resourceType() });
    }
  });
}

async function runCase(name, fn) {
  try {
    await fn();
  } catch (error) {
    add(name, "audit-error", { error: error instanceof Error ? error.stack || error.message : String(error) });
  }
}

const browser = await chromium.launch({ headless: true });
try {
  await runCase("collection-search-settled", async () => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: "pt-BR" });
    const page = await context.newPage();
    observe(page, "collection-search-settled");
    await page.goto(`${BASE_URL}/colecao`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await stable(page, 1000);
    const initialCount = await page.locator(".esv-product-card").count();
    const input = page.locator(".esv-collection-v2-search input").first();
    await input.fill("esmeralda");
    await page.waitForFunction(
      () => new URL(location.href).searchParams.get("q") === "esmeralda",
      null,
      { timeout: 15000 },
    ).catch(() => {});
    await idle(page, 15000);
    const url = page.url();
    const finalCount = await page.locator(".esv-product-card").count();
    const countLabel = (await page.locator(".esv-collection-v2-count").textContent().catch(() => ""))?.trim();
    const titles = (await page.locator(".esv-card-title").allTextContents()).map((x) => x.trim());
    const errorText = (await page.locator(".esv-collection-v2-error").textContent().catch(() => ""))?.trim();
    const synced = new URL(url).searchParams.get("q") === "esmeralda";
    const screenshot = await shot(page, "desktop-search-esmeralda-settled");
    add("collection-search-settled", "completed", { initialCount, finalCount, countLabel, titles, url, synced, errorText, screenshot });
    if (!synced) finding("medium", "Busca da coleção não sincroniza a URL após estabilização", { url, errorText });
    if (errorText) finding("medium", "Busca da coleção exibiu erro após espera completa", { errorText, url });
    await context.close();
  });

  await runCase("category-taxonomy", async () => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: "pt-BR" });
    const page = await context.newPage();
    observe(page, "category-taxonomy");
    await page.goto(`${BASE_URL}/colecao`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await stable(page, 1000);
    await page.locator(".esv-collection-v2-filter-trigger").first().click();
    await page.getByRole("button", { name: /filtrar por categoria/i }).first().click();
    const options = page.getByRole("option");
    const labels = (await options.allTextContents()).map((x) => x.trim());
    const suspicious = labels.filter((x) => /^(Contato|Dúvidas frequentes|Solicitar orçamento|Falar com a Esméra|Como funciona|Sobre a Esméra)$/i.test(x));
    const target = labels.findIndex((x) => /^Contato$/i.test(x));
    let selected = null;
    if (target >= 0) {
      await options.nth(target).click();
      await idle(page, 15000);
      selected = {
        label: labels[target],
        count: await page.locator(".esv-product-card").count(),
        countLabel: (await page.locator(".esv-collection-v2-count").textContent().catch(() => ""))?.trim(),
        emptyVisible: await page.locator(".esv-collection-v2-empty").isVisible().catch(() => false),
        url: page.url(),
        screenshot: await shot(page, "desktop-category-contato-result"),
      };
      if (selected.count === 0) {
        finding("high", "Filtro Categoria expõe opção de navegação sem produtos: Contato", selected);
      } else {
        finding("medium", "Filtro Categoria mistura taxonomia de navegação/conteúdo com produtos", selected);
      }
    }
    add("category-taxonomy", "completed", { optionCount: labels.length, suspicious, selected });
    await context.close();
  });

  await runCase("infinite-scroll-unfiltered", async () => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: "pt-BR" });
    const page = await context.newPage();
    observe(page, "infinite-scroll-unfiltered");
    await page.goto(`${BASE_URL}/colecao`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await stable(page, 1000);
    const before = await page.locator(".esv-product-card").count();
    const beforeLabel = (await page.locator(".esv-collection-v2-count").textContent().catch(() => ""))?.trim();
    const beforeMore = await page.getByRole("button", { name: /carregar mais/i }).isVisible().catch(() => false);
    for (let index = 0; index < 6; index++) {
      await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(900);
      await idle(page, 5000);
    }
    const after = await page.locator(".esv-product-card").count();
    const afterLabel = (await page.locator(".esv-collection-v2-count").textContent().catch(() => ""))?.trim();
    const afterMore = await page.getByRole("button", { name: /carregar mais/i }).isVisible().catch(() => false);
    const screenshot = await shot(page, "desktop-infinite-scroll-end");
    add("infinite-scroll-unfiltered", "completed", { before, beforeLabel, beforeMore, after, afterLabel, afterMore, screenshot });
    const total = Number((beforeLabel || "").match(/de\s+(\d+)/i)?.[1] || 0);
    if (total > before && after <= before) finding("high", "Infinite scroll não acrescenta produtos apesar de haver mais páginas", { before, total, after, beforeLabel, afterLabel });
    await context.close();
  });

  await runCase("desktop-real-viewer", async () => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: "pt-BR" });
    const page = await context.newPage();
    observe(page, "desktop-real-viewer");
    await page.goto(`${BASE_URL}/colecao`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await stable(page, 1200);
    await page.getByRole("button", { name: /conhecer a peça/i }).first().click();
    await page.waitForSelector(".esv-product-modal", { state: "visible", timeout: 5000 });
    await page.waitForTimeout(500);
    const active = page.locator(".esv-product-modal-image.is-active").first();
    const activeLabel = await active.getAttribute("aria-label");
    await active.click();
    const viewerVisible = await page.locator(".esv-product-viewer").waitFor({ state: "visible", timeout: 5000 }).then(() => true).catch(() => false);
    let viewer = null;
    if (viewerVisible) {
      await page.waitForTimeout(350);
      viewer = await page.locator(".esv-product-viewer-stage").evaluate((stage) => {
        const image = stage.querySelector(".esv-product-viewer-image");
        if (!(image instanceof HTMLImageElement)) return null;
        return {
          scale: stage.getAttribute("data-viewer-scale"),
          naturalWidth: image.naturalWidth,
          naturalHeight: image.naturalHeight,
          objectFit: getComputedStyle(image).objectFit,
        };
      });
      const zoom = page.getByRole("button", { name: /aumentar zoom/i }).first();
      if (await zoom.isVisible().catch(() => false)) {
        await zoom.click();
        await page.waitForTimeout(250);
        viewer.afterZoomScale = await page.locator(".esv-product-viewer-stage").getAttribute("data-viewer-scale");
      }
    }
    const screenshot = await shot(page, "desktop-real-viewer-followup");
    add("desktop-real-viewer", "completed", { activeLabel, viewerVisible, viewer, screenshot });
    if (!viewerVisible) finding("high", "Viewer real desktop não abre ao clicar no slide ativo", { activeLabel });
    await context.close();
  });

  await runCase("wishlist-state", async () => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: "pt-BR" });
    const page = await context.newPage();
    observe(page, "wishlist-state");
    await page.goto(`${BASE_URL}/colecao`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await stable(page, 1500);
    const wishlist = page.locator(".esv-product-card").first().getByRole("button", { name: /favorit/i }).first();
    const before = await wishlist.getAttribute("aria-pressed");
    await wishlist.click();
    await page.waitForFunction(
      (value) => document.querySelector(".esv-product-card .esv-card-wishlist")?.getAttribute("aria-pressed") !== value,
      before,
      { timeout: 5000 },
    ).catch(() => {});
    const after = await wishlist.getAttribute("aria-pressed");
    const stored = await page.evaluate(() => localStorage.getItem("esmera:wishlist"));
    const screenshot = await shot(page, "desktop-wishlist-settled");
    add("wishlist-state", "completed", { before, after, stored, screenshot });
    if (before === after) finding("medium", "Favorito não atualiza aria-pressed após clique", { before, after, stored });
    await context.close();
  });

  await runCase("mobile-sort-after-filter-close", async () => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: "pt-BR" });
    const page = await context.newPage();
    observe(page, "mobile-sort-after-filter-close");
    await page.goto(`${BASE_URL}/colecao`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await stable(page, 1200);
    await page.locator(".esv-collection-v2-filter-trigger").first().click();
    await page.waitForTimeout(200);
    const apply = page.locator("#esv-collection-filters.is-open .esv-collection-v2-results-action").first();
    const applyCount = await apply.count();
    if (applyCount) await apply.click({ force: true });
    await page.waitForTimeout(300);
    const filtersStillOpen = await page.locator("#esv-collection-filters.is-open").count() > 0;
    const sort = page.getByRole("button", { name: /ordenar coleção/i }).first();
    const labels = [];
    const states = [];
    for (let index = 0; index < 5; index++) {
      await sort.click();
      await page.waitForTimeout(100);
      const options = page.getByRole("option");
      if (index === 0) labels.push(...(await options.allTextContents()).map((x) => x.trim()));
      if (index >= await options.count()) break;
      const label = (await options.nth(index).textContent())?.trim();
      await options.nth(index).click();
      await idle(page, 10000);
      states.push({ label, url: page.url(), count: await page.locator(".esv-product-card").count() });
    }
    const screenshot = await shot(page, "mobile-sort-followup");
    add("mobile-sort-after-filter-close", "completed", { applyCount, filtersStillOpen, labels, states, screenshot });
    if (filtersStillOpen) finding("medium", "CTA de resultados do drawer mobile não fecha filtros", {});
    if (states.length !== 5) finding("high", "Ordenação mobile não permite selecionar todas as opções", { labels, states });
    await context.close();
  });

  for (const route of ["/", "/colecao"]) {
    await runCase(`forced-media-load-${route}`, async () => {
      const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: "pt-BR" });
      const page = await context.newPage();
      const failedImages = [];
      page.on("response", (response) => {
        if (response.status() >= 400 && response.request().resourceType() === "image") {
          failedImages.push({ status: response.status(), url: response.url() });
        }
      });
      await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded", timeout: 45000 });
      await stable(page, 900);
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y <= height; y += 650) {
        await page.evaluate((next) => scrollTo(0, next), y);
        await page.waitForTimeout(110);
      }
      await page.waitForTimeout(1200);
      const broken = await page.evaluate(() => Array.from(document.images)
        .filter((image) => image.currentSrc && image.naturalWidth <= 0)
        .map((image) => ({ src: image.currentSrc || image.src, alt: image.alt, loading: image.loading })));
      const screenshot = await shot(page, route === "/" ? "desktop-home-after-media-load" : "desktop-collection-after-media-load");
      add(`forced-media-load-${route}`, "completed", { imageCount: await page.locator("img").count(), broken, failedImages, screenshot });
      if (broken.length || failedImages.length) finding("critical", "Imagem realmente quebrada após forçar lazy-load", { route, broken, failedImages });
      await context.close();
    });
  }
} finally {
  await browser.close();
}

result.finishedAt = new Date().toISOString();
await writeFile(`${DIR}/followup.json`, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ cases: result.cases, findings: result.findings }, null, 2));
