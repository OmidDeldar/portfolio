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
proxies `/api/*` through to NestJS, so there is nothing to configure and no CORS
to think about.

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
└── scripts/sync-shared.mjs               keeps those two copies in sync
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

## Deploying

The two halves deploy independently.

### Front end (Vercel / Netlify / GitHub Pages / Cloudflare Pages)

```bash
cd web && npm run build      # → web/dist
```

Publish `web/dist`. Set one environment variable **only if** you deployed the
API somewhere:

```
VITE_API_URL=https://your-api-host.com
```

Leave it unset and the site runs in local mode — still complete, just not live.

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

---

MIT © Omid Deldar
