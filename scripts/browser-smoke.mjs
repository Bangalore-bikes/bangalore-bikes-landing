import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  rmSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { once } from "node:events";
import { startStorybookServer } from "./storybook-server.mjs";

const base = new URL(process.env.SMOKE_BASE_URL || "http://localhost:3102");
assert.ok(
  ["localhost", "127.0.0.1"].includes(base.hostname),
  "Smoke checks target local servers only",
);
const executable =
  process.env.CHROME_PATH ||
  [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  ].find(existsSync);
assert.ok(executable, "Set CHROME_PATH to an installed Chromium browser");

const scratchParent = resolve(tmpdir());
const profile = mkdtempSync(join(scratchParent, "bangalore-bikes-smoke-"));
const browser = spawn(
  executable,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--disable-sync",
    "--disable-extensions",
    "--remote-debugging-address=127.0.0.1",
    "--remote-debugging-port=0",
    "--user-data-dir=" + profile,
    "about:blank",
  ],
  { windowsHide: true, stdio: ["ignore", "ignore", "pipe"] },
);
let socket;
let storybookServer;
let nextId = 0;
const pending = new Map();
let feedFixtureMode = "live";
const timeoutMs = 15000;

async function waitFor(check, label) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await check()) return;
    await new Promise((done) => setTimeout(done, 100));
  }
  throw new Error("Timed out: " + label);
}

function command(method, params = {}) {
  const id = ++nextId;
  return new Promise((done, reject) => {
    const timeout = setTimeout(() => {
      pending.delete(id);
      reject(new Error("CDP timeout: " + method));
    }, timeoutMs);
    pending.set(id, { done, reject, timeout });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const result = await command("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

async function navigate(path) {
  await command("Page.navigate", { url: new URL(path, base).href });
  await waitFor(
    () =>
      evaluate(
        `document.readyState === 'complete' && !!document.querySelector('main, h1')`,
      ),
    path,
  );
}

async function screenshot(name) {
  if (!process.argv.includes("--screenshots")) return;
  const folder = resolve(".npm-tmp", "wiki-preview");
  mkdirSync(folder, { recursive: true });
  await evaluate("scrollTo(0, 0)");
  const result = await command("Page.captureScreenshot", { format: "png" });
  writeFileSync(
    join(folder, name + ".png"),
    Buffer.from(result.data, "base64"),
  );
}

try {
  const debuggerUrl = await new Promise((done, reject) => {
    let stderr = "";
    const timeout = setTimeout(
      () => reject(new Error("Browser debugger did not start")),
      timeoutMs,
    );
    browser.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    browser.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
      const match = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) {
        clearTimeout(timeout);
        done(match[1]);
      }
    });
    browser.once("exit", (code) => {
      clearTimeout(timeout);
      reject(new Error("Browser exited: " + code));
    });
  });
  const debuggerHost = new URL(debuggerUrl).host;
  const target = await fetch(
    "http://" + debuggerHost + "/json/new?about:blank",
    { method: "PUT" },
  ).then((response) => response.json());
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await once(socket, "open");
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (message.method === "Fetch.requestPaused") {
      const sort = new URL(message.params.request.url).searchParams.get("sort");
      const fixture = {
        mode: "live",
        sort,
        posts: [
          {
            id: "fixture",
            title:
              "[TEST FIXTURE] " +
              (sort === "new" ? "Newest" : "Trending") +
              " community post",
            url: "https://www.reddit.com/r/bangalorebikes/comments/abc123/test/",
            author: "test-rider",
            publishedAt: "2026-11-17T07:00:00.000Z",
          },
        ],
      };
      command("Fetch.fulfillRequest", {
        requestId: message.params.requestId,
        responseCode: feedFixtureMode === "live" ? 200 : 503,
        responseHeaders: [{ name: "Content-Type", value: "application/json" }],
        body: Buffer.from(
          JSON.stringify(
            feedFixtureMode === "live"
              ? fixture
              : { error: "Unavailable test fixture" },
          ),
        ).toString("base64"),
      }).catch(() => {});
      return;
    }
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    clearTimeout(request.timeout);
    if (message.error) request.reject(new Error(message.error.message));
    else request.done(message.result);
  });
  await command("Page.enable");
  await command("Network.enable");
  await command("Network.setBlockedURLs", { urls: ["*://preview.redd.it/*"] });
  await command("Fetch.enable", {
    patterns: [
      { urlPattern: "*/api/community-posts*", requestStage: "Request" },
    ],
  });
  const downloadFolder = join(profile, "downloads");
  mkdirSync(downloadFolder, { recursive: true });
  await command("Browser.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: downloadFolder,
  });
  await command("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await navigate("/");
  await command("Input.dispatchKeyEvent", {
    type: "keyDown",
    key: "Tab",
    code: "Tab",
    windowsVirtualKeyCode: 9,
  });
  await command("Input.dispatchKeyEvent", {
    type: "keyUp",
    key: "Tab",
    code: "Tab",
    windowsVirtualKeyCode: 9,
  });
  assert.equal(
    await evaluate("document.activeElement.textContent.trim()"),
    "Skip to content",
    "First keyboard target",
  );
  await command("Input.dispatchKeyEvent", {
    type: "keyDown",
    key: "Enter",
    code: "Enter",
    windowsVirtualKeyCode: 13,
  });
  await command("Input.dispatchKeyEvent", {
    type: "keyUp",
    key: "Enter",
    code: "Enter",
    windowsVirtualKeyCode: 13,
  });
  await waitFor(
    () => evaluate("document.activeElement.id === 'main-content'"),
    "skip link focuses content",
  );
  assert.equal(
    await evaluate("document.querySelectorAll('main').length"),
    1,
    "Homepage main landmark",
  );
  await waitFor(
    () =>
      evaluate(
        `document.querySelector('section[aria-labelledby="community-posts-title"]').textContent.includes('[TEST FIXTURE] Trending community post')`,
      ),
    "live community feed rendering",
  );
  feedFixtureMode = "unavailable";
  await evaluate(
    `Array.from(document.querySelectorAll('[aria-label="Community post order"] button')).find(button => button.textContent === 'Newest').click()`,
  );
  await waitFor(
    () =>
      evaluate(
        `document.querySelector('section[aria-labelledby="community-posts-title"] [role=status]').textContent.includes('selected community highlights')`,
      ),
    "honest feed failure fallback",
  );
  assert.ok(
    await evaluate(
      `document.querySelector('section[aria-labelledby="community-posts-title"]').textContent.includes('Service update (with location)')`,
    ),
  );
  console.log(
    "PASS community feed success and clearly labelled unavailable-feed fallback",
  );
  console.log("PASS keyboard skip link and homepage main landmark");
  assert.ok(
    await evaluate(`document.documentElement.scrollWidth <= innerWidth + 1`),
    "Mobile horizontal overflow",
  );
  await evaluate(
    `document.querySelector('button[aria-label="Open navigation menu"]').click()`,
  );
  await waitFor(
    () => evaluate(`!!document.querySelector('[role="dialog"]')`),
    "mobile menu opens",
  );
  assert.ok(
    await evaluate(
      `Array.from(document.querySelectorAll('[role="dialog"] a')).some(a => a.textContent.includes('Join the community') && new URL(a.href).pathname === '/join')`,
    ),
    "Mobile join destination",
  );
  await evaluate(
    `document.querySelector('[role="dialog"] a[href="/wiki"]').click()`,
  );
  await waitFor(
    () =>
      evaluate(
        `location.pathname === '/wiki' && !document.querySelector('[role="dialog"]')`,
      ),
    "mobile navigation closes",
  );
  await waitFor(
    () =>
      evaluate(
        `!!document.querySelector('section[aria-labelledby="reddit-resources-title"] input[type="search"]')`,
      ),
    "resource directory",
  );
  await evaluate(
    `Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(document.querySelector('section[aria-labelledby="reddit-resources-title"] input[type="search"]'), 'workshop'); document.querySelector('section[aria-labelledby="reddit-resources-title"] input[type="search"]').dispatchEvent(new Event('input', {bubbles:true}))`,
  );
  await waitFor(
    () =>
      evaluate(
        `document.querySelector('section[aria-labelledby="reddit-resources-title"] [role="status"]').textContent.trim() === '1 resource found'`,
      ),
    "search filters content",
  );
  await evaluate(
    `Array.from(document.querySelectorAll('fieldset button')).find(b => b.textContent.trim() === 'Community').click()`,
  );
  await waitFor(
    () =>
      evaluate(
        `document.querySelector('section[aria-labelledby="reddit-resources-title"] [role="status"]').textContent.trim() === '0 resources found'`,
      ),
    "search and category intersect",
  );
  assert.ok(
    await evaluate(
      `document.body.textContent.includes('No matching resources')`,
    ),
  );
  await evaluate(
    `Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Clear filters').click()`,
  );
  await waitFor(
    () =>
      evaluate(
        `document.querySelector('section[aria-labelledby="reddit-resources-title"] [role="status"]').textContent.trim() === '3 resources found'`,
      ),
    "clear restores collection",
  );
  const correction = await evaluate(
    `Array.from(document.querySelectorAll('main a')).find(a => a.textContent.includes('Suggest a correction')).href`,
  );
  assert.equal(new URL(correction).searchParams.get("to"), "/r/bangalorebikes");
  assert.ok(
    new URL(correction).searchParams
      .get("message")
      .includes("Source: https://www.reddit.com/r/bangalorebikes/comments/"),
  );
  assert.ok(
    await evaluate(`document.documentElement.scrollWidth <= innerWidth + 1`),
    "Resource directory mobile overflow",
  );
  console.log(
    "PASS mobile menu, Reddit join, resource search/category/reset, correction link, mobile layout",
  );

  await screenshot("wiki-mobile");
  await evaluate(
    `Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(document.querySelector('section[aria-labelledby="handbook-topics-title"] input'), 'phone'); document.querySelector('section[aria-labelledby="handbook-topics-title"] input').dispatchEvent(new Event('input', {bubbles:true}))`,
  );
  await waitFor(
    () =>
      evaluate(
        `document.querySelector('section[aria-labelledby="handbook-topics-title"] [role=status]').textContent.trim() === '1 guide found'`,
      ),
    "handbook full-text search",
  );
  await navigate("/wiki/ride-rules");
  await waitFor(
    () => evaluate(`!!document.querySelector('#before-you-leave')`),
    "native ride guide",
  );
  assert.ok(
    await evaluate(
      `document.querySelector('article').textContent.includes('helmet, shoes and gloves')`,
    ),
    "Guide content is readable on-site",
  );
  assert.ok(
    await evaluate(
      `!!document.querySelector('nav[aria-label="In this guide"] a[href="#on-the-road"]')`,
    ),
    "Guide section navigation",
  );
  assert.ok(
    await evaluate(`document.documentElement.scrollWidth <= innerWidth + 1`),
    "Guide mobile overflow",
  );
  await screenshot("guide-mobile");
  await navigate("/destinations");
  await waitFor(
    () =>
      evaluate(
        `document.querySelectorAll('section[aria-labelledby="destination-list-title"] details').length === 109`,
      ),
    "complete destination collection",
  );
  await screenshot("destinations-mobile");
  assert.ok(
    await evaluate(
      `document.querySelector('aside[aria-label="Historical source notice"]').textContent.includes('2010')`,
    ),
    "Historical age notice",
  );
  // Re-send the input on every poll: the first event can land before hydration.
  await waitFor(async () => {
    await evaluate(
      `Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(document.querySelector('input[type=search]'), 'Nandi'); document.querySelector('input[type=search]').dispatchEvent(new Event('input', {bubbles:true}))`,
    );
    return evaluate(
      `document.querySelector('[role=status]').textContent.trim() === '1 of 109 destinations'`,
    );
  }, "destination name search");
  await evaluate(`document.querySelector('details summary').click()`);
  assert.equal(
    await evaluate(`document.querySelectorAll('details[open] dl dd').length`),
    17,
    "All original source columns are readable",
  );
  assert.equal(
    new URL(await evaluate("location.href")).searchParams.get("q"),
    "Nandi",
    "Filters update the shareable URL",
  );
  await evaluate(
    `Array.from(document.querySelectorAll('button')).find(button => button.textContent.includes('Download 1 record as CSV')).click()`,
  );
  const csvPath = join(
    downloadFolder,
    "bangalore-bikes-historical-destinations.csv",
  );
  await waitFor(() => existsSync(csvPath), "filtered CSV download");
  const exportedCsv = readFileSync(csvPath, "utf8");
  assert.ok(
    exportedCsv.includes("Nandi hills") && exportedCsv.includes("2010"),
  );
  assert.equal(
    exportedCsv.split("\r\n").filter(Boolean).length,
    2,
    "Only the filtered record is exported",
  );
  await evaluate(`window.__previousDestinationDocument = true`);
  await command("Page.reload");
  await waitFor(
    () =>
      evaluate(
        `!window.__previousDestinationDocument && document.querySelector('input[type=search]')?.value === 'Nandi' && document.querySelector('[role=status]')?.textContent.trim() === '1 of 109 destinations'`,
      ),
    "shared filters survive reload",
  );
  await evaluate(
    `Array.from(document.querySelectorAll('button')).find(button => button.textContent === 'Reset destinations').click()`,
  );
  await waitFor(
    () =>
      evaluate(
        `document.querySelector('[role=status]').textContent.trim() === '109 of 109 destinations'`,
      ),
    "destination reset",
  );
  await evaluate(
    `const type = document.querySelectorAll('select')[0]; Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(type, 'Water fall'); type.dispatchEvent(new Event('change', {bubbles:true})); const distance = document.querySelectorAll('select')[1]; Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(distance, '150'); distance.dispatchEvent(new Event('change', {bubbles:true}))`,
  );
  await waitFor(
    () =>
      evaluate(
        `document.querySelector('[role=status]').textContent.trim() === '2 of 109 destinations'`,
      ),
    "destination category and distance intersection",
  );
  assert.ok(
    await evaluate(`document.documentElement.scrollWidth <= innerWidth + 1`),
    "Destination mobile overflow",
  );
  console.log(
    "PASS native handbook search and reading, section navigation, all 109 destinations, original columns, search/reset and intersecting filters",
  );
  await navigate("/destinations?q=not-a-match#place-5-nandi-hills");
  await waitFor(
    () =>
      evaluate(`document.getElementById('place-5-nandi-hills')?.open === true`),
    "shared destination record is revealed and expanded",
  );
  await navigate("/join");
  await waitFor(
    () => evaluate(`!!document.querySelector('#whatsapp-join-title')`),
    "native join page",
  );
  assert.ok(
    await evaluate(
      `Array.from(document.querySelectorAll('main a')).some(a => a.href === 'https://chat.whatsapp.com/BtOk3R3w4FPK36zMy3UmQD')`,
    ),
  );
  assert.ok(
    await evaluate(
      `!!document.querySelector('main img[src*="whatsapp-invite"]')`,
    ),
  );
  assert.ok(
    await evaluate(`document.documentElement.scrollWidth <= innerWidth + 1`),
    "Join page mobile overflow",
  );
  await screenshot("join-mobile");
  assert.equal(
    (await fetch(new URL("/api/community-posts?sort=invalid", base))).status,
    400,
    "Unsupported feed sorts are rejected",
  );
  console.log(
    "PASS shareable destination URLs, reload, filtered CSV download, expanded record links, and WhatsApp join/QR",
  );

  await command("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await navigate("/contact");
  assert.ok(
    await evaluate(`!document.querySelector('main form')`),
    "Fake contact form returned",
  );
  assert.ok(
    await evaluate(
      `Array.from(document.querySelectorAll('main a')).some(a => a.href.includes('reddit.com/message/compose/'))`,
    ),
  );
  assert.ok(
    await evaluate(`document.documentElement.scrollWidth <= innerWidth + 1`),
    "Desktop horizontal overflow",
  );
  for (const path of [
    "/rides/missing-ride",
    "/rides/missing-ride/calendar",
    "/blogs/missing-story",
    "/wiki/missing-guide",
  ]) {
    assert.equal((await fetch(new URL(path, base))).status, 404, path);
  }
  console.log(
    "PASS desktop layout, modmail contact, unknown ride and calendar 404s",
  );
  if (process.argv.includes("--screenshots")) {
    await navigate("/");
    await waitFor(
      () => evaluate(`!!document.querySelector('#community-posts-title')`),
      "homepage preview",
    );
    await screenshot("home-community-desktop");
    await navigate("/join");
    await waitFor(
      () => evaluate(`!!document.querySelector('#whatsapp-join-title')`),
      "join desktop preview",
    );
    await screenshot("join-desktop");
    await navigate("/wiki");
    await waitFor(
      () => evaluate(`!!document.querySelector('#handbook-topics-title')`),
      "desktop wiki preview",
    );
    await screenshot("wiki-desktop");
  }
  if (process.argv.includes("--storybook")) {
    const gallery = await startStorybookServer();
    storybookServer = gallery.server;
    await command("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      mobile: true,
    });
    for (const [story, label, downloadable] of [
      ["upcoming", "Upcoming ride", true],
      ["cancelled", "Ride cancelled", false],
      ["in-progress", "Ride in progress", false],
      ["past", "Past ride", false],
    ]) {
      await command("Page.navigate", {
        url:
          gallery.origin +
          "/iframe.html?id=community-ride-availability--" +
          story +
          "&viewMode=story",
      });
      await waitFor(
        () =>
          evaluate(
            "document.querySelector('#storybook-root [role=status]')?.textContent.trim() === " +
              JSON.stringify(label),
          ),
        "ride preview " + story,
      );
      assert.equal(
        await evaluate(
          "!!document.querySelector('#storybook-root a[download]')",
        ),
        downloadable,
        story + " calendar availability",
      );
      assert.ok(
        await evaluate(
          "document.documentElement.scrollWidth <= innerWidth + 1",
        ),
        story + " mobile overflow",
      );
    }
    await command("Page.navigate", {
      url:
        gallery.origin +
        "/iframe.html?id=community-article-content--structured-story&viewMode=story",
    });
    await waitFor(
      () =>
        evaluate(
          "document.querySelector('#storybook-root')?.textContent.includes('Literal <b>text</b>')",
        ),
      "article preview",
    );
    assert.ok(
      await evaluate("!document.querySelector('#storybook-root b')"),
      "Article text was interpreted as HTML",
    );
    assert.equal(
      await evaluate("document.querySelectorAll('#storybook-root li').length"),
      3,
      "Article list items and source",
    );
    console.log(
      "PASS isolated upcoming/cancelled/ongoing/past ride previews, calendar visibility, article text rendering",
    );
  }
} finally {
  if (socket?.readyState === WebSocket.OPEN) {
    try {
      await command("Browser.close");
    } catch {
      /* Browser may close the transport before replying. */
    }
    socket.close();
  }
  if (browser.exitCode === null) {
    browser.kill();
    await Promise.race([
      once(browser, "exit"),
      new Promise((done) => setTimeout(done, 2000)),
    ]);
  }
  for (const request of pending.values()) clearTimeout(request.timeout);
  if (storybookServer) {
    storybookServer.closeAllConnections();
    await new Promise((done) => storybookServer.close(done));
  }
  // Remove only the exact isolated profile created above, never a shared profile.
  if (
    dirname(resolve(profile)) === scratchParent &&
    profile.startsWith(join(scratchParent, "bangalore-bikes-smoke-"))
  ) {
    try {
      rmSync(profile, {
        recursive: true,
        force: true,
        maxRetries: 3,
        retryDelay: 100,
      });
    } catch {
      console.error(
        "Temporary browser profile could not be removed: " + profile,
      );
    }
  }
}
