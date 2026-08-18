const crypto = require('crypto');
const { parseCookies, cookieHeader, isSecureRequest, isProductionSite, getSiteBaseUrl } = require('./utils.js');
const { sendPasswordResetEmail } = require('./mail-notify.js');
const { normalizeUserSessionInput } = require('./persistence-naming.js');

const USER_SESSION_COOKIE = 'budganja_user';
const OAUTH_STATE_COOKIE = 'budganja_oauth_state';
const USER_SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const OAUTH_STATE_MAX_AGE_MS = 10 * 60 * 1000;
const PASSWORD_RESET_MAX_AGE_MS = 60 * 60 * 1000;
const LOCAL_PASSWORD_MIN_LEN = 8;

const MIN_USER_AGE = 18;

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function sanitizeUsername(raw) {
  const base = String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '')
    .replace(/[._-]{2,}/g, '-')
    .replace(/^[._-]+|[._-]+$/g, '');
  if (base.length < 3 || base.length > 32) return '';
  return base;
}

function slugFromText(raw) {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function deriveUsernameCandidate(userLike) {
  const fromUsername = sanitizeUsername(userLike && userLike.username);
  if (fromUsername) return fromUsername;
  const emailLocal = String(userLike && userLike.email || '').split('@')[0];
  const fromEmail = sanitizeUsername(emailLocal);
  if (fromEmail) return fromEmail;
  const fromName = sanitizeUsername(slugFromText(userLike && userLike.name));
  if (fromName) return fromName;
  return '';
}

function ensureUniqueUsername(users, preferred, currentUserId) {
  const taken = new Set(
    Object.values(users || {})
      .filter((u) => !currentUserId || u.id !== currentUserId)
      .map((u) => sanitizeUsername(u && u.username))
      .filter(Boolean)
  );
  const base = sanitizeUsername(preferred) || 'user';
  if (!taken.has(base)) return base;
  for (let i = 2; i <= 9999; i += 1) {
    const candidate = sanitizeUsername(base + '-' + i);
    if (candidate && !taken.has(candidate)) return candidate;
  }
  return sanitizeUsername(base + '-' + Date.now().toString(36).slice(-4)) || ('user-' + Date.now().toString(36).slice(-6));
}

function sanitizeBirthDate(raw) {
  const text = String(raw || '').trim();
  if (!text) return '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return '';
  const d = new Date(text + 'T00:00:00.000Z');
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function calculateAgeFromBirthDate(birthDate, now) {
  const bd = sanitizeBirthDate(birthDate);
  if (!bd) return null;
  const ref = now ? new Date(now) : new Date();
  if (isNaN(ref.getTime())) return null;
  const b = new Date(bd + 'T00:00:00.000Z');
  let age = ref.getUTCFullYear() - b.getUTCFullYear();
  const monthDiff = ref.getUTCMonth() - b.getUTCMonth();
  const dayDiff = ref.getUTCDate() - b.getUTCDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age -= 1;
  if (age < 0 || age > 120) return null;
  return age;
}

function birthDateFromAge(rawAge, now) {
  const age = sanitizeAge(rawAge);
  if (age == null) return '';
  const ref = now ? new Date(now) : new Date();
  if (isNaN(ref.getTime())) return '';
  const year = ref.getUTCFullYear() - age;
  const month = String(ref.getUTCMonth() + 1).padStart(2, '0');
  const day = String(ref.getUTCDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

function deriveOnboardingStage(profile, user) {
  const displayNameOk = String(profile && profile.displayName || '').trim().length >= 2;
  const usernameOk = !!sanitizeUsername(user && user.username);
  let age = calculateAgeFromBirthDate(user && user.birthDate);
  if (age == null) age = sanitizeAge(profile && profile.age);
  if (displayNameOk && usernameOk && age != null && age >= MIN_USER_AGE) return 'complete';
  if (displayNameOk || usernameOk) return 'profile_pending';
  return 'initial';
}

function deriveAccountStatus(onboardingStage, fallback) {
  const allowed = new Set(['active', 'pending_profile', 'suspended', 'disabled']);
  const current = String(fallback || '').trim();
  if (allowed.has(current) && (current === 'suspended' || current === 'disabled')) return current;
  return onboardingStage === 'complete' ? 'active' : 'pending_profile';
}

function appendUserActivity(user, action, meta) {
  const list = Array.isArray(user.activityLog) ? user.activityLog : [];
  const entry = {
    action: String(action || 'event').slice(0, 80),
    at: new Date().toISOString(),
    ip: String(meta && meta.ipAddress || '').slice(0, 120),
    ua: String(meta && meta.userAgent || '').slice(0, 220)
  };
  list.unshift(entry);
  user.activityLog = list.slice(0, 50);
}

function randomId(prefix) {
  return String(prefix || 'u') + crypto.randomBytes(12).toString('hex');
}

function hashSha256(input) {
  return crypto.createHash('sha256').update(String(input || ''), 'utf8').digest('hex');
}

function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(String(password || ''), salt, 64, (err, key) => {
      if (err) return reject(err);
      resolve('scrypt$' + salt + '$' + key.toString('hex'));
    });
  });
}

function verifyPassword(password, encodedHash) {
  if (!encodedHash || String(encodedHash).indexOf('scrypt$') !== 0) return Promise.resolve(false);
  const parts = String(encodedHash).split('$');
  if (parts.length !== 3) return Promise.resolve(false);
  const salt = parts[1];
  const expectedHex = parts[2];
  return new Promise((resolve) => {
    crypto.scrypt(String(password || ''), salt, 64, (err, key) => {
      if (err) return resolve(false);
      try {
        const expected = Buffer.from(expectedHex, 'hex');
        if (expected.length !== key.length) return resolve(false);
        resolve(crypto.timingSafeEqual(expected, key));
      } catch (e) {
        resolve(false);
      }
    });
  });
}

function findUserByEmail(users, email) {
  const target = normalizeEmail(email);
  if (!target) return null;
  return Object.values(users || {}).find((user) => normalizeEmail(user && user.email) === target) || null;
}

function validateLocalPassword(password) {
  const raw = String(password || '');
  if (raw.length < LOCAL_PASSWORD_MIN_LEN) return 'A senha deve ter pelo menos 8 caracteres.';
  return '';
}

function resolveUserPicture(user) {
  if (!user) return '';
  return String(user.picture || '').trim().slice(0, 500);
}

const COMMUNITY_TERMS_VERSION = 'v1';

function defaultProfile() {
  return {
    displayName: '',
    age: null,
    avatarUrl: '',
    whatsapp: '',
    communityTermsAcceptedAt: null,
    communityTermsVersion: '',
    experience: '',
    environment: '',
    substrate: '',
    method: '',
    phase: '',
    tentSize: '',
    lighting: '',
    genetics: '',
    goals: '',
    notes: '',
    journal: '',
    customGuide: '',
    planTasks: [],
    growLogs: [],
    activeGrowLogId: '',
    phaseStartedAt: null,
    guideWeekNotes: {},
    infraPlan: { title: '', notes: '', items: [], updatedAt: null },
    radioTrackIds: [],
    updatedAt: null
  };
}

function sanitizeIsoDate(val) {
  if (!val) return null;
  const d = new Date(val);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

function sanitizeGuideWeekNotes(raw) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const out = {};
  for (const [key, value] of Object.entries(src)) {
    const week = parseInt(key, 10);
    if (week >= 1 && week <= 24) {
      const text = String(value || '').trim().slice(0, 2000);
      if (text) out[String(week)] = text;
    }
  }
  return out;
}

function sanitizeAge(raw) {
  if (raw === null || raw === undefined || raw === '') return null;
  const n = parseInt(raw, 10);
  if (isNaN(n) || n < MIN_USER_AGE || n > 120) return null;
  return n;
}

/** WhatsApp opcional — só dígitos; vazio permitido. */
function sanitizeWhatsapp(raw) {
  const digits = String(raw || '').replace(/\D/g, '').slice(0, 15);
  if (!digits) return '';
  if (digits.length < 10 || digits.length > 15) return '';
  return digits;
}

function sanitizePlanTasks(raw) {
  if (!Array.isArray(raw)) return [];
  const validActions = new Set(['', 'rega', 'adubo']);
  const usedIds = new Set();
  return raw.slice(0, 60).map((t, i) => {
    const dueAt = sanitizeDateOnly(t && t.dueAt) || '';
    const actionType = validActions.has(String(t && t.actionType || ''))
      ? String(t.actionType || '')
      : '';
    let id = String(t && t.id ? t.id : 't' + i).slice(0, 24);
    if (!id || usedIds.has(id)) id = ('t' + i + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)).slice(0, 24);
    usedIds.add(id);
    return {
      id,
      label: String(t && t.label || '').trim().slice(0, 240),
      done: !!(t && t.done),
      toolHref: String(t && t.toolHref || '').trim().slice(0, 200),
      dueAt: dueAt,
      actionType: actionType,
      growId: String(t && t.growId || '').trim().slice(0, 24)
    };
  }).filter((t) => t.label);
}

const VALID_PHASES = new Set(['planejamento', 'germinacao', 'vegetativo', 'floracao', 'colheita']);

function sanitizeGrowPhase(raw) {
  const p = String(raw || '').trim();
  return VALID_PHASES.has(p) ? p : 'germinacao';
}

function sanitizeDateOnly(val) {
  if (!val) return null;
  const d = new Date(val);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function sanitizeEntryMetrics(raw) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const out = {};
  const pick = (key, min, max, decimals) => {
    if (src[key] === null || src[key] === undefined || src[key] === '') return;
    const n = parseFloat(String(src[key]).replace(',', '.'));
    if (isNaN(n) || n < min || n > max) return;
    out[key] = decimals === 0 ? Math.round(n) : Math.round(n * 10) / 10;
  };
  pick('ph', 0, 14, 1);
  pick('ec', 0, 10, 1);
  pick('temp', -10, 60, 0);
  pick('rh', 0, 100, 0);
  pick('vpd', 0, 5, 2);
  pick('dli', 0, 100, 1);
  if (src.calculator) {
    const slug = String(src.calculator).trim().slice(0, 32);
    if (/^[a-z0-9-]+$/.test(slug)) out.calculator = slug;
  }
  return out;
}

function sanitizeEntryPhotos(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 4).map((item) => {
    const url = String(item || '').trim().slice(0, 200);
    if (!url.startsWith('/uploads/')) return null;
    if (url.includes('..')) return null;
    return url;
  }).filter(Boolean);
}

const VALID_ENTRY_SOURCES = new Set(['manual', 'week-note', 'system', 'calculator']);

const VALID_ENTRY_ACTIONS = new Set(['rega', 'adubo', 'obs', 'treino', 'roteiro']);

function sanitizeEntryActionType(raw, source) {
  if (source === 'week-note') return 'roteiro';
  if (source === 'calculator') {
    const id = String(raw || '').trim();
    return VALID_ENTRY_ACTIONS.has(id) ? id : 'obs';
  }
  const id = String(raw || '').trim();
  return VALID_ENTRY_ACTIONS.has(id) ? id : 'obs';
}

function sanitizeGrowLogEntries(raw) {
  if (!Array.isArray(raw)) return [];
  const usedIds = new Set();
  return raw.slice(0, 300).map((e, i) => {
    const sourceRaw = String(e && e.source || 'manual');
    const source = VALID_ENTRY_SOURCES.has(sourceRaw) ? sourceRaw : 'manual';
    const text = String(e && e.text || '').trim().slice(0, 2000);
    const metrics = sanitizeEntryMetrics(e && e.metrics);
    const photos = sanitizeEntryPhotos(e && e.photos);
    const actionType = sanitizeEntryActionType(e && e.actionType, source);
    if (!text && !Object.keys(metrics).length && !photos.length && source === 'manual') return null;
    let id = String(e && e.id ? e.id : 'e' + i).slice(0, 24);
    if (!id || usedIds.has(id)) id = ('e' + i + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)).slice(0, 24);
    usedIds.add(id);
    const fallbackText = text
      || (source === 'calculator' ? 'Registo de calculadora.' : '')
      || (actionType === 'rega' ? 'Rega registada.' : actionType === 'adubo' ? 'Adubação registada.' : 'Registo.');
    return {
      id,
      date: sanitizeDateOnly(e && e.date) || new Date().toISOString().slice(0, 10),
      text: fallbackText,
      source: source,
      actionType: actionType,
      metrics: metrics,
      photos: photos,
      createdAt: sanitizeIsoDate(e && e.createdAt) || new Date().toISOString()
    };
  }).filter(Boolean);
}

function sanitizeGrowLogs(raw) {
  if (!Array.isArray(raw)) return [];
  const usedIds = new Set();
  return raw.slice(0, 40).map((g, i) => {
    const name = String(g && g.name || '').trim().slice(0, 80);
    if (!name) return null;
    let id = String(g && g.id ? g.id : 'g' + i).slice(0, 24);
    if (!id || usedIds.has(id)) id = ('g' + i + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)).slice(0, 24);
    usedIds.add(id);
    return {
      id,
      name: name,
      plantedAt: sanitizeIsoDate(g && g.plantedAt) || sanitizeIsoDate(g && g.createdAt) || new Date().toISOString(),
      phase: sanitizeGrowPhase(g && g.phase),
      plantCount: Math.max(1, Math.min(99, parseInt(g && g.plantCount, 10) || 1)),
      species: String(g && g.species || '').trim().slice(0, 120),
      environment: String(g && g.environment || '').trim().slice(0, 40),
      substrate: String(g && g.substrate || '').trim().slice(0, 80),
      customGuide: String(g && g.customGuide || '').trim().slice(0, 8000),
      guideWeekNotes: sanitizeGuideWeekNotes(g && g.guideWeekNotes),
      entries: sanitizeGrowLogEntries(g && g.entries),
      createdAt: sanitizeIsoDate(g && g.createdAt) || new Date().toISOString(),
      updatedAt: sanitizeIsoDate(g && g.updatedAt) || sanitizeIsoDate(g && g.createdAt) || new Date().toISOString()
    };
  }).filter(Boolean);
}

function sanitizeActiveGrowLogId(raw, logs) {
  const id = String(raw || '').trim().slice(0, 24);
  if (id && logs.some((log) => log.id === id)) return id;
  return logs.length ? logs[0].id : '';
}

function sanitizeInfraPlanField(raw) {
  const { sanitizeInfraPlan } = require('./infra-plan-service.js');
  return sanitizeInfraPlan(raw);
}

function sanitizeProfile(raw) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const pick = (key, max) => String(src[key] || '').trim().slice(0, max);
  const growLogs = sanitizeGrowLogs(src.growLogs);
  const termsAt = sanitizeIsoDate(src.communityTermsAcceptedAt);
  return {
    displayName: pick('displayName', 80),
    age: sanitizeAge(src.age),
    avatarUrl: '',
    whatsapp: sanitizeWhatsapp(src.whatsapp),
    communityTermsAcceptedAt: termsAt,
    communityTermsVersion: termsAt ? COMMUNITY_TERMS_VERSION : '',
    experience: pick('experience', 40),
    environment: pick('environment', 40),
    substrate: pick('substrate', 80),
    method: pick('method', 40),
    phase: sanitizeGrowPhase(src.phase),
    tentSize: pick('tentSize', 80),
    lighting: pick('lighting', 120),
    genetics: pick('genetics', 120),
    goals: pick('goals', 800),
    notes: pick('notes', 1200),
    journal: pick('journal', 8000),
    customGuide: pick('customGuide', 6000),
    planTasks: sanitizePlanTasks(src.planTasks),
    growLogs: growLogs,
    activeGrowLogId: sanitizeActiveGrowLogId(src.activeGrowLogId, growLogs),
    phaseStartedAt: sanitizeIsoDate(src.phaseStartedAt),
    guideWeekNotes: sanitizeGuideWeekNotes(src.guideWeekNotes),
    infraPlan: sanitizeInfraPlanField(src.infraPlan),
    radioTrackIds: sanitizeRadioTrackIdsInProfile(src.radioTrackIds),
    updatedAt: new Date().toISOString()
  };
}

function sanitizeRadioTrackIdsInProfile(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  const seen = new Set();
  for (const item of raw) {
    const id = String(item || '').trim().slice(0, 40);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
    if (out.length >= 5) break;
  }
  return out;
}

function isProfileComplete(profile) {
  if (!profile) return false;
  const name = String(profile.displayName || '').trim();
  const age = sanitizeAge(profile.age);
  return name.length >= 2 && age !== null && age >= MIN_USER_AGE;
}

function userHasAcceptedCommunityTerms(user) {
  const profile = user && user.profile ? user.profile : null;
  if (!profile) return false;
  const at = sanitizeIsoDate(profile.communityTermsAcceptedAt);
  const ver = String(profile.communityTermsVersion || '').trim();
  return !!(at && ver === COMMUNITY_TERMS_VERSION);
}

async function acceptCommunityTerms(store, userId) {
  const users = await store.getUsers();
  const user = users[userId];
  if (!user) return null;
  const prev = user.profile && typeof user.profile === 'object' ? user.profile : {};
  // Só actualiza os campos do termo — evita re-sanitizar growLogs/infraPlan e falhas colaterais.
  user.profile = Object.assign({}, prev, {
    communityTermsAcceptedAt: new Date().toISOString(),
    communityTermsVersion: COMMUNITY_TERMS_VERSION
  });
  try {
    user.activityLog = Array.isArray(user.activityLog) ? user.activityLog : [];
    appendUserActivity(user, 'community.terms.accepted', null);
  } catch (e) { /* ignore activity errors */ }
  user.updatedAt = new Date().toISOString();
  users[userId] = user;
  await store.setUsers(users);
  return user;
}

function applyCommunityTermsAcceptance(profile, accepted) {
  if (!accepted) return profile;
  return sanitizeProfile(Object.assign({}, profile || defaultProfile(), {
    communityTermsAcceptedAt: new Date().toISOString(),
    communityTermsVersion: COMMUNITY_TERMS_VERSION
  }));
}

/** Garante o termo aceite no login/cadastro (uma vez), sem pedir de novo na publicação. */
function ensureCommunityTermsOnUser(user) {
  if (!user) return user;
  if (userHasAcceptedCommunityTerms(user)) return user;
  user.profile = applyCommunityTermsAcceptance(user.profile || defaultProfile(), true);
  return user;
}

async function loadUserSessionsMap(store) {
  const raw = await store.getUserSessions();
  const map = new Map();
  const now = Date.now();
  for (const [token, session] of Object.entries(raw || {})) {
    const normalized = normalizeUserSessionInput(token, session, now);
    if (normalized.token && normalized.userId && normalized.expiresAt > now) {
      map.set(normalized.token, normalized);
    }
  }
  return map;
}

async function persistUserSessions(store, map) {
  const obj = {};
  for (const [token, session] of map.entries()) {
    const normalized = normalizeUserSessionInput(token, session);
    if (!normalized.token || !normalized.userId) continue;
    obj[normalized.token] = {
      userId: normalized.userId,
      expiresAt: normalized.expiresAt
    };
  }
  await store.setUserSessions(obj);
}

async function createUserSession(store, userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const session = { userId, expiresAt: Date.now() + USER_SESSION_MAX_AGE_MS };
  if (typeof store.upsertUserSession === 'function') {
    await store.upsertUserSession(token, session);
    return token;
  }
  const sessions = await loadUserSessionsMap(store);
  sessions.set(token, session);
  await persistUserSessions(store, sessions);
  return token;
}

async function destroyUserSession(store, token) {
  if (!token) return;
  if (typeof store.deleteUserSession === 'function') {
    await store.deleteUserSession(token);
    return;
  }
  const sessions = await loadUserSessionsMap(store);
  sessions.delete(token);
  await persistUserSessions(store, sessions);
}

async function getUserSession(store, cookieHeaderValue) {
  const cookies = parseCookies(cookieHeaderValue);
  const token = cookies[USER_SESSION_COOKIE];
  if (!token) return null;
  let session = null;
  if (typeof store.getUserSessionByToken === 'function') {
    session = await store.getUserSessionByToken(token);
  } else {
    const sessions = await loadUserSessionsMap(store);
    session = sessions.get(token) || null;
  }
  if (!session || session.expiresAt <= Date.now()) {
    if (session && typeof store.deleteUserSession === 'function') {
      await store.deleteUserSession(token);
    }
    return null;
  }
  return { token, userId: session.userId };
}

function setUserSessionCookie(headers, token) {
  const maxAge = Math.floor(USER_SESSION_MAX_AGE_MS / 1000);
  return cookieHeader(USER_SESSION_COOKIE, token, maxAge, isSecureRequest(headers), 'Lax');
}

function clearUserSessionCookie(headers) {
  return cookieHeader(USER_SESSION_COOKIE, '', 0, isSecureRequest(headers), 'Lax');
}

async function verifyGoogleIdToken(idToken, clientId) {
  if (!idToken || !clientId) return null;
  const url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken);
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (data.aud !== clientId) return null;
  if (Number(data.exp) * 1000 < Date.now()) return null;
  if (!data.sub) return null;
  return {
    id: String(data.sub),
    email: String(data.email || ''),
    name: String(data.name || data.email || 'Utilizador'),
    picture: String(data.picture || '')
  };
}

async function exchangeGoogleAuthCode(code, clientId, clientSecret, redirectUri) {
  if (!code || !clientId || !clientSecret || !redirectUri) return null;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code: String(code),
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    })
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.id_token) return null;
  return verifyGoogleIdToken(data.id_token, clientId);
}

function createOAuthState() {
  return crypto.randomBytes(24).toString('hex');
}

function setOAuthStateCookie(headers, state) {
  const maxAge = Math.floor(OAUTH_STATE_MAX_AGE_MS / 1000);
  return cookieHeader(OAUTH_STATE_COOKIE, state, maxAge, isSecureRequest(headers), 'Lax');
}

function clearOAuthStateCookie(headers) {
  return cookieHeader(OAUTH_STATE_COOKIE, '', 0, isSecureRequest(headers));
}

function readOAuthState(cookieHeaderValue) {
  const cookies = parseCookies(cookieHeaderValue);
  return cookies[OAUTH_STATE_COOKIE] || null;
}

function buildGoogleAuthUrl(clientId, redirectUri, state) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state: state,
    access_type: 'online',
    prompt: 'select_account'
  });
  return 'https://accounts.google.com/o/oauth2/v2/auth?' + params.toString();
}

async function upsertGoogleUser(store, googleUser, meta) {
  const { areNewRegistrationsAllowed, REGISTRATION_CLOSED_MESSAGE } = require('./registration-gate.js');
  const users = await store.getUsers();
  const now = new Date().toISOString();
  const googleId = String(googleUser.id || '').trim();
  const email = normalizeEmail(googleUser.email);
  const existingByGoogleId = Object.values(users || {}).find((user) =>
    String(user && user.googleId || '').trim() === googleId || String(user && user.id || '').trim() === googleId
  ) || null;
  const existingByEmail = email ? findUserByEmail(users, email) : null;
  const existing = existingByGoogleId || existingByEmail || {};
  if (!existing.id && !areNewRegistrationsAllowed()) {
    const err = new Error(REGISTRATION_CLOSED_MESSAGE);
    err.code = 'registration_closed';
    throw err;
  }
  const userId = existing.id || googleId || randomId('u');
  let profile = sanitizeProfile(Object.assign({}, defaultProfile(), existing.profile || {}));
  if (!existing.profile && googleUser.name && !profile.displayName) {
    profile.displayName = String(googleUser.name).trim().slice(0, 80);
  }
  // Termos de uso aceites ao entrar com Google (texto legal em entrar.html).
  profile = applyCommunityTermsAcceptance(profile, true);
  const username = ensureUniqueUsername(users, deriveUsernameCandidate({
    username: existing.username,
    email: email,
    name: profile.displayName || googleUser.name
  }), userId);
  const birthDate = sanitizeBirthDate(existing.birthDate || '');
  const onboardingStage = deriveOnboardingStage(profile, { username, birthDate });
  const accountStatus = deriveAccountStatus(onboardingStage, existing.accountStatus);
  const hasLocal = !!existing.localPasswordHash;
  const user = {
    id: userId,
    googleId: googleId,
    email: email,
    emailVerifiedAt: email ? (existing.emailVerifiedAt || now) : (existing.emailVerifiedAt || null),
    name: profile.displayName || googleUser.name,
    username: username,
    birthDate: birthDate,
    picture: googleUser.picture,
    provider: hasLocal ? 'hybrid' : 'google',
    localPasswordHash: existing.localPasswordHash || '',
    localPasswordUpdatedAt: existing.localPasswordUpdatedAt || null,
    resetTokenHash: '',
    resetTokenExpiresAt: null,
    isAdmin: !!existing.isAdmin,
    registrationIp: existing.registrationIp || String(meta && meta.ipAddress || '').slice(0, 120),
    lastLoginAt: now,
    lastLoginIp: String(meta && meta.ipAddress || '').slice(0, 120),
    accountStatus: accountStatus,
    onboardingStage: onboardingStage,
    activityLog: Array.isArray(existing.activityLog) ? existing.activityLog : [],
    createdAt: existing.createdAt || now,
    updatedAt: now,
    profile: profile
  };
  appendUserActivity(user, existing.id ? 'auth.login.google' : 'auth.register.google', meta);
  users[userId] = user;
  await store.setUsers(users);
  return user;
}

async function registerLocalUser(store, payload, meta) {
  const { areNewRegistrationsAllowed, REGISTRATION_CLOSED_MESSAGE } = require('./registration-gate.js');
  const users = await store.getUsers();
  const now = new Date().toISOString();
  const email = normalizeEmail(payload && payload.email);
  const password = String(payload && payload.password || '');
  const name = String(payload && payload.name || '').trim().slice(0, 80);

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return { ok: false, status: 400, error: 'E-mail inválido.' };
  }
  const passwordError = validateLocalPassword(password);
  if (passwordError) return { ok: false, status: 400, error: passwordError };

  const existing = findUserByEmail(users, email);
  const passwordHash = await hashPassword(password);

  if (existing) {
    if (existing.localPasswordHash) {
      return { ok: false, status: 409, error: 'Este e-mail já tem senha local. Use Entrar.' };
    }
    const merged = Object.assign({}, existing, {
      email: email,
      localPasswordHash: passwordHash,
      localPasswordUpdatedAt: now,
      resetTokenHash: '',
      resetTokenExpiresAt: null,
      provider: String(existing.provider || '').trim() === 'google' ? 'hybrid' : (existing.provider || 'local'),
      username: ensureUniqueUsername(users, deriveUsernameCandidate({
        username: existing.username,
        email: email,
        name: (existing.profile && existing.profile.displayName) || existing.name || name
      }), existing.id),
      registrationIp: existing.registrationIp || String(meta && meta.ipAddress || '').slice(0, 120),
      lastLoginAt: now,
      lastLoginIp: String(meta && meta.ipAddress || '').slice(0, 120),
      updatedAt: now
    });
    if (name && !(merged.profile && merged.profile.displayName)) {
      merged.profile = sanitizeProfile(Object.assign({}, defaultProfile(), merged.profile || {}, { displayName: name }));
      merged.name = merged.profile.displayName || merged.name;
    }
    if (payload && payload.communityTermsAccepted) {
      merged.profile = applyCommunityTermsAcceptance(merged.profile || defaultProfile(), true);
    }
    merged.birthDate = sanitizeBirthDate(merged.birthDate || '');
    merged.onboardingStage = deriveOnboardingStage(merged.profile, merged);
    merged.accountStatus = deriveAccountStatus(merged.onboardingStage, merged.accountStatus);
    merged.activityLog = Array.isArray(merged.activityLog) ? merged.activityLog : [];
    appendUserActivity(merged, 'auth.register.local.linked', meta);
    users[merged.id] = merged;
    await store.setUsers(users);
    return { ok: true, user: merged, linked: true };
  }

  if (!areNewRegistrationsAllowed()) {
    return { ok: false, status: 503, error: REGISTRATION_CLOSED_MESSAGE };
  }

  const userId = randomId('u');
  let profile = sanitizeProfile(Object.assign({}, defaultProfile(), { displayName: name }));
  if (payload && payload.communityTermsAccepted) {
    profile = applyCommunityTermsAcceptance(profile, true);
  }
  const username = ensureUniqueUsername(users, deriveUsernameCandidate({ email, name }), userId);
  const birthDate = '';
  const onboardingStage = deriveOnboardingStage(profile, { username, birthDate });
  const user = {
    id: userId,
    googleId: '',
    email: email,
    emailVerifiedAt: null,
    name: profile.displayName || email,
    username: username,
    birthDate: birthDate,
    picture: '',
    provider: 'local',
    localPasswordHash: passwordHash,
    localPasswordUpdatedAt: now,
    resetTokenHash: '',
    resetTokenExpiresAt: null,
    isAdmin: false,
    registrationIp: String(meta && meta.ipAddress || '').slice(0, 120),
    lastLoginAt: now,
    lastLoginIp: String(meta && meta.ipAddress || '').slice(0, 120),
    accountStatus: deriveAccountStatus(onboardingStage, ''),
    onboardingStage: onboardingStage,
    activityLog: [],
    createdAt: now,
    updatedAt: now,
    profile: profile
  };
  appendUserActivity(user, 'auth.register.local', meta);
  users[userId] = user;
  await store.setUsers(users);
  return { ok: true, user: user, linked: false };
}

async function loginLocalUser(store, payload, meta) {
  const users = await store.getUsers();
  const email = normalizeEmail(payload && payload.email);
  const password = String(payload && payload.password || '');
  const user = findUserByEmail(users, email);
  if (!user || !user.localPasswordHash) {
    return { ok: false, status: 401, error: 'E-mail ou senha inválidos.' };
  }
  const valid = await verifyPassword(password, user.localPasswordHash);
  if (!valid) return { ok: false, status: 401, error: 'E-mail ou senha inválidos.' };
  user.lastLoginAt = new Date().toISOString();
  user.lastLoginIp = String(meta && meta.ipAddress || '').slice(0, 120);
  ensureCommunityTermsOnUser(user);
  user.activityLog = Array.isArray(user.activityLog) ? user.activityLog : [];
  appendUserActivity(user, 'auth.login.local', meta);
  users[user.id] = user;
  await store.setUsers(users);
  return { ok: true, user: user };
}

async function requestLocalPasswordReset(store, payload, headers) {
  const users = await store.getUsers();
  const email = normalizeEmail(payload && payload.email);
  if (!email) {
    return { ok: true, sent: false, message: 'Se o e-mail existir, enviaremos instruções de recuperação.' };
  }
  const user = findUserByEmail(users, email);
  if (!user || !user.localPasswordHash) {
    return { ok: true, sent: false, message: 'Se o e-mail existir, enviaremos instruções de recuperação.' };
  }

  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  const expiresAt = new Date(now + PASSWORD_RESET_MAX_AGE_MS).toISOString();
  user.resetTokenHash = hashSha256(token);
  user.resetTokenExpiresAt = expiresAt;
  user.updatedAt = new Date().toISOString();
  users[user.id] = user;
  await store.setUsers(users);

  const base = getSiteBaseUrl(headers);
  const resetUrl = base + '/entrar.html?resetToken=' + encodeURIComponent(token) + '&email=' + encodeURIComponent(email);
  const mail = await sendPasswordResetEmail({ to: email, resetUrl: resetUrl });

  const out = { ok: true, sent: !!mail.sent, message: 'Se o e-mail existir, enviaremos instruções de recuperação.' };
  if (!mail.sent && !isProductionSite()) {
    out.devResetToken = token;
    out.devResetUrl = resetUrl;
  }
  return out;
}

async function resetLocalPassword(store, payload) {
  const users = await store.getUsers();
  const token = String(payload && payload.token || '').trim();
  const nextPassword = String(payload && payload.password || '');
  const passwordError = validateLocalPassword(nextPassword);
  if (passwordError) return { ok: false, status: 400, error: passwordError };
  if (!token) return { ok: false, status: 400, error: 'Token inválido.' };

  const tokenHash = hashSha256(token);
  const now = Date.now();
  const user = Object.values(users || {}).find((item) => {
    if (!item || !item.resetTokenHash) return false;
    if (String(item.resetTokenHash) !== tokenHash) return false;
    const expires = new Date(item.resetTokenExpiresAt || 0).getTime();
    return expires > now;
  });

  if (!user) return { ok: false, status: 400, error: 'Token inválido ou expirado.' };

  user.localPasswordHash = await hashPassword(nextPassword);
  user.localPasswordUpdatedAt = new Date().toISOString();
  user.resetTokenHash = '';
  user.resetTokenExpiresAt = null;
  user.provider = user.googleId ? 'hybrid' : (user.provider === 'google' ? 'hybrid' : 'local');
  user.updatedAt = new Date().toISOString();
  users[user.id] = user;
  await store.setUsers(users);
  return { ok: true, user: user };
}

async function getUserById(store, userId) {
  if (!userId) return null;
  const users = await store.getUsers();
  return users[userId] || null;
}

async function updateUserProfile(store, userId, payload) {
  const users = await store.getUsers();
  const user = users[userId];
  if (!user) return null;
  const prev = user.profile || defaultProfile();
  const src = payload && typeof payload === 'object' ? payload : {};
  const merged = Object.assign({}, prev, src);
  merged.avatarUrl = '';

  const ageProvided = Object.prototype.hasOwnProperty.call(src, 'age')
    && src.age !== undefined && src.age !== null && String(src.age).trim() !== '';
  const birthDateProvided = Object.prototype.hasOwnProperty.call(src, 'birthDate');

  // Só valida idade enviada no pedido — idade antiga inválida na base não bloqueia updates.
  if (ageProvided) {
    const attempt = parseInt(src.age, 10);
    if (isNaN(attempt) || attempt < MIN_USER_AGE) {
      const err = new Error('underage');
      err.code = 'underage';
      throw err;
    }
    if (attempt > 120) {
      const err = new Error('invalid_age');
      err.code = 'invalid_age';
      throw err;
    }
  }

  if (Object.prototype.hasOwnProperty.call(src, 'whatsapp')) {
    const rawWhatsapp = String(src.whatsapp || '').trim();
    if (rawWhatsapp) {
      const cleaned = sanitizeWhatsapp(rawWhatsapp);
      if (!cleaned) {
        const err = new Error('invalid_whatsapp');
        err.code = 'invalid_whatsapp';
        throw err;
      }
      merged.whatsapp = cleaned;
    } else {
      merged.whatsapp = '';
    }
  }

  const requestedUsername = Object.prototype.hasOwnProperty.call(src, 'username')
    ? sanitizeUsername(src.username)
    : sanitizeUsername(user.username);
  if (Object.prototype.hasOwnProperty.call(src, 'username') && !requestedUsername) {
    const err = new Error('invalid_username');
    err.code = 'invalid_username';
    throw err;
  }

  // Preferência: birthDate explícito válido > idade enviada (recalcula birth_date) > valor actual.
  // birthDate vazio no payload NÃO apaga a data existente (evita perder idade ao guardar só o nome).
  let nextBirthDate = sanitizeBirthDate(user.birthDate || '');
  if (birthDateProvided) {
    const requestedBirthDate = sanitizeBirthDate(src.birthDate);
    if (requestedBirthDate) {
      nextBirthDate = requestedBirthDate;
    } else if (ageProvided) {
      nextBirthDate = birthDateFromAge(src.age, new Date()) || nextBirthDate;
    }
  } else if (ageProvided) {
    nextBirthDate = birthDateFromAge(src.age, new Date()) || nextBirthDate;
  } else if (!nextBirthDate) {
    nextBirthDate = birthDateFromAge(merged.age, new Date()) || '';
  }

  const derivedAge = calculateAgeFromBirthDate(nextBirthDate);
  if (nextBirthDate && (derivedAge == null || derivedAge < MIN_USER_AGE)) {
    const err = new Error('underage');
    err.code = 'underage';
    throw err;
  }

  const profile = sanitizeProfile(merged);
  profile.age = derivedAge != null ? derivedAge : (ageProvided ? sanitizeAge(src.age) : profile.age);
  profile.phase = '';
  profile.phaseStartedAt = null;
  profile.activeGrowLogId = '';
  profile.customGuide = '';
  profile.guideWeekNotes = {};
  profile.growLogs = [];
  profile.planTasks = [];
  profile.journal = '';
  profile.radioTrackIds = sanitizeRadioTrackIdsInProfile(
    Object.prototype.hasOwnProperty.call(src, 'radioTrackIds')
      ? src.radioTrackIds
      : prev.radioTrackIds
  );

  if (profile.displayName) {
    user.name = profile.displayName;
  }

  const nextUsername = ensureUniqueUsername(users, requestedUsername || deriveUsernameCandidate({
    email: user.email,
    name: profile.displayName || user.name
  }), userId);

  user.username = nextUsername;
  user.birthDate = nextBirthDate;
  user.profile = profile;
  user.onboardingStage = deriveOnboardingStage(profile, user);
  user.accountStatus = deriveAccountStatus(user.onboardingStage, user.accountStatus);
  user.activityLog = Array.isArray(user.activityLog) ? user.activityLog : [];
  appendUserActivity(user, 'profile.updated', null);
  user.updatedAt = new Date().toISOString();
  users[userId] = user;
  await store.setUsers(users);
  return user;
}

function publicUserView(user) {
  if (!user) return null;
  const providers = [];
  if (user.googleId || user.provider === 'google' || user.provider === 'hybrid') providers.push('google');
  if (user.localPasswordHash || user.provider === 'local' || user.provider === 'hybrid') providers.push('local');
  const profile = sanitizeProfile(Object.assign({}, defaultProfile(), user.profile || {}));
  let birthDate = sanitizeBirthDate(user.birthDate || profile.birthDate || '');
  const dynamicAge = calculateAgeFromBirthDate(birthDate);
  if (dynamicAge != null) {
    profile.age = dynamicAge;
  } else if (profile.age != null && !birthDate) {
    // Perfil com idade mas sem birth_date: reconstrói data para consistência de onboarding.
    birthDate = birthDateFromAge(profile.age, new Date()) || '';
  }
  const username = sanitizeUsername(user.username || profile.username || deriveUsernameCandidate(user));
  profile.username = username;
  profile.birthDate = birthDate;
  const onboardingStage = deriveOnboardingStage(profile, { username, birthDate });
  const accountStatus = deriveAccountStatus(onboardingStage, user.accountStatus);
  return {
    id: user.id,
    email: user.email,
    emailVerified: !!user.emailVerifiedAt,
    emailVerifiedAt: user.emailVerifiedAt || null,
    name: user.name,
    username: username,
    birthDate: birthDate || null,
    age: profile.age != null ? profile.age : null,
    picture: resolveUserPicture(user),
    googlePicture: String(user.picture || '').trim().slice(0, 500),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    accountStatus: accountStatus,
    onboardingStage: onboardingStage,
    auth: {
      hasLocalPassword: !!user.localPasswordHash,
      hasGoogleLinked: !!(user.googleId || user.provider === 'google' || user.provider === 'hybrid'),
      providers: providers
    },
    profile: profile,
    profileComplete: isProfileComplete(profile),
    communityTermsAccepted: userHasAcceptedCommunityTerms({ profile: profile }),
    communityTermsVersion: COMMUNITY_TERMS_VERSION
  };
}

module.exports = {
  USER_SESSION_COOKIE,
  OAUTH_STATE_COOKIE,
  USER_SESSION_MAX_AGE_MS,
  MIN_USER_AGE,
  COMMUNITY_TERMS_VERSION,
  defaultProfile,
  sanitizeProfile,
  sanitizeUsername,
  resolveUserPicture,
  isProfileComplete,
  userHasAcceptedCommunityTerms,
  acceptCommunityTerms,
  createUserSession,
  destroyUserSession,
  getUserSession,
  setUserSessionCookie,
  clearUserSessionCookie,
  verifyGoogleIdToken,
  exchangeGoogleAuthCode,
  createOAuthState,
  setOAuthStateCookie,
  clearOAuthStateCookie,
  readOAuthState,
  buildGoogleAuthUrl,
  upsertGoogleUser,
  registerLocalUser,
  loginLocalUser,
  requestLocalPasswordReset,
  resetLocalPassword,
  getUserById,
  updateUserProfile,
  publicUserView,
  sanitizeIsoDate
};
