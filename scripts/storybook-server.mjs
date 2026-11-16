import { createServer } from "node:http";
import { readFile, realpath } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

// Read-only, loopback-only server used by browser smoke checks, never a deployment.
export async function startStorybookServer() {
  const root = await realpath(
    fileURLToPath(new URL("../storybook-static", import.meta.url)),
  );
  const types = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
  };
  const server = createServer(async (request, response) => {
    if (!["GET", "HEAD"].includes(request.method)) {
      response.writeHead(405).end();
      return;
    }
    try {
      const pathname = decodeURIComponent(
        new URL(request.url, "http://localhost").pathname,
      );
      const candidate = resolve(
        root,
        "." + (pathname === "/" ? "/index.html" : pathname),
      );
      if (!candidate.startsWith(root + sep)) {
        response.writeHead(404).end();
        return;
      }
      const file = await realpath(candidate);
      if (!file.startsWith(root + sep)) {
        response.writeHead(404).end();
        return;
      }
      const content = await readFile(file);
      response.writeHead(200, {
        "Content-Type": types[extname(file)] || "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store",
      });
      response.end(request.method === "HEAD" ? undefined : content);
    } catch {
      response.writeHead(404).end("Not found");
    }
  });
  await new Promise((done, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", done);
  });
  return { server, origin: "http://127.0.0.1:" + server.address().port };
}
