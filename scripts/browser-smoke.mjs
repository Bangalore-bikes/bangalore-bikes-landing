import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
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
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    clearTimeout(request.timeout);
    if (message.error) request.reject(new Error(message.error.message));
    else request.done(message.result);
  });
  await command("Page.enable");
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
      `Array.from(document.querySelectorAll('[role="dialog"] a')).some(a => a.textContent.includes('Join on Reddit') && a.href === 'https://www.reddit.com/r/bangalorebikes/')`,
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
    () => evaluate(`!!document.querySelector('input[type="search"]')`),
    "resource directory",
  );
  await evaluate(
    `Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(document.querySelector('input[type="search"]'), 'workshop'); document.querySelector('input[type="search"]').dispatchEvent(new Event('input', {bubbles:true}))`,
  );
  await waitFor(
    () =>
      evaluate(
        `document.querySelector('[role="status"]').textContent.trim() === '1 resource found'`,
      ),
    "search filters content",
  );
  await evaluate(
    `Array.from(document.querySelectorAll('fieldset button')).find(b => b.textContent.trim() === 'Community').click()`,
  );
  await waitFor(
    () =>
      evaluate(
        `document.querySelector('[role="status"]').textContent.trim() === '0 resources found'`,
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
        `document.querySelector('[role="status"]').textContent.trim() === '3 resources found'`,
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
  ]) {
    assert.equal((await fetch(new URL(path, base))).status, 404, path);
  }
  console.log(
    "PASS desktop layout, modmail contact, unknown ride and calendar 404s",
  );
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
