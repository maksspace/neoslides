# Sharing a talk

What `npm run share` (`assets/template/scripts/publish.mjs`) does and what the neoslides service
promises it. This is the client's side of the contract only; the service itself lives in its own
repository.

## What the person sees

- `npm run share` builds the talk (`next build`, static export to `out/`), zips it, signs the person in
  once, uploads the zip and prints a link like `https://k7f3x9q2ab.neoslides.app/`.
- The link is unlisted (random, `noindex`) but public: anyone who has it can open the talk.
- Running it again in the same project updates the same link (`.neoslides.json` remembers it); the
  previous version is kept on the server for rollback. `-- --new` makes a new link instead,
  `-- --delete` takes the talk down, `-- --logout` forgets the saved token, `-- --title "…"` names
  the talk in the person's account (default: the `<title>` of the start page), `-- --no-build`
  uploads `out/` as it is.
- `-- --list` prints every deck on the account (this project's marked `→`), `-- --whoami` the account
  the saved token belongs to.
- Decks are also managed at `https://neoslides.dev/account`: list, delete, personal tokens.

## For the agent

When the person asks to publish, update, delete or list, run the script yourself from the project
directory and relay its output; `SKILL.md` "Sharing a talk" maps requests to commands. The one
thing you cannot do is the sign-in: show the person the link and code the script prints, let them
approve it in their browser, and never handle the token directly.
- The build runs on the person's machine. Only the static files in `out/` leave it; the source and
  the prompt never do.

## Sign-in

OAuth device flow (RFC 8628) against `https://neoslides.dev`, `client_id` `neoslides-cli`. The token
never passes through the chat.

1. `POST /api/auth/device/code` with `{"client_id": "neoslides-cli"}` →
   `{device_code, user_code, verification_uri, verification_uri_complete, expires_in, interval}`.
2. The script prints `verification_uri_complete` and opens it in the browser if it can. The person
   signs in with Google and approves the code.
3. The script polls `POST /api/auth/device/token` with
   `{"grant_type": "urn:ietf:params:oauth:grant-type:device_code", "device_code", "client_id"}`
   every `interval` seconds. `400 authorization_pending`: keep polling; `400 slow_down`: add 5 s;
   `400 access_denied` or `expired_token`: stop; `200 {access_token, token_type: "Bearer", expires_in}`:
   done. Tokens last 30 days of inactivity.
4. The token is saved to `~/.config/neoslides/credentials.json` (mode `0600`).

`NEOSLIDES_TOKEN` in the environment overrides the saved token. For CI, the person creates a
personal token (`nsk_…`) on `/account` and sets that variable; it works wherever a device-flow
token does and can be revoked from the same page.

Every API request sends `Authorization: Bearer <token>`. On `401` the script deletes the saved
token and signs in again (or stops, if the token came from `NEOSLIDES_TOKEN`).

## Requests

All responses are JSON; errors are `{"error": {"code", "message"}}`.

| Request | Response |
| --- | --- |
| `POST /api/decks?title=<title>`, body: zip | `201 {slug, url, version}` |
| `PUT /api/decks/:slug?title=<title>`, body: zip | `200 {slug, url, version}` |
| `DELETE /api/decks/:slug` | `204` |
| `GET /api/decks` | `200 {decks: [{slug, url, title, version, bytes, files, createdAt, updatedAt}]}` |
| `GET /api/me` | `200 {email, name, usage: {decks, bytes}, limits: {decks, bytesPerDeck}}` |

The body is `Content-Type: application/zip`: the contents of `out/`, with `index.html` at the root.
`url` is `https://<slug>.neoslides.app/`. Dates in responses are ISO 8601.

| Code | Status | When |
| --- | --- | --- |
| `unauthorized` | 401 | No token, or an expired or revoked one |
| `forbidden` | 403 | Not the owner of the deck |
| `quota_exceeded` | 403 | Over the deck limit |
| `not_found` | 404 | No such deck, or it was deleted |
| `conflict` | 409 | Another upload of the same deck finished first; run again |
| `too_large` | 413 | Over a size or file-count limit |
| `invalid_archive` | 422 | Not a zip, no `index.html`, a bad path, or a disallowed file type |
| `rate_limited` | 429 | Too many uploads; wait `Retry-After` seconds |

## What an archive may contain

- Up to 20 decks per account, 10 uploads per minute.
- Zip ≤ 25 MB, unpacked ≤ 50 MB, ≤ 2,000 files.
- Static files only: `html css js mjs json txt map xml svg png jpg jpeg gif webp avif ico mp4 webm mp3
  wav ogg woff woff2 ttf otf pdf webmanifest`.
- No absolute paths, `..`, backslashes, symlinks, `__MACOSX/` or dotfiles.

A talk from this template passes all of this as long as large media in `public/` is compressed.

## Local backend

`NEOSLIDES_API=http://localhost:8787 npm run share` talks to a locally running service instead of
`https://neoslides.dev`; links then come back as `http://<slug>.localhost:8788/`.
