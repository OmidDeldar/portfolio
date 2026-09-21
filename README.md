# Omid Deldar — Portfolio

A black-and-violet portfolio site with an **interactive terminal** that is not a
prop: every command you type is `POST`ed to a real NestJS API and rendered from
its response.

```
omid@portfolio:~$ sudo hire-me
[sudo] password for guest: ********
Authentication successful.
```

- **Front end** — React 18 + TypeScript + Vite. No UI framework, no CSS library;
  the whole design system is ~10 stylesheets driven by CSS custom properties.
- **Back end** — NestJS 10 + TypeScript, Swagger docs, `class-validator` DTOs,
  Helmet, and per-IP rate limiting. In-memory store, so there is no database to
  provision.

---

## Quick start

### With Docker (nothing to install but Docker)

```bash
docker compose up --build
```

| What        | URL                                 |
| ----------- | ----------------------------------- |
| Site        | http://localhost:8080               |
| Swagger UI  | http://localhost:8080/api/docs      |
| API direct  | http://localhost:3000/api           |

nginx serves the built front end and proxies `/api` to the API container, so the
browser only ever talks to one origin and CORS never applies. See
[Docker](#docker) below for the details.

### Without Docker

```bash
npm run install:all
npm run dev
```

| What        | URL                             |
| ----------- | ------------------------------- |
| Site        | http://localhost:5173           |
| API         | http://localhost:3000/api       |
| Swagger UI  | http://localhost:3000/api/docs  |

`npm run dev` runs both processes together. In development the Vite server
proxies `/api/*` through to NestJS, so again there is no CORS to think about.

Run them separately if you prefer:

```bash
npm run dev:api     # NestJS on :3000, watch mode
npm run dev:web     # Vite on :5173
```

---

## Project layout

```
portfolio/
├── api/                                  NestJS service
│   └── src/
│       ├── data/portfolio.data.ts        ← ALL your CV content lives here
│       ├── modules/
│       │   ├── terminal/
│       │   │   ├── terminal.engine.ts    ← the shell: every command
│       │   │   ├── terminal.service.ts
│       │   │   └── terminal.controller.ts
│       │   ├── profile · experience · projects · skills · education
│       │   ├── stats/                    visitor counter (hashed, anonymous)
│       │   └── health/
│       └── main.ts                       bootstrap, CORS, Swagger, validation
│
├── web/                                  React front end
│   └── src/
│       ├── components/                   one .tsx + one .css per section
│       ├── hooks/                        reveal · count-up · typewriter
│       ├── lib/api.ts                    API client with offline fallback
│       ├── data/  lib/terminal.engine.ts ← AUTO-GENERATED copies, do not edit
│       └── styles/global.css             design tokens + themes
│
├── scripts/sync-shared.mjs               keeps those two copies in sync
│
├── api/Dockerfile                        multi-stage, non-root, healthchecked
├── web/Dockerfile                        builds from the REPO ROOT (see Docker)
├── web/nginx.conf                        static serving + /api proxy
└── docker-compose.yml                    both services, one command
```

### Editing your content

Everything on the site — the summary, all three roles, all five projects, skill
percentages, degrees, the headline numbers — comes from **one file**:

```
api/src/data/portfolio.data.ts
```

Edit it, then run:

```bash
npm run sync
```

That copies the file (and the terminal engine) into `web/src/`, where they act
as the offline fallback. `npm run build` runs the sync automatically.

> The two files under `web/src/data/` and `web/src/lib/terminal.engine.ts` carry
> an `AUTO-GENERATED` banner. Changes made there are overwritten on the next
> sync — always edit the copies under `api/`.

---

## The terminal

The centrepiece. `web/src/components/Terminal.tsx` is the UI;
`api/src/modules/terminal/terminal.engine.ts` is the brain.

Commands: `help` `whoami` `experience` `projects` `skills` `stack` `education`
`contact` `ls` `cat` `goto` `open` `neofetch` `ps` `uptime` `date` `echo` `man`
`clear` `sudo` `scan` `matrix` `theme` `banner` — plus a few that aren't on the
list (`coffee`, `sudo cat .secrets`, and the Konami code anywhere on the page).

It behaves like a shell: **Tab** completes commands *and* their arguments,
**↑/↓** walks history, **Ctrl+L** clears, **Ctrl+C** cancels. Unknown commands
get a Levenshtein "did you mean" suggestion.

Some commands reach out of the terminal and drive the page — `theme toxic`
recolours the entire site (and the background canvas) and remembers it,
`goto projects` scrolls, `matrix` takes over the screen, `open github` opens a
tab. That wiring is `handleAction` in `web/src/App.tsx`.

### Adding a command

One place, one object:

```ts
// api/src/modules/terminal/terminal.engine.ts
export const registry: CommandSpec[] = [
  // ...
  {
    name: 'certs',
    summary: 'Certifications I am working on',
    usage: 'certs',
    group: 'info',
    run: () => [blank(), accent('  Security+ — in progress'), blank()],
  },
];
```

Then `npm run sync`. It shows up in `help`, in Tab-completion, and in `man`
automatically.

---

## Why it still works with the API switched off

`web/src/lib/api.ts` wraps every call. If the API is unreachable — not deployed
yet, cold-starting on a free tier, or you just opened `dist/index.html` — the
site falls back to the bundled copy of the same data, and the terminal falls
back to running the identical engine in the browser. The status light in the
terminal's title bar and in the footer tells you which mode you're in
(`api: connected` vs `api: local mode`).

Practically: **you can deploy the front end alone and the site is 100% complete.**
The API makes it live, not functional.

---

## API reference

| Method | Endpoint                 | Purpose                                     |
| ------ | ------------------------ | ------------------------------------------- |
| GET    | `/api/profile`           | Name, headline, summary, links              |
| GET    | `/api/profile/stats`     | The four animated headline numbers          |
| GET    | `/api/profile/expertise` | Expertise areas and their technologies      |
| GET    | `/api/experience`        | All roles                                   |
| GET    | `/api/experience/:id`    | One role                                    |
| GET    | `/api/projects`          | All projects                                |
| GET    | `/api/projects/:id`      | One project                                 |
| GET    | `/api/skills`            | Skill groups with levels                    |
| GET    | `/api/education`         | Degrees and honours                         |
| POST   | `/api/terminal/exec`     | **Run a command** — `{ "command": "..." }`  |
| GET    | `/api/terminal/complete` | Tab-completion candidates                   |
| GET    | `/api/terminal/commands` | Command manifest                            |
| GET    | `/api/terminal/banner`   | ASCII welcome banner                        |
| GET    | `/api/stats`             | Visits, uptime, most-run commands           |
| POST   | `/api/stats/visit`       | Register a page view                        |
| GET    | `/api/health`            | Liveness probe                              |

Swagger UI with try-it-out: **http://localhost:3000/api/docs**

Notes: requests are capped at 60/min per IP (`ThrottlerModule`); the DTO rejects
commands over 200 characters and any unknown body field; visit fingerprints are
a SHA-256 of IP + user-agent truncated to 16 chars, so nothing identifying is
stored.

---

## Docker

```bash
docker compose up --build       # build and run
docker compose up -d            # detached
docker compose logs -f api      # follow the API
docker compose ps               # health status
docker compose down             # stop and remove
```

Two services on a private bridge network:

```
              :8080                    :3000
  browser ──▶ portfolio-web ──▶ portfolio-api
              nginx + static       node dist/main
                  │
                  └── /api/*  proxied to api:3000
```

The browser only ever hits `:8080`. nginx serves the static build and forwards
`/api` to the API container, which means the front end is same-origin — no CORS,
no `VITE_API_URL` to set. `:3000` is published as well, purely so you can open
Swagger directly and prove the API is a real service; delete that `ports:` block
in `docker-compose.yml` to keep it internal.

**Images.** Both are multi-stage. The API ends at ~213 MB: a builder stage
compiles TypeScript, a separate stage installs production dependencies only, and
the runtime stage copies just `dist/` and those deps — the Nest CLI and
TypeScript never reach the final image. It runs as the unprivileged `node` user
under `dumb-init` (so `SIGTERM` reaches node and `docker compose down` is
immediate rather than waiting out the kill timeout). The web image ends at
~48 MB: a Node builder produces `dist/`, and only those files land in an nginx
image. Both declare `HEALTHCHECK`s, and `web` waits for `api` to report healthy
before starting.

**The web image builds from the repository root, not from `web/`.** That is
deliberate — the build runs `scripts/sync-shared.mjs` itself, regenerating
`web/src/data/` and `web/src/lib/terminal.engine.ts` from the API sources. An
image therefore cannot ship stale content because someone forgot `npm run sync`.

**Pointing at an API on another host:**

```bash
docker build -f web/Dockerfile --build-arg VITE_API_URL=https://api.example.com -t portfolio-web .
```

Vite inlines env vars at build time, so this is a build argument, not a runtime
one — changing it means rebuilding the image.

### Two details worth knowing

**`TRUST_PROXY`.** Behind nginx every request reaches the API from the proxy's
address. Without `app.set('trust proxy', 1)` the visitor counter would see a
single visitor forever and the rate limiter would throttle all clients against
one shared bucket. It is on by default; set `TRUST_PROXY=false` only if you
expose the API directly to the internet with no proxy in front, since trusting
`X-Forwarded-For` from an untrusted source lets clients spoof their IP.

**nginx `add_header` inheritance.** `add_header` is *not* additive across
levels: any `location` that declares one silently discards every `add_header`
inherited from the server block. `web/nginx.conf` works around this by using
`expires` (a different directive, which does not break inheritance) where only
caching is needed, and restating the security headers in the one location that
genuinely needs its own. Worth remembering before adding a new `location`.

---

## Deploying

The two halves deploy independently. The Docker setup above is also the simplest
production deployment: one `docker compose up -d` on any VPS puts the whole
thing behind nginx on port 8080.

### Front end (Netlify or Vercel — config is in the repo)

Both `netlify.toml` and `vercel.json` are committed and ready. Each host ignores
the other's file, so you can pick either (or switch) with no changes:

1. Import `OmidDeldar/portfolio` on [Netlify](https://app.netlify.com/start) or
   [Vercel](https://vercel.com/new).
2. Accept the detected settings — the config file supplies them.
3. Deploy.

Both are configured to build **from the repository root**, not `web/`, so the
build runs `scripts/sync-shared.mjs` itself and a deploy can never ship stale
content. They also reproduce the security and caching headers from
`web/nginx.conf`, so the hosted site behaves like the Docker one.

Manually, the build is:

```bash
node scripts/sync-shared.mjs && npm ci --prefix web && npm run build --prefix web
# → web/dist
```

`VITE_API_URL` is deliberately unset, so the site runs in local mode: fully
complete, just not live. When you have an API host, set it as an environment
variable **and** uncomment the `/api/*` proxy block in `netlify.toml` (it must
stay above the SPA fallback, or `/api` gets swallowed by `index.html`).

### GitHub Pages

Works, but it's the weakest option here: Pages cannot proxy, so adding the API
later means pointing `VITE_API_URL` at another domain and configuring
`CORS_ORIGINS` on the API. Netlify and Vercel can proxy, which keeps the front
end same-origin and makes that upgrade a config line rather than a rework.

### API (Render / Railway / Fly / any VPS)

```bash
cd api && npm install && npm run build && npm run start:prod
```

- Build command: `npm install && npm run build`
- Start command: `node dist/main`
- Environment:
  - `PORT` — usually injected by the host
  - `CORS_ORIGINS` — **required in production**, comma-separated, e.g.
    `https://omiddeldar.dev,https://www.omiddeldar.dev`

Without `CORS_ORIGINS` the API only accepts the localhost dev origins, so the
deployed site would silently fall into local mode.

---

## Customising the look

All colour and type lives in `web/src/styles/global.css` under `:root`. The four
themes (`violet`, `toxic`, `amber`, `ice`) are each four lines below it, and the
`theme` terminal command just flips `data-theme` on `<html>`.

To change the primary colour everywhere — text, borders, glows, the background
canvas, the matrix rain — edit `--accent`, `--accent-soft`, `--accent-deep` and
`--accent-rgb` in one block.

---

## Accessibility & performance

`prefers-reduced-motion` is honoured throughout: the boot screen is skipped, the
canvas draws a single static frame, counters jump to their values, and reveals
render immediately. Skill bars are `role="meter"`, the timeline toggles use
`aria-expanded`/`aria-controls`, and the terminal input is labelled. Production
bundle is ~206 KB (66 KB gzipped) with no runtime dependencies beyond React.

---

## Scripts

| Command              | Does                                          |
| -------------------- | --------------------------------------------- |
| `npm run install:all`| Install both halves                           |
| `npm run dev`        | Run API + web together                        |
| `npm run build`      | Sync shared files, build both                 |
| `npm run sync`       | Copy shared data/engine into `web/src`        |
| `npm run typecheck`  | `tsc --noEmit` across both                    |
| `npm run preview`    | Serve the built front end                     |
| `npm run docker`     | `docker compose up --build`                   |
| `npm run docker:down`| `docker compose down`                         |

---

MIT © Omid Deldar
