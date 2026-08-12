import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import axeCore from "axe-core";

const BASE_URL = (process.env.BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
const ARTIFACT_DIR = process.env.ARTIFACT_DIR || "full-frontend-audit-artifacts";
const SCREENSHOT_DIR = `${ARTIFACT_DIR}/screenshots`;
const commit = process.env.GITHUB_SHA || "local";

await mkdir(SCREENSHOT_DIR, { recursive: true });

const report = {
  meta: {
    baseUrl: BASE_URL,
    commit,
    startedAt: new Date().toISOString(),
    auditVersion: 1,
  },
  sitemap: [],
  routeAudits: [],
  interactions: [],
  issues: [],
  console: [],
  network: [],
  screenshots: [],
  coverage: {
    viewports: [],
    deepRoutes: [],
    sitemapCount: 0,
    interactionGroups: [],
  },
};

const severityRank = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
const viewports = [
  { name: "desktop", width: 1440, height: 1000, isMobile: false, hasTouch: false },
  { name: "tablet", width: 1024, height: 1366, isMobile: false, hasTouch: true },
  { name: "mobile", width: 390, height: 844, isMobile: true, hasTouch: true },
];
report.coverage.viewports = viewports.map(({ name, width, height }) => ({ name, width, height }));

function slug(value) {
  return String(value || "root")
    .replace(/^https?:\/\/[^/]+/i, "")
    .replace(/[?#].*$/, "")
    .replace(/^\/+|\/+$/g, "")
    .replace(/[^a-z0-9_-]+/gi, "-")
    .replace(/^-+|-+$/g, "") || "home";
}

function issue(severity, category, title, details = {}) {
  const fingerprint = `${severity}|${category}|${title}|${details.route || ""}|${details.viewport || ""}`;
  if (report.issues.some((item) => item.fingerprint === fingerprint)) return;
  report.issues.push({
    fingerprint,
    severity,
    category,
    title,
    ...details,
  });
}

function recordInteraction(name, viewport, status, details = {}) {
  report.interactions.push({ name, viewport, status, ...details });
  if (!report.coverage.interactionGroups.includes(name)) {
    report.coverage.interactionGroups.push(name);
  }
}

async function screenshot(page, label, viewport, fullPage = false) {
  const file = `${viewport}-${slug(label)}.png`;
  const path = `${SCREENSHOT_DIR}/${file}`;
  try {
    await page.screenshot({ path, fullPage, animations: "disabled", timeout: 30000 });
    report.screenshots.push({ label, viewport, file: `screenshots/${file}`, fullPage });
    return file;
  } catch (error) {
    issue("low", "evidence", "Falha ao capturar screenshot", {
      viewport,
      route: page.url(),
      error: String(error),
      label,
    });
    return null;
  }
}

function attachObservers(page, viewport) {
  page.on("console", (message) => {
    if (!["error", "warning"].includes(message.type())) return;
    report.console.push({
      viewport,
      url: page.url(),
      type: message.type(),
      text: message.text(),
    });
  });
  page.on("pageerror", (error) => {
    report.console.push({ viewport, url: page.url(), type: "pageerror", text: error.message });
  });
  page.on("requestfailed", (request) => {
    const url = request.url();
    if (url.startsWith("data:")) return;
    report.network.push({
      viewport,
      page: page.url(),
      kind: "requestfailed",
      url,
      method: request.method(),
      error: request.failure()?.errorText || "unknown",
    });
  });
  page.on("response", (response) => {
    if (response.status() < 400) return;
    const url = response.url();
    if (url.includes("favicon") && response.status() === 404) return;
    report.network.push({
      viewport,
      page: page.url(),
      kind: "http",
      url,
      status: response.status(),
      method: response.request().method(),
    });
  });
}

async function waitStable(page, timeout = 1500) {
  await page.waitForTimeout(250);
  await page.waitForLoadState("domcontentloaded").catch(() => {});
  await page.waitForLoadState("networkidle", { timeout }).catch(() => {});
  await page.waitForTimeout(180);
}

async function domMetrics(page) {
  return await page.evaluate(() => {
    const visible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.visibility !== "hidden" && style.display !== "none" && rect.width > 0 && rect.height > 0;
    };
    const accessibleName = (element) => {
      const aria = element.getAttribute("aria-label") || element.getAttribute("title") || "";
      const text = (element.textContent || "").trim();
      const value = element instanceof HTMLInputElement ? element.placeholder || element.value : "";
      return (aria || text || value).trim();
    };
    const ids = Array.from(document.querySelectorAll("[id]"), (element) => element.id).filter(Boolean);
    const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
    const images = Array.from(document.images).map((img) => ({
      src: img.currentSrc || img.src,
      alt: img.getAttribute("alt"),
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      visible: visible(img),
    }));
    const interactive = Array.from(document.querySelectorAll("button, a[href], input, select, textarea, [role='button']"))
      .filter((element) => visible(element));
    const unnamed = interactive
      .filter((element) => !accessibleName(element))
      .slice(0, 30)
      .map((element) => ({ tag: element.tagName, cls: element.className, html: element.outerHTML.slice(0, 260) }));
    const tinyTargets = interactive
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          tag: element.tagName,
          name: accessibleName(element).slice(0, 80),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        };
      })
      .filter((item) => item.width > 0 && item.height > 0 && (item.width < 36 || item.height < 36))
      .slice(0, 50);
    const title = document.title || "";
    const description = document.querySelector('meta[name="description"]')?.getAttribute("content") || "";
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href") || "";
    const h1 = Array.from(document.querySelectorAll("h1")).map((el) => (el.textContent || "").trim()).filter(Boolean);
    const body = document.documentElement;
    const overflowX = Math.max(body.scrollWidth, document.body?.scrollWidth || 0) - body.clientWidth;
    const links = Array.from(document.querySelectorAll("a[href]"), (a) => a.getAttribute("href") || "");
    const paint = performance.getEntriesByType("paint").reduce((acc, entry) => {
      acc[entry.name] = Math.round(entry.startTime);
      return acc;
    }, {});
    const nav = performance.getEntriesByType("navigation")[0];
    return {
      title,
      description,
      canonical,
      h1,
      h1Count: h1.length,
      mainCount: document.querySelectorAll("main").length,
      mainContentIdCount: document.querySelectorAll("#main-content").length,
      headerCount: document.querySelectorAll("header").length,
      duplicateIds,
      imageCount: images.length,
      brokenImages: images.filter((img) => img.visible && (!img.complete || img.naturalWidth <= 0)),
      missingAlt: images.filter((img) => img.visible && img.alt === null),
      emptyAltVisible: images.filter((img) => img.visible && img.alt === ""),
      unnamed,
      tinyTargets,
      overflowX: Math.round(overflowX),
      internalLinks: links.filter((href) => href.startsWith("/")).length,
      hashLinks: links.filter((href) => href === "#" || href.startsWith("javascript:")),
      paint,
      domContentLoaded: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
      loadEventEnd: nav ? Math.round(nav.loadEventEnd) : null,
      domNodes: document.getElementsByTagName("*").length,
    };
  });
}

async function axeAudit(page) {
  try {
    await page.addScriptTag({ content: axeCore.source });
    return await page.evaluate(async () => {
      const result = await globalThis.axe.run(document, {
        resultTypes: ["violations"],
        rules: {
          "color-contrast": { enabled: true },
          "region": { enabled: true },
        },
      });
      return result.violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        help: violation.help,
        helpUrl: violation.helpUrl,
        nodes: violation.nodes.slice(0, 12).map((node) => ({
          target: node.target,
          html: node.html.slice(0, 500),
          summary: node.failureSummary,
        })),
        nodeCount: violation.nodes.length,
      }));
    });
  } catch (error) {
    return [{ id: "axe-runtime", impact: "minor", help: String(error), nodes: [], nodeCount: 0 }];
  }
}

function classifyAxeImpact(impact) {
  if (impact === "critical") return "critical";
  if (impact === "serious") return "high";
  if (impact === "moderate") return "medium";
  return "low";
}

async function auditRoute(page, route, viewportName, { fullPage = false, axe = true, expected404 = false } = {}) {
  let response = null;
  let loadError = null;
  try {
    response = await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await waitStable(page, 2200);
  } catch (error) {
    loadError = String(error);
  }
  const status = response?.status() ?? null;
  if (loadError) {
    issue("critical", "navigation", "Rota não carregou", { route, viewport: viewportName, error: loadError });
  } else if (expected404) {
    if (status !== 404) issue("medium", "routing", "Rota inexistente não retorna 404", { route, viewport: viewportName, status });
  } else if (status && status >= 400) {
    issue(status >= 500 ? "critical" : "high", "routing", `Rota retornou HTTP ${status}`, { route, viewport: viewportName });
  }

  let metrics = null;
  if (!loadError) {
    metrics = await domMetrics(page);
    if (metrics.overflowX > 2) issue("high", "responsive", "Overflow horizontal detectado", { route, viewport: viewportName, overflowPx: metrics.overflowX });
    if (!expected404 && metrics.mainCount === 0) issue("medium", "structure", "Página sem elemento <main>", { route, viewport: viewportName });
    if (!expected404 && metrics.mainContentIdCount !== 1) issue("medium", "structure", "Quantidade irregular de #main-content", { route, viewport: viewportName, count: metrics.mainContentIdCount });
    if (metrics.duplicateIds.length) issue("high", "accessibility", "IDs duplicados no DOM", { route, viewport: viewportName, ids: metrics.duplicateIds });
    if (metrics.brokenImages.length) issue("critical", "media", "Imagens visíveis quebradas", { route, viewport: viewportName, images: metrics.brokenImages.slice(0, 12) });
    if (metrics.missingAlt.length) issue("medium", "accessibility", "Imagens visíveis sem atributo alt", { route, viewport: viewportName, count: metrics.missingAlt.length, images: metrics.missingAlt.slice(0, 10) });
    if (metrics.unnamed.length) issue("high", "accessibility", "Controles interativos sem nome acessível", { route, viewport: viewportName, controls: metrics.unnamed.slice(0, 12) });
    if (metrics.hashLinks.length) issue("low", "navigation", "Links vazios/javascript encontrados", { route, viewport: viewportName, links: metrics.hashLinks });
    if (!expected404 && !metrics.title.trim()) issue("medium", "seo", "Página sem <title>", { route, viewport: viewportName });
    if (!expected404 && metrics.h1Count === 0) issue("medium", "seo", "Página sem H1", { route, viewport: viewportName });
    if (metrics.h1Count > 1) issue("low", "seo", "Mais de um H1 na página", { route, viewport: viewportName, headings: metrics.h1 });
  }

  const violations = !loadError && axe ? await axeAudit(page) : [];
  for (const violation of violations) {
    if (violation.id === "axe-runtime") continue;
    issue(classifyAxeImpact(violation.impact), "accessibility", `axe: ${violation.help}`, {
      route,
      viewport: viewportName,
      rule: violation.id,
      nodeCount: violation.nodeCount,
      nodes: violation.nodes.slice(0, 6),
      helpUrl: violation.helpUrl,
    });
  }

  const shot = !loadError ? await screenshot(page, `route-${slug(route)}`, viewportName, fullPage) : null;
  report.routeAudits.push({ route, viewport: viewportName, status, loadError, metrics, axeViolations: violations, screenshot: shot });
}

async function sitemapRoutes() {
  const response = await fetch(`${BASE_URL}/sitemap.xml`);
  const xml = await response.text();
  const paths = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => {
    try {
      return new URL(match[1]).pathname;
    } catch {
      return null;
    }
  }).filter(Boolean);
  return [...new Set(paths)];
}

function routeKind(route) {
  if (route === "/") return "home";
  if (route === "/colecao") return "collection-index";
  if (route.startsWith("/colecao/")) return "collection-detail";
  if (route.startsWith("/produto/")) return "product-detail";
  if (route.startsWith("/pagina/")) return "cms-page";
  if (route === "/sobre") return "about";
  if (route === "/contato") return "contact";
  if (route === "/termos") return "terms";
  if (route === "/politica-de-privacidade") return "privacy";
  return "other";
}

async function crawlSitemap(browser, routes) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  attachObservers(page, "sitemap-crawl");
  for (const route of routes) {
    let status = null;
    let title = "";
    let error = null;
    try {
      const response = await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded", timeout: 30000 });
      status = response?.status() ?? null;
      title = await page.title();
      if (status && status >= 400) issue(status >= 500 ? "critical" : "high", "routing", `Sitemap contém rota HTTP ${status}`, { route, status });
    } catch (cause) {
      error = String(cause);
      issue("critical", "routing", "Rota do sitemap não carrega", { route, error });
    }
    report.sitemap.push({ route, kind: routeKind(route), status, title, error });
  }
  await context.close();
}

async function clickIfVisible(locator) {
  if (await locator.count() === 0) return false;
  const first = locator.first();
  if (!(await first.isVisible().catch(() => false))) return false;
  await first.click({ timeout: 8000 }).catch(() => {});
  return true;
}

async function closeSurface(page) {
  await page.keyboard.press("Escape").catch(() => {});
  await page.waitForTimeout(220);
}

async function auditHeaderAndOverlays(page, viewport) {
  await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await waitStable(page, 1800);

  // Desktop nav / mobile drawer.
  try {
    if (viewport === "mobile") {
      const menu = page.getByRole("button", { name: /abrir menu/i });
      if (await clickIfVisible(menu)) {
        await waitStable(page, 800);
        const drawerLinks = await page.locator(".esv-nav-v2-drawer a[href]").allTextContents().catch(() => []);
        await screenshot(page, "menu-mobile-open", viewport, false);
        recordInteraction("header-menu", viewport, "passed", { drawerLinks: drawerLinks.map((x) => x.trim()).filter(Boolean) });
        await closeSurface(page);
      } else {
        recordInteraction("header-menu", viewport, "not-found");
        issue("high", "navigation", "Botão de menu mobile não encontrado", { viewport, route: "/" });
      }
    } else {
      const desktopTriggers = page.locator(".esv-nav-v2-desktop button, .esv-nav-v2-desktop a");
      const count = await desktopTriggers.count();
      const tested = [];
      for (let index = 0; index < Math.min(count, 12); index++) {
        const item = desktopTriggers.nth(index);
        if (!(await item.isVisible().catch(() => false))) continue;
        const name = ((await item.textContent()) || (await item.getAttribute("aria-label")) || `item-${index}`).trim();
        await item.hover().catch(() => {});
        await page.waitForTimeout(220);
        tested.push({ name, megaVisible: await page.locator(".esv-mega-v2").isVisible().catch(() => false) });
      }
      await screenshot(page, "header-desktop-nav", viewport, false);
      recordInteraction("header-menu", viewport, "passed", { tested });
    }
  } catch (error) {
    recordInteraction("header-menu", viewport, "failed", { error: String(error) });
    issue("high", "navigation", "Falha ao operar menu principal", { viewport, route: "/", error: String(error) });
  }

  // Search overlay: populated and empty state.
  try {
    await closeSurface(page);
    const searchButton = page.getByRole("button", { name: /buscar objetos|buscar/i }).first();
    if (await clickIfVisible(searchButton)) {
      await page.waitForTimeout(250);
      await screenshot(page, "search-open", viewport, false);
      const input = page.locator("input[type='search'], .esv-search-field input, input[placeholder*='Buscar']").first();
      if (await input.count()) {
        await input.fill("mesa");
        await page.waitForTimeout(650);
        const resultCount = await page.locator(".esv-search-results > button, .esv-search-results a").count().catch(() => 0);
        await screenshot(page, "search-mesa-results", viewport, false);
        await input.fill("zzzxxyy-audit-no-result");
        await page.waitForTimeout(650);
        const emptyVisible = await page.locator(".esv-search-empty").isVisible().catch(() => false);
        await screenshot(page, "search-empty-state", viewport, false);
        recordInteraction("search-overlay", viewport, "passed", { resultCount, emptyVisible });
        if (!emptyVisible) issue("medium", "usability", "Busca sem resultados não expõe estado vazio claro", { viewport, route: "/" });
      } else {
        issue("high", "usability", "Overlay de busca abriu sem campo de busca", { viewport, route: "/" });
        recordInteraction("search-overlay", viewport, "failed", { reason: "input-missing" });
      }
      await closeSurface(page);
    } else {
      issue("high", "navigation", "Ação de busca não encontrada no header", { viewport, route: "/" });
      recordInteraction("search-overlay", viewport, "not-found");
    }
  } catch (error) {
    recordInteraction("search-overlay", viewport, "failed", { error: String(error) });
    issue("high", "usability", "Falha ao operar busca global", { viewport, route: "/", error: String(error) });
  }

  // Cart / enquiry empty state.
  try {
    await closeSurface(page);
    const cart = page.getByRole("button", { name: /carrinho|sacola|seleção/i }).or(page.getByRole("link", { name: /carrinho|sacola|seleção/i })).first();
    if (await clickIfVisible(cart)) {
      await page.waitForTimeout(250);
      await screenshot(page, "cart-open", viewport, false);
      const empty = await page.locator(".esv-enquiry-empty").isVisible().catch(() => false);
      recordInteraction("cart-overlay", viewport, "passed", { empty });
      await closeSurface(page);
    } else {
      issue("medium", "navigation", "Ação de carrinho/seleção não encontrada", { viewport, route: "/" });
      recordInteraction("cart-overlay", viewport, "not-found");
    }
  } catch (error) {
    recordInteraction("cart-overlay", viewport, "failed", { error: String(error) });
  }
}

async function openRealProductModal(page) {
  await page.goto(`${BASE_URL}/colecao`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await waitStable(page, 2200);
  const cards = page.locator(".esv-product-card");
  const count = await cards.count();
  for (let index = 0; index < Math.min(count, 8); index++) {
    const card = cards.nth(index);
    const candidate = card.locator("button").filter({ visible: true }).first();
    if (await candidate.count() === 0) continue;
    const label = ((await candidate.getAttribute("aria-label")) || (await candidate.textContent()) || "").trim();
    if (/favorit/i.test(label)) continue;
    await candidate.click().catch(() => {});
    if (await page.locator(".esv-product-modal").isVisible().catch(() => false)) return { cardIndex: index, label };
  }
  return null;
}

async function auditProductJourney(page, viewport) {
  try {
    const opened = await openRealProductModal(page);
    if (!opened) {
      issue("high", "product", "Não foi possível abrir popup de produto real a partir da coleção", { viewport, route: "/colecao" });
      recordInteraction("product-modal-real", viewport, "not-opened");
      return;
    }
    await waitStable(page, 1400);
    const gallery = await page.locator(".esv-product-modal-gallery").evaluate((node) => ({
      className: node.className,
      imageCount: node.querySelectorAll(".esv-product-modal-image").length,
      visibleImages: Array.from(node.querySelectorAll(".esv-product-modal-image img")).filter((img) => {
        const rect = img.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      }).length,
    }));
    await screenshot(page, "real-product-modal", viewport, false);

    const next = page.getByRole("button", { name: /próxima imagem/i });
    if (await next.count() && await next.isVisible().catch(() => false)) {
      await next.click().catch(() => {});
      await page.waitForTimeout(260);
      await screenshot(page, "real-product-modal-next", viewport, false);
    }

    const activeImageButton = page.locator(".esv-product-modal-image.is-active, .esv-product-modal-image").first();
    if (await activeImageButton.count()) {
      await activeImageButton.click().catch(() => {});
      await page.waitForTimeout(300);
    }
    const viewerVisible = await page.locator(".esv-product-viewer").isVisible().catch(() => false);
    if (viewerVisible) {
      const viewerMetrics = await page.locator(".esv-product-viewer").evaluate((viewer) => {
        const img = viewer.querySelector(".esv-product-viewer-image");
        const stage = viewer.querySelector(".esv-product-viewer-stage");
        if (!(img instanceof HTMLImageElement) || !(stage instanceof HTMLElement)) return null;
        const ir = img.getBoundingClientRect();
        const sr = stage.getBoundingClientRect();
        return {
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          rendered: { width: ir.width, height: ir.height },
          stage: { width: sr.width, height: sr.height },
          objectFit: getComputedStyle(img).objectFit,
          scale: stage.getAttribute("data-viewer-scale"),
        };
      });
      await screenshot(page, "real-product-viewer", viewport, false);
      const zoomIn = page.getByRole("button", { name: /aumentar zoom/i });
      if (await zoomIn.count() && await zoomIn.isVisible().catch(() => false)) {
        await zoomIn.click().catch(() => {});
        await page.waitForTimeout(200);
        await screenshot(page, "real-product-viewer-zoom", viewport, false);
      }
      recordInteraction("product-modal-real", viewport, "passed", { opened, gallery, viewerVisible, viewerMetrics });
      await closeSurface(page);
    } else {
      issue("high", "product", "Clique na foto do produto não abriu viewer/zoom", { viewport, route: "/colecao", gallery });
      recordInteraction("product-modal-real", viewport, "failed", { opened, gallery, viewerVisible });
    }
    await closeSurface(page);
  } catch (error) {
    recordInteraction("product-modal-real", viewport, "failed", { error: String(error) });
    issue("high", "product", "Falha no fluxo real popup → galeria → zoom", { viewport, route: "/colecao", error: String(error) });
  }
}

async function auditWishlistAndCart(page, viewport) {
  try {
    await page.goto(`${BASE_URL}/colecao`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await waitStable(page, 1800);
    const card = page.locator(".esv-product-card").first();
    if (!(await card.count())) {
      recordInteraction("wishlist-cart-card-actions", viewport, "not-found");
      return;
    }

    const wishlist = card.getByRole("button", { name: /favorit/i }).first();
    if (await wishlist.count() && await wishlist.isVisible().catch(() => false)) {
      const before = await wishlist.getAttribute("aria-pressed");
      await wishlist.click().catch(() => {});
      await page.waitForTimeout(180);
      const after = await wishlist.getAttribute("aria-pressed");
      if (before === after) issue("medium", "usability", "Favorito não altera estado aria-pressed", { viewport, route: "/colecao", before, after });
    }

    const actionButtons = card.locator(".esv-card-action-slot button");
    if (await actionButtons.count()) {
      await actionButtons.first().click().catch(() => {});
      await page.waitForTimeout(300);
      const cartQuantity = await page.locator(".esv-cart-quantity").textContent().catch(() => null);
      await screenshot(page, "card-action-after-click", viewport, false);
      recordInteraction("wishlist-cart-card-actions", viewport, "passed", { cartQuantity });
    } else {
      recordInteraction("wishlist-cart-card-actions", viewport, "partial", { reason: "no-card-action-button" });
    }
  } catch (error) {
    recordInteraction("wishlist-cart-card-actions", viewport, "failed", { error: String(error) });
  }
}

async function auditCollection(page, viewport) {
  try {
    await page.goto(`${BASE_URL}/colecao`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await waitStable(page, 1800);
    const initialCount = await page.locator(".esv-product-card").count();
    await screenshot(page, "collection-initial", viewport, viewport !== "tablet");

    const search = page.locator(".esv-collection-v2-search input[type='search']").first();
    if (await search.count()) {
      await search.fill("esmeralda");
      await page.waitForTimeout(900);
      const searchedCount = await page.locator(".esv-product-card").count();
      const url = new URL(page.url());
      if (url.searchParams.get("q") !== "esmeralda") issue("medium", "collection", "Busca da coleção não sincronizou URL", { viewport, route: "/colecao", url: page.url() });
      await screenshot(page, "collection-search", viewport, false);
      await search.fill("");
      await page.waitForTimeout(750);
      recordInteraction("collection-search", viewport, "passed", { initialCount, searchedCount });
    } else {
      issue("high", "collection", "Campo de busca da coleção não encontrado", { viewport, route: "/colecao" });
    }

    const filterTrigger = page.locator(".esv-collection-v2-filter-trigger").first();
    if (await filterTrigger.count() && await filterTrigger.isVisible().catch(() => false)) {
      await filterTrigger.click();
      await page.waitForTimeout(180);
      await screenshot(page, "collection-filters-open", viewport, false);

      const categoryTrigger = page.getByRole("button", { name: /categoria/i }).first();
      if (await categoryTrigger.count() && await categoryTrigger.isVisible().catch(() => false)) {
        await categoryTrigger.click();
        const options = page.getByRole("option");
        const optionTexts = (await options.allTextContents()).map((x) => x.trim()).filter(Boolean);
        if (await options.count() > 1) {
          await options.nth(1).click();
          await page.waitForTimeout(850);
        } else {
          await closeSurface(page);
        }
        recordInteraction("collection-category-filter", viewport, "passed", { options: optionTexts });
      }

      if (!(await filterTrigger.isVisible().catch(() => false))) {
        // Filter selection may close the mobile drawer; reopen it.
        if (await page.locator(".esv-collection-v2-filter-trigger").count()) {
          await page.locator(".esv-collection-v2-filter-trigger").first().click().catch(() => {});
          await page.waitForTimeout(150);
        }
      }

      const materialButtons = page.locator(".esv-collection-v2-filters input[type='checkbox'], .esv-collection-v2-filters button").filter({ visible: true });
      const materialLabels = [];
      const materialCount = await materialButtons.count();
      for (let index = 0; index < Math.min(materialCount, 20); index++) {
        const el = materialButtons.nth(index);
        const text = ((await el.textContent()) || (await el.getAttribute("aria-label")) || "").trim();
        if (text) materialLabels.push(text);
      }
      recordInteraction("collection-material-filters", viewport, "inspected", { labels: [...new Set(materialLabels)] });

      const availabilityTrigger = page.getByRole("button", { name: /disponibilidade/i }).first();
      if (await availabilityTrigger.count() && await availabilityTrigger.isVisible().catch(() => false)) {
        await availabilityTrigger.click();
        const options = page.getByRole("option");
        const labels = (await options.allTextContents()).map((x) => x.trim()).filter(Boolean);
        for (let index = 0; index < await options.count(); index++) {
          // Verify every declared availability option can receive focus; select one representative.
          await options.nth(index).focus().catch(() => {});
        }
        if (await options.count() > 1) {
          await options.nth(1).click();
          await page.waitForTimeout(800);
        }
        recordInteraction("collection-availability-filter", viewport, "passed", { options: labels });
      }
      await screenshot(page, "collection-filter-applied", viewport, false);
    } else {
      issue("high", "collection", "Botão de filtros da coleção não encontrado", { viewport, route: "/colecao" });
    }

    // Sort: inspect and select every option sequentially, returning to editorial at the end.
    const sortTrigger = page.getByRole("button", { name: /ordenar/i }).first();
    if (await sortTrigger.count() && await sortTrigger.isVisible().catch(() => false)) {
      await sortTrigger.click();
      let options = page.getByRole("option");
      const labels = (await options.allTextContents()).map((x) => x.trim()).filter(Boolean);
      const valuesTested = [];
      for (let index = 0; index < labels.length; index++) {
        if (index > 0) {
          await sortTrigger.click().catch(() => {});
          await page.waitForTimeout(100);
          options = page.getByRole("option");
        }
        if (index < await options.count()) {
          const label = labels[index];
          await options.nth(index).click().catch(() => {});
          await page.waitForTimeout(650);
          valuesTested.push({ label, url: page.url(), count: await page.locator(".esv-product-card").count() });
        }
      }
      await screenshot(page, "collection-sort-final", viewport, false);
      recordInteraction("collection-sort-all-options", viewport, "passed", { options: labels, valuesTested });
    } else {
      issue("high", "collection", "Controle de ordenação não encontrado", { viewport, route: "/colecao" });
    }

    // Infinite scroll / sentinel.
    const beforeScroll = await page.locator(".esv-product-card").count();
    await page.evaluate(() => globalThis.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(1500);
    const afterScroll = await page.locator(".esv-product-card").count();
    recordInteraction("collection-infinite-scroll", viewport, "inspected", { beforeScroll, afterScroll });
  } catch (error) {
    recordInteraction("collection-complete", viewport, "failed", { error: String(error) });
    issue("high", "collection", "Falha no fluxo completo de filtros/ordenação", { viewport, route: "/colecao", error: String(error) });
  }
}

async function auditKeyboard(page, viewport) {
  try {
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await waitStable(page, 1200);
    const sequence = [];
    for (let i = 0; i < 24; i++) {
      await page.keyboard.press("Tab");
      const active = await page.evaluate(() => {
        const el = document.activeElement;
        if (!(el instanceof HTMLElement)) return null;
        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        return {
          tag: el.tagName,
          text: (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 80),
          visible: rect.width > 0 && rect.height > 0,
          outline: style.outlineStyle,
          outlineWidth: style.outlineWidth,
          boxShadow: style.boxShadow,
        };
      });
      if (active) sequence.push(active);
    }
    const invisibleFocus = sequence.filter((item) => !item.visible);
    if (invisibleFocus.length) issue("high", "accessibility", "Foco de teclado entra em controle invisível", { viewport, route: "/", controls: invisibleFocus });
    recordInteraction("keyboard-navigation", viewport, "passed", { sequence });
  } catch (error) {
    recordInteraction("keyboard-navigation", viewport, "failed", { error: String(error) });
  }
}

const browser = await chromium.launch({ headless: true });
try {
  let routes = ["/", "/colecao", "/sobre", "/contato", "/termos", "/politica-de-privacidade"];
  try {
    const fromSitemap = await sitemapRoutes();
    routes = [...new Set([...routes, ...fromSitemap])];
  } catch (error) {
    issue("high", "routing", "Não foi possível ler o sitemap", { error: String(error) });
  }
  report.coverage.sitemapCount = routes.length;
  await crawlSitemap(browser, routes);

  const byKind = new Map();
  for (const route of routes) {
    const kind = routeKind(route);
    const bucket = byKind.get(kind) || [];
    bucket.push(route);
    byKind.set(kind, bucket);
  }

  const deepRoutes = [...new Set([
    "/",
    "/colecao",
    "/sobre",
    "/contato",
    "/termos",
    "/politica-de-privacidade",
    ...(byKind.get("collection-detail") || []).slice(0, 2),
    ...(byKind.get("product-detail") || []).slice(0, 2),
    ...(byKind.get("cms-page") || []).slice(0, 2),
  ])];
  report.coverage.deepRoutes = deepRoutes;

  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      isMobile: viewport.isMobile,
      hasTouch: viewport.hasTouch,
      deviceScaleFactor: 1,
      locale: "pt-BR",
    });
    const page = await context.newPage();
    attachObservers(page, viewport.name);

    for (const route of deepRoutes) {
      await auditRoute(page, route, viewport.name, {
        fullPage: viewport.name !== "tablet" && ["/", "/colecao", "/sobre", "/contato"].includes(route),
        axe: viewport.name !== "tablet" || ["/", "/colecao"].includes(route),
      });
    }
    await auditRoute(page, "/__auditoria-rota-inexistente-404", viewport.name, { expected404: true, axe: false, fullPage: false });

    await auditHeaderAndOverlays(page, viewport.name);
    if (viewport.name !== "tablet") {
      await auditCollection(page, viewport.name);
      await auditProductJourney(page, viewport.name);
      await auditWishlistAndCart(page, viewport.name);
      await auditKeyboard(page, viewport.name);
    }

    await context.close();
  }
} finally {
  await browser.close();
}

// Promote repeated browser/network failures into issues after collection, filtering harmless aborts.
const relevantConsole = report.console.filter((entry) => !/ResizeObserver loop|favicon|AbortError/i.test(entry.text || ""));
if (relevantConsole.length) {
  issue("high", "runtime", "Erros/warnings relevantes no console", { count: relevantConsole.length, samples: relevantConsole.slice(0, 20) });
}
const relevantNetwork = report.network.filter((entry) => !/google|gstatic|fonts\.googleapis/i.test(entry.url || ""));
if (relevantNetwork.length) {
  issue("high", "network", "Falhas HTTP/rede durante navegação", { count: relevantNetwork.length, samples: relevantNetwork.slice(0, 20) });
}

report.meta.finishedAt = new Date().toISOString();
report.issues.sort((a, b) => (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0));
report.summary = {
  sitemapRoutes: report.sitemap.length,
  deepAudits: report.routeAudits.length,
  interactions: report.interactions.length,
  screenshots: report.screenshots.length,
  consoleEvents: relevantConsole.length,
  networkEvents: relevantNetwork.length,
  issues: {
    critical: report.issues.filter((item) => item.severity === "critical").length,
    high: report.issues.filter((item) => item.severity === "high").length,
    medium: report.issues.filter((item) => item.severity === "medium").length,
    low: report.issues.filter((item) => item.severity === "low").length,
  },
};

const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
const issueRows = report.issues.map((item) => `<tr><td class="sev ${esc(item.severity)}">${esc(item.severity)}</td><td>${esc(item.category)}</td><td>${esc(item.title)}</td><td>${esc(item.route || "")}</td><td>${esc(item.viewport || "")}</td></tr>`).join("\n");
const routeRows = report.routeAudits.map((item) => `<tr><td>${esc(item.viewport)}</td><td>${esc(item.route)}</td><td>${esc(item.status)}</td><td>${esc(item.metrics?.title || "")}</td><td>${esc(item.metrics?.overflowX ?? "")}</td><td>${esc(item.axeViolations?.length ?? 0)}</td></tr>`).join("\n");
const interactionRows = report.interactions.map((item) => `<tr><td>${esc(item.viewport)}</td><td>${esc(item.name)}</td><td>${esc(item.status)}</td></tr>`).join("\n");
const gallery = report.screenshots.map((shot) => `<figure><a href="${esc(shot.file)}"><img src="${esc(shot.file)}" loading="lazy"></a><figcaption>${esc(shot.viewport)} — ${esc(shot.label)}</figcaption></figure>`).join("\n");
const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Auditoria E2E Esméra</title><style>body{font-family:Inter,Arial,sans-serif;margin:0;background:#f3f0e8;color:#262724}main{max-width:1440px;margin:auto;padding:36px}h1{font-weight:400}.cards{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin:24px 0}.card{border:1px solid #d7d1c5;padding:14px}.gallery{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.gallery img{width:100%;height:260px;object-fit:cover;border:1px solid #d7d1c5}.gallery figcaption{font-size:12px;margin-top:6px}table{width:100%;border-collapse:collapse;margin:18px 0 36px;font-size:13px}th,td{border-bottom:1px solid #d7d1c5;text-align:left;padding:8px;vertical-align:top}.sev{font-weight:600}.critical{color:#8b0000}.high{color:#b33a00}.medium{color:#806000}.low{color:#555}@media(max-width:900px){.cards,.gallery{grid-template-columns:1fr 1fr}}@media(max-width:520px){main{padding:18px}.cards,.gallery{grid-template-columns:1fr}}</style></head><body><main><h1>Auditoria E2E completa — Esméra</h1><p>Commit: <code>${esc(commit)}</code></p><div class="cards"><div class="card"><b>${report.summary.sitemapRoutes}</b><br>rotas sitemap</div><div class="card"><b>${report.summary.deepAudits}</b><br>auditorias profundas</div><div class="card"><b>${report.summary.interactions}</b><br>interações</div><div class="card"><b>${report.summary.screenshots}</b><br>screenshots</div><div class="card"><b>${report.summary.issues.critical}/${report.summary.issues.high}/${report.summary.issues.medium}/${report.summary.issues.low}</b><br>C/H/M/L</div></div><h2>Achados</h2><table><thead><tr><th>Sev.</th><th>Categoria</th><th>Achado</th><th>Rota</th><th>Viewport</th></tr></thead><tbody>${issueRows}</tbody></table><h2>Rotas profundas</h2><table><thead><tr><th>Viewport</th><th>Rota</th><th>HTTP</th><th>Title</th><th>Overflow px</th><th>axe</th></tr></thead><tbody>${routeRows}</tbody></table><h2>Interações</h2><table><thead><tr><th>Viewport</th><th>Fluxo</th><th>Status</th></tr></thead><tbody>${interactionRows}</tbody></table><h2>Evidências visuais</h2><div class="gallery">${gallery}</div></main></body></html>`;

await writeFile(`${ARTIFACT_DIR}/audit.json`, `${JSON.stringify(report, null, 2)}\n`);
await writeFile(`${ARTIFACT_DIR}/report.html`, html);
await writeFile(`${ARTIFACT_DIR}/README.txt`, `Full frontend audit\nCommit: ${commit}\nRoutes: ${report.summary.sitemapRoutes}\nDeep audits: ${report.summary.deepAudits}\nInteractions: ${report.summary.interactions}\nScreenshots: ${report.summary.screenshots}\nIssues C/H/M/L: ${report.summary.issues.critical}/${report.summary.issues.high}/${report.summary.issues.medium}/${report.summary.issues.low}\n`);
console.log(JSON.stringify(report.summary, null, 2));