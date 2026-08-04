# AGENTS.md

## Cursor Cloud specific instructions

**Painel REM** is a static front-end site (HTML/CSS/JS) for an N=1 endocannabinoid relaxation research panel. No database, backend API, Docker, or npm runtime dependencies are required.

### Commands

See root `README.md` and `package.json`. Quick reference:

| Task | Command |
| --- | --- |
| Install | `npm install` (no packages today; keeps lock/node_modules consistent if deps are added) |
| Test / surface check | `npm test` (file + panel string checks) |
| JS syntax (CI) | `node --check assets/js/diario-rem.js` (and `cultivo-ideias.js`, `musica-rem.js`) |
| Dev server | `npm start` → http://localhost:3000 (`npx serve`) |

CI uses **Node 20** (`.github/workflows/ci.yml`). Any recent Node that can run `npx serve` is fine.

### Gotchas

- `npm start` pulls `serve` via `npx --yes`; first start needs network.
- Client data for Diário REM / cultivo lives in **browser `localStorage`** only — not on the server.
- GitHub Pages deploy is via Actions on `main` → branch `gh-pages` (`.github/workflows/pages.yml`). One-time: Settings → Pages → Source: **Deploy from a branch** → `gh-pages` / root (see README).

### Hello-world check

With `npm start` running: open http://localhost:3000 → **Diário REM** → mark modules / scores → **Salvar** → **Exportar JSON**. That exercises the core N=1 diary flow.
