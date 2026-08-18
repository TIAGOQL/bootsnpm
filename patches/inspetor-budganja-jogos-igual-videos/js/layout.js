// Layout.js - Dynamic header and footer injection

const ASSET_V = '315';

let deferredInstallPrompt = null;
let installFloatingBtn = null;
const PWA_INSTALL_STATE_KEY = 'budganja_pwa_install_state';

function isStandaloneApp() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;
}

function isIosInstallable() {
  if (isStandaloneApp()) return false;
  const ua = navigator.userAgent || '';
  const ios = /iPad|iPhone|iPod/.test(ua)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  return ios;
}

function isMobileUa() {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
}

/** Chrome / Edge / Opera no desktop — candidatos a instalar PWA. */
function isDesktopInstallCandidate() {
  if (isStandaloneApp() || isIosInstallable() || isMobileUa()) return false;
  if (!window.isSecureContext || !('serviceWorker' in navigator)) return false;
  const ua = navigator.userAgent || '';
  return /Chrome|Chromium|Edg|OPR/i.test(ua) && !/SamsungBrowser/i.test(ua);
}

function isInstallDismissedRecently() {
  try {
    const raw = localStorage.getItem(PWA_INSTALL_STATE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (data.dismissedUntil && Date.now() < data.dismissedUntil) return true;
    localStorage.removeItem(PWA_INSTALL_STATE_KEY);
  } catch (e) { /* ignore */ }
  return false;
}

function rememberInstallDismissed() {
  try {
    localStorage.setItem(PWA_INSTALL_STATE_KEY, JSON.stringify({
      dismissedUntil: Date.now() + 7 * 24 * 60 * 60 * 1000
    }));
  } catch (e) { /* ignore */ }
}

function clearInstallDismissed() {
  try { localStorage.removeItem(PWA_INSTALL_STATE_KEY); } catch (e) { /* ignore */ }
}

function canShowInstallUi() {
  if (isStandaloneApp()) return false;
  if (isInstallDismissedRecently()) return false;
  if (deferredInstallPrompt) return true;
  if (isIosInstallable()) return true;
  // Android / outros: manter atalho visível mesmo sem beforeinstallprompt
  // (Chrome deixa de disparar o evento depois de recusar ou instalação falhada).
  if (isMobileUa()) return true;
  if (isDesktopInstallCandidate()) return true;
  return false;
}

function showInstallButtons() {
  refreshInstallVisibility();
}

function hideInstallButtons() {
  if (installFloatingBtn) installFloatingBtn.classList.add('is-hidden');
}

function dismissInstallUi() {
  rememberInstallDismissed();
  deferredInstallPrompt = null;
  hideInstallButtons();
}

function refreshInstallVisibility() {
  if (!installFloatingBtn) return;
  if (canShowInstallUi()) {
    installFloatingBtn.classList.remove('is-hidden');
  } else {
    installFloatingBtn.classList.add('is-hidden');
  }
}

function fillInstallSheet(sheet, titleId, title, bodyHtml) {
  const titleEl = sheet.querySelector('#' + titleId);
  const panel = sheet.querySelector('.pwa-install-sheet-panel');
  const closeBtn = sheet.querySelector('.pwa-install-sheet-close');
  if (titleEl) titleEl.textContent = title;
  if (panel) {
    const bodyNodes = panel.querySelectorAll('p, .pwa-install-sheet-body');
    bodyNodes.forEach((n) => n.remove());
    const wrap = document.createElement('div');
    wrap.className = 'pwa-install-sheet-body';
    wrap.innerHTML = bodyHtml;
    if (closeBtn) panel.insertBefore(wrap, closeBtn);
    else panel.appendChild(wrap);
  }
  if (closeBtn) closeBtn.textContent = i18n('common.installGotIt', 'Entendi');
}

function showIosInstallSheet() {
  let sheet = document.getElementById('pwa-ios-install-sheet');
  if (!sheet) {
    sheet = document.createElement('div');
    sheet.id = 'pwa-ios-install-sheet';
    sheet.className = 'pwa-install-sheet';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-labelledby', 'pwa-ios-install-title');
    sheet.innerHTML =
      '<div class="pwa-install-sheet-backdrop" data-close="1"></div>' +
      '<div class="pwa-install-sheet-panel">' +
      '<h2 id="pwa-ios-install-title"></h2>' +
      '<button type="button" class="botao pwa-install-sheet-close"></button>' +
      '</div>';
    sheet.querySelector('[data-close]').addEventListener('click', () => { sheet.hidden = true; });
    sheet.querySelector('.pwa-install-sheet-close').addEventListener('click', () => { sheet.hidden = true; });
    document.body.appendChild(sheet);
  }
  fillInstallSheet(
    sheet,
    'pwa-ios-install-title',
    i18n('common.installTitle', 'Instalar BudGanja'),
    '<p>' + i18n('common.installIosBody',
      'No iPhone ou iPad: toque em <strong>Compartilhar</strong> e depois em <strong>Adicionar à Tela de Início</strong>.') +
    ' <span class="pwa-ios-share-icon" aria-hidden="true">⎋</span></p>'
  );
  sheet.hidden = false;
}

function ensureInstallSheet(id, titleId, title, bodyHtml) {
  let sheet = document.getElementById(id);
  if (!sheet) {
    sheet = document.createElement('div');
    sheet.id = id;
    sheet.className = 'pwa-install-sheet';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-labelledby', titleId);
    sheet.innerHTML =
      '<div class="pwa-install-sheet-backdrop" data-close="1"></div>' +
      '<div class="pwa-install-sheet-panel">' +
      '<h2 id="' + titleId + '"></h2>' +
      '<button type="button" class="botao pwa-install-sheet-close"></button>' +
      '</div>';
    const closeSheet = () => { sheet.hidden = true; };
    sheet.querySelector('[data-close]').addEventListener('click', closeSheet);
    sheet.querySelector('.pwa-install-sheet-close').addEventListener('click', closeSheet);
    document.body.appendChild(sheet);
  }
  fillInstallSheet(sheet, titleId, title, bodyHtml);
  sheet.hidden = false;
  return sheet;
}

function showDesktopInstallSheet() {
  ensureInstallSheet(
    'pwa-desktop-install-sheet',
    'pwa-desktop-install-title',
    i18n('common.installDesktopTitle', 'Instalar BudGanja no computador'),
    i18n('common.installDesktopBody',
      '<p>No Chrome ou Edge: menu <strong>⋮ → Instalar Inspetor BudGanja…</strong>.</p>')
  );
}

function showAndroidInstallSheet() {
  ensureInstallSheet(
    'pwa-android-install-sheet',
    'pwa-android-install-title',
    i18n('common.installAndroidTitle', 'Instalar BudGanja no telemóvel'),
    i18n('common.installAndroidBody',
      '<p>No Chrome: toque em <strong>⋮</strong> e escolha <strong>Instalar app</strong>.</p>')
  );
}

function showAlreadyInstalledSheet() {
  ensureInstallSheet(
    'pwa-installed-sheet',
    'pwa-installed-title',
    i18n('common.installAlreadyTitle', 'App já instalado'),
    i18n('common.installAlreadyBody',
      '<p>O BudGanja já está a correr como aplicação neste dispositivo.</p>')
  );
}

function waitForInstallPrompt(timeoutMs) {
  if (deferredInstallPrompt) return Promise.resolve(deferredInstallPrompt);
  return new Promise((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      window.removeEventListener('beforeinstallprompt', onPrompt);
      resolve(null);
    }, timeoutMs);
    function onPrompt(e) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      e.preventDefault();
      deferredInstallPrompt = e;
      resolve(e);
    }
    window.addEventListener('beforeinstallprompt', onPrompt);
  });
}

async function runNativeInstallPrompt(options) {
  const opts = options || {};
  if (!deferredInstallPrompt) return false;
  try {
    await deferredInstallPrompt.prompt();
    const choice = await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    if (choice.outcome === 'accepted') {
      hideInstallButtons();
      clearInstallDismissed();
      refreshPermanentInstallButtons();
      return true;
    }
    // Só esconder o flutuante por uns dias se o utilizador fechou o banner — não o atalho do menu.
    if (opts.dismissOnCancel !== false) dismissInstallUi();
    return false;
  } catch (e) {
    if (opts.dismissOnCancel !== false) dismissInstallUi();
    return false;
  }
}

async function promptInstallApp(options) {
  const opts = options || {};
  const persistent = !!opts.persistent;
  const mainBtn = installFloatingBtn && installFloatingBtn.querySelector('.install-prompt-main');
  const labelEl = installFloatingBtn && installFloatingBtn.querySelector('.install-prompt-label');
  if (mainBtn) {
    mainBtn.disabled = true;
    mainBtn.setAttribute('aria-busy', 'true');
  }
  if (labelEl) labelEl.textContent = i18n('common.installPreparing', 'A preparar instalação…');

  try {
    if (isStandaloneApp()) {
      showAlreadyInstalledSheet();
      return true;
    }

    // Pedido explícito (menu/rodapé): reabrir a opção mesmo após ter fechado o banner.
    if (persistent) clearInstallDismissed();

    if (!deferredInstallPrompt) {
      await waitForInstallPrompt(persistent || isDesktopInstallCandidate() ? 3500 : 1200);
    }

    if (deferredInstallPrompt) {
      const accepted = await runNativeInstallPrompt({ dismissOnCancel: !persistent });
      if (!accepted && isMobileUa() && !isIosInstallable()) showAndroidInstallSheet();
      return accepted;
    }

    if (isIosInstallable()) {
      showIosInstallSheet();
      return false;
    }

    if (isMobileUa()) {
      showAndroidInstallSheet();
      return false;
    }

    if (isDesktopInstallCandidate()) {
      showDesktopInstallSheet();
    }
    return false;
  } finally {
    if (mainBtn) {
      mainBtn.disabled = false;
      mainBtn.removeAttribute('aria-busy');
    }
    applyInstallPromptI18n();
    refreshInstallVisibility();
    refreshPermanentInstallButtons();
  }
}

function applyInstallPromptI18n() {
  if (!installFloatingBtn) return;
  const mainBtn = installFloatingBtn.querySelector('.install-prompt-main');
  const labelEl = installFloatingBtn.querySelector('.install-prompt-label');
  const dismissBtn = installFloatingBtn.querySelector('.install-prompt-dismiss');
  if (mainBtn) mainBtn.setAttribute('aria-label', i18n('common.installAppAria', 'Instalar aplicativo BudGanja'));
  if (labelEl && !mainBtn?.disabled) labelEl.textContent = i18n('common.installApp', 'Instalar app');
  if (dismissBtn) {
    const close = i18n('common.installClose', 'Fechar');
    dismissBtn.setAttribute('aria-label', close);
    dismissBtn.setAttribute('title', close);
  }
}

function refreshPermanentInstallButtons() {
  const show = !isStandaloneApp();
  document.querySelectorAll('[data-pwa-install]').forEach((btn) => {
    btn.hidden = !show;
  });
}

function bindPermanentInstallButtons(root) {
  const scope = root || document;
  scope.querySelectorAll('[data-pwa-install]').forEach((btn) => {
    if (btn.dataset.boundInstall === '1') return;
    btn.dataset.boundInstall = '1';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      void promptInstallApp({ persistent: true });
    });
  });
  refreshPermanentInstallButtons();
}

window.budganjaPromptInstallApp = function () {
  return promptInstallApp({ persistent: true });
};

async function tryAutoInstallPrompt() {
  // Auto-prompt só no telemóvel — no desktop consome o evento e esconde o botão.
  if (isStandaloneApp() || isInstallDismissedRecently() || !deferredInstallPrompt) return;
  if (!isMobileUa()) return;
  try {
    if (sessionStorage.getItem('budganja_pwa_auto_prompt') === '1') return;
    sessionStorage.setItem('budganja_pwa_auto_prompt', '1');
  } catch (e) { /* ignore */ }
  await new Promise((resolve) => setTimeout(resolve, 1500));
  if (deferredInstallPrompt) await promptInstallApp();
}

function initInstallUi() {
  if (!installFloatingBtn) {
    const wrap = document.createElement('div');
    wrap.className = 'install-prompt is-hidden';
    wrap.innerHTML =
      '<button type="button" class="install-prompt-main">' +
      '<span aria-hidden="true">\uD83D\uDCF2</span> ' +
      '<span class="install-prompt-label"></span>' +
      '</button>' +
      '<button type="button" class="install-prompt-dismiss">×</button>';
    wrap.querySelector('.install-prompt-main').addEventListener('click', () => { void promptInstallApp(); });
    wrap.querySelector('.install-prompt-dismiss').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dismissInstallUi();
    });
    document.body.appendChild(wrap);
    installFloatingBtn = wrap;
  }
  applyInstallPromptI18n();
  refreshInstallVisibility();
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  showInstallButtons();
  void tryAutoInstallPrompt();
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  hideInstallButtons();
  clearInstallDismissed();
  refreshPermanentInstallButtons();
});

const APP_VERSION_KEY = 'budganja_app_version';
const APP_UPDATE_DISMISS_KEY = 'budganja_update_prompt_dismissed';
let appUpdateReloading = false;
let swRegistration = null;
let updateCheckInFlight = false;
let lastUpdateCheckAt = 0;
const UPDATE_CHECK_MIN_MS = 5000;
let appUpdatePromptEl = null;
let appUpdatePromptVersion = null;

let cachedSiteBuiltAt = null;

async function fetchVersionMeta() {
  try {
    const res = await fetch('/version.json?_=' + Date.now(), { cache: 'no-store', credentials: 'same-origin' });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

async function fetchServerAppVersion() {
  const data = await fetchVersionMeta();
  return data && data.version != null ? String(data.version) : null;
}

function formatSiteUpdatedDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const locale = (window.BudGanjaI18n && typeof window.BudGanjaI18n.getLocale === 'function')
    ? window.BudGanjaI18n.getLocale()
    : (document.documentElement.lang || 'pt-BR');
  try {
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'America/Sao_Paulo'
    }).format(d);
  } catch (e) {
    return d.toISOString().slice(0, 10);
  }
}

function resolveFooterUpdatedDate(site) {
  const fromBuild = formatSiteUpdatedDate(cachedSiteBuiltAt);
  if (fromBuild) return fromBuild;
  return i18n(
    'common.privacyUpdatedDate',
    (site && site.privacyUpdated) || DEFAULT_SITE.privacyUpdated || ''
  );
}

async function clearAllAppCaches() {
  if (!('caches' in window)) return;
  const keys = await caches.keys();
  await Promise.all(keys.map((key) => caches.delete(key)));
}

async function getCachedAppVersion() {
  if (!('caches' in window)) return null;
  const keys = await caches.keys();
  const match = keys.find((key) => key.indexOf('budganja-v') === 0);
  return match ? match.replace('budganja-v', '') : null;
}

async function unregisterLegacyServiceWorkers() {
  if (!('serviceWorker' in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  const expected = '/sw.js?v=' + ASSET_V;
  await Promise.all(regs.map((reg) => {
    const scriptUrl = (reg.active && reg.active.scriptURL)
      || (reg.waiting && reg.waiting.scriptURL)
      || (reg.installing && reg.installing.scriptURL)
      || '';
    if (!scriptUrl.includes('/sw.js')) return Promise.resolve(false);
    if (scriptUrl.indexOf(expected) !== -1) return Promise.resolve(false);
    return reg.unregister();
  }));
}

async function unregisterAllServiceWorkers() {
  if (!('serviceWorker' in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(regs.map((reg) => reg.unregister()));
}

function reloadForAppUpdate() {
  if (appUpdateReloading) return;
  appUpdateReloading = true;
  window.location.reload();
}

async function purgeAndReloadForVersion(serverVersion) {
  const guardKey = 'budganja_purge_attempts_' + serverVersion;
  let attempts = 0;
  try {
    attempts = parseInt(sessionStorage.getItem(guardKey) || '0', 10);
  } catch (e) { /* ignore */ }
  if (attempts >= 3) return;
  try {
    sessionStorage.setItem(guardKey, String(attempts + 1));
    localStorage.setItem(APP_VERSION_KEY, serverVersion);
  } catch (e) { /* ignore */ }

  await unregisterAllServiceWorkers();
  await clearAllAppCaches();

  const url = new URL(window.location.href);
  url.searchParams.set('_budv', serverVersion);
  url.hash = '';
  appUpdateReloading = true;
  window.location.replace(url.toString());
}

function wasUpdatePromptDismissed(version) {
  try {
    return localStorage.getItem(APP_UPDATE_DISMISS_KEY) === String(version);
  } catch (e) {
    return false;
  }
}

function rememberUpdatePromptDismissed(version) {
  try {
    localStorage.setItem(APP_UPDATE_DISMISS_KEY, String(version));
  } catch (e) { /* ignore */ }
}

function clearUpdatePromptDismissed() {
  try {
    localStorage.removeItem(APP_UPDATE_DISMISS_KEY);
  } catch (e) { /* ignore */ }
}

function hideUpdatePrompt() {
  if (!appUpdatePromptEl) return;
  appUpdatePromptEl.style.display = 'none';
}

function showUpdatePrompt(serverVersion) {
  if (!serverVersion || wasUpdatePromptDismissed(serverVersion)) return;
  appUpdatePromptVersion = String(serverVersion);

  if (!appUpdatePromptEl) {
    appUpdatePromptEl = document.getElementById('budganja-update-prompt');
    if (appUpdatePromptEl) {
      appUpdatePromptEl.style.display = 'block';
      return;
    }
    appUpdatePromptEl = document.createElement('div');
    appUpdatePromptEl.id = 'budganja-update-prompt';
    appUpdatePromptEl.className = 'cultivo-app-update-banner';
    appUpdatePromptEl.setAttribute('role', 'status');
    appUpdatePromptEl.setAttribute('aria-live', 'polite');
    appUpdatePromptEl.style.position = 'fixed';
    appUpdatePromptEl.style.left = '12px';
    appUpdatePromptEl.style.right = '12px';
    appUpdatePromptEl.style.bottom = '12px';
    appUpdatePromptEl.style.zIndex = '9999';
    appUpdatePromptEl.style.background = 'rgba(20,26,22,0.96)';
    appUpdatePromptEl.style.color = '#f2fff6';
    appUpdatePromptEl.style.border = '1px solid rgba(67,199,122,0.45)';
    appUpdatePromptEl.style.borderRadius = '12px';
    appUpdatePromptEl.style.padding = '12px';
    appUpdatePromptEl.style.boxShadow = '0 8px 28px rgba(0,0,0,0.35)';
    appUpdatePromptEl.innerHTML =
      '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between">' +
      '<strong style="font-size:14px">Nova versão disponível</strong>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button type="button" data-update-now="1" style="border:0;border-radius:10px;padding:8px 12px;background:#2ecc71;color:#0e2216;font-weight:700;cursor:pointer">Atualizar agora</button>' +
      '<button type="button" data-update-later="1" style="border:1px solid rgba(255,255,255,0.22);border-radius:10px;padding:8px 12px;background:transparent;color:#eaf7ee;cursor:pointer">Depois</button>' +
      '</div>' +
      '</div>';

    appUpdatePromptEl.addEventListener('click', async (event) => {
      const nowBtn = event.target && event.target.closest ? event.target.closest('[data-update-now]') : null;
      if (nowBtn) {
        clearUpdatePromptDismissed();
        await purgeAndReloadForVersion(appUpdatePromptVersion);
        return;
      }
      const laterBtn = event.target && event.target.closest ? event.target.closest('[data-update-later]') : null;
      if (laterBtn) {
        rememberUpdatePromptDismissed(appUpdatePromptVersion);
        hideUpdatePrompt();
      }
    });

    document.body.appendChild(appUpdatePromptEl);
  }

  appUpdatePromptEl.style.display = 'block';
}

async function checkAppVersionMismatch() {
  const serverVersion = await fetchServerAppVersion();
  if (!serverVersion) return false;

  let storedVersion = null;
  try { storedVersion = localStorage.getItem(APP_VERSION_KEY); } catch (e) { /* ignore */ }

  const cacheVersion = await getCachedAppVersion();

  if (!storedVersion) {
    if ((cacheVersion && cacheVersion !== serverVersion) || ASSET_V !== serverVersion) {
      showUpdatePrompt(serverVersion);
      return false;
    }
    clearUpdatePromptDismissed();
    hideUpdatePrompt();
    try { localStorage.setItem(APP_VERSION_KEY, serverVersion); } catch (e) { /* ignore */ }
    return false;
  }

  if (storedVersion !== serverVersion
      || (cacheVersion && cacheVersion !== serverVersion)
      || ASSET_V !== serverVersion) {
    showUpdatePrompt(serverVersion);
    return false;
  }
  clearUpdatePromptDismissed();
  hideUpdatePrompt();
  return false;
}

async function refreshUpdateChecks(options) {
  const force = !!(options && options.force);
  const now = Date.now();
  if (!force && now - lastUpdateCheckAt < UPDATE_CHECK_MIN_MS) return;
  if (updateCheckInFlight) return;
  updateCheckInFlight = true;
  lastUpdateCheckAt = now;
  try {
    if (await checkAppVersionMismatch()) return;
    if (swRegistration) {
      try { await swRegistration.update(); } catch (e) { /* ignore */ }
    }
  } finally {
    updateCheckInFlight = false;
  }
}

function bindAppUpdateTriggers() {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') refreshUpdateChecks({ force: true });
  });
  window.addEventListener('pageshow', () => {
    refreshUpdateChecks({ force: true });
  });
  window.addEventListener('focus', () => {
    refreshUpdateChecks({ force: true });
  });
  window.addEventListener('online', () => {
    refreshUpdateChecks({ force: true });
  });

  const onActivity = () => refreshUpdateChecks();
  document.addEventListener('pointerdown', onActivity, { passive: true });
  document.addEventListener('keydown', onActivity, { passive: true });

  window.setInterval(() => {
    if (document.visibilityState === 'visible') refreshUpdateChecks();
  }, 15000);
}

async function initAppUpdates() {
  await unregisterLegacyServiceWorkers();

  if (await checkAppVersionMismatch()) return;

  if ('serviceWorker' in navigator) {
    try {
      swRegistration = await navigator.serviceWorker.register('/sw.js?v=' + ASSET_V, { updateViaCache: 'none' });
    } catch (e) {
      swRegistration = null;
    }

    if (swRegistration) {
      swRegistration.addEventListener('updatefound', () => {
        const newWorker = swRegistration.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
        });
    });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        reloadForAppUpdate();
      });
    }
  }

  const serverVersion = await fetchServerAppVersion();
  if (serverVersion) {
    try { localStorage.setItem(APP_VERSION_KEY, serverVersion); } catch (e) { /* ignore */ }
  }

  bindAppUpdateTriggers();
  refreshUpdateChecks({ force: true });
}

async function isServerAvailable() {
  try {
    const res = await fetch('/api/me', { credentials: 'include' });
    const type = res.headers.get('content-type') || '';
    if (!type.includes('application/json')) return false;
    await res.json();
    return res.status === 401 || res.status === 200;
  } catch (e) {
    return false;
  }
}

const DEFAULT_SITE = {
  siteName: 'Inspetor BudGanja',
  siteTagline: 'Laboratório de fitoterapia brasileira',
  footerText: '© 2026 Inspetor BudGanja. Conteúdo educacional sobre plantas medicinais do Brasil.',
  privacyUpdated: '1 de agosto de 2026',
  gaMeasurementId: 'G-Q47PEYEXX6',
  ogImage: '/imagens/og-default.jpg',
  contactEmail: 'tql.tql@gmail.com',
  youtubeChannelUrl: '/videos/',
  youtubeChannelLabel: 'Canal @InspetorBudGanja',
  spotifyPodcastUrl: 'https://open.spotify.com/show/033yuLDWnN84xOcfHyJ1FZ',
  spotifyPodcastLabel: 'Podcast Inspetor BudGanja',
  nav: [
    {
      label: 'Biblioteca',
      mega: true,
      megaCompact: true,
      megaAccordion: true,
      megaHeader: 'Biblioteca',
      megaHeaderHref: '/biblioteca/',
      authOnly: false,
      groups: [{ title: '', items: [] }]
    },
    {
      label: 'Ferramentas',
      mega: true,
      megaCompact: true,
      megaAccordion: true,
      megaHeader: 'Ferramentas',
      megaHeaderHref: '/calculadoras/',
      groups: [{ title: '', items: [] }]
    }
  ],
  footerLinks: [
    { label: 'Início', href: '/' },
    { label: 'Plantas', href: '/plantas/' },
    { label: 'Animais', href: '/animais/' },
    { label: 'Curso UNIFESP', href: '/biblioteca/unifesp/' },
    { label: 'Pesquisas', href: '/biblioteca/pesquisas/' },
    { label: 'Inspeções', href: '/biblioteca/inspecoes/' },
    { label: 'Vídeos', href: '/videos/' },
    { label: 'Games', href: '/jogos/' },
    { label: 'Equipamentos', href: '/equipamentos/' },
    { label: 'Ferramentas', href: '/calculadoras/' },
    { label: 'Comunidade', href: '/comunidade/' },
    { label: 'BudGanja Radio', href: '/radio/' },
    { label: 'Sorteios', href: '/sorteios/' }
  ],
  footerGroups: [
    {
      title: 'Biblioteca',
      links: [
        { label: 'Plantas', href: '/plantas/' },
    { label: 'Animais', href: '/animais/' },
        { label: 'Curso UNIFESP', href: '/biblioteca/unifesp/' },
        { label: 'Inspeções', href: '/biblioteca/inspecoes/' },
        { label: 'Pesquisas', href: '/biblioteca/pesquisas/' },
        { label: 'Vídeos', href: '/videos/' },
        { label: 'Games', href: '/jogos/' },
        { label: 'Equipamentos', href: '/equipamentos/' }
      ]
    },
    {
      title: 'Ferramentas',
      links: [
        { label: 'Ferramentas', href: '/calculadoras/' },
        { label: 'Luxímetro', href: '/calculadoras/luximetro.html' },
        { label: 'Solo', href: '/calculadoras/super-solo.html' }
      ]
    },
    {
      title: 'Comunidade',
      links: [
        { label: 'Feed da comunidade', href: '/comunidade/' },
        { label: 'BudGanja Radio', href: '/radio/' },
        { label: 'Sorteios', href: '/sorteios/' }
      ]
    },
    {
      title: 'Sobre nós',
      links: [
        { label: 'Sobre o projeto', href: '/info/sobre.html' },
        { label: 'Contato', href: '/info/contato.html' },
        { label: 'Privacidade', href: '/info/privacidade.html' }
      ]
    }
  ]
};

function i18n(key, fallback) {
  return window.BudGanjaI18n ? window.BudGanjaI18n.t(key, fallback) : (fallback || '');
}

function translateFooterLabel(label) {
  var map = {
    'Início': 'common.home',
    'Guia de Cultivo': 'nav.growingGuide',
    'Pesquisas': 'nav.technicalResearch',
    'Inspeções': 'nav.inspections',
    'Extensão académica': 'nav.academicExtension',
    'Extensão acadêmica': 'nav.academicExtension',
    'Equipamentos': 'nav.equipment',
    'Calculadoras': 'nav.calculators',
    'Ferramentas': 'nav.calculators',
    'Luxímetro': 'nav.luxMeter',
    'Solo': 'nav.soilCalc',
    'Diário de pesquisas': 'nav.growDiary',
    'Últimos vídeos': 'nav.videos',
    'Vídeos': 'nav.videos',
    'Games': 'nav.games',
    'Comunidade': 'nav.community',
    'Feed da comunidade': 'nav.communityFeed',
    'Rádio': 'nav.radio',
    'Sorteios': 'nav.giveaways',
    'Sobre o projeto': 'nav.aboutProject',
    'Privacidade': 'nav.privacy',
    'Contato': 'nav.contact',
    'Plantas': 'nav.plants',
    'Animais': 'nav.animals',
    'UNIFESP': 'nav.unifesp'
  };
  return map[label] ? i18n(map[label], label) : label;
}

function translateFooterGroupTitle(title) {
  if (title === 'Biblioteca') return i18n('footer.groupLibrary', title);
  if (title === 'Ferramentas') return i18n('footer.groupTools', title);
  if (title === 'Comunidade') return i18n('footer.groupCommunity', title);
  if (title === 'Sobre nós') return i18n('footer.groupAbout', title);
  return title;
}

const OG_SITE_NAME = 'Inspetor BudGanja';

function escapeNavText(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
}

function safeHref(value) {
  const href = String(value || '').trim();
  return href && href !== 'undefined' && href !== 'null' ? href : '';
}

function normalizeNavPath(href) {
  const raw = safeHref(href);
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) {
    try {
      return new URL(raw).pathname.replace(/\/$/, '') || '/';
    } catch (e) {
      return raw;
    }
  }
  let path = raw.split(/[?#]/)[0];
  if (!path.startsWith('/')) path = '/' + path;
  if (path.endsWith('/index.html')) {
    path = path.slice(0, -'/index.html'.length) || '/';
  }
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }
  return path;
}

function isNavLinkActive(href) {
  const target = normalizeNavPath(href);
  if (!target) return false;
  let current = normalizeNavPath(window.location.pathname);
  if (target === current) return true;
  if (target.endsWith('/') && current === target.slice(0, -1)) return true;
  if (!target.endsWith('/') && current === target + '/') return true;
  return false;
}

function markActiveNavLinks(root) {
  if (!root) return;
  root.querySelectorAll('a[href]').forEach(function (link) {
    const href = link.getAttribute('href');
    if (!isNavLinkActive(href)) return;
    link.classList.add('active', 'is-active');
    const dropdown = link.closest('.nav-dropdown');
    if (dropdown) {
      dropdown.classList.add('is-active');
      const toggle = dropdown.querySelector('.nav-dropdown-toggle');
      if (toggle) toggle.classList.add('active');
    }
  });
}

function markQuickNavActive(root) {
  if (!root) return;
  const current = normalizeNavPath(window.location.pathname);
  root.querySelectorAll('.header-quick-link, .header-community-mark').forEach(function (link) {
    const href = link.getAttribute('href');
    const prefixes = String(link.getAttribute('data-active-prefixes') || '')
      .split(',')
      .map(function (p) { return normalizeNavPath(p.trim()); })
      .filter(Boolean);
    const prefixMatch = prefixes.some(function (prefix) {
      return current === prefix || current.startsWith(prefix + '/');
    });
    const active = isNavLinkActive(href) || prefixMatch;
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function initAccordionToggles(root, toggleSelector, wrapSelector) {
  if (!root) return;
  root.addEventListener('click', function (e) {
    const toggle = e.target.closest(toggleSelector);
    if (!toggle || !root.contains(toggle)) return;
        e.preventDefault();
    e.stopPropagation();
    const wrap = toggle.closest(wrapSelector);
    if (!wrap) return;
    const willOpen = !wrap.classList.contains('open');
    root.querySelectorAll(wrapSelector + '.open').forEach(function (other) {
      if (other === wrap) return;
      other.classList.remove('open');
      const otherBtn = other.querySelector(toggleSelector);
      if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
    });
    wrap.classList.toggle('open', willOpen);
    toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
  });
}

window.budganjaInitAccordion = initAccordionToggles;
window.budganjaIsNavLinkActive = isNavLinkActive;
window.buildAccordionListHTML = buildAccordionListHTML;

function navSlug(label) {
  return String(label || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function hoverTipMarkup(text) {
  const tip = String(text || '').trim();
  if (!tip) return { attrs: '', html: '' };
  const safe = escapeNavText(tip);
  return {
    attrs: ' data-tip="' + safe + '"',
    html: '<span class="app-tile-tip" role="tooltip">' + safe + '</span>'
  };
}

function enhanceHoverTips(root) {
  const scope = root || document;
  scope.querySelectorAll('[data-tip]:not([data-tip-done])').forEach(function (el) {
    const text = (el.getAttribute('data-tip') || '').trim();
    if (!text) return;
    el.classList.add('has-hover-tip');
    el.removeAttribute('title');
    if (!el.querySelector('.app-tile-tip')) {
      el.insertAdjacentHTML('beforeend', hoverTipMarkup(text).html);
    }
    el.setAttribute('data-tip-done', '1');
  });
}

window.budganjaEnhanceHoverTips = enhanceHoverTips;

function resolveNavTileSlug(child) {
  if (child.slug) return child.slug;
  const href = safeHref(child.href);
  if (href.includes('guia/cultivo')) return 'guia-cultivo';
  if (href.includes('/videos')) return 'videos';
  if (href.includes('/jogos')) return 'videos';
  if (href.includes('pesquisas')) return 'pesquisas';
  if (href.includes('inspecoes')) return 'inspecoes';
  if (href.includes('clonadora-6')) return 'clonadora-6';
  if (href.includes('clonadora-12')) return 'clonadora-12';
  if (href.includes('manual-clonadora')) return 'manual-clonadora';
  if (href.includes('equipamentos')) return 'equipamentos';
  if (href.includes('sorteios')) return 'sorteios';
  if (href.includes('calculadoras')) return 'calculadoras';
  return navSlug(child.label);
}

function buildSubmenuTileHTML(child) {
  const href = safeHref(child.href);
  if (!href) return '';

  const slug = resolveNavTileSlug(child);
  const slugClass = slug ? ' nav-app-tile--' + slug : '';
  const featuredClass = child.featured ? ' nav-app-tile--featured' : '';
  const icon = child.icon ? escapeNavText(child.icon) : '🧮';
  const label = child.tileLabel || child.label || '';
  const tipText = child.description || child.desc || '';
  const tip = tipText ? escapeNavText(tipText) : '';

  return (
    '<li><a href="' + escapeNavText(href) + '" class="nav-app-tile' + slugClass + featuredClass + '">' +
    '<span class="nav-app-tile-icon-wrap" aria-hidden="true">' +
    '<span class="nav-app-tile-icon">' + icon + '</span>' +
    '</span>' +
    '<span class="nav-app-tile-label">' + escapeNavText(label) + '</span>' +
    (tip ? '<span class="app-tile-tip" role="tooltip">' + tip + '</span>' : '') +
    '</a></li>'
  );
}

function buildSubmenuLinkHTML(child) {
  const href = safeHref(child.href);
  if (!href) return '';

  const icon = child.icon
    ? '<span class="nav-item-icon" aria-hidden="true">' + escapeNavText(child.icon) + '</span>'
    : '';
  const desc = child.desc
    ? '<span class="nav-item-desc">' + escapeNavText(child.desc) + '</span>'
    : '';
  const featuredClass = child.featured ? ' nav-rich-link--featured' : '';
  const badge = child.featured
    ? '<span class="nav-item-badge">' + escapeNavText(i18n('common.featured', 'Destaque')) + '</span>'
    : '';
  const tipText = child.desc || child.description || '';
  const tip = hoverTipMarkup(tipText);

  if (icon || desc) {
    return (
      '<li' + (child.featured ? ' class="nav-mega-feature"' : '') + '>' +
      '<a href="' + escapeNavText(href) + '" class="nav-rich-link has-hover-tip' + featuredClass + '"' + tip.attrs + '>' +
      icon +
      '<span class="nav-item-copy">' +
      '<span class="nav-item-label-row">' +
      '<span class="nav-item-label">' + escapeNavText(child.label) + '</span>' +
      badge +
      '</span>' +
      desc +
      '</span>' +
      tip.html +
      '</a></li>'
    );
  }

  return '<li><a href="' + escapeNavText(href) + '">' + escapeNavText(child.label) + '</a></li>';
}

function buildMegaPanelHeaderHTML(item) {
  if (!item.megaHeader && !item.megaSubtitle) return '';
  const headerHref = safeHref(item.megaHeaderHref);
  let titleHtml = '';
  if (item.megaHeader) {
    if (headerHref) {
      titleHtml =
        '<a href="' + escapeNavText(headerHref) + '" class="nav-panel-title nav-panel-title-link">' +
        escapeNavText(item.megaHeader) +
        '</a>';
    } else {
      titleHtml = '<span class="nav-panel-title">' + escapeNavText(item.megaHeader) + '</span>';
    }
  }
  return (
    '<li class="nav-panel-header">' +
    titleHtml +
    (item.megaSubtitle ? '<span class="nav-panel-subtitle">' + escapeNavText(item.megaSubtitle) + '</span>' : '') +
    '</li>'
  );
}

function buildMegaGroupHeaderHTML(group) {
  if (!group || !group.title) return '';
  const icon = group.icon
    ? '<span class="nav-group-icon" aria-hidden="true">' + escapeNavText(group.icon) + '</span>'
    : '';
  return (
    '<li class="nav-mega-group" aria-hidden="true">' +
    icon +
    '<span class="nav-group-title">' + escapeNavText(group.title) + '</span>' +
    '</li>'
  );
}

function buildAccordionLinkHTML(child) {
  const href = safeHref(child.href);
  if (!href) return '';

  const slug = resolveNavTileSlug(child);
  const slugClass = slug ? ' nav-accordion-link--' + slug : '';
  const activeClass = isNavLinkActive(href) ? ' is-active' : '';
  const icon = child.icon ? escapeNavText(child.icon) : '•';
  const label = child.label || '';
  const external = /^https?:\/\//i.test(href);
  const externalAttrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';

  return (
    '<li class="nav-accordion-item">' +
    '<a href="' + escapeNavText(href) + '" class="nav-accordion-link' + slugClass + activeClass + '"' + externalAttrs + '>' +
    '<span class="nav-accordion-icon" aria-hidden="true">' + icon + '</span>' +
    '<span class="nav-accordion-label">' + escapeNavText(label) + '</span>' +
    '</a></li>'
  );
}

function buildNavTileSubmenuHTML(parent, accordion) {
  const icon = parent.icon ? escapeNavText(parent.icon) : '🌱';
  const label = parent.tileLabel || parent.label || 'Menu';
  const subTiles = (parent.children || [])
    .map(function (child) { return buildMegaPanelTileItemHTML(child, accordion); })
    .filter(Boolean)
    .join('');
  if (!subTiles) return '';

  const wrapClass = accordion ? ' nav-tile-submenu--accordion' : '';
  const toggleClass = accordion ? ' nav-tile-submenu-toggle--accordion' : '';
  const nestedClass = accordion ? ' nav-app-tiles--nested-accordion' : '';

  return (
    '<li class="nav-tile-submenu' + wrapClass + '">' +
    '<button type="button" class="nav-tile-submenu-toggle' + toggleClass + '" aria-expanded="false" aria-haspopup="true">' +
    '<span class="nav-app-tile-icon-wrap" aria-hidden="true">' +
    '<span class="nav-app-tile-icon">' + icon + '</span>' +
    '</span>' +
    '<span class="nav-tile-submenu-label">' + escapeNavText(label) + '</span>' +
    '<span class="nav-tile-submenu-chevron" aria-hidden="true">▾</span>' +
    '</button>' +
    '<ul class="nav-app-tiles nav-app-tiles--nested' + nestedClass + '">' + subTiles + '</ul>' +
    '</li>'
  );
}

function buildMegaPanelTileItemHTML(child, accordion) {
  if (child.submenu && child.children && child.children.length) {
    return buildNavTileSubmenuHTML(child, accordion);
  }
  if (accordion) {
    return buildAccordionLinkHTML(child);
  }
  return buildSubmenuTileHTML(child);
}

function buildAccordionListHTML(items) {
  if (!items || !items.length) return '';
  return (
    '<ul class="nav-accordion-list">' +
    items.map(function (child) { return buildMegaPanelTileItemHTML(child, true); }).filter(Boolean).join('') +
    '</ul>'
  );
}

function buildMegaPanelTilesHTML(items, accordion) {
  if (!items || !items.length) return '';
  if (accordion) {
    return '<li class="nav-accordion-wrap">' + buildAccordionListHTML(items) + '</li>';
  }
  return (
    '<li class="nav-app-tiles-wrap"><ul class="nav-app-tiles">' +
    items.map(function (child) { return buildMegaPanelTileItemHTML(child, false); }).filter(Boolean).join('') +
    '</ul></li>'
  );
}

function buildMegaPanelItemsHTML(item) {
  const accordion = !!item.megaAccordion;
  let html = '';
  if (item.featured && !item.megaCompact) {
    html += buildSubmenuLinkHTML(item.featured);
  }
  if (item.groups && item.groups.length) {
    item.groups.forEach(function (group) {
      if (!accordion && group.title) {
        html += buildMegaGroupHeaderHTML(group);
      }
      if (item.megaCompact) {
        html += buildMegaPanelTilesHTML(group.items, accordion);
      } else {
        html += (group.items || []).map(buildSubmenuLinkHTML).filter(Boolean).join('');
      }
    });
  } else if (item.children && item.children.length) {
    if (item.megaCompact) {
      html += buildMegaPanelTilesHTML(item.children, accordion);
    } else {
      html += item.children.map(buildSubmenuLinkHTML).filter(Boolean).join('');
    }
  }
  return html;
}

function buildNavItemHTML(item) {
  const hasPanel = (item.children && item.children.length) || (item.groups && item.groups.length) || item.featured;
  if (hasPanel) {
    const subs = buildMegaPanelItemsHTML(item);
    const megaClass = item.mega ? ' nav-dropdown-mega' : '';
    const panelClass = item.mega ? 'nav-submenu nav-mega-panel' : 'nav-submenu';
    const compactClass = item.mega && !item.groups && !item.megaWide && !item.megaCompact && item.children && item.children.length <= 2
      ? ' nav-mega-panel--compact'
      : '';
    const wideClass = item.megaWide && !item.megaCompact ? ' nav-mega-panel--wide' : '';
    const toolsClass = item.megaCompact && !item.megaAccordion ? ' nav-mega-panel--tools' : '';
    const accordionClass = item.megaAccordion ? ' nav-mega-panel--accordion' : '';
    const panelHeader = item.mega ? buildMegaPanelHeaderHTML(item) : '';
    const navKey = navSlug(item.label);
    return (
      '<li class="nav-dropdown' + megaClass + '" data-nav="' + escapeNavText(navKey) + '">' +
      '<button type="button" class="nav-dropdown-toggle nav-pill" aria-expanded="false" aria-haspopup="true">' +
      escapeNavText(item.label) +
      ' <span class="nav-caret" aria-hidden="true"><svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button>' +
      '<ul class="' + panelClass + compactClass + wideClass + toolsClass + accordionClass + '">' + panelHeader + subs + '</ul></li>'
    );
  }

  const href = safeHref(item.href);
  if (!href) return '';

  const ctaClass = item.navCta ? ' nav-pill--cta' : '';

  return (
    '<li><a href="' + escapeNavText(href) + '" class="nav-top-link nav-pill' + ctaClass + '">' +
    escapeNavText(item.label) +
    '</a></li>'
  );
}

function isAdminAuth(authState) {
  return !!(authState && authState.isAdmin);
}

function isAuthUser(authState) {
  return !!(authState && (authState.isUser || authState.isAdmin));
}

function navItemAllowed(item, authState) {
  if (!item) return false;
  if (item.adminOnly && !isAdminAuth(authState)) return false;
  if (item.authOnly && !isAuthUser(authState)) return false;
  return true;
}

function filterAdminOnlyNav(items, authState) {
  if (!Array.isArray(items)) return [];
  return items.filter(function (item) {
    return navItemAllowed(item, authState);
  });
}

/** Hubs reais do site — fonte única para quick-nav (desktop) e menu mobile. */
function getSiteHubNav(authState) {
  const quick = [
      {
        href: '/plantas/',
        icon: '🌿',
        label: i18n('nav.plants', 'Plantas'),
        tip: i18n('nav.quickPlantsTip', 'Catálogo de plantas fitoterápicas do Brasil'),
        prefixes: '/plantas',
        tone: 'comunidade'
      },
      {
        href: '/animais/',
        icon: '🐾',
        label: i18n('nav.animals', 'Animais'),
        tip: i18n('nav.quickAnimalsTip', 'Catálogo de animais: criação, companhia e derivados industriais'),
        prefixes: '/animais',
        tone: 'comunidade'
      },
      {
        href: '/biblioteca/unifesp/',
        icon: '🎓',
        label: i18n('nav.unifesp', 'UNIFESP'),
        tip: i18n('nav.quickUnifespTip', 'Curso de extensão UNIFESP sobre cannabis medicinal'),
        prefixes: '/biblioteca/unifesp,/posts/post-inspecao-curso-unifesp',
        tone: 'inspecoes'
      },
      {
        href: '/biblioteca/',
        icon: '📚',
        label: i18n('nav.library', 'Biblioteca'),
        tip: i18n('nav.quickLibraryTip', 'Inspeções, UNIFESP, guias, pesquisas e catálogos'),
        prefixes: '/biblioteca/inspecoes,/guia',
        tone: 'inspecoes',
        authOnly: true
      },
      {
        href: '/biblioteca/pesquisas/',
        icon: '🔬',
        label: i18n('nav.technicalResearch', 'Pesquisas'),
        tip: i18n('nav.quickResearchTip', 'Pesquisas do laboratório e da comunidade'),
        prefixes: '/biblioteca/pesquisas',
        tone: 'pesquisas'
      },
      {
        href: '/calculadoras/',
        icon: '🧮',
        label: i18n('nav.calculators', 'Ferramentas'),
        tip: i18n('nav.quickCalculatorsTip', 'VPD, pH, EC, luxímetro e mais'),
        prefixes: '/calculadoras',
        tone: 'ferramentas'
      },
      {
        href: '/videos/',
        icon: '▶',
        label: i18n('nav.videos', 'Vídeos'),
        tip: i18n('nav.quickVideosTip', 'Últimos vídeos do canal'),
        prefixes: '/videos',
        tone: 'videos'
      },
      {
        href: '/jogos/',
        icon: '🎮',
        label: i18n('nav.games', 'Games'),
        tip: i18n('nav.quickGamesTip', 'Zangado e Paulinho o LOKO — mesmo player dos Vídeos'),
        prefixes: '/jogos',
        tone: 'videos'
      }
  ].filter(function (item) { return navItemAllowed(item, authState); });

  const exploreLinks = [
          {
            href: '/',
            icon: '🏠',
            label: i18n('common.home', 'Início'),
            prefixes: '/',
            exact: true,
            tone: 'inicio'
          },
          {
            href: '/biblioteca/',
            icon: '📚',
            label: i18n('nav.library', 'Biblioteca'),
            prefixes: '/biblioteca/inspecoes,/guia',
            tone: 'inspecoes',
            authOnly: true
          },
          {
            href: '/plantas/',
            icon: '🌿',
            label: i18n('nav.plants', 'Plantas'),
            prefixes: '/plantas',
            tone: 'comunidade'
          },
          {
            href: '/animais/',
            icon: '🐾',
            label: i18n('nav.animals', 'Animais'),
            prefixes: '/animais',
            tone: 'comunidade'
          },
          {
            href: '/biblioteca/unifesp/',
            icon: '🎓',
            label: i18n('nav.unifesp', 'Curso UNIFESP'),
            prefixes: '/biblioteca/unifesp',
            tone: 'inspecoes'
          },
          {
            href: '/biblioteca/inspecoes/',
            icon: '🔍',
            label: i18n('nav.inspections', 'Inspeções'),
            prefixes: '/biblioteca/inspecoes',
            tone: 'inspecoes'
          },
          {
            href: '/biblioteca/pesquisas/',
            icon: '🔬',
            label: i18n('nav.technicalResearch', 'Pesquisas'),
            prefixes: '/biblioteca/pesquisas',
            tone: 'pesquisas'
          },
          {
            href: '/videos/',
            icon: '▶',
            label: i18n('nav.videos', 'Vídeos'),
            prefixes: '/videos',
            tone: 'videos'
          },
          {
            href: '/jogos/',
            icon: '🎮',
            label: i18n('nav.games', 'Games'),
            prefixes: '/jogos',
            tone: 'videos'
          }
  ].filter(function (item) { return navItemAllowed(item, authState); });

  return {
    quick: quick,
    mobileSections: [
      {
        title: i18n('nav.sectionExplore', 'Explorar'),
        links: exploreLinks
      },
      {
        title: i18n('nav.sectionTools', 'Ferramentas'),
        links: [
          {
            href: '/calculadoras/',
            icon: '🧮',
            label: i18n('nav.calculators', 'Ferramentas'),
            prefixes: '/calculadoras',
            tone: 'ferramentas'
          },
          {
            href: '/equipamentos/',
            icon: '🛠️',
            label: i18n('nav.equipment', 'Equipamentos'),
            prefixes: '/equipamentos',
            tone: 'equipamentos'
          },
          {
            href: '/biblioteca/pesquisas/',
            icon: '🔬',
            label: i18n('nav.technicalResearch', 'Pesquisas'),
            prefixes: '/biblioteca/pesquisas',
            tone: 'pesquisas'
          }
        ]
      },
      {
        title: i18n('nav.sectionCommunity', 'Comunidade'),
        links: [
          {
            href: '/comunidade/',
            icon: '<img class="mobile-menu-link-icon-img" src="/biblioteca/imagens/foto-comunidade.png" alt="" width="20" height="20" decoding="async">',
            label: i18n('nav.communityFeed', 'Feed da comunidade'),
            prefixes: '/comunidade',
            tone: 'comunidade'
          },
          {
            href: '/radio/',
            icon: '📻',
            label: i18n('nav.radio', 'BudGanja Radio'),
            prefixes: '/radio',
            tone: 'radio'
          },
          {
            href: '/sorteios/',
            icon: '🎁',
            label: i18n('nav.giveaways', 'Sorteios'),
            prefixes: '/sorteios',
            tone: 'sorteios'
          }
        ]
      }
    ]
  };
}

function buildDesktopQuickNavHTML(authState) {
  const items = getSiteHubNav(authState).quick;
  const links = items.map(function (item) {
    const cls =
      'header-quick-link' +
      (item.tone ? ' header-quick-link--' + item.tone : '') +
      (item.mobileBar ? ' header-quick-link--mobile-bar' : '');
    return (
      '<a href="' + escapeNavText(item.href) + '" class="' + cls + '"' +
      ' data-active-prefixes="' + escapeNavText(item.prefixes) + '"' +
      ' data-tip="' + escapeNavText(item.tip) + '">' +
      '<span class="header-quick-link-icon" aria-hidden="true">' + item.icon + '</span>' +
      '<span class="header-quick-link-label">' + escapeNavText(item.label) + '</span>' +
      '</a>'
    );
  }).join('');
  return (
    '<nav class="header-quick-nav" aria-label="' + escapeNavText(i18n('nav.quickNav', 'Atalhos do laboratório')) + '">' +
    '<div class="header-quick-track">' + links + '</div></nav>'
  );
}

function buildMobileHubNavHTML(authState) {
  const sections = getSiteHubNav(authState).mobileSections;
  return sections.map(function (section) {
    const links = (section.links || []).map(function (item) {
      const cls = 'mobile-menu-link' +
        (item.cta ? ' mobile-menu-link--cta' : '') +
        (item.tone ? ' mobile-menu-link--' + item.tone : '');
      const exactAttr = item.exact ? ' data-active-exact="1"' : '';
      const iconHtml = item.icon
        ? '<span class="mobile-menu-link-icon" aria-hidden="true">' + item.icon + '</span>'
        : '';
      return (
        '<a href="' + escapeNavText(item.href) + '" class="' + cls + '"' +
        ' data-active-prefixes="' + escapeNavText(item.prefixes || item.href) + '"' +
        exactAttr + '>' +
        iconHtml +
        '<span class="mobile-menu-link-label">' + escapeNavText(item.label) + '</span>' +
        '</a>'
      );
    }).join('');
    return (
      '<div class="mobile-menu-section">' +
      '<p class="mobile-menu-section-title">' + escapeNavText(section.title) + '</p>' +
      '<div class="mobile-menu-section-links">' + links + '</div>' +
      '</div>'
    );
  }).join('');
}

function buildHeaderHTML(site, authState) {
  const config = site || DEFAULT_SITE;
  const navItems = filterAdminOnlyNav(config.nav || DEFAULT_SITE.nav, authState);
  const navLinks = navItems.map(buildNavItemHTML).join('\n                ');

  const headerSearch =
    '<div id="site-search" class="site-search" hidden role="dialog" aria-label="' + escapeNavText(i18n('common.searchTitle', 'Buscar no site')) + '">' +
    '<div class="site-search-header">' +
    '<span class="site-search-title">' + escapeNavText(i18n('common.searchTitle', 'Buscar no site')) + '</span>' +
    '<kbd class="site-search-kbd" aria-hidden="true">Ctrl+K</kbd>' +
    '</div>' +
    '<form class="site-search-form" role="search" onsubmit="return false;">' +
    '<input type="search" id="site-search-input" class="site-search-input" placeholder="' + escapeNavText(i18n('common.searchPlaceholder', 'Páginas, guias e artigos…')) + '" autocomplete="off" aria-label="' + escapeNavText(i18n('common.searchTitle', 'Buscar no site')) + '">' +
    '<button type="button" class="site-search-close" aria-label="' + escapeNavText(i18n('common.searchClose', 'Fechar busca')) + '">×</button>' +
    '</form>' +
    '<ul id="site-search-results" class="site-search-results"></ul>' +
    '</div>';

  // Cluster: rádio + plantas + animais + idioma (no mobile ficam juntos ao centro).
  const plantsQuickLink =
    '<a href="/plantas/" class="header-quick-link header-quick-link--plants header-plants-link"' +
    ' data-active-prefixes="/plantas"' +
    ' data-tip="' + escapeNavText(i18n('nav.quickPlantsTip', 'Catálogo de plantas fitoterápicas do Brasil')) + '"' +
    ' aria-label="' + escapeNavText(i18n('nav.plants', 'Plantas')) + '"' +
    ' title="' + escapeNavText(i18n('nav.plants', 'Plantas')) + '">' +
    '<span class="header-quick-link-icon" aria-hidden="true">' +
    '<svg class="header-plants-svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M12 22V11"></path>' +
    '<path d="M12 11c-3.5-1.5-6-5-6-9 4 0 7.5 2.5 9 6"></path>' +
    '<path d="M12 11c3.5-1.5 6-5 6-9-4 0-7.5 2.5-9 6"></path>' +
    '</svg></span></a>';

  const animalsQuickLink =
    '<a href="/animais/" class="header-quick-link header-quick-link--animals header-animals-link"' +
    ' data-active-prefixes="/animais"' +
    ' data-tip="' + escapeNavText(i18n('nav.quickAnimalsTip', 'Catálogo de animais: criação, companhia e derivados industriais')) + '"' +
    ' aria-label="' + escapeNavText(i18n('nav.animals', 'Animais')) + '"' +
    ' title="' + escapeNavText(i18n('nav.animals', 'Animais')) + '">' +
    '<span class="header-quick-link-icon" aria-hidden="true">' +
    '<svg class="header-animals-svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M11 5c-.5-1.5-1.5-3-3.5-3S4 4 4 6.5 5.5 10 8 10"></path>' +
    '<path d="M13 5c.5-1.5 1.5-3 3.5-3S20 4 20 6.5 18.5 10 16 10"></path>' +
    '<path d="M8 10c-2 1-3.5 3-3.5 5.5S6.5 20 10 20h4c3.5 0 5.5-2 5.5-4.5S18 11 16 10"></path>' +
    '<circle cx="9.5" cy="14" r="0.8" fill="currentColor" stroke="none"></circle>' +
    '<circle cx="14.5" cy="14" r="0.8" fill="currentColor" stroke="none"></circle>' +
    '</svg></span></a>';

  const radioLangCluster =
    '<div class="header-cluster header-cluster--community-lang">' +
    '<div id="header-radio-host" class="header-radio-host"></div>' +
    plantsQuickLink +
    animalsQuickLink +
    buildLangSwitcherHTML('header') +
    '</div>';

  const communityMark =
    '<a href="/comunidade/" class="header-community-mark"' +
    ' data-active-prefixes="/comunidade"' +
    ' data-tip="' + escapeNavText(i18n('nav.quickCommunityTip', 'Feed de fotos do diário de pesquisas')) + '"' +
    ' aria-label="' + escapeNavText(i18n('nav.community', 'Comunidade')) + '"' +
    ' title="' + escapeNavText(i18n('nav.community', 'Comunidade')) + '">' +
    '<span class="header-community-mark-media" aria-hidden="true">' +
    '<img class="header-community-mark-img" src="/biblioteca/imagens/foto-comunidade.png" alt="" width="40" height="40" decoding="async">' +
    '</span>' +
    '<span class="header-community-mark-label">' + escapeNavText(i18n('nav.community', 'Comunidade')) + '</span>' +
    '</a>';

  const headerToolbar =
    '<div class="header-toolbar">' +
    '<button type="button" class="header-quick-link header-quick-link--search" id="search-toggle" aria-expanded="false" aria-label="' + escapeNavText(i18n('common.searchOpen', 'Buscar no site')) + '" title="' + escapeNavText(i18n('common.searchShortcut', 'Buscar (Ctrl+K)')) + '">' +
    '<span class="header-quick-link-icon" aria-hidden="true">' +
    '<svg class="header-search-svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">' +
    '<circle cx="10.5" cy="10.5" r="6.5"></circle>' +
    '<path d="M16 16l4.5 4.5"></path>' +
    '</svg></span></button>' +
    headerSearch +
    '</div>';

  return (
    '<a class="skip-link" href="#main-content">' + escapeNavText(i18n('common.skipLink', 'Ir para o conteúdo')) + '</a>' +
    '<nav id="primary-nav" class="primary-nav" aria-label="' + escapeNavText(i18n('common.mobileNav', 'Navegação principal')) + '">' +
    '<ul>' + navLinks + '</ul>' +
    '</nav>' +
    '<div class="header-bar">' +
    '<div class="header-chrome header-chrome--main">' +
    '<div class="header-brand-group">' +
    '<div class="logo">' +
    '<a href="/" class="header-quick-link header-quick-link--brand logo-link" aria-label="' + escapeNavText(config.siteName || DEFAULT_SITE.siteName) + '">' +
    '<span class="header-quick-link-icon" aria-hidden="true">' +
    '<img class="logo-mark-img" src="/imagens/app-icon.v' + ASSET_V + '.png" alt="" width="28" height="28" decoding="async">' +
    '</span>' +
    '<span class="header-quick-link-label">' + escapeNavText(config.siteName || DEFAULT_SITE.siteName) + '</span>' +
    '</a></div>' +
    communityMark +
    '</div>' +
    '<span class="header-chrome-sep" aria-hidden="true"></span>' +
    radioLangCluster +
    buildDesktopQuickNavHTML(authState) +
    '<span class="header-chrome-sep header-chrome-sep--end" aria-hidden="true"></span>' +
    '<div class="header-right">' +
    '<div class="header-utilities">' +
    headerToolbar +
    '</div>' +
    '<button type="button" class="header-quick-link header-quick-link--menu menu-toggle" aria-label="' + escapeNavText(i18n('common.menuOpen', 'Abrir menu')) + '" aria-expanded="false" aria-controls="mobile-menu">' +
    '<span class="header-quick-link-icon" aria-hidden="true">' +
    '<span class="menu-toggle-bars"><span></span><span></span><span></span></span>' +
    '</span></button></div>' +
    '</div></div>'
  );
}

function buildMobileNavSectionHTML(navItem) {
  const items = (navItem.groups && navItem.groups[0] && navItem.groups[0].items) || navItem.children || [];
  if (items.length) {
    return (
      '<div class="mobile-menu-section">' +
      '<p class="mobile-menu-section-title">' + escapeNavText(navItem.label || '') + '</p>' +
      buildAccordionListHTML(items) +
      '</div>'
    );
  }
  const href = safeHref(navItem.href);
  if (!href) return '';
  const ctaClass = navItem.navCta ? ' mobile-menu-link--cta' : '';
  return (
    '<div class="mobile-menu-section mobile-menu-section--flat">' +
    '<a href="' + escapeNavText(href) + '" class="mobile-menu-link' + ctaClass + '">' +
    escapeNavText(navItem.label || '') + '</a></div>'
  );
}

function buildLangSwitcherHTML(variant) {
  const isHeader = variant === 'header';
  const rootClass = isHeader
    ? 'lang-switcher lang-switcher--header'
    : 'lang-switcher mobile-menu-util-lang';
  const btnClass = isHeader
    ? 'lang-switcher-btn header-quick-link header-quick-link--lang'
    : 'lang-switcher-btn mobile-menu-util';
  const btnInner = isHeader
    ? (
      '<span class="header-quick-link-icon" aria-hidden="true">' +
      '<svg class="header-lang-svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="12" cy="12" r="9"></circle>' +
      '<path d="M3 12h18"></path>' +
      '<path d="M12 3a14 14 0 0 1 0 18"></path>' +
      '<path d="M12 3a14 14 0 0 0 0 18"></path>' +
      '</svg></span>' +
      '<span class="lang-switcher-code">EN</span>'
    )
    : 'EN';
  return (
    '<div class="' + rootClass + '">' +
    '<button type="button" class="' + btnClass + '" aria-haspopup="listbox" aria-expanded="false" title="' +
    escapeNavText(i18n('common.langChoose', 'Choose language')) + '" aria-label="' +
    escapeNavText(i18n('common.langChoose', 'Choose language')) + '">' + btnInner + '</button>' +
    '<ul class="lang-switcher-menu" hidden role="listbox">' +
    '<li><button type="button" class="lang-switcher-option" data-lang="en" role="option">English</button></li>' +
    '<li><button type="button" class="lang-switcher-option" data-lang="pt-BR" role="option">Português</button></li>' +
    '<li><button type="button" class="lang-switcher-option" data-lang="es" role="option">Español</button></li>' +
    '</ul></div>'
  );
}

function buildMobileUtilsHTML(authState, hideAuthNav) {
  const links = [];
  links.push(
    '<button type="button" class="mobile-menu-util mobile-menu-util--search" data-mobile-search-open>' +
    '<span class="mobile-menu-util-icon" aria-hidden="true">⌕</span>' +
    '<span>' + escapeNavText(i18n('common.searchOpen', 'Buscar no site')) + '</span></button>'
  );
  links.push(buildLangSwitcherHTML('mobile'));
  if (!isStandaloneApp()) {
    links.push(
      '<button type="button" class="mobile-menu-util mobile-menu-util--install" data-pwa-install>' +
      '<span class="mobile-menu-util-icon" aria-hidden="true">⬇</span>' +
      '<span>' + escapeNavText(i18n('common.installApp', 'Instalar app')) + '</span></button>'
    );
  }
  const adminLink = authState && authState.adminLink;
  if (adminLink && !hideAuthNav) {
    links.push(
      '<a href="' + escapeNavText(adminLink.href) + '" class="mobile-menu-util">' +
      '<span class="mobile-menu-util-icon" aria-hidden="true">⚙</span>' +
      '<span>' + escapeNavText(adminLink.label || i18n('common.panel', 'Painel')) + '</span></a>'
    );
  }
  if (!links.length) return '';
  return '<div class="mobile-menu-utils">' + links.join('') + '</div>';
}

function markMobileHubActive(root) {
  if (!root) return;
  const current = normalizeNavPath(window.location.pathname);
  root.querySelectorAll('.mobile-menu-link[data-active-prefixes]').forEach(function (link) {
    const exact = link.getAttribute('data-active-exact') === '1';
    const href = link.getAttribute('href');
    if (exact) {
      link.classList.toggle('is-active', isNavLinkActive(href));
      return;
    }
    const prefixes = String(link.getAttribute('data-active-prefixes') || '')
      .split(',')
      .map(function (p) { return normalizeNavPath(p.trim()); })
      .filter(Boolean);
    const prefixMatch = prefixes.some(function (prefix) {
      if (prefix === '/') return false;
      return current === prefix || current.startsWith(prefix + '/');
    });
    link.classList.toggle('is-active', isNavLinkActive(href) || prefixMatch);
  });
}

function buildMobileMenuHTML(site, authState) {
  const config = site || DEFAULT_SITE;
  const ytUrl = config.youtubeChannelUrl || DEFAULT_SITE.youtubeChannelUrl;
  const ytLabel = config.youtubeChannelLabel || DEFAULT_SITE.youtubeChannelLabel;
  const spotifyUrl = config.spotifyPodcastUrl || DEFAULT_SITE.spotifyPodcastUrl;
  const spotifyLabel = config.spotifyPodcastLabel || DEFAULT_SITE.spotifyPodcastLabel;

  const hideAuthNav = document.body.dataset.page === 'admin'
    || document.body.dataset.page === 'sorteios-admin'
    || document.body.dataset.page === 'login'
    || document.body.dataset.page === 'entrar';

  const userLink = authState && authState.userLink;
  let accountHtml = '';
  if (userLink && !hideAuthNav) {
    if (userLink.isUser) {
      const pic = userLink.picture || '/imagens/avatars/inspector.svg';
      const avatar = '<img src="' + escapeNavText(pic) + '" alt="" class="mobile-menu-account-avatar" width="36" height="36" loading="lazy">';
      accountHtml =
        '<div class="mobile-menu-account">' +
        '<a href="' + escapeNavText(userLink.href) + '" class="mobile-menu-account-link">' +
        avatar +
        '<span class="mobile-menu-account-copy">' +
        '<strong class="mobile-menu-account-title">' + escapeNavText(userLink.label || i18n('common.profile', 'Minha conta')) + '</strong>' +
        '<span class="mobile-menu-account-hint">' + escapeNavText(i18n('common.openProfile', 'Abrir perfil')) + '</span>' +
        '</span></a></div>';
    } else {
      accountHtml =
        '<div class="mobile-menu-account">' +
        '<a href="' + escapeNavText(userLink.href) + '" class="mobile-menu-account-link mobile-menu-account-link--guest">' +
        '<span class="mobile-menu-account-avatar mobile-menu-account-avatar--guest" aria-hidden="true">👤</span>' +
        '<span class="mobile-menu-account-copy">' +
        '<strong class="mobile-menu-account-title">' + escapeNavText(userLink.label || i18n('common.login', 'Entrar')) + '</strong>' +
        '<span class="mobile-menu-account-hint">' + escapeNavText(i18n('common.accessProfile', 'Aceder ao perfil')) + '</span>' +
        '</span></a></div>';
    }
  }

  const hubNavHtml = buildMobileHubNavHTML(authState);
  const utilsHtml = buildMobileUtilsHTML(authState, hideAuthNav);

  const footLinks = [
    ytUrl
      ? (function () {
          const external = /^https?:\/\//i.test(ytUrl);
          return (
            '<a href="' + escapeNavText(ytUrl) + '" class="mobile-menu-foot-link"' +
            (external ? ' target="_blank" rel="noopener noreferrer"' : '') +
            '>▶ ' + escapeNavText(ytLabel) + '</a>'
          );
        })()
      : '',
    spotifyUrl
      ? '<a href="' + escapeNavText(spotifyUrl) + '" class="mobile-menu-foot-link mobile-menu-foot-link--muted" target="_blank" rel="noopener noreferrer">♪ ' + escapeNavText(spotifyLabel) + '</a>'
      : ''
  ].filter(Boolean).join('');

  return (
    '<div id="mobile-menu-scrim" class="mobile-menu-scrim" aria-hidden="true"></div>' +
    '<aside id="mobile-menu" class="mobile-menu" aria-hidden="true" aria-label="' + escapeNavText(i18n('common.mobileNav', 'Menu de navegação')) + '">' +
    '<div class="mobile-menu-top">' +
    '<div class="mobile-menu-brand">' +
    '<img class="mobile-menu-brand-icon" src="/imagens/app-icon.v' + ASSET_V + '.png" alt="" width="28" height="28" decoding="async">' +
    '<p class="mobile-menu-title">' + escapeNavText(config.siteName || DEFAULT_SITE.siteName) + '</p>' +
    '</div>' +
    '<button type="button" id="mobile-menu-close" class="mobile-menu-close" aria-label="' + escapeNavText(i18n('common.menuClose', 'Fechar menu')) + '">×</button>' +
    '</div>' +
    '<div class="mobile-menu-body">' +
    accountHtml +
    '<nav class="mobile-menu-nav" aria-label="' + escapeNavText(i18n('common.mobileNav', 'Navegação principal')) + '">' +
    hubNavHtml +
    '</nav>' +
    utilsHtml +
    '</div>' +
    (footLinks ? '<div class="mobile-menu-foot">' + footLinks + '</div>' : '') +
    '</aside>'
  );
}

function mountMobileMenu(site, authState, menuToggle) {
  document.getElementById('mobile-menu-scrim') && document.getElementById('mobile-menu-scrim').remove();
  document.getElementById('mobile-menu') && document.getElementById('mobile-menu').remove();

  const wrap = document.createElement('div');
  wrap.innerHTML = buildMobileMenuHTML(site, authState);
  while (wrap.firstChild) {
    document.body.appendChild(wrap.firstChild);
  }

  const scrim = document.getElementById('mobile-menu-scrim');
  const panel = document.getElementById('mobile-menu');
  const closeBtn = document.getElementById('mobile-menu-close');
  if (!scrim || !panel) return;

  function setOpen(open) {
    scrim.classList.toggle('is-open', open);
    panel.classList.toggle('is-open', open);
    scrim.setAttribute('aria-hidden', open ? 'false' : 'true');
    panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.classList.toggle('mobile-menu-open', open);
    if (menuToggle) {
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuToggle.classList.toggle('is-active', open);
      menuToggle.setAttribute(
        'aria-label',
        open ? i18n('common.menuClose', 'Fechar menu de navegação') : i18n('common.menuOpen', 'Abrir menu de navegação')
      );
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(panel.getAttribute('aria-hidden') !== 'false');
    });
  }

  if (closeBtn) closeBtn.addEventListener('click', function () { setOpen(false); });
  scrim.addEventListener('click', function () { setOpen(false); });

  markMobileHubActive(panel);

  const searchOpenBtn = panel.querySelector('[data-mobile-search-open]');
  if (searchOpenBtn) {
    searchOpenBtn.addEventListener('click', function () {
      setOpen(false);
      if (typeof window.budganjaSetSearchOpen === 'function') {
        var searchPanel = document.getElementById('site-search');
        window.budganjaSetSearchOpen(searchPanel ? searchPanel.hidden : true);
        return;
      }
      const searchToggle = document.getElementById('search-toggle');
      if (searchToggle) searchToggle.click();
    });
  }

  bindPermanentInstallButtons(panel);
  panel.querySelectorAll('[data-pwa-install]').forEach(function (btn) {
    btn.addEventListener('click', function () { setOpen(false); });
  });

  panel.querySelectorAll('a[href]').forEach(function (link) {
    link.addEventListener('click', function () { setOpen(false); });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.getAttribute('aria-hidden') === 'false') setOpen(false);
  });
}

function buildFooterHTML(site) {
  const config = site || DEFAULT_SITE;
  const ytUrl = config.youtubeChannelUrl || DEFAULT_SITE.youtubeChannelUrl;
  const ytLabel = config.youtubeChannelLabel || DEFAULT_SITE.youtubeChannelLabel;
  const spotifyUrl = config.spotifyPodcastUrl || DEFAULT_SITE.spotifyPodcastUrl;
  const spotifyLabel = config.spotifyPodcastLabel || DEFAULT_SITE.spotifyPodcastLabel;
  const footerGroups = config.footerGroups || DEFAULT_SITE.footerGroups;
  const privacyDate = resolveFooterUpdatedDate(config);

  const groupsHtml = footerGroups.map((group) =>
    '<div class="footer-col">' +
    '<p class="footer-col-title">' + escapeNavText(translateFooterGroupTitle(group.title)) + '</p>' +
    '<nav class="footer-col-links" aria-label="' + escapeNavText(translateFooterGroupTitle(group.title)) + '">' +
    (group.links || []).map((link) => {
      const href = safeHref(link.href);
      return href ? '<a href="' + escapeNavText(href) + '">' + escapeNavText(translateFooterLabel(link.label)) + '</a>' : '';
    }).filter(Boolean).join('') +
    '</nav></div>'
  ).join('');

  const brandHtml =
    '<div class="footer-brand">' +
    '<a href="/" class="footer-brand-link">' +
    '<img class="footer-brand-icon" src="/imagens/app-icon.v' + ASSET_V + '.png" alt="" width="32" height="32" loading="lazy" decoding="async">' +
    '<span class="footer-brand-name">' + escapeNavText(config.siteName || DEFAULT_SITE.siteName) + '</span>' +
    '</a>' +
    '<p class="footer-brand-tagline">' + escapeNavText(i18n('footer.tagline', config.siteTagline || DEFAULT_SITE.siteTagline || '')) + '</p>' +
    (ytUrl
      ? (function () {
          const external = /^https?:\/\//i.test(ytUrl);
          return (
            '<a href="' + escapeNavText(ytUrl) + '" class="footer-yt-link"' +
            (external ? ' target="_blank" rel="noopener noreferrer"' : '') +
            '>' + escapeNavText(ytLabel) +
            (external ? ' <span class="footer-ext" aria-hidden="true">↗</span>' : '') +
            '</a>'
          );
        })()
      : '') +
    (spotifyUrl
      ? '<a href="' + escapeNavText(spotifyUrl) + '" class="footer-yt-link" target="_blank" rel="noopener noreferrer">' +
        escapeNavText(spotifyLabel) + ' <span class="footer-ext" aria-hidden="true">↗</span></a>'
      : '') +
    '</div>';

  return (
    '<footer class="site-footer">' +
    '<div class="footer-shell">' +
    '<div class="footer-grid">' +
    brandHtml +
    groupsHtml +
    '</div>' +
    '<div class="footer-bar">' +
    '<p class="footer-copy">' + escapeNavText(i18n('footer.copy', config.footerText || DEFAULT_SITE.footerText)) + '</p>' +
    '<div class="footer-bar-actions">' +
    '<button type="button" class="footer-install-btn" data-pwa-install>' +
    escapeNavText(i18n('common.installApp', 'Instalar app')) +
    '</button>' +
    '<p class="footer-legal">' +
    escapeNavText(i18n('common.footerLegal', 'Conteúdo educacional.')) +
    ' · <a href="/info/privacidade.html">' + escapeNavText(i18n('common.footerPrivacy', 'Privacidade')) + '</a>' +
    ' · ' + escapeNavText(i18n('common.footerUpdated', 'atualizado em')) + ' ' + escapeNavText(privacyDate) +
    '</p>' +
    '</div>' +
    '</div>' +
    '</div></footer>'
  );
}

function absoluteUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const origin = window.location.origin;
  const base = path.startsWith('/') ? path : '/' + path.replace(/^\.\//, '');
  return origin + base;
}

function injectSeoMeta(site) {
  const head = document.head;
  if (!head) return;

  const pageUrl = window.location.href.split('#')[0];
  const title = document.title || OG_SITE_NAME;
  const descMeta = head.querySelector('meta[name="description"]');
  const description = descMeta ? descMeta.getAttribute('content') : '';

  function ensureMeta(attr, key, value) {
    if (!value) return;
    let el = head.querySelector('meta[' + attr + '="' + key + '"]');
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      head.appendChild(el);
    }
    el.setAttribute('content', value);
  }

  // Preferência: capa do post/página. Ícones PWA (icon-512, etc.) são fracos no WhatsApp —
  // nesses casos usar o hero do site (igual à home).
  const existingOg = head.querySelector('meta[property="og:image"]');
  const existingTw = head.querySelector('meta[name="twitter:image"]');
  const existingOgUrl = head.querySelector('meta[property="og:url"]');
  const pageCover = (existingOg && existingOg.getAttribute('content')) ||
    (existingTw && existingTw.getAttribute('content')) || '';
  const siteCover = site.ogImage || DEFAULT_SITE.ogImage || '/imagens/background-hero.png';
  function isWeakShareImage(url) {
    return /\/imagens\/(?:icon-192|icon-512|icon-512-maskable|app-icon|apple-touch-icon|favicon)/i.test(String(url || ''));
  }
  const chosenCover = (pageCover && !isWeakShareImage(pageCover)) ? pageCover : siteCover;
  const imageUrl = absoluteUrl(chosenCover || pageCover);
  if (!imageUrl) return;

  ensureMeta('property', 'og:image', imageUrl);
  if (!(existingOgUrl && existingOgUrl.getAttribute('content'))) {
    ensureMeta('property', 'og:url', pageUrl);
  }
  ensureMeta('property', 'og:site_name', OG_SITE_NAME);
  ensureMeta('name', 'twitter:card', 'summary_large_image');
  ensureMeta('name', 'twitter:title', title);
  ensureMeta('name', 'twitter:description', description);
  ensureMeta('name', 'twitter:image', imageUrl);

  if (!head.querySelector('link[rel="canonical"]')) {
    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    const existingUrl = existingOgUrl && existingOgUrl.getAttribute('content');
    canonical.href = existingUrl || pageUrl;
    head.appendChild(canonical);
  }

  if (document.body.dataset.page === 'home' && !document.getElementById('jsonld-org')) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'jsonld-org';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: OG_SITE_NAME,
      url: absoluteUrl('index.html'),
      description: description,
      sameAs: [
        'https://www.youtube.com/@InspetorBudGanja',
        site.spotifyPodcastUrl || DEFAULT_SITE.spotifyPodcastUrl
      ].filter(Boolean)
    });
    head.appendChild(script);
  }
}

function initAnalytics(site) {
  function run() {
    if (window.BudGanjaAnalytics && typeof window.BudGanjaAnalytics.init === 'function') {
      window.BudGanjaAnalytics.init(site || DEFAULT_SITE);
      return true;
    }
    return false;
  }
  if (run()) return;
  if (document.querySelector('script[src*="analytics.js"]')) {
    var existing = document.querySelector('script[src*="analytics.js"]');
    existing.addEventListener('load', function () { run(); });
    return;
  }
  var s = document.createElement('script');
  s.id = 'budganja-analytics-js';
  s.src = '/js/analytics.js?v=' + ASSET_V;
  s.onload = function () { run(); };
  document.head.appendChild(s);
}

async function fetchSiteConfig() {
  let site = DEFAULT_SITE;
  try {
    const res = await fetch('/api/site');
    if (res.ok) site = await res.json();
  } catch (e) { /* fallback */ }
  return applyGeneratedNav(site);
}

function applyGeneratedNav(site) {
  if (!site || !Array.isArray(site.nav)) return site;
  const bib = typeof window !== 'undefined' ? window.__BIBLIOTECA_NAV__ : null;
  const fer = typeof window !== 'undefined' ? window.__FERRAMENTAS_NAV__ : null;
  if (!bib && !fer) return site;
  const next = Object.assign({}, site);
  if (bib && fer) {
    next.nav = [bib, fer];
  } else {
    next.nav = site.nav.map(function (item) {
      if (item && item.label === 'Biblioteca' && bib) return bib;
      if (item && item.label === 'Ferramentas' && fer) return fer;
      return item;
    });
  }
  return next;
}

function localizeSiteForLayout(site) {
  if (!site) return site;
  try {
    var next = JSON.parse(JSON.stringify(site));
    if (window.BudGanjaI18n && window.BudGanjaI18n.localizeNavTree && Array.isArray(next.nav)) {
      next.nav = window.BudGanjaI18n.localizeNavTree(next.nav);
    }
    return next;
  } catch (e) {
    return site;
  }
}

function localizeAuthForLayout(authState) {
  if (!authState) return authState;
  var next = Object.assign({}, authState);
  if (next.userLink) {
    next.userLink = Object.assign({}, next.userLink, {
      label: next.userLink.isUser
        ? i18n('common.profile', 'Minha conta')
        : i18n('common.login', 'Entrar')
    });
  }
  if (next.adminLink) {
    next.adminLink = Object.assign({}, next.adminLink, {
      label: i18n('common.panel', 'Painel')
    });
  }
  return next;
}

function applyFerramentasNav(site) {
  return applyGeneratedNav(site);
}

async function fetchAuthState() {
  const userFallback = { label: i18n('common.login', 'Entrar'), href: '/entrar.html', isUser: false };
  const state = { userLink: userFallback, adminLink: null, isAdmin: false, isUser: false };

  try {
    const serverOk = await isServerAvailable();
    if (!serverOk) return localizeAuthForLayout(state);

    try {
      const res = await fetch('/api/user/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        state.userLink = {
          label: i18n('common.profile', 'Minha conta'),
          href: '/perfil.html',
          isUser: true,
          picture: data.picture || '/imagens/avatars/inspector.svg',
          name: data.name || null
        };
        state.isUser = true;
      }
    } catch (e) { /* not logged in as user */ }

    try {
      const res = await fetch('/api/me', { credentials: 'include' });
      if (res.ok) {
        state.adminLink = { label: i18n('common.panel', 'Painel'), href: '/admin.html', isAdmin: true };
        state.isAdmin = true;
      }
    } catch (e) { /* not admin */ }

    return localizeAuthForLayout(state);
  } catch (e) {
    return localizeAuthForLayout(state);
  }
}

function slugFromPostUrl(href) {
  if (!href) return '';
  const match = String(href).match(/\/posts\/post-([^/?#]+)\.html/i)
    || String(href).match(/(?:^|\/)post-([^/?#]+)\.html/i);
  return match ? match[1] : '';
}

function adminEditUrl(slug) {
  return '/admin.html?slug=' + encodeURIComponent(slug);
}

function enhancePostCardEditButtons() {
  if (document.body.dataset.adminSession !== '1') return;

  document.querySelectorAll('.post-card:not([data-admin-enhanced])').forEach(function (card) {
    var slug = card.dataset.postSlug || '';
    if (!slug) {
      var link = card.querySelector('a[href]');
      slug = slugFromPostUrl(link && link.getAttribute('href'));
    }
    if (!slug) return;

    card.dataset.adminEnhanced = '1';
    card.dataset.postSlug = slug;
    card.classList.add('post-card--admin');

    var btn = document.createElement('a');
    btn.href = adminEditUrl(slug);
    btn.className = 'post-card-edit-btn';
    btn.title = 'Editar publicação';
    btn.setAttribute('aria-label', 'Editar publicação');
    btn.textContent = '✏️';
    card.appendChild(btn);
  });
}

function showAdminPostEditBar() {
  if (document.body.dataset.page === 'admin' || document.body.dataset.page === 'login' || document.body.dataset.page === 'sorteios-admin') return;

  var postSlug = document.body.dataset.postSlug;
  if (!postSlug) return;

  var main = document.querySelector('main');
  var h1 = main && main.querySelector('h1');
  if (!h1 || main.querySelector('.admin-edit-inline')) return;

  var link = document.createElement('a');
  link.href = adminEditUrl(postSlug);
  link.className = 'admin-edit-inline';
  link.textContent = '✏️ Editar publicação';
  h1.insertAdjacentElement('afterend', link);
}

function initAdminEditUi(authLink) {
  if (!authLink || !authLink.isAdmin) return;
  document.body.dataset.adminSession = '1';
  showAdminPostEditBar();
  enhancePostCardEditButtons();
  window.budganjaEnhanceAdminPostCards = enhancePostCardEditButtons;

  if (typeof MutationObserver !== 'undefined') {
    var observer = new MutationObserver(function () {
      enhancePostCardEditButtons();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
}

function syncHeaderOffset() {
  const header = document.getElementById('site-header');
  if (!header) return;
  document.documentElement.style.setProperty('--header-offset', header.offsetHeight + 'px');
}

function isMobileNav() {
  return window.matchMedia('(max-width: 1024px)').matches;
}

function closeAllDropdowns(navRoot, except) {
  if (!navRoot) return;
  navRoot.querySelectorAll('.nav-dropdown.open').forEach((dropdown) => {
    if (dropdown === except) return;
    dropdown.classList.remove('open');
    const toggle = dropdown.querySelector('.nav-dropdown-toggle');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  });
}

function toggleNavDropdown(btn, navRoot) {
  const dropdown = btn.closest('.nav-dropdown');
  if (!dropdown) return;
  const willOpen = !dropdown.classList.contains('open');
  closeAllDropdowns(navRoot, willOpen ? dropdown : null);
  dropdown.classList.toggle('open', willOpen);
  btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
}

function initNavDropdowns(navPanel, setMobileNav) {
  if (!navPanel) return;

  navPanel.addEventListener('click', function (e) {
    const tileToggle = e.target.closest('.nav-tile-submenu-toggle');
    if (tileToggle && navPanel.contains(tileToggle)) {
      e.preventDefault();
      e.stopPropagation();
      const wrap = tileToggle.closest('.nav-tile-submenu');
      if (!wrap) return;
      const willOpen = !wrap.classList.contains('open');
      navPanel.querySelectorAll('.nav-tile-submenu.open').forEach(function (other) {
        if (other === wrap) return;
        other.classList.remove('open');
        const otherBtn = other.querySelector('.nav-tile-submenu-toggle');
        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
      });
      wrap.classList.toggle('open', willOpen);
      tileToggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      return;
    }

    const toggle = e.target.closest('.nav-dropdown-toggle');
    if (toggle && navPanel.contains(toggle)) {
      e.preventDefault();
      e.stopPropagation();
      toggleNavDropdown(toggle, navPanel);
      return;
    }

    const link = e.target.closest('a[href]');
    if (link && navPanel.contains(link) && isMobileNav()) {
      return;
    }
  });

  navPanel.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const tileToggle = e.target.closest('.nav-tile-submenu-toggle');
    if (tileToggle && navPanel.contains(tileToggle)) {
      e.preventDefault();
      tileToggle.click();
      return;
    }
    const toggle = e.target.closest('.nav-dropdown-toggle');
    if (!toggle || !navPanel.contains(toggle)) return;
    e.preventDefault();
    toggleNavDropdown(toggle, navPanel);
  });

  document.addEventListener('click', function (e) {
    if (e.target.closest('.nav-dropdown')) return;
    closeAllDropdowns(navPanel);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeAllDropdowns(navPanel);
    }
  });
}

async function enrichBibliotecaWithPosts(navPanel) {
  if (window.matchMedia('(min-width: 1025px)').matches) return;

  const dropdown = navPanel && navPanel.querySelector('[data-nav="biblioteca"] .nav-mega-panel');
  if (!dropdown) return;

  let posts = [];
  try {
    const res = await fetch('/api/posts');
    if (res.ok) posts = await res.json();
  } catch (e) { /* fallback */ }

  if (!posts.length) {
    try {
      const res = await fetch('/posts-public.json');
      if (res.ok) posts = await res.json();
    } catch (e) { /* ignore */ }
  }

  if (!posts.length) return;

  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  const categoryLabels = {
    pesquisa: 'Pesquisas',
    inspecao: 'Inspeções',
    equipamento: 'Equipamentos'
  };

  const grouped = { pesquisa: [], inspecao: [], equipamento: [] };
  posts.forEach((post) => {
    const cat = post.category || 'pesquisa';
    if (grouped[cat] && grouped[cat].length < 3) grouped[cat].push(post);
  });

  Object.keys(grouped).forEach((cat) => {
    if (!grouped[cat].length) return;

    const section = document.createElement('li');
    section.className = 'nav-recent-group';
    section.innerHTML =
      '<span class="nav-recent-title">' + escapeNavText(categoryLabels[cat] || cat) + ' — recentes</span>' +
      '<ul class="nav-recent-list">' +
      grouped[cat].map(function (post) {
        const href = safeHref(post.url || post.filename);
        if (!href) return '';
        const excerpt = String(post.excerpt || post.title || '').trim();
        const tip = hoverTipMarkup(excerpt);
        return (
          '<li><a href="' + escapeNavText(href) + '" class="nav-recent-link has-hover-tip"' + tip.attrs + '>' +
          escapeNavText(post.title || 'Publicação') +
          tip.html +
          '</a></li>'
        );
      }).filter(Boolean).join('') +
      '</ul>';

    dropdown.appendChild(section);
  });

  enhanceHoverTips(dropdown);
}

function applyUserPictureToDom(picture) {
  if (!picture) return;
  document.querySelectorAll('.header-profile-avatar, .nav-user-avatar, .mobile-menu-account-avatar').forEach(function (img) {
    img.src = picture;
  });
}

let cachedLayoutSite = null;
let cachedLayoutAuth = null;

function applyAdminOnlyVisibility(isAdmin) {
  document.body.classList.toggle('is-admin', !!isAdmin);
  document.querySelectorAll('[data-admin-only]').forEach(function (el) {
    if (isAdmin) el.removeAttribute('hidden');
    else el.setAttribute('hidden', '');
  });
}

function applyAuthOnlyVisibility(authState) {
  const allow = isAuthUser(authState);
  document.body.classList.toggle('is-auth-user', allow);
  document.querySelectorAll('[data-auth-only]').forEach(function (el) {
    if (allow) el.removeAttribute('hidden');
    else el.setAttribute('hidden', '');
  });
}

function injectLayout(site, authState) {
  cachedLayoutSite = site;
  cachedLayoutAuth = authState;
  const localizedSite = localizeSiteForLayout(site);
  const localizedAuth = localizeAuthForLayout(authState);
  const headerContainer = document.getElementById('site-header');
  const footerContainer = document.getElementById('site-footer');
  const headerHTML = buildHeaderHTML(localizedSite, localizedAuth);
  const footerHTML = buildFooterHTML(localizedSite);
  applyAdminOnlyVisibility(isAdminAuth(localizedAuth));
  applyAuthOnlyVisibility(localizedAuth);

  if (headerContainer) {
    headerContainer.innerHTML = headerHTML;

    const menuToggle = headerContainer.querySelector('.menu-toggle');
    const navPanel = document.getElementById('primary-nav');
    const quickNav = headerContainer.querySelector('.header-quick-nav');

    mountMobileMenu(localizedSite, localizedAuth, menuToggle);
    initNavDropdowns(navPanel, function () {});

    const updateHeaderState = function () {
      const scrolled = window.scrollY > 16;
      headerContainer.classList.toggle('is-scrolled', scrolled);
      syncHeaderOffset();
    };
    updateHeaderState();
    window.addEventListener('scroll', updateHeaderState, { passive: true });
    window.addEventListener('resize', updateHeaderState, { passive: true });

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (navPanel) {
      markActiveNavLinks(navPanel);
      enhanceHoverTips(navPanel);
    }
    if (quickNav) {
      markQuickNavActive(quickNav);
      enhanceHoverTips(quickNav);
    }

    enhanceHoverTips(headerContainer);
  }

  if (footerContainer) {
    footerContainer.innerHTML = footerHTML;
    markActiveNavLinks(footerContainer);
    bindPermanentInstallButtons(footerContainer);
  }
}


document.addEventListener('DOMContentLoaded', async function () {
  initInstallUi();
  initAppUpdates();

  window.addEventListener('budganja:user-profile', function (e) {
    if (e.detail && e.detail.picture) applyUserPictureToDom(e.detail.picture);
  });

  const [site, authState, versionMeta] = await Promise.all([
    fetchSiteConfig(),
    fetchAuthState(),
    fetchVersionMeta()
  ]);
  if (versionMeta && versionMeta.builtAt) cachedSiteBuiltAt = String(versionMeta.builtAt);
  injectLayout(site, authState);
  if (window.BudGanjaI18n) {
    window.BudGanjaI18n.apply();
    window.BudGanjaI18n.initLanguageSwitcher();
  }
  if (typeof window.budganjaReinitChrome === 'function') window.budganjaReinitChrome();
  enhanceHoverTips(document);
  initInstallUi();
  refreshInstallVisibility();
  bindPermanentInstallButtons(document);
  injectSeoMeta(site);
  initAnalytics(site);

  window.addEventListener('budganja:locale-change', function () {
    injectLayout(cachedLayoutSite, cachedLayoutAuth);
    if (window.BudGanjaI18n) {
      window.BudGanjaI18n.apply();
      window.BudGanjaI18n.initLanguageSwitcher();
    }
    applyInstallPromptI18n();
    enhanceHoverTips(document);
    if (typeof window.budganjaReinitChrome === 'function') window.budganjaReinitChrome();
  });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  if (authState && authState.isAdmin) initAdminEditUi(authState);

  if (!document.querySelector('script[src*="site-features.js"]')) {
    const feat = document.createElement('script');
    feat.id = 'site-features-js';
    feat.src = '/js/site-features.js?v=' + ASSET_V;
    document.body.appendChild(feat);
  }

  function loadRadioPlayerScript() {
    if (document.querySelector('script[src*="radio-player.js"]')) return;
    const radio = document.createElement('script');
    radio.id = 'radio-player-js';
    radio.src = '/js/radio-player.js?v=' + ASSET_V;
    document.body.appendChild(radio);
  }

  function loadRadioOrderThenPlayer() {
    if (window.BudGanjaRadioOrder) {
      loadRadioPlayerScript();
      return;
    }
    if (document.querySelector('script[src*="radio-order.js"]')) {
      loadRadioPlayerScript();
      return;
    }
    const order = document.createElement('script');
    order.id = 'radio-order-js';
    order.src = '/js/radio-order.js?v=' + ASSET_V;
    order.onload = loadRadioPlayerScript;
    order.onerror = loadRadioPlayerScript;
    document.body.appendChild(order);
  }

  if (window.BudGanjaRadioMedia) {
    loadRadioOrderThenPlayer();
  } else if (!document.querySelector('script[src*="radio-media-session.js"]')) {
    const radioMedia = document.createElement('script');
    radioMedia.id = 'radio-media-session-js';
    radioMedia.src = '/js/radio-media-session.js?v=' + ASSET_V;
    radioMedia.onload = loadRadioOrderThenPlayer;
    radioMedia.onerror = loadRadioOrderThenPlayer;
    document.body.appendChild(radioMedia);
  } else {
    loadRadioOrderThenPlayer();
  }
});
