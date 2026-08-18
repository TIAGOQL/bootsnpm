import { REM_AUTH_CONFIG } from "./auth-config.js";

const SESSION_KEY = "rem-auth-v1";
const CONFIG_KEY = "rem-auth-config-v1";

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getSession() {
  const s = readJson(SESSION_KEY, null);
  if (!s || !s.provider || !s.sub) return null;
  return s;
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function saveSession(session) {
  const next = {
    provider: session.provider,
    sub: String(session.sub),
    name: session.name || "",
    email: session.email || "",
    picture: session.picture || "",
    at: session.at || new Date().toISOString(),
  };
  writeJson(SESSION_KEY, next);
  return next;
}

function defaultAppleRedirect() {
  if (typeof location === "undefined") return "";
  return location.href.split("?")[0].split("#")[0];
}

export function getAuthConfig() {
  const local = readJson(CONFIG_KEY, {});
  return {
    googleClientId: String(local.googleClientId || REM_AUTH_CONFIG.googleClientId || "").trim(),
    appleClientId: String(local.appleClientId || REM_AUTH_CONFIG.appleClientId || "").trim(),
    appleRedirectURI: String(
      local.appleRedirectURI || REM_AUTH_CONFIG.appleRedirectURI || defaultAppleRedirect()
    ).trim(),
  };
}

export function saveAuthConfig(partial) {
  const cur = getAuthConfig();
  const next = {
    googleClientId: String(partial.googleClientId ?? cur.googleClientId).trim(),
    appleClientId: String(partial.appleClientId ?? cur.appleClientId).trim(),
    appleRedirectURI: String(partial.appleRedirectURI ?? cur.appleRedirectURI).trim(),
  };
  writeJson(CONFIG_KEY, next);
  return next;
}

function decodeJwtPayload(token) {
  const parts = String(token || "").split(".");
  if (parts.length < 2) return null;
  try {
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    return JSON.parse(atob(pad));
  } catch {
    return null;
  }
}

function loadScript(src, id) {
  return new Promise((resolve, reject) => {
    if (id && document.getElementById(id)?.dataset.loaded === "1") {
      resolve();
      return;
    }
    const existing = id ? document.getElementById(id) : document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "1") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Falha ao carregar ${src}`)), {
        once: true,
      });
      return;
    }
    const el = document.createElement("script");
    el.src = src;
    el.async = true;
    if (id) el.id = id;
    el.onload = () => {
      el.dataset.loaded = "1";
      resolve();
    };
    el.onerror = () => reject(new Error(`Falha ao carregar ${src}`));
    document.head.appendChild(el);
  });
}

export async function ensureGoogleSdk() {
  await loadScript("https://accounts.google.com/gsi/client", "rem-gis-sdk");
  if (!window.google?.accounts?.id) {
    throw new Error("Google Identity Services não carregou.");
  }
}

export async function ensureAppleSdk() {
  await loadScript(
    "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js",
    "rem-apple-sdk"
  );
  if (!window.AppleID?.auth) {
    throw new Error("Apple Sign In JS não carregou.");
  }
}

function sessionFromGoogleCredential(credential) {
  const payload = decodeJwtPayload(credential);
  if (!payload?.sub) throw new Error("Google não devolveu identidade válida.");
  return saveSession({
    provider: "google",
    sub: payload.sub,
    name: payload.name || payload.given_name || "",
    email: payload.email || "",
    picture: payload.picture || "",
  });
}

/** Monta o botão oficial Google (GIS). Cadastro = mesmo fluxo de login. */
export async function mountGoogleButton(host, { onSession, onError } = {}) {
  const { googleClientId } = getAuthConfig();
  if (!googleClientId) throw new Error("Falta o Google Client ID.");
  await ensureGoogleSdk();
  host.innerHTML = "";

  window.google.accounts.id.initialize({
    client_id: googleClientId,
    callback: (response) => {
      try {
        const session = sessionFromGoogleCredential(response.credential);
        onSession?.(session);
      } catch (err) {
        onError?.(err);
      }
    },
    auto_select: false,
    ux_mode: "popup",
    context: "signup",
  });

  window.google.accounts.id.renderButton(host, {
    type: "standard",
    theme: "outline",
    size: "large",
    text: "signup_with",
    shape: "rectangular",
    logo_alignment: "left",
    width: Math.min(340, Math.max(240, host.clientWidth || 280)),
    locale: "pt",
  });
}

export async function signInWithApple() {
  const { appleClientId, appleRedirectURI } = getAuthConfig();
  if (!appleClientId) {
    throw new Error("Falta o Apple Services ID. Cole em «Ligar provedores» e salve.");
  }
  if (!appleRedirectURI) {
    throw new Error("Falta o Redirect URI da Apple.");
  }
  await ensureAppleSdk();

  window.AppleID.auth.init({
    clientId: appleClientId,
    scope: "name email",
    redirectURI: appleRedirectURI,
    usePopup: true,
  });

  const response = await window.AppleID.auth.signIn();
  const idToken = response?.authorization?.id_token;
  const payload = decodeJwtPayload(idToken);
  if (!payload?.sub) {
    throw new Error("Apple não devolveu identidade válida.");
  }
  const nameFromApple = response?.user?.name;
  const fullName = nameFromApple
    ? [nameFromApple.firstName, nameFromApple.lastName].filter(Boolean).join(" ")
    : "";

  return saveSession({
    provider: "apple",
    sub: payload.sub,
    name: fullName || payload.email || "Conta Apple",
    email: response?.user?.email || payload.email || "",
    picture: "",
  });
}

function providerLabel(provider) {
  if (provider === "google") return "Google";
  if (provider === "apple") return "Apple";
  return provider || "conta";
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function setStatus(el, message, kind) {
  if (!el) return;
  el.hidden = !message;
  el.textContent = message || "";
  el.dataset.kind = kind || "";
}

function renderLoggedIn(root, session) {
  const who = session.name || session.email || session.sub;
  const pic = session.picture
    ? `<img class="auth-avatar" src="${escapeHtml(session.picture)}" alt="" width="48" height="48" referrerpolicy="no-referrer">`
    : `<span class="auth-avatar auth-avatar-fallback" aria-hidden="true">${escapeHtml(
        (who || "?").slice(0, 1).toUpperCase()
      )}</span>`;

  root.innerHTML = `
    <section class="auth-panel" data-auth-view="in">
      <div class="auth-profile">
        ${pic}
        <div class="auth-profile-text">
          <p class="auth-kicker">Conta ativa · ${escapeHtml(providerLabel(session.provider))}</p>
          <h2 class="auth-name">${escapeHtml(who)}</h2>
          ${session.email ? `<p class="auth-email">${escapeHtml(session.email)}</p>` : ""}
        </div>
      </div>
      <p class="auth-note">Sessão só neste aparelho. O diário continua em <code>localStorage</code> — não sobe para o servidor.</p>
      <div class="auth-actions">
        <a class="auth-link-btn" href="diario-rem.html">Abrir Diário REM</a>
        <button type="button" class="auth-btn auth-btn-ghost" data-auth-logout>Sair</button>
      </div>
    </section>
  `;

  root.querySelector("[data-auth-logout]")?.addEventListener("click", () => {
    clearSession();
    render(root);
  });
}

function renderLoggedOut(root) {
  const cfg = getAuthConfig();
  const googleReady = Boolean(cfg.googleClientId);
  const appleReady = Boolean(cfg.appleClientId);

  root.innerHTML = `
    <section class="auth-panel" data-auth-view="out">
      <p class="auth-lead">Cadastro e entrada com conta Google ou Apple. Sem senha do Painel REM.</p>
      <div class="auth-providers">
        <div class="auth-provider">
          <div id="rem-google-btn-host" class="auth-google-host"></div>
          ${
            googleReady
              ? ""
              : `<p class="auth-hint">Ative o Google colando o Client ID em «Ligar provedores».</p>`
          }
        </div>
        <div class="auth-provider">
          <button type="button" class="auth-btn auth-btn-apple" data-auth-apple ${
            appleReady ? "" : "disabled"
          }>
            Continuar com Apple
          </button>
          ${
            appleReady
              ? ""
              : `<p class="auth-hint">Ative a Apple com o Services ID (conta Apple Developer).</p>`
          }
        </div>
      </div>
      <p class="auth-status" data-auth-status hidden></p>

      <details class="auth-setup" ${googleReady && appleReady ? "" : "open"}>
        <summary>Ligar provedores (Client ID)</summary>
        <form class="auth-setup-form" data-auth-config-form>
          <label>
            Google Client ID
            <input name="googleClientId" type="text" autocomplete="off" spellcheck="false"
              placeholder="123456789-abc.apps.googleusercontent.com"
              value="${escapeHtml(cfg.googleClientId)}">
          </label>
          <label>
            Apple Services ID
            <input name="appleClientId" type="text" autocomplete="off" spellcheck="false"
              placeholder="com.seuapp.web"
              value="${escapeHtml(cfg.appleClientId)}">
          </label>
          <label>
            Apple Redirect URI
            <input name="appleRedirectURI" type="url" autocomplete="off" spellcheck="false"
              placeholder="${escapeHtml(defaultAppleRedirect())}"
              value="${escapeHtml(cfg.appleRedirectURI)}">
          </label>
          <button type="submit" class="auth-btn">Salvar no aparelho</button>
          <p class="auth-hint">
            Google Cloud → Credenciais → ID do cliente OAuth (Web).
            Origins autorizados: <code>http://localhost:3000</code> e
            <code>https://tiagoql.github.io</code>.
            IDs ficam em <code>localStorage</code> ou em <code>assets/js/auth-config.js</code>.
          </p>
        </form>
      </details>
    </section>
  `;

  const status = root.querySelector("[data-auth-status]");

  root.querySelector("[data-auth-config-form]")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    saveAuthConfig({
      googleClientId: fd.get("googleClientId"),
      appleClientId: fd.get("appleClientId"),
      appleRedirectURI: fd.get("appleRedirectURI"),
    });
    setStatus(status, "Provedores salvos neste aparelho.", "ok");
    render(root);
  });

  const googleHost = root.querySelector("#rem-google-btn-host");
  if (googleReady && googleHost) {
    mountGoogleButton(googleHost, {
      onSession: () => render(root),
      onError: (err) => setStatus(status, err.message || String(err), "err"),
    }).catch((err) => setStatus(status, err.message || String(err), "err"));
  }

  root.querySelector("[data-auth-apple]")?.addEventListener("click", async () => {
    setStatus(status, "Abrindo Apple…", "ok");
    try {
      await signInWithApple();
      render(root);
    } catch (err) {
      const msg = err?.error || err?.message || String(err);
      setStatus(status, msg, "err");
    }
  });

  // Só localhost: prova a sessão sem Client ID (não é OAuth real).
  if (isLocalHost()) {
    const dev = document.createElement("div");
    dev.className = "auth-dev";
    dev.innerHTML = `
      <p class="auth-hint">Modo local: simular sessão para testar a UI (não substitui Google/Apple reais).</p>
      <div class="auth-actions">
        <button type="button" class="auth-btn auth-btn-ghost" data-auth-sim="google">Simular Google</button>
        <button type="button" class="auth-btn auth-btn-ghost" data-auth-sim="apple">Simular Apple</button>
      </div>
    `;
    root.querySelector(".auth-panel")?.appendChild(dev);
    dev.querySelectorAll("[data-auth-sim]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const provider = btn.getAttribute("data-auth-sim");
        saveSession({
          provider,
          sub: `local-${provider}-demo`,
          name: provider === "google" ? "Conta Google (teste)" : "Conta Apple (teste)",
          email: provider === "google" ? "teste@gmail.com" : "teste@privaterelay.appleid.com",
          picture: "",
        });
        render(root);
      });
    });
  }
}

function isLocalHost() {
  const h = location.hostname;
  return h === "localhost" || h === "127.0.0.1" || h === "[::1]";
}

export function render(root = document.querySelector("[data-auth]")) {
  if (!root) return;
  const session = getSession();
  if (session) renderLoggedIn(root, session);
  else renderLoggedOut(root);
}

export function mountAuthChip(host = document.querySelector("[data-auth-chip]")) {
  if (!host) return;
  const session = getSession();
  const href = host.dataset.authHref || "pesquisas/conta.html";
  if (!session) {
    host.innerHTML = `<a class="auth-chip" href="${escapeHtml(href)}">Entrar · Google / Apple</a>`;
    return;
  }
  const label = session.name || session.email || providerLabel(session.provider);
  host.innerHTML = `<a class="auth-chip is-in" href="${escapeHtml(href)}">${escapeHtml(
    label
  )} · conta</a>`;
}

function boot() {
  const root = document.querySelector("[data-auth]");
  if (root) render(root);
  mountAuthChip();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
