const fs = require('fs');
const path = require('path');
const { extractCultivoFields } = require('./cultivo-user-service.js');
const { mergeGuiaInspecoesPosts } = require('./merge-guia-inspecoes.js');

function createFsStore(root) {
  const postsPath = path.join(root, 'posts.json');
  const pagesPath = path.join(root, 'content', 'pages.json');
  const sitePath = path.join(root, 'content', 'site.json');
  const sessionsPath = path.join(root, 'content', 'sessions.json');
  const userSessionsPath = path.join(root, 'content', 'user-sessions.json');
  const usersPath = path.join(root, 'content', 'users.json');
  const oauthStatesPath = path.join(root, 'content', 'oauth-states.json');
  const sorteiosPath = path.join(root, 'sorteios.json');
  const sorteioAlertsPath = path.join(root, 'sorteio-alerts.json');
  const sorteioConfigPath = path.join(root, 'content', 'sorteio.json');
  const seriesPath = path.join(root, 'content', 'series.json');
  const uploadsDir = path.join(root, 'uploads');

  if (!fs.existsSync(uploadsDir)) {
    try { fs.mkdirSync(uploadsDir, { recursive: true }); } catch (e) { /* ignore */ }
  }

  function readJson(file, fallback) {
    try {
      return JSON.parse(fs.readFileSync(file, 'utf8') || '');
    } catch (e) {
      return fallback;
    }
  }

  return {
    async getPosts() {
      return mergeGuiaInspecoesPosts(readJson(postsPath, []));
    },
    async setPosts(posts) {
      fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2), 'utf8');
    },
    async getPages() {
      return readJson(pagesPath, null);
    },
    async setPages(pages) {
      const dir = path.dirname(pagesPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(pagesPath, JSON.stringify(pages, null, 2), 'utf8');
    },
    async getSite() {
      return readJson(sitePath, null);
    },
    async setSite(site) {
      const dir = path.dirname(sitePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(sitePath, JSON.stringify(site, null, 2), 'utf8');
    },
    async getSessions() {
      return readJson(sessionsPath, {});
    },
    async setSessions(sessions) {
      const dir = path.dirname(sessionsPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(sessionsPath, JSON.stringify(sessions), 'utf8');
    },
    async getUserSessions() {
      return readJson(userSessionsPath, {});
    },
    async setUserSessions(sessions) {
      const dir = path.dirname(userSessionsPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(userSessionsPath, JSON.stringify(sessions), 'utf8');
    },
    async getUserSessionByToken(token) {
      const all = readJson(userSessionsPath, {});
      return all[token] || null;
    },
    async upsertUserSession(token, session) {
      const all = readJson(userSessionsPath, {});
      all[token] = session;
      const dir = path.dirname(userSessionsPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(userSessionsPath, JSON.stringify(all), 'utf8');
    },
    async deleteUserSession(token) {
      const all = readJson(userSessionsPath, {});
      delete all[token];
      const dir = path.dirname(userSessionsPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(userSessionsPath, JSON.stringify(all), 'utf8');
    },
    async getAdminSessionByToken(token) {
      const all = readJson(sessionsPath, {});
      return all[token] || null;
    },
    async upsertAdminSession(token, session) {
      const all = readJson(sessionsPath, {});
      all[token] = session;
      const dir = path.dirname(sessionsPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(sessionsPath, JSON.stringify(all), 'utf8');
    },
    async deleteAdminSession(token) {
      const all = readJson(sessionsPath, {});
      delete all[token];
      const dir = path.dirname(sessionsPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(sessionsPath, JSON.stringify(all), 'utf8');
    },
    async getOAuthStateByKey(state) {
      const all = readJson(oauthStatesPath, {});
      return all[state] || null;
    },
    async upsertOAuthState(state, entry) {
      const all = readJson(oauthStatesPath, {});
      all[state] = entry;
      const dir = path.dirname(oauthStatesPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(oauthStatesPath, JSON.stringify(all), 'utf8');
    },
    async deleteOAuthState(state) {
      const all = readJson(oauthStatesPath, {});
      delete all[state];
      const dir = path.dirname(oauthStatesPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(oauthStatesPath, JSON.stringify(all), 'utf8');
    },
    async getUsers() {
      return readJson(usersPath, {});
    },
    async setUsers(users) {
      const dir = path.dirname(usersPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf8');
    },
    async getOAuthStates() {
      return readJson(oauthStatesPath, {});
    },
    async setOAuthStates(states) {
      const dir = path.dirname(oauthStatesPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(oauthStatesPath, JSON.stringify(states), 'utf8');
    },
    async getSorteios() {
      return readJson(sorteiosPath, []);
    },
    async setSorteios(entries) {
      fs.writeFileSync(sorteiosPath, JSON.stringify(entries, null, 2), 'utf8');
    },
    async getSorteioConfig() {
      return readJson(sorteioConfigPath, null);
    },
    async setSorteioConfig(config) {
      const dir = path.dirname(sorteioConfigPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(sorteioConfigPath, JSON.stringify(config, null, 2), 'utf8');
    },
    async getSorteioAlertSubscribers() {
      return readJson(sorteioAlertsPath, []);
    },
    async getSorteioAlertSubscriber(userId) {
      const list = readJson(sorteioAlertsPath, []);
      return list.find((item) => item.userId === userId && item.active !== false) || null;
    },
    async subscribeSorteioAlert(subscriber) {
      const list = readJson(sorteioAlertsPath, []).filter((item) => item.userId !== subscriber.userId);
      list.unshift(subscriber);
      fs.writeFileSync(sorteioAlertsPath, JSON.stringify(list, null, 2), 'utf8');
    },
    async unsubscribeSorteioAlert(userId) {
      const list = readJson(sorteioAlertsPath, []).map((item) => {
        if (item.userId !== userId) return item;
        return Object.assign({}, item, { active: false });
      });
      fs.writeFileSync(sorteioAlertsPath, JSON.stringify(list, null, 2), 'utf8');
    },
    async getGuiaCultivo() {
      return readJson(path.join(root, 'content', 'guia-cultivo.json'), null);
    },
    async setGuiaCultivo(guia) {
      const file = path.join(root, 'content', 'guia-cultivo.json');
      const dir = path.dirname(file);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(file, JSON.stringify(guia, null, 2), 'utf8');
    },
    async getYoutubeFeed() {
      return readJson(path.join(root, 'content', 'youtube-feed.json'), null);
    },
    async setYoutubeFeed(feed) {
      const file = path.join(root, 'content', 'youtube-feed.json');
      const dir = path.dirname(file);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(file, JSON.stringify(feed, null, 2), 'utf8');
    },
    async countCultivoGrows(userId) {
      const users = await readJson(usersPath, {});
      const extracted = extractCultivoFields(users[userId] && users[userId].profile);
      return Array.isArray(extracted.growLogs) ? extracted.growLogs.length : 0;
    },
    async getCultivoState(userId) {
      const users = await readJson(usersPath, {});
      return extractCultivoFields(users[userId] && users[userId].profile);
    },
    async setCultivoState(userId, state) {
      const users = await readJson(usersPath, {});
      const user = users[userId];
      if (!user) return state;
      user.profile = Object.assign(user.profile || {}, state || {});
      user.updatedAt = new Date().toISOString();
      users[userId] = user;
      const dir = path.dirname(usersPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf8');
      return state;
    },
    async createCultivoSubmission(submission) {
      const file = path.join(root, 'data', 'cultivo-submissions.json');
      const list = readJson(file, []);
      list.push(submission);
      const dir = path.dirname(file);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(file, JSON.stringify(list, null, 2), 'utf8');
      return submission;
    },
    async getCultivoSubmissionById(id) {
      const file = path.join(root, 'data', 'cultivo-submissions.json');
      const list = readJson(file, []);
      return list.find((row) => row.id === id) || null;
    },
    async findActiveCultivoSubmission(userId, growId) {
      const file = path.join(root, 'data', 'cultivo-submissions.json');
      const list = readJson(file, []);
      return list
        .filter((row) => row.userId === userId && row.growId === growId && (row.status === 'pending' || row.status === 'approved'))
        .sort((a, b) => String(b.submittedAt).localeCompare(String(a.submittedAt)))[0] || null;
    },
    async listCultivoSubmissionsByUser(userId, growId) {
      const file = path.join(root, 'data', 'cultivo-submissions.json');
      let list = readJson(file, []).filter((row) => row.userId === userId);
      if (growId) list = list.filter((row) => row.growId === growId);
      return list.sort((a, b) => String(b.submittedAt).localeCompare(String(a.submittedAt)));
    },
    async listCultivoSubmissionsAdmin(status) {
      const file = path.join(root, 'data', 'cultivo-submissions.json');
      let list = readJson(file, []);
      if (status) list = list.filter((row) => row.status === status);
      return list.sort((a, b) => String(b.submittedAt).localeCompare(String(a.submittedAt)));
    },
    async updateCultivoSubmission(id, patch) {
      const file = path.join(root, 'data', 'cultivo-submissions.json');
      const list = readJson(file, []);
      const idx = list.findIndex((row) => row.id === id);
      if (idx < 0) return null;
      list[idx] = Object.assign({}, list[idx], patch);
      fs.writeFileSync(file, JSON.stringify(list, null, 2), 'utf8');
      return list[idx];
    },
    async listUsersAdmin(query) {
      const users = readJson(usersPath, {});
      const q = String(query || '').trim().toLowerCase();
      let list = Object.values(users || {});
      if (q) {
        list = list.filter((u) =>
          String(u.email || '').toLowerCase().includes(q)
          || String(u.name || '').toLowerCase().includes(q)
          || String(u.id || '').toLowerCase().includes(q)
        );
      }
      return list.map((user) => {
        const safeUser = Object.assign({}, user);
        delete safeUser.localPasswordHash;
        delete safeUser.resetTokenHash;
        delete safeUser.resetTokenExpiresAt;
        const extracted = extractCultivoFields(user.profile);
        const growLogs = Array.isArray(extracted.growLogs) ? extracted.growLogs : [];
        const entryCount = growLogs.reduce((sum, g) => sum + (Array.isArray(g.entries) ? g.entries.length : 0), 0);
        const planTasks = Array.isArray(extracted.planTasks) ? extracted.planTasks : [];
        return Object.assign({}, safeUser, {
          isAdmin: !!user.isAdmin,
          growCount: growLogs.length,
          entryCount: entryCount,
          submissionCount: 0,
          planTaskCount: planTasks.length
        });
      }).sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    },
    async getUserByIdAdmin(userId) {
      const users = readJson(usersPath, {});
      const user = users[userId];
      if (!user) return null;
      const safeUser = Object.assign({}, user);
      delete safeUser.localPasswordHash;
      delete safeUser.resetTokenHash;
      delete safeUser.resetTokenExpiresAt;
      const extracted = extractCultivoFields(user.profile);
      const growLogs = Array.isArray(extracted.growLogs) ? extracted.growLogs : [];
      const entryCount = growLogs.reduce((sum, g) => sum + (Array.isArray(g.entries) ? g.entries.length : 0), 0);
      const planTasks = Array.isArray(extracted.planTasks) ? extracted.planTasks : [];
      return Object.assign({}, safeUser, {
        isAdmin: !!user.isAdmin,
        growCount: growLogs.length,
        entryCount: entryCount,
        planTaskCount: planTasks.length
      });
    },
    async setUserAdminFlag(userId, isAdmin) {
      const users = readJson(usersPath, {});
      const user = users[userId];
      if (!user) return null;
      user.isAdmin = !!isAdmin;
      user.updatedAt = new Date().toISOString();
      users[userId] = user;
      fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf8');
      return users[userId];
    },
    async deleteUser(userId) {
      const id = String(userId || '').trim();
      if (!id) return false;
      const users = readJson(usersPath, {});
      if (!users[id]) return false;
      delete users[id];
      fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf8');
      try {
        const sessionsPath = path.join(root, 'content', 'user-sessions.json');
        const sessions = readJson(sessionsPath, {});
        let changed = false;
        Object.keys(sessions || {}).forEach((token) => {
          if (sessions[token] && sessions[token].userId === id) {
            delete sessions[token];
            changed = true;
          }
        });
        if (changed) fs.writeFileSync(sessionsPath, JSON.stringify(sessions, null, 2), 'utf8');
      } catch (e) { /* ignore */ }
      return true;
    },
    async countAdminUsers() {
      const users = readJson(usersPath, {});
      return Object.values(users || {}).filter((u) => u.isAdmin).length;
    },
    async listUserGrowsSummary(userId) {
      const users = readJson(usersPath, {});
      const extracted = extractCultivoFields(users[userId] && users[userId].profile);
      const growLogs = Array.isArray(extracted.growLogs) ? extracted.growLogs : [];
      return growLogs.map((g) => ({
        id: g.id,
        name: g.name || '',
        phase: g.phase || '',
        species: g.species || '',
        plantedAt: g.plantedAt,
        plantCount: g.plantCount != null ? g.plantCount : 1,
        createdAt: g.createdAt,
        entryCount: Array.isArray(g.entries) ? g.entries.length : 0
      }));
    },
    async listUserSubmissionsSummary() {
      return [];
    },
    async listSorteioEntriesByEmail(email) {
      const normalized = String(email || '').trim().toLowerCase();
      const list = readJson(sorteiosPath, []);
      return list.filter((e) => String(e.email || '').toLowerCase() === normalized).slice(0, 50);
    },
    async getSorteioAlertForUser(userId) {
      const list = readJson(sorteioAlertsPath, []);
      const row = list.find((item) => item.userId === userId && item.active !== false);
      return row || null;
    },
    async saveUpload(name, buffer) {
      const safeRel = String(name || '').replace(/\\/g, '/').replace(/^\/+/, '');
      if (!safeRel || safeRel.includes('..')) {
        throw new Error('invalid upload path');
      }
      const out = path.join(uploadsDir, safeRel);
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out, buffer);
      return `/uploads/${safeRel}`;
    },
    async getUpload(name) {
      const safeRel = String(name || '').replace(/\\/g, '/').replace(/^\/+/, '');
      if (!safeRel || safeRel.includes('..')) return null;
      const fp = path.join(uploadsDir, safeRel);
      if (!fs.existsSync(fp) || !fs.statSync(fp).isFile()) return null;
      const buf = fs.readFileSync(fp);
      const ext = path.extname(safeRel).toLowerCase();
      const types = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.mov': 'video/quicktime'
      };
      return { buffer: buf, contentType: types[ext] || 'application/octet-stream' };
    },
    async listUploads(prefix) {
      const safePrefix = String(prefix || '').replace(/\\/g, '/').replace(/^\/+/, '');
      if (safePrefix.includes('..')) return [];
      const dir = path.join(uploadsDir, safePrefix);
      if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return [];
      return fs.readdirSync(dir)
        .filter((name) => {
          try {
            return fs.statSync(path.join(dir, name)).isFile();
          } catch (e) {
            return false;
          }
        })
        .map((name) => (safePrefix ? safePrefix.replace(/\/?$/, '/') : '') + name);
    },
    async deleteUpload(name) {
      const safeRel = String(name || '').replace(/\\/g, '/').replace(/^\/+/, '');
      if (!safeRel || safeRel.includes('..')) return false;
      const fp = path.join(uploadsDir, safeRel);
      if (!fs.existsSync(fp) || !fs.statSync(fp).isFile()) return false;
      fs.unlinkSync(fp);
      return true;
    },
    async getSeriesOptions(category) {
      const DEFAULT = [
        { id: 'canal-movrecam', label: 'Canal MovReCam', category: 'inspecao', sortOrder: 3.5 },
        { id: 'verificacao-equipamento', label: 'Verifica\u00e7\u00e3o de Equipamentos', category: 'inspecao', sortOrder: 4 }
      ];
      const REMOVED_SERIES = new Set([
        'canal-jardimhg',
        'guia-cultivo-basico',
        'canal-inspetorbudganja',
        'canal-plantamemo'
      ]);
      const all = readJson(seriesPath, DEFAULT).filter((s) => !REMOVED_SERIES.has(s.id));
      return category ? all.filter((s) => s.category === category) : all;
    },
    async upsertSeriesOption(item) {
      const DEFAULT = [
        { id: 'canal-movrecam', label: 'Canal MovReCam', category: 'inspecao', sortOrder: 3.5 },
        { id: 'verificacao-equipamento', label: 'Verifica\u00e7\u00e3o de Equipamentos', category: 'inspecao', sortOrder: 4 }
      ];
      const REMOVED_SERIES = new Set([
        'canal-jardimhg',
        'guia-cultivo-basico',
        'canal-inspetorbudganja',
        'canal-plantamemo'
      ]);
      const all = readJson(seriesPath, DEFAULT)
        .filter((s) => s.id !== item.id && !REMOVED_SERIES.has(s.id));
      all.push(item);
      all.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      const dir = path.dirname(seriesPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(seriesPath, JSON.stringify(all, null, 2), 'utf8');
    },
    async deleteSeriesOption(id) {
      const DEFAULT = [];
      const all = readJson(seriesPath, DEFAULT).filter((s) => s.id !== id);
      fs.writeFileSync(seriesPath, JSON.stringify(all, null, 2), 'utf8');
    },
    async insertCommunityPost(post) {
      const file = path.join(root, 'data', 'community-posts.json');
      const list = readJson(file, []);
      list.push(post);
      const dir = path.dirname(file);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(file, JSON.stringify(list, null, 2), 'utf8');
      return post;
    },
    async findCommunityPostByEntryPhoto(entryId, photoUrl) {
      const file = path.join(root, 'data', 'community-posts.json');
      const list = readJson(file, []);
      return list.find((row) => row.entryId === entryId && row.photoUrl === photoUrl) || null;
    },
    async getCommunityPostById(id) {
      const file = path.join(root, 'data', 'community-posts.json');
      const posts = readJson(file, []);
      const post = posts.find((row) => row.id === id);
      if (!post) return null;
      const commentsFile = path.join(root, 'data', 'community-comments.json');
      const comments = readJson(commentsFile, []).filter((c) => c.postId === id && c.status === 'published');
      const users = readJson(usersPath, {});
      const user = users[post.userId] || {};
      return Object.assign({}, post, {
        authorName: user.name || '',
        authorUsername: user.username || '',
        authorPicture: user.picture || '',
        commentCount: comments.length
      });
    },
    async listCommunityFeed(options) {
      const limit = Math.min(Math.max(Number(options && options.limit) || 20, 1), 50);
      const cursor = String(options && options.cursor || '').trim();
      const file = path.join(root, 'data', 'community-posts.json');
      const commentsFile = path.join(root, 'data', 'community-comments.json');
      const users = readJson(usersPath, {});
      const comments = readJson(commentsFile, []);
      const kind = String(options && options.kind || '').trim();
      let list = readJson(file, [])
        .filter((row) => row.status === 'published')
        .filter((row) => {
          if (kind !== 'diary' && kind !== 'plant_id') return true;
          const rowKind = row.kind || 'diary';
          return rowKind === kind;
        })
        .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
      if (cursor) list = list.filter((row) => String(row.createdAt) < cursor);
      const slice = list.slice(0, limit + 1);
      const hasMore = slice.length > limit;
      const items = (hasMore ? slice.slice(0, limit) : slice).map((post) => {
        const user = users[post.userId] || {};
        return Object.assign({}, post, {
          authorName: user.name || '',
          authorUsername: user.username || '',
          authorPicture: user.picture || '',
          commentCount: comments.filter((c) => c.postId === post.id && c.status === 'published').length
        });
      });
      return {
        items,
        nextCursor: hasMore && items.length ? items[items.length - 1].createdAt : null
      };
    },
    async listCommunityPostsByUser(userId) {
      const file = path.join(root, 'data', 'community-posts.json');
      return readJson(file, [])
        .filter((row) => row.userId === userId && row.status === 'published')
        .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
        .slice(0, 200)
        .map((row) => ({
          id: row.id,
          entryId: row.entryId || '',
          photoUrl: row.photoUrl || '',
          status: row.status,
          createdAt: row.createdAt
        }));
    },
    async listCommunityPostsAdmin(limit) {
      const n = Math.min(Math.max(Number(limit) || 50, 1), 100);
      const file = path.join(root, 'data', 'community-posts.json');
      const users = readJson(usersPath, {});
      return readJson(file, [])
        .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
        .slice(0, n)
        .map((post) => {
          const user = users[post.userId] || {};
          return Object.assign({}, post, {
            authorName: user.name || '',
            authorUsername: user.username || '',
            authorPicture: user.picture || ''
          });
        });
    },
    async setCommunityPostStatus(id, status) {
      const file = path.join(root, 'data', 'community-posts.json');
      const list = readJson(file, []);
      const idx = list.findIndex((row) => row.id === id);
      if (idx < 0) return;
      list[idx].status = status;
      list[idx].updatedAt = new Date().toISOString();
      fs.writeFileSync(file, JSON.stringify(list, null, 2), 'utf8');
    },
    async insertCommunityComment(comment) {
      const file = path.join(root, 'data', 'community-comments.json');
      const list = readJson(file, []);
      list.push(comment);
      const dir = path.dirname(file);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(file, JSON.stringify(list, null, 2), 'utf8');
      return comment;
    },
    async listCommunityComments(postId) {
      const file = path.join(root, 'data', 'community-comments.json');
      const users = readJson(usersPath, {});
      return readJson(file, [])
        .filter((c) => c.postId === postId && c.status === 'published')
        .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)))
        .slice(0, 200)
        .map((comment) => {
          const user = users[comment.userId] || {};
          return Object.assign({}, comment, {
            authorName: user.name || '',
            authorUsername: user.username || '',
            authorPicture: user.picture || ''
          });
        });
    },
    async getCommunityCommentById(id) {
      const file = path.join(root, 'data', 'community-comments.json');
      const users = readJson(usersPath, {});
      const comment = readJson(file, []).find((c) => c.id === id);
      if (!comment) return null;
      const user = users[comment.userId] || {};
      return Object.assign({}, comment, {
        authorName: user.name || '',
        authorUsername: user.username || '',
        authorPicture: user.picture || ''
      });
    },
    async setCommunityCommentStatus(id, status) {
      const file = path.join(root, 'data', 'community-comments.json');
      const list = readJson(file, []);
      const idx = list.findIndex((row) => row.id === id);
      if (idx < 0) return;
      list[idx].status = status;
      fs.writeFileSync(file, JSON.stringify(list, null, 2), 'utf8');
    }
  };
}

module.exports = { createFsStore };
