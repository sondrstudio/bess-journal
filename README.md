# Bess's Journal

A time-gated daily journal. Entries unlock on their own `unlockDate`, opening with
a cinematic intro and a hand-drawn, paper-textured layout.

Built with React 19, Vite, Tailwind and GSAP.

## Running locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
npm run lint
```

Add `?dev` to the URL to unlock every entry regardless of its date — useful for
previewing future days while writing them.

## Configuring the database

Entries sync through a [JSONBin.io](https://jsonbin.io) bin so they can be edited
from the live site. Credentials are read from the environment:

1. Create a private bin at jsonbin.io, seeded with the contents of
   `src/data/dailyEntries.json` (the editor rejects an empty value, and the app
   ignores an empty array)
2. `cp .env.example .env`
3. Fill in `VITE_JSONBIN_BIN_ID` and `VITE_JSONBIN_MASTER_KEY`

**Escape every `$` in the master key as `\$`.** Vite runs `.env` through
dotenv-expand, which reads `$NAME` as a variable reference and expands it to an
empty string — so a key like `$2a$10$SGQ1o...` silently loses its `$SGQ1o...`
segment and every request 401s. Quoting the value does not help; only
backslashes do.

`.env` is gitignored. On Vercel, set the same two variables under
**Project → Settings → Environment variables** so they are present at build
time. Paste the key there **without** the backslashes — the escaping below is a
`.env` file-format quirk, not part of the key. (`netlify.toml` and
`public/_headers` are left over from the original build and are inert on
Vercel; `vercel.json` carries the equivalent cache policy.)

Without credentials the site still runs: it falls back to the bundled
`src/data/dailyEntries.json` plus `localStorage`, and in-browser edits stay local
to that device.

> **Note:** Vite inlines `VITE_*` values into the client bundle, so the master key
> is readable by anyone who loads the site. Keep this bin dedicated to the
> journal and treat its contents as public.

## Writing entries

Entry content lives in `src/data/dailyEntries.json` — see
[HOW_TO_ADD_POEMS.md](HOW_TO_ADD_POEMS.md). Content still carried over from the
original build is tracked in [CONTENT_TODO.md](CONTENT_TODO.md).

Press `Cmd+Shift+E` on the site to open the in-browser entry editor.
