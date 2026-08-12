import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:8000";
const ARTIFACT_DIR = "home-hygiene-artifacts";

await mkdir(ARTIFACT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();

const metrics = {
  baseUrl: BASE_URL,
  status: "started",
  top: null,
  transition: null,
};

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".esv-hero");
  // Let the intentional one-shot hero entrance finish before measuring scroll.
  await page.waitForTimeout(1200);

  const top = await page.evaluate(() => {
    const hero = document.querySelector(".esv-hero");
    const picture = document.querySelector(".esv-hero-picture");
    return {
      mainContentCount: document.querySelectorAll("#main-content").length,
      sceneHookCount: document.querySelectorAll("[data-motion-scene]").length,
      heroPictureTransform: picture
        ? getComputedStyle(picture).transform
        : null,
      heroImageTransform: document.querySelector(".esv-hero-picture img")
        ? getComputedStyle(document.querySelector(".esv-hero-picture img")).transform
        : null,
      heroHeight: hero?.getBoundingClientRect().height ?? 0,
    };
  });
  metrics.top = top;

  invariant(top.mainContentCount === 1, `Expected one #main-content, got ${top.mainContentCount}`);
  invariant(top.sceneHookCount === 0, `Expected zero data-motion-scene hooks, got ${top.sceneHookCount}`);
  invariant(top.heroPictureTransform === "none", `Hero picture starts transformed: ${top.heroPictureTransform}`);
  invariant(top.heroHeight > 0, "Hero has no measurable height");

  await page.screenshot({
    path: `${ARTIFACT_DIR}/home-top.png`,
    fullPage: false,
  });

  await page.evaluate((heroHeight) => {
    globalThis.scrollTo({
      top: Math.max(1, heroHeight * 0.88),
      left: 0,
      behavior: "instant",
    });
  }, top.heroHeight);
  await page.waitForTimeout(180);

  const transition = await page.evaluate(() => {
    const picture = document.querySelector(".esv-hero-picture");
    const maisonMain = document.querySelector(".esv-maison-main");
    const maisonSecondary = document.querySelector(".esv-maison-secondary");
    return {
      scrollY: globalThis.scrollY,
      heroPictureTransform: picture
        ? getComputedStyle(picture).transform
        : null,
      maisonMainTransform: maisonMain
        ? getComputedStyle(maisonMain).transform
        : null,
      maisonSecondaryTransform: maisonSecondary
        ? getComputedStyle(maisonSecondary).transform
        : null,
      sceneHookCount: document.querySelectorAll("[data-motion-scene]").length,
    };
  });
  metrics.transition = transition;

  invariant(transition.scrollY > 0, "Home did not scroll into the Hero → Maison transition");
  invariant(
    transition.heroPictureTransform === top.heroPictureTransform,
    `Hero picture changed transform on scroll: ${top.heroPictureTransform} -> ${transition.heroPictureTransform}`,
  );
  invariant(
    transition.maisonMainTransform === "none",
    `Maison primary media still drifts on scroll: ${transition.maisonMainTransform}`,
  );
  invariant(
    transition.maisonSecondaryTransform === null || transition.maisonSecondaryTransform === "none",
    `Maison secondary media still drifts on scroll: ${transition.maisonSecondaryTransform}`,
  );
  invariant(transition.sceneHookCount === 0, "Legacy scene hooks reappeared after scroll");

  await page.screenshot({
    path: `${ARTIFACT_DIR}/hero-to-maison-transition.png`,
    fullPage: false,
  });

  metrics.status = "passed";
} catch (error) {
  metrics.status = "failed";
  metrics.error = error instanceof Error ? error.stack || error.message : String(error);
  throw error;
} finally {
  await writeFile(
    `${ARTIFACT_DIR}/metrics.json`,
    `${JSON.stringify(metrics, null, 2)}\n`,
  );
  await context.close();
  await browser.close();
}
