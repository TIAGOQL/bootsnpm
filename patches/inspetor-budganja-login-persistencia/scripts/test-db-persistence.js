'use strict';

/**
 * Testes de persistência SQL — usa prefixo __test__ e reverte alterações no final.
 * Não altera conteúdo real do site (tagline, sobre, sorteio público, perfis).
 */

require('../lib/load-env.js');
const { ROOT } = require('../lib/paths.js');
const { createSqlStore } = require('../lib/store-sql.js');
const { getDbClient, initDatabaseOnce } = require('../lib/db/client.js');
const { ensureContentMigrated, contentTableCounts } = require('../lib/db/content-repos.js');
const { migrateFromJsonIfEmpty } = require('../lib/db/migrate-from-json.js');
const { createPost, deletePost } = require('../lib/posts-service.js');
const { createSession, destroySession, getSession } = require('../lib/auth-service.js');
const { saveOAuthState, consumeOAuthState } = require('../lib/oauth-state-service.js');
const { createUserSession, getUserSession, destroyUserSession } = require('../lib/user-auth-service.js');

const TEST_PREFIX = '__test_db__';
let passed = 0;
let failed = 0;

function assert(name, condition, detail) {
  if (condition) {
    passed += 1;
    console.log('  OK  ' + name);
  } else {
    failed += 1;
    console.error(' FAIL ' + name + (detail ? ' — ' + detail : ''));
  }
}

async function queryOne(db, sql, args) {
  const r = await db.execute({ sql, args: args || [] });
  return r.rows[0] || null;
}

async function runTests() {
  console.log('=== Testes de persistência (modo isolado) ===\n');

  await initDatabaseOnce(ROOT);
  const db = getDbClient(ROOT);
  await migrateFromJsonIfEmpty(db, ROOT);
  await ensureContentMigrated(db, ROOT);

  const counts = await contentTableCounts(db);
  assert('Tabela posts', counts.posts >= 1);
  assert('Tabela pages', counts.pages >= 1);
  assert('Tabela users', counts.users >= 0);

  const store = await createSqlStore(ROOT);
  const testSlug = TEST_PREFIX + Date.now();
  let adminToken = null;
  let oauthState = null;

  try {
    const postResult = await createPost(store, {
      title: TEST_PREFIX + ' post',
      excerpt: 'Teste automático',
      content: '## Teste\n\nConteúdo temporário.',
      category: 'pesquisa',
      published: false
    });
    assert('createPost', postResult.ok === true);
    const postRow = await queryOne(db, 'SELECT slug FROM posts WHERE slug = ?', [postResult.slug]);
    assert('posts table', postRow && postRow.slug === postResult.slug);

    adminToken = await createSession(store, TEST_PREFIX + 'admin');
    const adminSess = await queryOne(db, 'SELECT username FROM admin_sessions WHERE token = ?', [adminToken]);
    assert('admin_sessions', adminSess && String(adminSess.username).startsWith(TEST_PREFIX));

    const adminKeep = await createSession(store, TEST_PREFIX + 'keep');
    await getSession(store, 'budganja_session=token-inexistente');
    const keepAdmin = await queryOne(db, 'SELECT token FROM admin_sessions WHERE token = ?', [adminKeep]);
    assert('admin session sobrevive get miss', !!keepAdmin);
    await destroySession(store, adminKeep);

    const testUserId = TEST_PREFIX + 'user-' + Date.now();
    await db.execute({
      sql: "INSERT INTO users (id, email, name, picture, provider, profile_json, created_at, updated_at) VALUES (?, ?, 'Teste', '', 'local', '{}', ?, ?)",
      args: [testUserId, testUserId + '@example.test', new Date().toISOString(), new Date().toISOString()]
    });
    const userTokenA = await createUserSession(store, testUserId);
    const userTokenB = await createUserSession(store, testUserId);
    await getUserSession(store, 'budganja_user=token-inexistente');
    await getUserSession(store, 'budganja_user=' + userTokenA);
    const rowA = await queryOne(db, 'SELECT token FROM user_sessions WHERE token = ?', [userTokenA]);
    const rowB = await queryOne(db, 'SELECT token FROM user_sessions WHERE token = ?', [userTokenB]);
    assert('user_sessions A persiste', !!rowA);
    assert('user_sessions B não apagada por get paralelo', !!rowB);
    const me = await getUserSession(store, 'budganja_user=' + userTokenA);
    assert('getUserSession lê cookie', me && me.userId === testUserId);
    await destroyUserSession(store, userTokenA);
    await destroyUserSession(store, userTokenB);
    await db.execute({ sql: 'DELETE FROM users WHERE id = ?', args: [testUserId] });

    oauthState = TEST_PREFIX + 'oauth-' + Date.now();
    await saveOAuthState(store, oauthState, { returnTo: '/perfil.html' });
    const oauthRow = await queryOne(db, 'SELECT state FROM oauth_states WHERE state = ?', [oauthState]);
    assert('oauth_states', oauthRow && oauthRow.state === oauthState);

    await deletePost(store, postResult.slug);
    const gone = await queryOne(db, 'SELECT slug FROM posts WHERE slug = ?', [postResult.slug]);
    assert('deletePost', !gone);
  } finally {
    if (adminToken) await destroySession(store, adminToken);
    if (oauthState) await consumeOAuthState(store, oauthState);
    await db.execute('DELETE FROM admin_sessions WHERE username LIKE ?', [TEST_PREFIX + '%']);
    await db.execute('DELETE FROM oauth_states WHERE state LIKE ?', [TEST_PREFIX + '%']);
    await db.execute('DELETE FROM user_sessions WHERE user_id LIKE ?', [TEST_PREFIX + '%']);
    await db.execute('DELETE FROM users WHERE id LIKE ?', [TEST_PREFIX + '%']);
    await db.execute('DELETE FROM posts WHERE slug LIKE ?', [TEST_PREFIX + '%']);
  }

  console.log('\n=== Resultado: ' + passed + ' OK, ' + failed + ' falhas ===');
  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
