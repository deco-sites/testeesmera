import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const BASE_URL = (process.env.BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
const DIR = "full-frontend-option-matrix-artifacts";
await mkdir(`${DIR}/screenshots`, { recursive: true });

const out = {
  startedAt: new Date().toISOString(),
  categories: [],
  materials: [],
  availability: [],
  sorts: [],
  navigation: [],
  commerce: [],
  search: [],
  findings: [],
  errors: [],
};

const finding = (severity, title, data = {}) => out.findings.push({ severity, title, ...data });
const screenshot = async (page, name, fullPage = false) => {
  const file = `screenshots/${name}.png`;
  await page.screenshot({ path: `${DIR}/${file}`, fullPage, animations: "disabled", timeout: 30000 });
  return file;
};
const waitIdle = async (page, timeout = 10000) => {
  const started = Date.now();
  let timedOut = false;
  await page.waitForFunction(
    () => document.querySelector(".esv-collection-v2")?.getAttribute("aria-busy") === "false",
    null,
    { timeout },
  ).catch(() => { timedOut = true; });
  await page.waitForTimeout(180);
  return { ms: Date.now() - started, timedOut };
};
const errorText = async (page) => (await page.locator(".esv-collection-v2-error").textContent().catch(() => ""))?.trim() || "";
const countText = async (page) => (await page.locator(".esv-collection-v2-count").textContent().catch(() => ""))?.trim() || "";

async function openFilters(page) {
  const panel = page.locator("#esv-collection-filters");
  if (!(await panel.evaluate((el) => el.classList.contains("is-open")).catch(() => false))) {
    await page.locator(".esv-collection-v2-filter-trigger").first().click();
    await page.waitForTimeout(120);
  }
}

async function selectFacetIndex(page, ariaLabel, index) {
  const trigger = page.getByRole("button", { name: ariaLabel }).first();
  await trigger.click();
  await page.waitForTimeout(60);
  const options = page.getByRole("option");
  const label = ((await options.nth(index).textContent()) || "").trim();
  await options.nth(index).click();
  const idle = await waitIdle(page, 10000);
  return { label, idle };
}

const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: "pt-BR" });
  const page = await context.newPage();
  page.on("pageerror", (err) => out.errors.push({ type: "pageerror", message: err.message, url: page.url() }));
  page.on("console", (message) => {
    if (message.type() === "error") out.errors.push({ type: "console", message: message.text(), url: page.url() });
  });

  // COLLECTION — every category option.
  await page.goto(`${BASE_URL}/colecao`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(900);
  await openFilters(page);
  const categoryTrigger = page.getByRole("button", { name: "Filtrar por categoria" }).first();
  await categoryTrigger.click();
  const categoryLabels = (await page.getByRole("option").allTextContents()).map((x) => x.trim());
  await page.keyboard.press("Escape");

  for (let index = 0; index < categoryLabels.length; index++) {
    await openFilters(page);
    const selected = await selectFacetIndex(page, "Filtrar por categoria", index);
    const record = {
      index,
      label: selected.label,
      url: page.url(),
      count: await page.locator(".esv-product-card").count(),
      countText: await countText(page),
      empty: await page.locator(".esv-collection-v2-empty").isVisible().catch(() => false),
      error: await errorText(page),
      responseMs: selected.idle.ms,
      waitTimedOut: selected.idle.timedOut,
    };
    out.categories.push(record);
  }
  await screenshot(page, "category-matrix-final");

  const nonProductCategoryNames = /^(Contato|Dúvidas frequentes|Solicitar orçamento|Falar com a Esméra|Como funciona|Sobre a Esméra)$/i;
  const polluted = out.categories.filter((item) => nonProductCategoryNames.test(item.label));
  const emptyPolluted = polluted.filter((item) => item.empty || item.count === 0);
  if (polluted.length) {
    finding("high", "Filtro Categoria contém taxonomia de navegação/conteúdo", {
      polluted,
      emptyPolluted: emptyPolluted.map((item) => item.label),
    });
  }
  const categoryErrors = out.categories.filter((item) => item.error || item.waitTimedOut);
  if (categoryErrors.length) {
    finding("medium", "Algumas categorias excederam o tempo de resposta ou exibiram erro", {
      count: categoryErrors.length,
      samples: categoryErrors.slice(0, 12),
    });
  }

  // Reset category to Todas.
  await openFilters(page);
  await selectFacetIndex(page, "Filtrar por categoria", 0);

  // MATERIALS — every button, one at a time, then clear.
  await openFilters(page);
  const materialRoot = page.locator(".esv-collection-v2-materials");
  const materialButtons = materialRoot.locator("button");
  const materialLabels = [];
  for (let i = 0; i < await materialButtons.count(); i++) {
    materialLabels.push(((await materialButtons.nth(i).getAttribute("aria-label")) || (await materialButtons.nth(i).textContent()) || "").trim());
  }
  for (let index = 0; index < materialLabels.length; index++) {
    await openFilters(page);
    const buttons = page.locator(".esv-collection-v2-materials button");
    const button = buttons.nth(index);
    const label = materialLabels[index];
    await button.click();
    const idle = await waitIdle(page, 10000);
    const selected = await button.getAttribute("aria-pressed").catch(() => null);
    const applied = {
      index,
      label,
      selected,
      url: page.url(),
      count: await page.locator(".esv-product-card").count(),
      countText: await countText(page),
      error: await errorText(page),
      responseMs: idle.ms,
      waitTimedOut: idle.timedOut,
    };
    // Toggle the same material off so each case is isolated.
    await page.locator(".esv-collection-v2-materials button").nth(index).click();
    await waitIdle(page, 10000);
    out.materials.push(applied);
  }
  if (out.materials.some((item) => item.error || item.waitTimedOut)) {
    finding("medium", "Algumas opções de matéria excederam o tempo de resposta ou exibiram erro", {
      samples: out.materials.filter((item) => item.error || item.waitTimedOut).slice(0, 12),
    });
  }

  // AVAILABILITY — all 5 options including Todas.
  await openFilters(page);
  const availabilityTrigger = page.getByRole("button", { name: "Filtrar por disponibilidade" }).first();
  await availabilityTrigger.click();
  const availabilityLabels = (await page.getByRole("option").allTextContents()).map((x) => x.trim());
  await page.keyboard.press("Escape");
  for (let index = 0; index < availabilityLabels.length; index++) {
    await openFilters(page);
    const selected = await selectFacetIndex(page, "Filtrar por disponibilidade", index);
    out.availability.push({
      index,
      label: selected.label,
      url: page.url(),
      count: await page.locator(".esv-product-card").count(),
      countText: await countText(page),
      empty: await page.locator(".esv-collection-v2-empty").isVisible().catch(() => false),
      error: await errorText(page),
      responseMs: selected.idle.ms,
      waitTimedOut: selected.idle.timedOut,
    });
  }
  if (out.availability.some((item) => item.error || item.waitTimedOut)) {
    finding("medium", "Algumas disponibilidades excederam o tempo de resposta ou exibiram erro", {
      samples: out.availability.filter((item) => item.error || item.waitTimedOut),
    });
  }

  // Reset availability.
  await openFilters(page);
  await selectFacetIndex(page, "Filtrar por disponibilidade", 0);

  // SORT — all options.
  const sortTrigger = page.getByRole("button", { name: "Ordenar coleção" }).first();
  await sortTrigger.click();
  const sortLabels = (await page.getByRole("option").allTextContents()).map((x) => x.trim());
  await page.keyboard.press("Escape");
  for (let index = 0; index < sortLabels.length; index++) {
    const selected = await selectFacetIndex(page, "Ordenar coleção", index);
    out.sorts.push({
      index,
      label: selected.label,
      url: page.url(),
      count: await page.locator(".esv-product-card").count(),
      error: await errorText(page),
      responseMs: selected.idle.ms,
      waitTimedOut: selected.idle.timedOut,
    });
  }
  await screenshot(page, "all-filter-options-tested");

  // HEADER / MEGA — expose every root trigger, collect every menu href and verify HTTP.
  await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(900);
  const rootItems = page.locator(".esv-nav-v2-desktop > *");
  const discovered = new Map();
  for (let index = 0; index < await rootItems.count(); index++) {
    const item = rootItems.nth(index);
    if (!(await item.isVisible().catch(() => false))) continue;
    const label = ((await item.textContent()) || (await item.getAttribute("aria-label")) || `root-${index}`).trim();
    const tag = await item.evaluate((el) => el.tagName);
    const href = await item.getAttribute("href");
    if (href) discovered.set(href, { label, source: "root" });
    if (tag === "BUTTON") {
      await item.hover();
      await page.waitForTimeout(180);
      const links = page.locator(".esv-mega-v2 a[href]");
      for (let li = 0; li < await links.count(); li++) {
        const link = links.nth(li);
        const lh = await link.getAttribute("href");
        if (!lh) continue;
        const ll = ((await link.textContent()) || "").trim();
        discovered.set(lh, { label: ll, source: label });
      }
    }
  }
  await screenshot(page, "header-menu-option-matrix");
  for (const [href, meta] of discovered.entries()) {
    if (!href.startsWith("/")) {
      out.navigation.push({ href, ...meta, kind: "external", status: "not-requested" });
      continue;
    }
    let status = null;
    let error = null;
    try {
      const response = await fetch(`${BASE_URL}${href}`);
      status = response.status;
    } catch (cause) {
      error = String(cause);
    }
    const record = { href, ...meta, kind: "internal", status, error };
    out.navigation.push(record);
    if (error || !status || status >= 400) finding("high", "Opção de navegação aponta para rota com falha", record);
  }

  // SEARCH → first result should open a product surface.
  const searchButton = page.getByRole("button", { name: /buscar objetos|buscar/i }).first();
  await searchButton.click();
  const searchInput = page.locator("input[type='search']").first();
  await searchInput.fill("mesa");
  await page.waitForTimeout(800);
  const searchResults = page.locator(".esv-search-results > button, .esv-search-results a");
  const resultCount = await searchResults.count();
  let openedProduct = false;
  if (resultCount) {
    await searchResults.first().click();
    openedProduct = await page.locator(".esv-product-modal").isVisible().catch(() => false);
  }
  out.search.push({ query: "mesa", resultCount, openedProduct, screenshot: await screenshot(page, "search-result-open-product") });
  if (resultCount && !openedProduct) finding("high", "Resultado da busca não abre o produto", { query: "mesa", resultCount });
  await page.keyboard.press("Escape").catch(() => {});
  await page.waitForTimeout(180);

  // FAVORITE — real pointer behavior: hover card first, then click visible favorite.
  await page.goto(`${BASE_URL}/colecao`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(1000);
  const card = page.locator(".esv-product-card").first();
  await card.hover();
  await page.waitForTimeout(250);
  const wishlist = card.locator(".esv-card-wishlist").first();
  const beforeFav = await wishlist.getAttribute("aria-pressed");
  let favoriteClickError = null;
  try {
    await wishlist.click({ timeout: 5000 });
  } catch (error) {
    favoriteClickError = String(error);
  }
  await page.waitForTimeout(220);
  const afterFav = await wishlist.getAttribute("aria-pressed");
  const favoriteRecord = { action: "wishlist-hover-click", before: beforeFav, after: afterFav, error: favoriteClickError, screenshot: await screenshot(page, "wishlist-real-pointer") };
  out.commerce.push(favoriteRecord);
  if (favoriteClickError || beforeFav === afterFav) finding("high", "Favorito não responde ao clique real após hover do card", favoriteRecord);

  // CART — hover card, click transactional CTA, open cart and remove item.
  await card.hover();
  await page.waitForTimeout(200);
  const buy = card.locator(".esv-card-action-slot button").first();
  let addError = null;
  if (await buy.count()) {
    try { await buy.click({ timeout: 5000 }); } catch (error) { addError = String(error); }
  } else {
    addError = "No card action button";
  }
  await page.waitForTimeout(350);
  const quantityAfterAdd = ((await page.locator(".esv-cart-quantity").textContent().catch(() => "")) || "").trim();
  const cartTrigger = page.getByRole("button", { name: /carrinho|sacola|seleção/i }).or(page.getByRole("link", { name: /carrinho|sacola|seleção/i })).first();
  let cartOpened = false;
  let removeVisible = false;
  let quantityAfterRemove = null;
  if (await cartTrigger.count()) {
    await cartTrigger.click().catch(() => {});
    await page.waitForTimeout(250);
    cartOpened = await page.locator(".esv-enquiry-panel").isVisible().catch(() => false);
    const remove = page.locator(".esv-cart-remove, .esv-enquiry-list button").first();
    removeVisible = await remove.isVisible().catch(() => false);
    if (removeVisible) {
      await remove.click().catch(() => {});
      await page.waitForTimeout(250);
      quantityAfterRemove = ((await page.locator(".esv-cart-quantity").textContent().catch(() => "")) || "").trim();
    }
  }
  const cartRecord = { action: "card-cart-add-open-remove", addError, quantityAfterAdd, cartOpened, removeVisible, quantityAfterRemove, screenshot: await screenshot(page, "cart-add-remove-flow") };
  out.commerce.push(cartRecord);
  if (addError || !cartOpened) finding("high", "Fluxo adicionar → abrir carrinho falhou", cartRecord);

  await context.close();
} finally {
  await browser.close();
}

out.finishedAt = new Date().toISOString();
out.summary = {
  categories: out.categories.length,
  materials: out.materials.length,
  availability: out.availability.length,
  sorts: out.sorts.length,
  navigation: out.navigation.length,
  commerce: out.commerce.length,
  search: out.search.length,
  findings: out.findings.length,
  errors: out.errors.length,
};
await writeFile(`${DIR}/option-matrix.json`, `${JSON.stringify(out, null, 2)}\n`);
console.log(JSON.stringify(out.summary, null, 2));
console.log(JSON.stringify(out.findings, null, 2));
