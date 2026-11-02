// Walks the whole talk in a headless browser and writes screenshots + a report to ./verify.
// Run after `npm run build`:  npm run verify            (serves ./out itself, like the deck host)
//                             VERIFY_URL=http://localhost:3000 npm run verify   (an already running app)
// Flags: --effects also walks /effects;  --keep keeps old screenshots.
// It checks what a rehearsal would catch: console errors, every scene and beat forwards and back,
// every tour step (spotlight found, survives a reload), reduced motion, phone width, media served locally.
// It cannot judge whether an animation *means* the right thing: look at the screenshots.

import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright-core";
import { serve } from "./serve.mjs";

const args = new Set(process.argv.slice(2));
const OUT = "verify";
const PORT = 3999;
const base = process.env.VERIFY_URL ?? `http://localhost:${PORT}`;
const failures = [];
const warnings = [];
const fail = (what) => { failures.push(what); console.log(`  ✗ ${what}`); };
const warn = (what) => { warnings.push(what); console.log(`  ! ${what}`); };
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const slug = (route) => route.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "home";

// --- browser -------------------------------------------------------------------------------

// Newest Playwright Chromium already on this machine, if any.
const cachedChromium = () => {
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH ?? (process.platform === "darwin" ? join(homedir(), "Library/Caches/ms-playwright") : join(homedir(), ".cache/ms-playwright"));
  if (!existsSync(root)) return undefined;
  const dirs = readdirSync(root).filter((name) => name.startsWith("chromium")).sort((a, b) => Number(b.split("-").pop()) - Number(a.split("-").pop()));
  for (const dir of dirs) {
    for (const sub of readdirSync(join(root, dir))) {
      for (const exe of ["chrome-headless-shell", "chrome", "Chromium.app/Contents/MacOS/Chromium", "Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"]) {
        const path = join(root, dir, sub, exe);
        if (existsSync(path)) return path;
      }
    }
  }
  return undefined;
};

const launch = async () => {
  const attempts = [
    process.env.CHROME_PATH && { executablePath: process.env.CHROME_PATH },
    {},
    cachedChromium() && { executablePath: cachedChromium() },
    { channel: "chrome" },
  ].filter(Boolean);
  for (const options of attempts) {
    try { return await chromium.launch(options); } catch { /* try the next one */ }
  }
  console.error("No Chromium found. Run `npx playwright install chromium`, or set CHROME_PATH to a Chrome/Chromium binary.");
  process.exit(2);
};

// --- server --------------------------------------------------------------------------------

let server;
const startServer = async () => {
  if (process.env.VERIFY_URL) return;
  server = await serve(PORT);
};

// --- helpers -------------------------------------------------------------------------------

const browser = await (async () => { await startServer(); return launch(); })();
if (!args.has("--keep")) rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const open = async (options = {}) => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, ...options });
  page.on("console", (message) => { if (message.type() === "error") fail(`console error on ${new URL(page.url()).pathname}: ${message.text()}`); });
  page.on("pageerror", (error) => fail(`page error on ${new URL(page.url()).pathname}: ${error.message}`));
  page.on("requestfailed", (request) => { if (!request.url().includes("/_next/") && !request.failure()?.errorText.includes("ERR_ABORTED")) fail(`request failed: ${request.url()}`); });
  return page;
};
const shot = (page, name) => page.screenshot({ path: join(OUT, `${name}.png`) });
const pathname = (page) => new URL(page.url()).pathname;
const activeScene = (page) => page.evaluate(() => [...document.querySelectorAll(".deck__dots button")].findIndex((dot) => dot.hasAttribute("data-active")));
const sceneCount = (page) => page.locator(".deck__dots button").count();
const isDeck = (page) => page.locator(".deck").count().then((n) => n > 0);

// Every internal route reachable from the start page and the product navigation.
const discover = async (page) => {
  const seen = new Set(["/"]);
  const queue = ["/"];
  while (queue.length && seen.size < 40) {
    const route = queue.shift();
    await page.goto(base + route);
    await sleep(700);
    const links = await page.evaluate(() => [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")));
    for (const href of links) {
      if (!href?.startsWith("/") || href.startsWith("//")) continue;
      const clean = href.split(/[?#]/)[0];
      if (!seen.has(clean)) { seen.add(clean); queue.push(clean); }
    }
  }
  return [...seen];
};

// Media must be served from public/, so the talk works offline.
const checkMedia = async (page) => {
  const external = await page.evaluate(() => [...document.querySelectorAll("img[src], video[src], source[src], audio[src]")]
    .map((el) => el.src).filter((src) => src && !src.startsWith(location.origin) && !src.startsWith("data:") && !src.startsWith("blob:")));
  for (const src of external) fail(`external media on ${pathname(page)} (put it in public/): ${src}`);
};

// --- 1. routes -----------------------------------------------------------------------------

console.log(`Verifying ${base}`);
const page = await open();
const routes = await discover(page);
console.log(`Routes: ${routes.join(", ")}`);
const decks = [];
for (const route of routes) {
  await page.goto(base + route);
  await sleep(900);
  await checkMedia(page);
  if (await isDeck(page)) decks.push(route);
  else await shot(page, `route-${slug(route)}`);
}
const talkDecks = decks.filter((route) => args.has("--effects") || route !== "/effects");

// --- 2. decks forwards, then backwards from ?scene=last ------------------------------------

const walkDeck = async (route) => {
  console.log(`Deck ${route}`);
  await page.goto(base + route);
  await sleep(1500);
  const total = await sceneCount(page);
  let presses = 0;
  let scene = 0;
  let beat = 0;
  await shot(page, `deck-${slug(route)}-s${String(scene).padStart(2, "0")}-b0`);
  while (presses < total * 8) {
    await page.keyboard.press("ArrowRight");
    presses += 1;
    await sleep(450);
    if (pathname(page) !== route || !(await isDeck(page))) break;
    const now = await activeScene(page);
    beat = now === scene ? beat + 1 : 0;
    scene = now;
    const name = `deck-${slug(route)}-s${String(scene).padStart(2, "0")}-b${beat}`;
    await shot(page, `${name}-mid`); // mid-animation: effects must already be moving
    await sleep(1400);
    await shot(page, name);
  }
  if (scene < total - 1) fail(`${route}: stopped on scene ${scene + 1} of ${total}`);
  console.log(`  ${total} scenes, ${presses} clicks, finished → ${pathname(page)}`);

  await page.goto(`${base}${route}?scene=last`);
  await sleep(1200);
  if ((await activeScene(page)) !== total - 1) fail(`${route}?scene=last did not open the last scene`);
  for (let i = 0; i < total * 8 && (await activeScene(page)) > 0; i += 1) {
    await page.keyboard.press("ArrowLeft");
    await sleep(250);
    if (pathname(page) !== route) { fail(`${route}: ← left the deck before scene 1`); break; }
  }
};
for (const route of talkDecks) await walkDeck(route);

// --- 3. tour: start it the way the talk does (end of the first deck) -----------------------

if (talkDecks.length) {
  const first = talkDecks[0];
  await page.goto(`${base}${first}?scene=last`);
  await sleep(1200);
  for (let i = 0; i < 12 && pathname(page) === first; i += 1) { await page.keyboard.press("ArrowRight"); await sleep(500); }
  await sleep(1200);
  if (!(await page.locator(".guide").count())) warn("no tour panel after the first deck (fine if this talk has no live tour)");
  for (let step = 1; step <= 40 && (await page.locator(".guide").count()); step += 1) {
    await sleep(1000);
    if (!routes.includes(pathname(page))) routes.push(pathname(page));
    const target = await page.locator(".guide").getAttribute("data-target");
    const spotlight = async () => (await page.locator(".spotlight").count()) > 0;
    if (target && !(await spotlight())) fail(`tour step ${step}: no element with data-demo="${target}" on ${pathname(page)}`);
    await shot(page, `tour-${String(step).padStart(2, "0")}`);
    // Every step must survive a reload (a question, a crash, a "back" from the next deck).
    await page.reload();
    await sleep(1500);
    if (!(await page.locator(".guide").count())) fail(`tour step ${step}: the panel is gone after a reload`);
    else if (target && !(await spotlight())) fail(`tour step ${step}: spotlight lost after a reload`);
    const button = page.locator(".guide__button--primary");
    if (!(await button.count())) break;
    await button.click();
    await sleep(600);
  }
  console.log(`Tour finished → ${pathname(page)}`);
  // Decks only reachable from the tour (e.g. the part after the demo).
  const after = pathname(page);
  if (await isDeck(page) && !decks.includes(after)) {
    decks.push(after);
    talkDecks.push(after);
    if (!routes.includes(after)) routes.push(after);
    await walkDeck(after);
  }
}

// --- 4. reduced motion: content still there ------------------------------------------------

const calm = await open({ reducedMotion: "reduce" });
for (const route of talkDecks) {
  await calm.goto(base + route);
  await sleep(800);
  const hidden = await calm.evaluate(() => [...document.querySelectorAll(".deck__scene h1, .deck__scene h2")]
    .filter((el) => el.offsetParent !== null && Number(getComputedStyle(el).opacity) < 0.5).length);
  if (hidden) fail(`${route}: ${hidden} heading(s) stay invisible with reduced motion`);
  await shot(calm, `reduced-${slug(route)}`);
}

// --- 5. phone width ------------------------------------------------------------------------

const phone = await open({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
const overflow = () => phone.evaluate(() => document.documentElement.scrollWidth - innerWidth);
for (const route of routes.filter((r) => !decks.includes(r))) {
  await phone.goto(base + route);
  await sleep(900);
  if ((await overflow()) > 2) fail(`${route}: horizontal scroll at 375 px`);
  await shot(phone, `phone-${slug(route)}`);
}
for (const route of talkDecks) {
  await phone.goto(base + route);
  await sleep(1200);
  const total = await sceneCount(phone);
  for (let i = 0; i < total; i += 1) {
    if (i) { await phone.locator(".deck__dots button").nth(i).click(); await sleep(1600); }
    const measure = () => phone.evaluate(() => Math.max(0, ...[...document.querySelectorAll(".deck__scene *")]
      .filter((el) => el.offsetParent !== null && !el.closest("canvas") && Number(getComputedStyle(el).opacity) > 0)
      .map((el) => {
        // Only what is actually visible: an ancestor inside the scene with overflow other than visible
        // clips it. The deck itself clips at the screen edge, so the walk stops at the scene.
        let right = el.getBoundingClientRect().right;
        for (let up = el.parentElement; up && !up.matches(".deck__scene, .deck") && right > innerWidth; up = up.parentElement) {
          if (getComputedStyle(up).overflowX !== "visible") right = Math.min(right, up.getBoundingClientRect().right);
        }
        return Math.round(right - innerWidth);
      })));
    // The previous scene may still be leaving: measure again before warning.
    let sticking = await measure();
    if (sticking > 8) { await sleep(1500); sticking = await measure(); }
    if (sticking > 8) warn(`${route} scene ${i + 1}: content sticks out ${sticking} px at 375 px (check the screenshot; flying particles are fine)`);
    await shot(phone, `phone-${slug(route)}-s${String(i).padStart(2, "0")}`);
  }
}

// --- report --------------------------------------------------------------------------------

await browser.close();
server?.close();
writeFileSync(join(OUT, "report.json"), JSON.stringify({ base, routes, decks: talkDecks, failures, warnings }, null, 2));
console.log(`\n${failures.length} failure(s), ${warnings.length} warning(s). Screenshots: ./${OUT}`);
console.log("Now look at the -mid screenshots: an effect that is not moving there is not working.");
process.exit(failures.length ? 1 : 0);
