const crypto = require('crypto');
const { parseCookies, cookieHeader, getAdminUser, getAdminPass, isSecureRequest } = require('./utils.js');
const { normalizeAdminSessionInput } = require('./persistence-naming.js');

const SESSION_COOKIE = 'budganja_session';
const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;

async function loadSessionsMap(store) {
  const raw = await store.getSessions();
  const map = new Map();
  const now = Date.now();
  for (const [token, session] of Object.entries(raw || {})) {
    const normalized = normalizeAdminSessionInput(token, session, now);
    if (normalized.token && normalized.username && normalized.expiresAt > now) {
      map.set(normalized.token, normalized);
    }
  }
  return map;
}

async function persistSessions(store, map) {
  const obj = {};
  for (const [token, session] of map.entries()) {
    const normalized = normalizeAdminSessionInput(token, session);
    if (!normalized.token || !normalized.username) continue;
    obj[normalized.token] = {
      username: normalized.username,
      expiresAt: normalized.expiresAt
    };
  }
  await store.setSessions(obj);
}

async function createSession(store, username) {
  const token = crypto.randomBytes(32).toString('hex');
  const session = { username, expiresAt: Date.now() + SESSION_MAX_AGE_MS };
  if (typeof store.upsertAdminSession === 'function') {
    await store.upsertAdminSession(token, session);
    return token;
  }
  const sessions = await loadSessionsMap(store);
  const now = Date.now();
  for (const [existing, row] of sessions.entries()) {
    if (row.expiresAt <= now) sessions.delete(existing);
  }
  sessions.set(token, session);
  await persistSessions(store, sessions);
  return token;
}

async function destroySession(store, token) {
  if (!token) return;
  if (typeof store.deleteAdminSession === 'function') {
    await store.deleteAdminSession(token);
    return;
  }
  const sessions = await loadSessionsMap(store);
  sessions.delete(token);
  await persistSessions(store, sessions);
}

async function getSession(store, cookieHeaderValue) {
  const cookies = parseCookies(cookieHeaderValue);
  const token = cookies[SESSION_COOKIE];
  if (!token) return null;
  let session = null;
  if (typeof store.getAdminSessionByToken === 'function') {
    session = await store.getAdminSessionByToken(token);
  } else {
    const sessions = await loadSessionsMap(store);
    session = sessions.get(token) || null;
  }
  if (!session || session.expiresAt <= Date.now()) {
    if (session && typeof store.deleteAdminSession === 'function') {
      await store.deleteAdminSession(token);
    }
    return null;
  }
  return { token, username: session.username };
}

function setSessionCookie(headers, token) {
  const maxAge = Math.floor(SESSION_MAX_AGE_MS / 1000);
  const secure = isSecureRequest(headers);
  return cookieHeader(SESSION_COOKIE, token, maxAge, secure, 'Lax');
}

function clearSessionCookie(headers) {
  const secure = isSecureRequest(headers);
  return cookieHeader(SESSION_COOKIE, '', 0, secure, 'Lax');
}

function timingSafeEqual(a, b) {
  const left = Buffer.from(String(a), 'utf8');
  const right = Buffer.from(String(b), 'utf8');
  if (left.length !== right.length) {
    crypto.timingSafeEqual(left, left);
    return false;
  }
  return crypto.timingSafeEqual(left, right);
}

function checkCredentials(username, password) {
  return timingSafeEqual(username, getAdminUser()) && timingSafeEqual(password, getAdminPass());
}

module.exports = {
  SESSION_COOKIE,
  getSession,
  createSession,
  destroySession,
  setSessionCookie,
  clearSessionCookie,
  checkCredentials
};
