import { constants } from "node:fs";
import { access, appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

// Playwright is installed by browser.sh under /tmp, not as an app dependency.
// createRequire resolves it from that prefix. A static import would miss it.
const playwrightPackage = process.env.MARKSPORTFOLIO_PLAYWRIGHT_PACKAGE;
if (!playwrightPackage) {
  throw new Error("MARKSPORTFOLIO_PLAYWRIGHT_PACKAGE is not set. Run scripts/verify-marksportfolio/browser.sh.");
}
const { chromium } = createRequire(playwrightPackage)("playwright");

const baseUrl = process.env.MARKSPORTFOLIO_VERIFY_URL;
const evidenceDir = process.env.MARKSPORTFOLIO_VERIFY_EVIDENCE;
const statePath = process.env.MARKSPORTFOLIO_VERIFY_BROWSER_STATE;
const feature = process.env.MARKSPORTFOLIO_VERIFY_FEATURE || "session";
const transcriptPath = path.join(evidenceDir, `${feature}.txt`);

const CHROME_ARGS = ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"];
const CHROME_CANDIDATES = [
  process.env.MARKSPORTFOLIO_VERIFY_CHROME,
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/local/bin/google-chrome",
].filter(Boolean);

const BLOCKED_CLICKS = new Set([
  "send verification code",
  "redeploy resume",
  "sign out",
]);

function fail(message) {
  const line = `result=fail ${message}`;
  console.error(`[browser] ${line}`);
  return appendTranscript(line).finally(() => {
    process.exitCode = 1;
  });
}

function norm(value) {
  return value.replace(/\s+/g, " ").trim();
}

async function appendTranscript(line) {
  await mkdir(evidenceDir, { recursive: true });
  await appendFile(transcriptPath, `${line}\n`, "utf8");
}

function parseArgs(argv) {
  const command = argv[0];
  const positional = [];
  const flags = {};
  for (let index = 1; index < argv.length; index += 1) {
    const token = argv[index];
    if (token.startsWith("--")) {
      const key = token.slice(2);
      const next = argv[index + 1];
      if (next === undefined || next.startsWith("--")) {
        flags[key] = true;
      } else {
        flags[key] = next;
        index += 1;
      }
    } else {
      positional.push(token);
    }
  }
  return { command, positional, flags };
}

function flagText(flags, key) {
  const value = flags[key];
  return typeof value === "string" ? value : "";
}

function exactFlag(flags) {
  return flags.exact === true;
}

function nthFlag(flags) {
  const raw = flags.nth;
  if (raw === undefined) {
    return 0;
  }
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`--nth must be a non-negative integer, got ${raw}`);
  }
  return value;
}

async function readState() {
  try {
    const raw = await readFile(statePath, "utf8");
    const parsed = JSON.parse(raw);
    return {
      url: typeof parsed.url === "string" ? parsed.url : "",
      cardTitle: typeof parsed.cardTitle === "string" ? parsed.cardTitle : "",
      visitHref: typeof parsed.visitHref === "string" ? parsed.visitHref : "",
      githubHref: typeof parsed.githubHref === "string" ? parsed.githubHref : "",
    };
  } catch {
    return { url: "", cardTitle: "", visitHref: "", githubHref: "" };
  }
}

async function writeState(state) {
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

function assertLocal(url) {
  if (!url.startsWith(`${baseUrl}/`) && url !== baseUrl && !url.startsWith(`${baseUrl}#`) && !url.startsWith(`${baseUrl}?`)) {
    throw new Error(`Refusing to leave the local verification server for ${url}`);
  }
}

function assertOpenPath(openPath) {
  if (!openPath.startsWith("/") || openPath.startsWith("//") || openPath.startsWith("/api/") || openPath === "/api") {
    throw new Error(`Refusing path ${openPath}. Open a public page path such as /, /projects/..., /login, or /admin.`);
  }
}

async function launchBrowser() {
  let sawExecutable = false;
  let lastError = null;
  for (const executablePath of CHROME_CANDIDATES) {
    try {
      await access(executablePath, constants.X_OK);
    } catch {
      continue;
    }
    sawExecutable = true;
    try {
      return await chromium.launch({
        executablePath,
        headless: true,
        args: CHROME_ARGS,
      });
    } catch (error) {
      lastError = error;
    }
  }
  if (!sawExecutable) {
    const error = new Error("NEED_CHROMIUM");
    error.exitCode = 80;
    throw error;
  }
  throw lastError instanceof Error ? lastError : new Error("Chrome failed to launch");
}

function scopeFor(page, flags) {
  const heading = flagText(flags, "within-heading");
  if (!heading) {
    return page;
  }
  return page
    .getByRole("heading", { name: heading, exact: true })
    .locator("xpath=ancestor::section[1]");
}

function roleLocator(scope, flags) {
  const role = flagText(flags, "role");
  const name = flagText(flags, "name");
  if (!role || !name) {
    throw new Error("This command needs --role and --name");
  }
  return scope.getByRole(role, { name, exact: exactFlag(flags) }).nth(nthFlag(flags));
}

async function optionalHref(locator) {
  if ((await locator.count()) < 1) {
    return "";
  }
  return (await locator.first().getAttribute("href")) || "";
}

async function headingList(page) {
  const texts = await page.getByRole("heading").allInnerTexts();
  return texts.map(norm).filter(Boolean).join(" | ");
}

async function restore(page, state) {
  if (!state.url) {
    throw new Error("No page is open. Run browser.sh open <path> first.");
  }
  assertLocal(state.url);
  await page.goto(state.url, { waitUntil: "domcontentloaded", timeout: 30000 });
}

async function recordCard(target, state) {
  const article = target.locator("xpath=ancestor::article[1]");
  state.cardTitle = norm(await article.getByRole("heading").first().innerText());
  state.visitHref = await optionalHref(article.getByRole("link", { name: "Visit" }));
  state.githubHref = await optionalHref(
    article.getByRole("link", { name: "View Source Code on GitHub", exact: true }),
  );
}

function refuseClick(name, href) {
  if (BLOCKED_CLICKS.has(name.toLowerCase())) {
    throw new Error(`Refusing to activate "${name}". This harness does not send email, sign in, or deploy.`);
  }
  if (!href) {
    return;
  }
  if (/^(mailto:|tel:|javascript:)/i.test(href)) {
    throw new Error(`Refusing to follow ${href}. Read it with expect-link.`);
  }
  if (/^https?:\/\//i.test(href) && !href.startsWith(baseUrl)) {
    throw new Error(`Refusing to follow external href ${href}. Read it with expect-link.`);
  }
  if (href.startsWith("//")) {
    throw new Error(`Refusing protocol-relative href ${href}.`);
  }
}

function evidenceFile(name) {
  if (!name || name.includes("/") || name.includes("\\") || name === "." || name === "..") {
    throw new Error(`Evidence file must be a bare filename, got ${name}`);
  }
  return path.join(evidenceDir, name);
}

async function run(page, state, command, positional, flags) {
  if (command === "open") {
    const openPath = positional[0];
    if (!openPath) {
      throw new Error("open requires a path");
    }
    assertOpenPath(openPath);
    const target = new URL(openPath, `${baseUrl}/`).href;
    assertLocal(target);
    const response = await page.goto(target, { waitUntil: "domcontentloaded", timeout: 30000 });
    assertLocal(page.url());
    state.url = page.url();
    state.cardTitle = "";
    state.visitHref = "";
    state.githubHref = "";
    const status = response ? response.status() : 0;
    await appendTranscript(
      `action=open path=${openPath} url=${page.url()} http=${status} headings=${await headingList(page)}`,
    );
    console.log(`[browser] open ${page.url()} http=${status}`);
    return;
  }

  await restore(page, state);

  if (command === "expect-heading") {
    const text = positional.join(" ");
    await page.getByRole("heading", { name: text, exact: true }).first().waitFor({
      state: "visible",
      timeout: 15000,
    });
    await appendTranscript(`action=expect-heading name=${text} url=${page.url()}`);
    console.log(`[browser] heading ${text}`);
    return;
  }

  if (command === "expect-text") {
    const text = positional.join(" ");
    const body = await page.locator("body").innerText();
    if (!body.includes(text)) {
      throw new Error(`Visible text missing ${JSON.stringify(text)} at ${page.url()}`);
    }
    await appendTranscript(`action=expect-text text=${JSON.stringify(text)} url=${page.url()}`);
    console.log(`[browser] text ${text}`);
    return;
  }

  if (command === "expect-role") {
    const locator = roleLocator(scopeFor(page, flags), flags);
    await locator.waitFor({ state: "visible", timeout: 15000 });
    await appendTranscript(
      `action=expect-role role=${flagText(flags, "role")} name=${flagText(flags, "name")} url=${page.url()}`,
    );
    console.log(`[browser] role ${flagText(flags, "role")} ${flagText(flags, "name")}`);
    return;
  }

  if (command === "expect-link") {
    const name = flagText(flags, "name");
    if (!name) {
      throw new Error("expect-link needs --name");
    }
    const link = scopeFor(page, flags)
      .getByRole("link", { name, exact: exactFlag(flags) })
      .nth(nthFlag(flags));
    await link.waitFor({ state: "visible", timeout: 15000 });
    const href = (await link.getAttribute("href")) || "";
    const expected = flagText(flags, "href");
    const prefix = flagText(flags, "href-prefix");
    if (expected && href !== expected) {
      throw new Error(`Link ${JSON.stringify(name)} href was ${href}, expected ${expected}`);
    }
    if (prefix && !href.startsWith(prefix)) {
      throw new Error(`Link ${JSON.stringify(name)} href was ${href}, expected prefix ${prefix}`);
    }
    await appendTranscript(`action=expect-link name=${JSON.stringify(name)} href=${href} url=${page.url()}`);
    console.log(`[browser] link ${name} -> ${href}`);
    return;
  }

  if (command === "expect-disabled") {
    const locator = roleLocator(page, flags);
    await locator.waitFor({ state: "visible", timeout: 15000 });
    if (!(await locator.isDisabled())) {
      throw new Error(`${flagText(flags, "role")} ${JSON.stringify(flagText(flags, "name"))} was enabled`);
    }
    await appendTranscript(
      `action=expect-disabled role=${flagText(flags, "role")} name=${flagText(flags, "name")} url=${page.url()}`,
    );
    console.log(`[browser] disabled ${flagText(flags, "name")}`);
    return;
  }

  if (command === "expect-absent") {
    const text = positional.join(" ");
    const body = await page.locator("body").innerText();
    if (body.includes(text)) {
      throw new Error(`Found forbidden text ${JSON.stringify(text)} at ${page.url()}`);
    }
    await appendTranscript(`action=expect-absent text=${JSON.stringify(text)} url=${page.url()}`);
    console.log(`[browser] absent ${text}`);
    return;
  }

  if (command === "expect-url-prefix") {
    const prefix = positional[0];
    const pathname = new URL(page.url()).pathname;
    if (!pathname.startsWith(prefix)) {
      throw new Error(`Path ${pathname} does not start with ${prefix}`);
    }
    await appendTranscript(`action=expect-url-prefix prefix=${prefix} url=${page.url()}`);
    console.log(`[browser] path ${pathname}`);
    return;
  }

  if (command === "expect-url-contains") {
    const fragment = positional.join(" ");
    if (!page.url().includes(fragment)) {
      throw new Error(`URL ${page.url()} does not contain ${fragment}`);
    }
    await appendTranscript(`action=expect-url-contains fragment=${fragment} url=${page.url()}`);
    console.log(`[browser] url contains ${fragment}`);
    return;
  }

  if (command === "click") {
    const name = flagText(flags, "name");
    const target = roleLocator(scopeFor(page, flags), flags);
    await target.waitFor({ state: "visible", timeout: 15000 });
    const href = (await target.getAttribute("href")) || "";
    refuseClick(name, href);
    if (flags["record-card"] === true) {
      await recordCard(target, state);
    }
    const previous = page.url();
    await Promise.all([
      page.waitForURL((url) => url.href !== previous, { timeout: 15000 }),
      (async () => {
        await target.evaluate((element) => {
          element.scrollIntoView({ block: "center", inline: "center" });
        });
        await target.click();
      })(),
    ]);
    await page.waitForLoadState("domcontentloaded");
    assertLocal(page.url());
    state.url = page.url();
    await appendTranscript(
      `action=click role=${flagText(flags, "role")} name=${JSON.stringify(name)} from=${previous} url=${page.url()} card=${JSON.stringify(state.cardTitle)} visit=${state.visitHref} github=${state.githubHref}`,
    );
    console.log(`[browser] click ${name} -> ${page.url()}`);
    return;
  }

  if (command === "expect-recorded-heading") {
    if (!state.cardTitle) {
      throw new Error("No card title was recorded. Click with --record-card first.");
    }
    const heading = norm(await page.getByRole("heading", { level: 1 }).innerText());
    if (heading !== state.cardTitle) {
      throw new Error(`h1 was ${JSON.stringify(heading)}, card title was ${JSON.stringify(state.cardTitle)}`);
    }
    await appendTranscript(`action=expect-recorded-heading heading=${JSON.stringify(heading)} url=${page.url()}`);
    console.log(`[browser] h1 ${heading}`);
    return;
  }

  if (command === "expect-recorded-links") {
    if (state.visitHref) {
      const href =
        (await page.getByRole("link", { name: "Visit Site" }).first().getAttribute("href")) || "";
      if (href !== state.visitHref) {
        throw new Error(`Visit Site href was ${href}, card Visit href was ${state.visitHref}`);
      }
    }
    if (state.githubHref) {
      const href =
        (await page
          .getByRole("link", { name: "View Source Code on GitHub", exact: true })
          .first()
          .getAttribute("href")) || "";
      if (href !== state.githubHref) {
        throw new Error(`Source href was ${href}, card source href was ${state.githubHref}`);
      }
    }
    await appendTranscript(
      `action=expect-recorded-links visit=${state.visitHref || "absent"} github=${state.githubHref || "absent"} url=${page.url()}`,
    );
    console.log(`[browser] recorded links visit=${state.visitHref || "absent"} github=${state.githubHref || "absent"}`);
    return;
  }

  if (command === "expect-project-preview") {
    const main = page.locator("main");
    const iframe = main.locator("iframe");
    const image = main.locator("img");
    const iframeCount = await iframe.count();
    const imageCount = await image.count();
    const text = await main.innerText();
    const placeholder = text.includes("No preview available") || text.includes("No image available");
    if (state.visitHref) {
      if (iframeCount < 1) {
        throw new Error(`Coding project ${state.cardTitle} has a Visit link but no demo iframe`);
      }
      const title = (await iframe.first().getAttribute("title")) || "";
      if (!title.includes(state.cardTitle) || !title.includes("Interactive Demo")) {
        throw new Error(`Demo iframe title was ${JSON.stringify(title)}`);
      }
    } else if (imageCount < 1 && !placeholder) {
      throw new Error(`Project ${state.cardTitle} has no image and no preview placeholder`);
    }
    if (!state.visitHref && imageCount > 0) {
      await image.first().scrollIntoViewIfNeeded();
      const loaded = await image.first().evaluate(
        (element) =>
          new Promise((resolve) => {
            if (element.complete && element.naturalWidth > 0) {
              resolve(true);
              return;
            }
            const finish = (ok) => resolve(ok);
            element.addEventListener("load", () => finish(element.naturalWidth > 0), { once: true });
            element.addEventListener("error", () => finish(false), { once: true });
            setTimeout(() => finish(element.complete && element.naturalWidth > 0), 10000);
          }),
      );
      if (!loaded) {
        throw new Error(`Project image for ${state.cardTitle} did not load`);
      }
    }
    await appendTranscript(
      `action=expect-project-preview card=${JSON.stringify(state.cardTitle)} iframes=${iframeCount} images=${imageCount} placeholder=${placeholder} url=${page.url()}`,
    );
    console.log(`[browser] preview iframes=${iframeCount} images=${imageCount}`);
    return;
  }

  if (command === "screenshot") {
    const file = evidenceFile(positional[0]);
    const selector = flagText(flags, "selector");
    if (selector) {
      await page.locator(selector).first().screenshot({ path: file });
    } else {
      await page.screenshot({ path: file });
    }
    await appendTranscript(`action=screenshot file=${path.basename(file)} selector=${selector || "viewport"} url=${page.url()}`);
    console.log(`[browser] screenshot ${file}`);
    return;
  }

  if (command === "snapshot") {
    const file = evidenceFile(positional[0]);
    const selector = flagText(flags, "selector");
    const locator = selector ? page.locator(selector).first() : page.locator("body");
    const snapshot = await locator.ariaSnapshot();
    await writeFile(file, snapshot, "utf8");
    await appendTranscript(`action=snapshot file=${path.basename(file)} selector=${selector || "body"} url=${page.url()}`);
    console.log(`[browser] snapshot ${file}`);
    return;
  }

  throw new Error(`Unknown command ${command}`);
}

async function main() {
  if (!baseUrl || !evidenceDir || !statePath) {
    throw new Error("browser.sh must be started so the verification environment is set.");
  }
  const { command, positional, flags } = parseArgs(process.argv.slice(2));
  if (!command) {
    throw new Error("Missing command. Example: browser.sh open /");
  }
  const browser = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const state = await readState();
  try {
    await run(page, state, command, positional, flags);
    await writeState(state);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === "NEED_CHROMIUM" || (error && error.exitCode === 80)) {
      process.exitCode = 80;
      console.error("[browser] NEED_CHROMIUM");
      return;
    }
    await fail(`${command}: ${message}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  if (message === "NEED_CHROMIUM") {
    process.exitCode = 80;
    console.error("[browser] NEED_CHROMIUM");
    return;
  }
  console.error(`[browser] ${message}`);
  process.exitCode = 1;
});
