// Publishes the talk to a shareable link on neoslides.app. What it does and expects: docs/sharing.md in the skill.
//   npm run share                 build, upload, print the link (same link on every re-publish)
//   npm run share -- --new        always make a new link
//   npm run share -- --title "…"  title shown in your neoslides.dev account (default: <title> of the start page)
//   npm run share -- --no-build   upload ./out as it is
//   npm run share -- --list        the account's decks (the one from this project is marked)
//   npm run share -- --login      only sign in;  --logout  forget the token;  --delete  delete this deck
//   npm run share -- --whoami     which account the saved token belongs to
// Sign-in is a device flow: open the printed link, sign in with Google, approve. The token is saved to
// ~/.config/neoslides/credentials.json (or set NEOSLIDES_TOKEN). NEOSLIDES_API overrides https://neoslides.dev.
// The link is unlisted but public: anyone with it can open the talk. Everything in ./out is uploaded.

import { spawn, spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, relative, sep } from "node:path";
import { deflateRawSync } from "node:zlib";

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const option = (name) => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] : undefined; };
const API = (process.env.NEOSLIDES_API ?? "https://neoslides.dev").replace(/\/$/, "");
const CLIENT_ID = "neoslides-cli";
const CREDENTIALS = join(process.env.XDG_CONFIG_HOME ?? join(homedir(), ".config"), "neoslides", "credentials.json");
const PROJECT = ".neoslides.json";
const OUT = "out";
const MAX_ZIP = 25 * 1024 * 1024;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const die = (message) => { console.error(`✗ ${message}`); process.exit(1); };
const readJson = (path) => { try { return JSON.parse(readFileSync(path, "utf8")); } catch { return undefined; } };

// --- sign-in (device flow) -----------------------------------------------------------------

const savedToken = () => {
  if (process.env.NEOSLIDES_TOKEN) return process.env.NEOSLIDES_TOKEN;
  const saved = readJson(CREDENTIALS);
  return saved?.api === API ? saved.token : undefined;
};

const openInBrowser = (url) => {
  const command = process.platform === "darwin" ? "open" : process.platform === "win32" ? "cmd" : "xdg-open";
  const args = process.platform === "win32" ? ["/c", "start", "", url] : [url];
  try { spawn(command, args, { stdio: "ignore", detached: true }).on("error", () => {}).unref(); } catch { /* the link is printed anyway */ }
};

const post = (path, body) => fetch(API + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

const login = async () => {
  const start = await post("/api/auth/device/code", { client_id: CLIENT_ID }).catch((error) => die(`Can't reach ${API}: ${error.message}`));
  if (!start.ok) die(`Sign-in failed to start (${start.status}).`);
  const code = await start.json();
  const link = code.verification_uri_complete ?? code.verification_uri;
  console.log(`\nSign in to publish. Open this link, sign in with Google and approve the code ${code.user_code}:\n\n  ${link}\n`);
  openInBrowser(link);
  let interval = (code.interval ?? 5) * 1000;
  const deadline = Date.now() + (code.expires_in ?? 900) * 1000;
  while (Date.now() < deadline) {
    await sleep(interval);
    const res = await post("/api/auth/device/token", {
      grant_type: "urn:ietf:params:oauth:grant-type:device_code",
      device_code: code.device_code,
      client_id: CLIENT_ID,
    }).catch(() => undefined);
    if (!res) continue;
    const body = await res.json().catch(() => ({}));
    if (res.ok && body.access_token) {
      const me = await fetch(`${API}/api/me`, { headers: { Authorization: `Bearer ${body.access_token}` } }).then((r) => r.json()).catch(() => ({}));
      mkdirSync(dirname(CREDENTIALS), { recursive: true });
      writeFileSync(CREDENTIALS, JSON.stringify({ api: API, token: body.access_token, email: me.email }, null, 2));
      chmodSync(CREDENTIALS, 0o600);
      console.log(`✓ Signed in${me.email ? ` as ${me.email}` : ""}.`);
      return body.access_token;
    }
    if (body.error === "authorization_pending") continue;
    if (body.error === "slow_down") { interval += 5000; continue; }
    die(body.error === "access_denied" ? "Sign-in was declined." : body.error === "expired_token" ? "The sign-in code expired. Run it again." : `Sign-in failed (${res.status} ${body.error ?? ""}).`);
  }
  die("The sign-in code expired. Run it again.");
};

const logout = () => { rmSync(CREDENTIALS, { force: true }); console.log("✓ Signed out."); };

// --- zip (deflated entries; no dependencies) ------------------------------------

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

const filesIn = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const path = join(dir, entry.name);
  if (entry.name.startsWith(".")) return [];
  if (entry.isDirectory()) return filesIn(path);
  return entry.isFile() ? [path] : [];
});

const zip = (dir) => {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const file of filesIn(dir)) {
    const name = Buffer.from(relative(dir, file).split(sep).join("/"));
    const data = readFileSync(file);
    const packed = deflateRawSync(data);
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x0800, 6); local.writeUInt16LE(8, 8);
    local.writeUInt32LE(crc, 14); local.writeUInt32LE(packed.length, 18); local.writeUInt32LE(data.length, 22); local.writeUInt16LE(name.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6); central.writeUInt16LE(0x0800, 8); central.writeUInt16LE(8, 10);
    central.writeUInt32LE(crc, 16); central.writeUInt32LE(packed.length, 20); central.writeUInt32LE(data.length, 24); central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(offset, 42);
    locals.push(local, name, packed);
    centrals.push(central, name);
    offset += local.length + name.length + packed.length;
  }
  const directory = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  const count = centrals.length / 2;
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(count, 8); end.writeUInt16LE(count, 10);
  end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
  return { archive: Buffer.concat([...locals, directory, end]), count };
};

// --- deck API ------------------------------------------------------------------------------

const call = async (token, method, path, body) => {
  const res = await fetch(API + path, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/zip" } : {}) },
    body,
  }).catch((error) => die(`Can't reach ${API}: ${error.message}`));
  if (res.status === 401) return { unauthorized: true };
  const data = res.status === 204 ? {} : await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data, retryAfter: res.headers.get("retry-after") };
};

// Retries once with a fresh sign-in when the saved token is no longer valid.
const withAuth = async (request) => {
  let token = savedToken() ?? (await login());
  let result = await request(token);
  if (result.unauthorized) {
    if (process.env.NEOSLIDES_TOKEN) die("NEOSLIDES_TOKEN was rejected.");
    rmSync(CREDENTIALS, { force: true });
    token = await login();
    result = await request(token);
    if (result.unauthorized) die("Sign-in was rejected by the server.");
  }
  return result;
};

const explain = ({ status, data, retryAfter }) => {
  const message = data?.error?.message ?? `HTTP ${status}`;
  if (status === 429) return `${message} Try again in ${retryAfter ?? "a minute"} s.`;
  return message;
};

const pageTitle = () => readFileSync(join(OUT, "index.html"), "utf8").match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() ?? "";

const publish = async () => {
  if (!flag("no-build")) {
    console.log("Building the static talk…");
    const build = spawnSync(process.execPath, ["node_modules/next/dist/bin/next", "build"], { stdio: "inherit" });
    if (build.status !== 0) die("The build failed; fix it before publishing.");
  }
  if (!existsSync(join(OUT, "index.html"))) die("No static build in ./out. Run `npm run build` first.");
  const { archive, count } = zip(OUT);
  if (archive.length > MAX_ZIP) die(`The talk is ${(archive.length / 1048576).toFixed(1)} MB zipped; the limit is 25 MB. Compress large media in public/.`);
  const title = encodeURIComponent((option("title") ?? pageTitle()).slice(0, 200));
  const saved = flag("new") ? undefined : readJson(PROJECT);
  console.log(`Uploading ${count} files (${(archive.length / 1048576).toFixed(1)} MB)…`);

  let result = await withAuth((token) => saved?.slug
    ? call(token, "PUT", `/api/decks/${saved.slug}?title=${title}`, archive)
    : call(token, "POST", `/api/decks?title=${title}`, archive));
  // The deck was deleted, or belongs to another account: publish as a new one.
  if (saved?.slug && (result.status === 404 || result.status === 403)) {
    console.log(`The deck ${saved.slug} isn't yours any more; making a new link.`);
    result = await withAuth((token) => call(token, "POST", `/api/decks?title=${title}`, archive));
  }
  if (!result.ok) die(`Publishing failed: ${explain(result)}`);

  const { slug, url, version } = result.data;
  writeFileSync(PROJECT, `${JSON.stringify({ api: API, slug, url }, null, 2)}\n`);
  console.log(`\n✓ Published${version > 1 ? ` (version ${version})` : ""}: ${url}\n`);
  console.log("Anyone with the link can open it. Re-run `npm run share` to update the same link.");
};

const remove = async () => {
  const saved = readJson(PROJECT);
  if (!saved?.slug) die(`Nothing to delete: no ${PROJECT} in this project.`);
  const result = await withAuth((token) => call(token, "DELETE", `/api/decks/${saved.slug}`));
  if (!result.ok && result.status !== 404) die(`Deleting failed: ${explain(result)}`);
  rmSync(PROJECT, { force: true });
  console.log(`✓ Deleted ${saved.url}`);
};

const list = async () => {
  const mine = readJson(PROJECT)?.slug;
  const result = await withAuth((token) => call(token, "GET", "/api/decks"));
  if (!result.ok) die(`Listing failed: ${explain(result)}`);
  const decks = result.data.decks ?? [];
  if (!decks.length) return console.log("No decks yet. `npm run share` publishes this one.");
  const day = (iso) => (iso ?? "").slice(0, 10);
  for (const d of decks) {
    const mark = d.slug === mine ? "→" : " ";
    console.log(`${mark} ${d.url}  ${d.title || "(untitled)"}  v${d.version}  ${d.files} files  updated ${day(d.updatedAt)}`);
  }
  if (mine) console.log("\n→ this project's deck");
};

const whoami = async () => {
  const result = await withAuth((token) => call(token, "GET", "/api/me"));
  if (!result.ok) die(`Not signed in: ${explain(result)}`);
  const { email, usage, limits } = result.data;
  console.log(`${email} · ${usage.decks}/${limits.decks} decks · ${API}`);
};

if (flag("logout")) logout();
else if (flag("login")) await login();
else if (flag("whoami")) await whoami();
else if (flag("list")) await list();
else if (flag("delete")) await remove();
else await publish();
