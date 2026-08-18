'use strict';

/**
 * Deploy local fácil — um comando:
 *   npm run facil
 *
 * Faz: .env → install (se preciso) → migrate → sobe o servidor.
 */

const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const PORT = String(process.env.PORT || '8080');

function log(msg) {
  console.log(msg);
}

function run(cmd, args, opts) {
  const r = spawnSync(cmd, args, {
    cwd: ROOT,
    env: process.env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...opts
  });
  if (r.status !== 0) {
    process.exit(r.status || 1);
  }
}

function ensureEnv() {
  const envPath = path.join(ROOT, '.env');
  const example = path.join(ROOT, '.env.example');
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(example)) {
      fs.copyFileSync(example, envPath);
      log('✓ .env criado a partir de .env.example');
    } else {
      fs.writeFileSync(
        envPath,
        ['ADMIN_USER=admin', 'RESEARCH_PASS=test123', 'PORT=8080', 'SITE_URL=http://localhost:8080', ''].join('\n')
      );
      log('✓ .env mínimo criado');
    }
  } else {
    log('✓ .env ok');
  }
}

function ensureDeps() {
  if (!fs.existsSync(path.join(ROOT, 'node_modules'))) {
    log('→ npm install…');
    run('npm', ['install']);
  } else {
    log('✓ node_modules ok');
  }
}

function migrate() {
  log('→ db:migrate…');
  run('npm', ['run', 'db:migrate']);
}

function startServer() {
  process.env.PORT = PORT;
  log('');
  log('══════════════════════════════════════');
  log('  Deploy local pronto');
  log('  Site:  http://localhost:' + PORT);
  log('  Admin: http://localhost:' + PORT + '/login.html');
  log('  Parar: Ctrl+C');
  log('══════════════════════════════════════');
  log('');

  const child = spawn('node', ['server/index.js'], {
    cwd: ROOT,
    env: process.env,
    stdio: 'inherit'
  });

  child.on('exit', (code) => process.exit(code || 0));
}

log('');
log('BudGanja — deploy fácil (local, sem Netlify)');
log('');
ensureEnv();
ensureDeps();
migrate();
startServer();
