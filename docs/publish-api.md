# Publishing API

How a generated project gets from `npm run share` to a shareable link. This document is the contract between the template's `scripts/publish.mjs` (in this repository) and the backend (`neoslides.dev` + the deck host on `*.neoslides.app`, in its own repository).

## Domains

| Domain | Serves |
| --- | --- |
| `neoslides.dev` | Site, docs, agent install guide (`/install.md`, `/llms.txt`), sign-in, `/device` (CLI sign-in confirmation), account page, API (`/api/*`) |
| `<slug>.neoslides.app` | Published decks, nothing else. Static files from R2 |
| `neoslides.app` | Redirect to `https://neoslides.dev` |

Decks run arbitrary JavaScript, so they never share a registrable domain with sessions. Never set cookies on `neoslides.app`.

## Stack (all Cloudflare)

- **`neoslides.dev`:** Next.js on Workers via `@opennextjs/cloudflare`, `nodejs_compat`. Bindings: D1 `DB`, R2 `DECKS` (read/write), rate limiter `PUBLISH_LIMIT`.
- **Auth:** Better Auth on D1 (Drizzle adapter), created per request from `getCloudflareContext().env`. Google is the only sign-in method. Plugins: `deviceAuthorization` (CLI sign-in) and `bearer` (CLI requests). Secrets via `wrangler secret`: `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`. Google redirect URI: `https://neoslides.dev/api/auth/callback/google`.
- **Deck host:** a separate small Worker on the route `*.neoslides.app/*`. Bindings: R2 `DECKS` (read), D1 `DB` (read).

## Sign-in from the CLI (device flow)

Better Auth's `deviceAuthorization` plugin (RFC 8628), `client_id` = `neoslides-cli`. The token never passes through the chat.

1. `POST https://neoslides.dev/api/auth/device/code` with `{"client_id": "neoslides-cli"}`
   → `{device_code, user_code, verification_uri, verification_uri_complete, expires_in, interval}`.
2. The script prints `verification_uri_complete` (`https://neoslides.dev/device?user_code=ABCD-EFGH`) and opens it in the browser if it can. The person signs in with Google and approves.
3. The script polls `POST /api/auth/device/token` with `{"grant_type": "urn:ietf:params:oauth:grant-type:device_code", "device_code": "…", "client_id": "neoslides-cli"}` every `interval` seconds:
   - `400 {"error": "authorization_pending"}`: keep polling;
   - `400 {"error": "slow_down"}`: add 5 s to the interval;
   - `400 {"error": "access_denied" | "expired_token"}`: stop;
   - `200 {"access_token", "token_type": "Bearer", "expires_in"}`: done.
4. The script saves `{api, token, email}` to `~/.config/neoslides/credentials.json` (mode `0600`). `NEOSLIDES_TOKEN` in the environment overrides the file (for CI).

Every API request sends `Authorization: Bearer <token>`. On `401` the script deletes the saved token and runs the device flow again.

## Deck API

All responses are JSON. Errors: `{"error": {"code": "…", "message": "…"}}`.

| Request | Response |
| --- | --- |
| `GET /api/me` | `200 {email, name, usage: {decks, bytes}, limits: {decks, bytesPerDeck}}` |
| `POST /api/decks?title=<title>`, body: zip | `201 {slug, url, version}` |
| `PUT /api/decks/:slug?title=<title>`, body: zip | `200 {slug, url, version}` (owner only) |
| `GET /api/decks` | `200 {decks: [{slug, url, title, version, bytes, files, createdAt, updatedAt}]}` |
| `DELETE /api/decks/:slug` | `204` (owner only) |

`url` is `https://<slug>.neoslides.app/`. The upload body is `Content-Type: application/zip`, the contents of the static export (`out/`) with `index.html` at the root.

| Code | Status | When |
| --- | --- | --- |
| `unauthorized` | 401 | No token, or an expired one |
| `forbidden` | 403 | Not the owner of the deck |
| `not_found` | 404 | No such deck (or deleted) |
| `quota_exceeded` | 403 | Over the deck limit |
| `too_large` | 413 | Over a size or file-count limit |
| `invalid_archive` | 422 | Not a zip, no `index.html`, bad path, disallowed file type |
| `rate_limited` | 429 | Too many publishes; `Retry-After` header |

### Limits (v1)

- 20 decks per account; 10 publishes per minute per account.
- Archive ≤ 25 MB; unpacked ≤ 50 MB; ≤ 2,000 files. (Workers have ~128 MB of memory: unpack with `fflate`, write files to R2 one by one.)
- Allowed extensions: `html css js mjs json txt map xml svg png jpg jpeg gif webp avif ico mp4 webm mp3 wav ogg woff woff2 ttf otf pdf webmanifest`.
- Rejected: absolute paths, `..`, backslashes, symlinks, `__MACOSX/`, dotfiles.

### Publishing a version

1. Validate the archive completely before writing anything.
2. New deck: generate the slug, 10 random characters from `[a-z0-9]` (`crypto.getRandomValues`), retry on a collision.
3. Write the files to R2 as `decks/<slug>/<version>/<path>`, `version` = previous + 1.
4. Only after all files are written, update the deck row in D1 (`current_version`, `bytes`, `files`, `title`, `updated_at`). The switch is atomic and the previous version stays for rollback.
5. A cron Worker deletes versions older than the previous one, and decks deleted more than 7 days ago.

### D1 table (besides Better Auth's own)

```sql
create table decks (
  slug text primary key,
  user_id text not null references user(id),
  title text not null default '',
  current_version integer not null,
  bytes integer not null,
  files integer not null,
  created_at integer not null,
  updated_at integer not null,
  deleted_at integer
);
create index decks_user on decks(user_id);
```

## Deck host (`*.neoslides.app`)

1. Slug from the host's first label; anything else, or the bare domain, redirects to `https://neoslides.dev`.
2. `current_version` from D1 (cache it in the Cache API for 60 s). Missing or deleted → the 404 page.
3. Resolve the path in this order: `/` → `index.html`; `/a/b` → `a/b`, then `a/b.html`, then `a/b/index.html`. Not found → the deck's `404.html` with status 404, or a plain 404.
4. Headers:
   - `Content-Type` from the extension;
   - `/_next/static/*`: `Cache-Control: public, max-age=31536000, immutable`; everything else: `no-cache`;
   - `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Robots-Tag: noindex` (links are unlisted).
5. `GET` and `HEAD` only.

## The project side

`npm run share` in a generated project:

1. Signs in if needed (device flow above).
2. Builds the static export into `out/` (`NEOSLIDES_EXPORT=1 next build`).
3. Zips `out/` and uploads it: `PUT` to the slug in `.neoslides.json` if there is one, otherwise `POST`.
4. Writes `{api, slug, url}` to `.neoslides.json` and prints the link. A `403`/`404` on `PUT` (deleted deck, another account) falls back to `POST`.

`npm run share -- --new` always creates a new deck; `-- --delete` deletes the one in `.neoslides.json`; `-- --logout` forgets the token. `NEOSLIDES_API` overrides `https://neoslides.dev` (for a local backend).
