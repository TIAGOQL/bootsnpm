'use strict';

const {
  loadPosts,
  savePosts,
  loadPages,
  savePages,
  loadSite,
  saveSite,
  loadGuiaCultivo,
  saveGuiaCultivo,
  loadSorteioConfig,
  saveSorteioConfig,
  loadSorteios,
  saveSorteios,
  loadSorteioAlertSubscribers,
  getSorteioAlertSubscriberByUserId,
  upsertSorteioAlertSubscriber,
  deactivateSorteioAlertSubscriber,
  loadCalculators,
  loadYoutubeFeed,
  saveYoutubeFeed,
  loadSeriesOptions,
  upsertSeriesOption,
  deleteSeriesOption,
  ensureContentMigrated
} = require('./db/content-repos.js');
const {
  countCultivoGrows,
  loadCultivoState,
  saveCultivoState
} = require('./db/cultivo-repos.js');
const {
  insertCultivoSubmission,
  getCultivoSubmissionById,
  findActiveSubmissionForGrow,
  listCultivoSubmissionsByUser,
  listCultivoSubmissionsAdmin,
  updateCultivoSubmission
} = require('./db/cultivo-submissions-repos.js');
const {
  insertCommunityPost,
  findCommunityPostByEntryPhoto,
  getCommunityPostById,
  listCommunityFeed,
  listCommunityPostsByUser,
  listCommunityPostsAdmin,
  setCommunityPostStatus,
  insertCommunityComment,
  listCommunityComments,
  getCommunityCommentById,
  setCommunityCommentStatus
} = require('./db/community-repos.js');
const {
  listUsersAdmin,
  getUserByIdAdmin,
  setUserAdminFlag,
  deleteUserById,
  countAdminUsers,
  listUserGrowsSummary,
  listUserSubmissionsSummary,
  listSorteioEntriesByEmail,
  getSorteioAlertForUser
} = require('./db/users-repos.js');
const { initDatabaseOnce } = require('./db/client.js');
const { migrateFromJsonIfEmpty } = require('./db/migrate-from-json.js');
const {
  normalizeUserInput,
  normalizeUserOutput,
  normalizeAdminSessionInput,
  normalizeUserSessionInput,
  normalizeOAuthStateInput
} = require('./persistence-naming.js');

function rowToUser(row) {
  return normalizeUserOutput({
    id: row.id,
    google_id: row.google_id || '',
    email: row.email,
    email_verified_at: row.email_verified_at || null,
    name: row.name,
    username: row.username || '',
    birth_date: row.birth_date || '',
    picture: row.picture,
    provider: row.provider,
    local_password_hash: row.local_password_hash || '',
    local_password_updated_at: row.local_password_updated_at || null,
    reset_token_hash: row.reset_token_hash || '',
    reset_token_expires_at: row.reset_token_expires_at || null,
    registration_ip: row.registration_ip || '',
    last_login_at: row.last_login_at || null,
    last_login_ip: row.last_login_ip || '',
    account_status: row.account_status || 'pending_profile',
    onboarding_stage: row.onboarding_stage || 'initial',
    activity_log_json: row.activity_log_json || '[]',
    is_admin: !!(row.is_admin),
    created_at: row.created_at,
    updated_at: row.updated_at,
    profile_json: row.profile_json || '{}'
  });
}

async function ensureUserAuthColumns(db) {
  const info = await db.execute("PRAGMA table_info('users')");
  const cols = new Set((info.rows || []).map((row) => String(row.name || '').toLowerCase()));
  const add = async (name, sqlType) => {
    if (cols.has(name.toLowerCase())) return;
    await db.execute('ALTER TABLE users ADD COLUMN ' + name + ' ' + sqlType);
  };
  await add('google_id', "TEXT NOT NULL DEFAULT ''");
  await add('email_verified_at', 'TEXT');
  await add('username', "TEXT NOT NULL DEFAULT ''");
  await add('birth_date', "TEXT NOT NULL DEFAULT ''");
  await add('local_password_hash', "TEXT NOT NULL DEFAULT ''");
  await add('local_password_updated_at', 'TEXT');
  await add('reset_token_hash', "TEXT NOT NULL DEFAULT ''");
  await add('reset_token_expires_at', 'TEXT');
  await add('registration_ip', "TEXT NOT NULL DEFAULT ''");
  await add('last_login_at', 'TEXT');
  await add('last_login_ip', "TEXT NOT NULL DEFAULT ''");
  await add('account_status', "TEXT NOT NULL DEFAULT 'pending_profile'");
  await add('onboarding_stage', "TEXT NOT NULL DEFAULT 'initial'");
  await add('activity_log_json', "TEXT NOT NULL DEFAULT '[]'");
  try {
    await db.execute('CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)');
    await db.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_unique ON users(username) WHERE username <> ''");
  } catch (e) {
    // Keep startup resilient for legacy or partially migrated local databases.
  }
}

async function replaceUserSessions(db, sessions) {
  await db.execute('DELETE FROM user_sessions');
  for (const [token, session] of Object.entries(sessions || {})) {
    const normalized = normalizeUserSessionInput(token, session);
    if (!normalized.userId || !normalized.token) continue;
    await db.execute({
      sql: 'INSERT INTO user_sessions (token, user_id, expires_at) VALUES (?, ?, ?)',
      args: [normalized.token, normalized.userId, normalized.expiresAt]
    });
  }
}

async function replaceAdminSessions(db, sessions) {
  await db.execute('DELETE FROM admin_sessions');
  for (const [token, session] of Object.entries(sessions || {})) {
    const normalized = normalizeAdminSessionInput(token, session);
    if (!normalized.username || !normalized.token) continue;
    await db.execute({
      sql: 'INSERT INTO admin_sessions (token, username, expires_at) VALUES (?, ?, ?)',
      args: [normalized.token, normalized.username, normalized.expiresAt]
    });
  }
}

async function replaceOAuthStates(db, states) {
  await db.execute('DELETE FROM oauth_states');
  for (const [state, entry] of Object.entries(states || {})) {
    const normalized = normalizeOAuthStateInput(state, entry);
    if (!normalized.state) continue;
    await db.execute({
      sql: 'INSERT INTO oauth_states (state, return_to, created_at, expires_at) VALUES (?, ?, ?, ?)',
      args: [
        normalized.state,
        normalized.returnTo,
        normalized.createdAt,
        normalized.expiresAt
      ]
    });
  }
}

async function getUserSessionRow(db, token) {
  const key = String(token || '');
  if (!key) return null;
  const result = await db.execute({
    sql: 'SELECT token, user_id, expires_at FROM user_sessions WHERE token = ?',
    args: [key]
  });
  const mapped = sessionsFromUserRows(result.rows);
  return mapped[key] || null;
}

async function upsertUserSessionRow(db, token, session) {
  const normalized = normalizeUserSessionInput(token, session);
  if (!normalized.token || !normalized.userId) return;
  await db.execute({
    sql:
      'INSERT INTO user_sessions (token, user_id, expires_at) VALUES (?, ?, ?) ' +
      'ON CONFLICT(token) DO UPDATE SET user_id = excluded.user_id, expires_at = excluded.expires_at',
    args: [normalized.token, normalized.userId, normalized.expiresAt]
  });
}

async function deleteUserSessionRow(db, token) {
  const key = String(token || '');
  if (!key) return;
  await db.execute({ sql: 'DELETE FROM user_sessions WHERE token = ?', args: [key] });
}

async function getAdminSessionRow(db, token) {
  const key = String(token || '');
  if (!key) return null;
  const result = await db.execute({
    sql: 'SELECT token, username, expires_at FROM admin_sessions WHERE token = ?',
    args: [key]
  });
  const mapped = sessionsFromAdminRows(result.rows);
  return mapped[key] || null;
}

async function upsertAdminSessionRow(db, token, session) {
  const normalized = normalizeAdminSessionInput(token, session);
  if (!normalized.token || !normalized.username) return;
  await db.execute({
    sql:
      'INSERT INTO admin_sessions (token, username, expires_at) VALUES (?, ?, ?) ' +
      'ON CONFLICT(token) DO UPDATE SET username = excluded.username, expires_at = excluded.expires_at',
    args: [normalized.token, normalized.username, normalized.expiresAt]
  });
}

async function deleteAdminSessionRow(db, token) {
  const key = String(token || '');
  if (!key) return;
  await db.execute({ sql: 'DELETE FROM admin_sessions WHERE token = ?', args: [key] });
}

async function getOAuthStateRow(db, state) {
  const key = String(state || '');
  if (!key) return null;
  const result = await db.execute({
    sql: 'SELECT state, return_to, created_at, expires_at FROM oauth_states WHERE state = ?',
    args: [key]
  });
  const mapped = statesFromRows(result.rows);
  return mapped[key] || null;
}

async function upsertOAuthStateRow(db, state, entry) {
  const normalized = normalizeOAuthStateInput(state, entry);
  if (!normalized.state) return;
  await db.execute({
    sql:
      'INSERT INTO oauth_states (state, return_to, created_at, expires_at) VALUES (?, ?, ?, ?) ' +
      'ON CONFLICT(state) DO UPDATE SET return_to = excluded.return_to, created_at = excluded.created_at, expires_at = excluded.expires_at',
    args: [normalized.state, normalized.returnTo, normalized.createdAt, normalized.expiresAt]
  });
}

async function deleteOAuthStateRow(db, state) {
  const key = String(state || '');
  if (!key) return;
  await db.execute({ sql: 'DELETE FROM oauth_states WHERE state = ?', args: [key] });
}

function sessionsFromUserRows(rows) {
  const out = {};
  for (const row of rows) {
    const normalized = normalizeUserSessionInput(row.token, {
      user_id: row.user_id,
      expires_at: Number(row.expires_at)
    });
    if (!normalized.token || !normalized.userId) continue;
    out[normalized.token] = { userId: normalized.userId, expiresAt: normalized.expiresAt };
  }
  return out;
}

function sessionsFromAdminRows(rows) {
  const out = {};
  for (const row of rows) {
    const normalized = normalizeAdminSessionInput(row.token, {
      username: row.username,
      expires_at: Number(row.expires_at)
    });
    if (!normalized.token || !normalized.username) continue;
    out[normalized.token] = { username: normalized.username, expiresAt: normalized.expiresAt };
  }
  return out;
}

function statesFromRows(rows) {
  const out = {};
  for (const row of rows) {
    const normalized = normalizeOAuthStateInput(row.state, {
      return_to: row.return_to,
      created_at: Number(row.created_at),
      expires_at: Number(row.expires_at)
    });
    if (!normalized.state) continue;
    out[normalized.state] = {
      returnTo: normalized.returnTo,
      createdAt: normalized.createdAt,
      expiresAt: normalized.expiresAt
    };
  }
  return out;
}

async function createSqlStore(root) {
  const db = await initDatabaseOnce(root);
  await ensureUserAuthColumns(db);
  await migrateFromJsonIfEmpty(db, root);
  await ensureContentMigrated(db, root);

  return {
    backend: 'sql',

    async getPosts() {
      return loadPosts(db);
    },
    async setPosts(posts) {
      await savePosts(db, posts);
    },
    async getPages() {
      return loadPages(db);
    },
    async setPages(pages) {
      await savePages(db, pages);
    },
    async getSite() {
      return loadSite(db);
    },
    async setSite(site) {
      await saveSite(db, site);
    },
    async getCalculators() {
      return loadCalculators(db);
    },
    async getSessions() {
      const result = await db.execute('SELECT token, username, expires_at FROM admin_sessions');
      return sessionsFromAdminRows(result.rows);
    },
    async setSessions(sessions) {
      await replaceAdminSessions(db, sessions);
    },
    async getUserSessions() {
      const result = await db.execute('SELECT token, user_id, expires_at FROM user_sessions');
      return sessionsFromUserRows(result.rows);
    },
    async setUserSessions(sessions) {
      await replaceUserSessions(db, sessions);
    },
    async getUserSessionByToken(token) {
      return getUserSessionRow(db, token);
    },
    async upsertUserSession(token, session) {
      return upsertUserSessionRow(db, token, session);
    },
    async deleteUserSession(token) {
      return deleteUserSessionRow(db, token);
    },
    async getAdminSessionByToken(token) {
      return getAdminSessionRow(db, token);
    },
    async upsertAdminSession(token, session) {
      return upsertAdminSessionRow(db, token, session);
    },
    async deleteAdminSession(token) {
      return deleteAdminSessionRow(db, token);
    },
    async getOAuthStateByKey(state) {
      return getOAuthStateRow(db, state);
    },
    async upsertOAuthState(state, entry) {
      return upsertOAuthStateRow(db, state, entry);
    },
    async deleteOAuthState(state) {
      return deleteOAuthStateRow(db, state);
    },
    async getUsers() {
      const result = await db.execute(
        'SELECT id, google_id, email, email_verified_at, name, username, birth_date, picture, provider, local_password_hash, local_password_updated_at, reset_token_hash, reset_token_expires_at, registration_ip, last_login_at, last_login_ip, account_status, onboarding_stage, activity_log_json, profile_json, is_admin, created_at, updated_at FROM users'
      );
      const users = {};
      for (const row of result.rows) {
        const user = rowToUser(row);
        users[user.id] = user;
      }
      return users;
    },
    async setUsers(users) {
      for (const user of Object.values(users || {})) {
        const normalized = normalizeUserInput(user, new Date().toISOString());
        if (!normalized.id) continue;
        await db.execute({
          sql: `INSERT INTO users (id, google_id, email, email_verified_at, name, username, birth_date, picture, provider, local_password_hash, local_password_updated_at, reset_token_hash, reset_token_expires_at, registration_ip, last_login_at, last_login_ip, account_status, onboarding_stage, activity_log_json, profile_json, is_admin, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                  google_id = excluded.google_id,
                  email = excluded.email,
                  email_verified_at = excluded.email_verified_at,
                  name = excluded.name,
                  username = excluded.username,
                  birth_date = excluded.birth_date,
                  picture = excluded.picture,
                  provider = excluded.provider,
                  local_password_hash = excluded.local_password_hash,
                  local_password_updated_at = excluded.local_password_updated_at,
                  reset_token_hash = excluded.reset_token_hash,
                  reset_token_expires_at = excluded.reset_token_expires_at,
                  registration_ip = excluded.registration_ip,
                  last_login_at = excluded.last_login_at,
                  last_login_ip = excluded.last_login_ip,
                  account_status = excluded.account_status,
                  onboarding_stage = excluded.onboarding_stage,
                  activity_log_json = excluded.activity_log_json,
                  profile_json = excluded.profile_json,
                  updated_at = excluded.updated_at`,
          args: [
            normalized.id,
            normalized.googleId,
            normalized.email,
            normalized.emailVerifiedAt || null,
            normalized.name,
            normalized.username,
            normalized.birthDate,
            normalized.picture,
            normalized.provider,
            normalized.localPasswordHash,
            normalized.localPasswordUpdatedAt || null,
            normalized.resetTokenHash,
            normalized.resetTokenExpiresAt || null,
            normalized.registrationIp,
            normalized.lastLoginAt || null,
            normalized.lastLoginIp,
            normalized.accountStatus,
            normalized.onboardingStage,
            JSON.stringify(Array.isArray(normalized.activityLog) ? normalized.activityLog : []),
            JSON.stringify(normalized.profile || {}),
            normalized.isAdmin ? 1 : 0,
            normalized.createdAt,
            normalized.updatedAt
          ]
        });
      }
    },
    async getOAuthStates() {
      const result = await db.execute(
        'SELECT state, return_to, created_at, expires_at FROM oauth_states'
      );
      return statesFromRows(result.rows);
    },
    async setOAuthStates(states) {
      await replaceOAuthStates(db, states);
    },
    async getSorteios() {
      return loadSorteios(db);
    },
    async setSorteios(entries) {
      await saveSorteios(db, entries);
    },
    async getSorteioConfig() {
      return loadSorteioConfig(db);
    },
    async setSorteioConfig(config) {
      await saveSorteioConfig(db, config);
    },
    async getSorteioAlertSubscribers() {
      return loadSorteioAlertSubscribers(db);
    },
    async getSorteioAlertSubscriber(userId) {
      return getSorteioAlertSubscriberByUserId(db, userId);
    },
    async subscribeSorteioAlert(subscriber) {
      await upsertSorteioAlertSubscriber(db, subscriber);
    },
    async unsubscribeSorteioAlert(userId) {
      await deactivateSorteioAlertSubscriber(db, userId);
    },
    async getGuiaCultivo() {
      return loadGuiaCultivo(db);
    },
    async setGuiaCultivo(guia) {
      await saveGuiaCultivo(db, guia);
    },
    async getYoutubeFeed() {
      return loadYoutubeFeed(db);
    },
    async setYoutubeFeed(feed) {
      await saveYoutubeFeed(db, feed);
    },
    async countCultivoGrows(userId) {
      return countCultivoGrows(db, userId);
    },
    async getCultivoState(userId) {
      return loadCultivoState(db, userId);
    },
    async setCultivoState(userId, state) {
      return saveCultivoState(db, userId, state);
    },
    async createCultivoSubmission(submission) {
      return insertCultivoSubmission(db, submission);
    },
    async getCultivoSubmissionById(id) {
      return getCultivoSubmissionById(db, id);
    },
    async findActiveCultivoSubmission(userId, growId) {
      return findActiveSubmissionForGrow(db, userId, growId);
    },
    async listCultivoSubmissionsByUser(userId, growId) {
      return listCultivoSubmissionsByUser(db, userId, growId);
    },
    async listCultivoSubmissionsAdmin(status) {
      return listCultivoSubmissionsAdmin(db, status);
    },
    async updateCultivoSubmission(id, patch) {
      return updateCultivoSubmission(db, id, patch);
    },
    async listUsersAdmin(query) {
      return listUsersAdmin(db, query);
    },
    async getUserByIdAdmin(userId) {
      return getUserByIdAdmin(db, userId);
    },
    async setUserAdminFlag(userId, isAdmin) {
      return setUserAdminFlag(db, userId, isAdmin);
    },
    async deleteUser(userId) {
      return deleteUserById(db, userId);
    },
    async countAdminUsers() {
      return countAdminUsers(db);
    },
    async listUserGrowsSummary(userId) {
      return listUserGrowsSummary(db, userId);
    },
    async listUserSubmissionsSummary(userId) {
      return listUserSubmissionsSummary(db, userId);
    },
    async listSorteioEntriesByEmail(email) {
      return listSorteioEntriesByEmail(db, email);
    },
    async getSorteioAlertForUser(userId) {
      return getSorteioAlertForUser(db, userId);
    },
    async getSeriesOptions(category) {
      return loadSeriesOptions(db, category || null);
    },
    async upsertSeriesOption(item) {
      return upsertSeriesOption(db, item);
    },
    async deleteSeriesOption(id) {
      return deleteSeriesOption(db, id);
    },
    async insertCommunityPost(post) {
      return insertCommunityPost(db, post);
    },
    async findCommunityPostByEntryPhoto(entryId, photoUrl) {
      return findCommunityPostByEntryPhoto(db, entryId, photoUrl);
    },
    async getCommunityPostById(id) {
      return getCommunityPostById(db, id);
    },
    async listCommunityFeed(options) {
      return listCommunityFeed(db, options || {});
    },
    async listCommunityPostsByUser(userId) {
      return listCommunityPostsByUser(db, userId);
    },
    async listCommunityPostsAdmin(limit) {
      return listCommunityPostsAdmin(db, limit);
    },
    async setCommunityPostStatus(id, status) {
      return setCommunityPostStatus(db, id, status);
    },
    async insertCommunityComment(comment) {
      return insertCommunityComment(db, comment);
    },
    async listCommunityComments(postId) {
      return listCommunityComments(db, postId);
    },
    async getCommunityCommentById(id) {
      return getCommunityCommentById(db, id);
    },
    async setCommunityCommentStatus(id, status) {
      return setCommunityCommentStatus(db, id, status);
    }
  };
}

module.exports = { createSqlStore };
