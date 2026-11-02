// Serves the static build in ./out the way the deck host on *.neoslides.app does, so what you
// rehearse and verify is exactly what gets published.
//   npm start                 http://localhost:3000
//   PORT=4000 npm start
// Paths resolve in this order: /a/b → a/b, a/b.html, a/b/index.html; otherwise 404.html with 404.

import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = resolve("out");
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8", ".json": "application/json", ".txt": "text/plain; charset=utf-8",
  ".map": "application/json", ".xml": "application/xml", ".svg": "image/svg+xml", ".png": "image/png",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".webp": "image/webp", ".avif": "image/avif",
  ".ico": "image/x-icon", ".mp4": "video/mp4", ".webm": "video/webm", ".mp3": "audio/mpeg", ".wav": "audio/wav",
  ".ogg": "audio/ogg", ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf", ".otf": "font/otf",
  ".pdf": "application/pdf", ".webmanifest": "application/manifest+json",
};

const isFile = (path) => existsSync(path) && statSync(path).isFile();

// The file a request path maps to, or undefined. Never leaves ROOT.
export const resolvePath = (root, urlPath) => {
  let path;
  try { path = decodeURIComponent(urlPath.split(/[?#]/)[0]); } catch { return undefined; }
  const clean = normalize(path).replace(/^(\.\.[/\\])+/, "").replace(/^[/\\]+|[/\\]+$/g, "");
  const candidates = clean ? [clean, `${clean}.html`, join(clean, "index.html")] : ["index.html"];
  for (const candidate of candidates) {
    const full = join(root, candidate);
    if (full.startsWith(root) && isFile(full)) return full;
  }
  return undefined;
};

export const serve = (port = 3000, root = ROOT) => {
  if (!isFile(join(root, "index.html"))) {
    console.error("No static build in ./out. Run `npm run build` first.");
    process.exit(2);
  }
  const server = createServer((req, res) => {
    if (req.method !== "GET" && req.method !== "HEAD") { res.writeHead(405).end(); return; }
    let file = resolvePath(root, req.url ?? "/");
    let status = 200;
    if (!file) {
      status = 404;
      file = isFile(join(root, "404.html")) ? join(root, "404.html") : undefined;
      if (!file) { res.writeHead(404).end("Not found"); return; }
    }
    res.writeHead(status, {
      "Content-Type": TYPES[extname(file).toLowerCase()] ?? "application/octet-stream",
      "Cache-Control": (req.url ?? "").startsWith("/_next/static/") ? "public, max-age=31536000, immutable" : "no-cache",
      "X-Content-Type-Options": "nosniff",
    });
    if (req.method === "HEAD") res.end();
    else createReadStream(file).pipe(res);
  });
  return new Promise((done) => server.listen(port, () => done(server)));
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT ?? 3000);
  await serve(port);
  console.log(`Serving ./out on http://localhost:${port}`);
}
