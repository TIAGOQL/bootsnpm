# AGENTS.md

## Cursor Cloud specific instructions

This is the [bootstrap-npm-starter](https://github.com/twbs/bootstrap-npm-starter) template: static HTML + Sass + Bootstrap 4. There is no database, API, or Docker dependency.

### Node version (important)

- `node-sass@5` (used by `css-compile`) only has prebuilt binaries for older Node. **Use Node 14** (matches CI’s Node 12/14 matrix).
- Cloud VMs often expose a newer system Node at `/exec-daemon/node`. After `nvm use 14`, ensure nvm’s bin directory is **first** on `PATH`, e.g. `export PATH="$NVM_DIR/versions/node/v14.21.3/bin:$PATH"`, then confirm `node -v` prints `v14.x`.
- If `npm ci` fails during `node-sass` install/postinstall (404 for a binding or node-gyp errors mentioning Node 22+), you are on the wrong Node.

### Commands

See root `README.md` and `package.json` scripts. Quick reference:

| Task | Command |
| --- | --- |
| Install | `npm ci` (or `npm i`) |
| Lint + CSS build (“tests”) | `npm test` |
| Dev (watch Sass + static server) | `npm start` → http://localhost:3000 |
| Server only | `npm run server` |

There is no separate unit/e2e suite; `npm test` runs Stylelint then compiles/prefixes CSS.

### Hello-world check

With `npm start` running, open http://localhost:3000 and click **Toggle example modal**. A Bootstrap modal titled “Success!” confirms CSS + JS are wired correctly.
