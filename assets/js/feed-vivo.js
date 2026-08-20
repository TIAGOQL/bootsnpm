const ME_KEY = "rem-feed-me-v1";
const FEED_KEY = "rem-feed-v1";
const MAX_POSTS = 12;
const MAX_CAPTION = 280;
const MAX_PHOTO_CHARS = 220000;

function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function cleanName(value) {
  const name = String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 32);
  return name || "Anônimo";
}

function loadMe() {
  try {
    const me = JSON.parse(localStorage.getItem(ME_KEY) || "null");
    if (me && typeof me === "object" && me.id) {
      return { id: String(me.id), name: cleanName(me.name), createdAt: me.createdAt || nowIso() };
    }
  } catch {
    /* ignore */
  }
  return null;
}

function saveMe(me) {
  localStorage.setItem(ME_KEY, JSON.stringify(me));
}

function ensureMe(nameHint) {
  const existing = loadMe();
  const name = cleanName(nameHint || existing?.name);
  if (existing) {
    if (name !== existing.name) {
      existing.name = name;
      saveMe(existing);
    }
    return existing;
  }
  const me = { id: uid("a"), name, createdAt: nowIso() };
  saveMe(me);
  return me;
}

function emptyFeed() {
  return { version: 1, posts: [] };
}

function loadFeed() {
  try {
    const data = JSON.parse(localStorage.getItem(FEED_KEY) || "null");
    if (data && Array.isArray(data.posts)) return { version: 1, posts: data.posts };
    if (Array.isArray(data)) return { version: 1, posts: data };
  } catch {
    /* ignore */
  }
  return emptyFeed();
}

function saveFeed(feed) {
  localStorage.setItem(FEED_KEY, JSON.stringify(feed));
}

function safePhotoSrc(src) {
  if (typeof src !== "string") return "";
  if (
    src.startsWith("data:image/jpeg") ||
    src.startsWith("data:image/png") ||
    src.startsWith("data:image/webp")
  ) {
    return src;
  }
  return "";
}

function formatWhen(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function loadImageFallback(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não deu para abrir essa foto. Use JPEG ou PNG."));
    };
    img.src = url;
  });
}

async function sourceFromFile(file) {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      try {
        return await createImageBitmap(file);
      } catch {
        /* fall through */
      }
    }
  }
  return loadImageFallback(file);
}

async function compressImage(file) {
  if (!file) throw new Error("Escolha a foto da planta.");
  const type = String(file.type || "").toLowerCase();
  if (type && !type.startsWith("image/")) {
    throw new Error("Isso não é foto. JPEG ou PNG da planta.");
  }
  if (file.size > 12 * 1024 * 1024) {
    throw new Error("Arquivo grande demais. Tire outra foto.");
  }

  const source = await sourceFromFile(file);
  const srcW = source.width || source.naturalWidth;
  const srcH = source.height || source.naturalHeight;
  if (!srcW || !srcH) {
    throw new Error("Não deu para ler essa foto. JPEG ou PNG.");
  }

  const max = 960;
  const scale = Math.min(1, max / Math.max(srcW, srcH));
  const width = Math.max(1, Math.round(srcW * scale));
  const height = Math.max(1, Math.round(srcH * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("O navegador não conseguiu preparar a foto.");
  ctx.drawImage(source, 0, 0, width, height);
  if (typeof source.close === "function") source.close();

  let quality = 0.72;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);
  while (dataUrl.length > MAX_PHOTO_CHARS && quality > 0.42) {
    quality -= 0.1;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }
  if (dataUrl.length > MAX_PHOTO_CHARS) {
    throw new Error("Foto ainda grande. Chegue um pouco mais perto e tire de novo.");
  }
  return dataUrl;
}

function setStatus(root, text, isError) {
  const el = root.querySelector("[data-feed-status]");
  if (!el) return;
  el.hidden = !text;
  el.textContent = text || "";
  el.classList.toggle("is-error", Boolean(isError));
}

function renderMe(root) {
  const me = loadMe();
  const who = root.querySelector("[data-feed-who]");
  const nameInput = root.querySelector("[name=apelido]");
  if (nameInput && me && !nameInput.value) nameInput.placeholder = me.name;
  if (!who) return;
  if (!me) {
    who.textContent = "Sem e-mail. Sem senha. Apelido é opcional — pode enviar a foto agora.";
    return;
  }
  who.textContent = `Neste aparelho você é ${me.name}.`;
}

function renderFeed(root) {
  const box = root.querySelector("[data-feed-lista]");
  if (!box) return;
  const me = loadMe();
  const { posts } = loadFeed();
  if (!posts.length) {
    box.innerHTML = `<p class="feed-empty">Ainda não tem foto. Escolha a da planta e envie.</p>`;
    return;
  }

  box.innerHTML = [...posts]
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
    .map((post) => {
      const photo = safePhotoSrc(post.photo);
      const comments = Array.isArray(post.comments) ? post.comments : [];
      const mine = me && post.authorId === me.id;
      const commentList = comments
        .map(
          (c) => `
          <li>
            <strong>${escapeHtml(c.authorName || "Anônimo")}</strong>
            <span>${escapeHtml(c.text || "")}</span>
          </li>`
        )
        .join("");
      return `
        <article class="feed-card" data-post-id="${escapeHtml(post.id)}">
          ${photo ? `<img class="feed-card-photo" src="${photo}" alt="Foto de planta">` : ""}
          <p class="feed-card-meta"><strong>${escapeHtml(post.authorName || "Anônimo")}</strong> · ${escapeHtml(formatWhen(post.createdAt))}</p>
          ${post.caption ? `<p class="feed-card-caption">${escapeHtml(post.caption)}</p>` : ""}
          ${
            comments.length
              ? `<ul class="feed-comments">${commentList}</ul>`
              : `<p class="feed-comments-empty">Sem comentários ainda.</p>`
          }
          <form class="feed-comment-form" data-comment-form>
            <label>
              <span class="visually-hidden">Comentário</span>
              <input name="comment" type="text" maxlength="${MAX_CAPTION}" placeholder="Comentar sem cadastro…" autocomplete="off">
            </label>
            <button type="submit" class="diario-secondary">Comentar</button>
          </form>
          ${mine ? `<button type="button" class="feed-remove is-quiet" data-remove-post>Tirar esta foto</button>` : ""}
        </article>`;
    })
    .join("");
}

function render(root) {
  renderMe(root);
  renderFeed(root);
}

function takeFile(root, file) {
  if (!file) return;
  const preview = root.querySelector("[data-feed-preview]");
  const holder = root.querySelector("[data-feed-preview-wrap]");
  const sendBtn = root.querySelector("[data-feed-form] button[type=submit]");
  setStatus(root, "Preparando a foto…");
  if (sendBtn) sendBtn.disabled = true;
  compressImage(file)
    .then((dataUrl) => {
      root._pendingPhoto = dataUrl;
      if (preview) {
        preview.src = dataUrl;
        preview.hidden = false;
      }
      if (holder) holder.hidden = false;
      setStatus(root, "Foto pronta. Pode enviar.");
      if (sendBtn) sendBtn.disabled = false;
    })
    .catch((err) => {
      root._pendingPhoto = "";
      if (preview) {
        preview.removeAttribute("src");
        preview.hidden = true;
      }
      if (holder) holder.hidden = true;
      setStatus(root, err.message || "Não deu para usar essa foto.", true);
      if (sendBtn) sendBtn.disabled = false;
    });
}

function persistPost(root) {
  if (root._posting) return;
  const photo = root._pendingPhoto;
  if (!photo) {
    setStatus(root, "Escolha a foto da planta primeiro.", true);
    return;
  }
  const nameHint = root.querySelector("[name=apelido]")?.value;
  const caption = String(root.querySelector("[name=caption]")?.value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_CAPTION);
  const me = ensureMe(nameHint);
  root._posting = true;
  const feed = loadFeed();
  feed.posts.unshift({
    id: uid("p"),
    authorId: me.id,
    authorName: me.name,
    photo,
    caption,
    createdAt: nowIso(),
    comments: [],
  });
  feed.posts = feed.posts.slice(0, MAX_POSTS);
  try {
    saveFeed(feed);
  } catch {
    setStatus(root, "O aparelho encheu. Exporte ou tire uma foto antiga.", true);
    root._posting = false;
    return;
  }
  root._posting = false;
  root._pendingPhoto = "";
  const preview = root.querySelector("[data-feed-preview]");
  const holder = root.querySelector("[data-feed-preview-wrap]");
  const fileInput = root.querySelector("[data-plant-file]");
  const captionEl = root.querySelector("[name=caption]");
  if (preview) {
    preview.removeAttribute("src");
    preview.hidden = true;
  }
  if (holder) holder.hidden = true;
  if (fileInput) fileInput.value = "";
  if (captionEl) captionEl.value = "";
  setStatus(root, "Foto enviada. Ficou neste aparelho.");
  render(root);
}

function persistComment(root, form) {
  const card = form.closest("[data-post-id]");
  const postId = card?.dataset.postId;
  const text = String(form.querySelector("[name=comment]")?.value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_CAPTION);
  if (!postId || !text) {
    setStatus(root, "Escreva o comentário.", true);
    return;
  }
  const nameHint = root.querySelector("[name=apelido]")?.value;
  const me = ensureMe(nameHint);
  const feed = loadFeed();
  const post = feed.posts.find((p) => p.id === postId);
  if (!post) return;
  if (!Array.isArray(post.comments)) post.comments = [];
  post.comments.push({
    id: uid("c"),
    authorId: me.id,
    authorName: me.name,
    text,
    createdAt: nowIso(),
  });
  try {
    saveFeed(feed);
  } catch {
    setStatus(root, "Não coube o comentário. Exporte o feed e limpe uma foto.", true);
    return;
  }
  setStatus(root, "Comentário enviado.");
  render(root);
}

function exportFeed() {
  const payload = {
    kind: "rem-feed-vivo",
    exportedAt: nowIso(),
    me: loadMe(),
    feed: loadFeed(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `feed-vivo-${nowIso().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importFeed(root, file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result || "{}"));
      const incoming = parsed.feed?.posts || parsed.posts;
      if (!Array.isArray(incoming)) throw new Error("JSON sem fotos.");
      const feed = loadFeed();
      const seen = new Set(feed.posts.map((p) => p.id));
      for (const post of incoming) {
        if (!post || !post.id || seen.has(post.id)) continue;
        const photo = safePhotoSrc(post.photo);
        if (!photo) continue;
        seen.add(post.id);
        feed.posts.push({
          id: String(post.id),
          authorId: String(post.authorId || "a-import"),
          authorName: cleanName(post.authorName),
          photo,
          caption: String(post.caption || "").slice(0, MAX_CAPTION),
          createdAt: post.createdAt || nowIso(),
          comments: Array.isArray(post.comments)
            ? post.comments.map((c) => ({
                id: String(c.id || uid("c")),
                authorId: String(c.authorId || "a-import"),
                authorName: cleanName(c.authorName),
                text: String(c.text || "").slice(0, MAX_CAPTION),
                createdAt: c.createdAt || nowIso(),
              }))
            : [],
        });
      }
      feed.posts = feed.posts
        .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
        .slice(0, MAX_POSTS);
      saveFeed(feed);
      setStatus(root, "Fotos de outra pessoa entraram neste aparelho.");
      render(root);
    } catch {
      setStatus(root, "JSON inválido.", true);
    }
  };
  reader.readAsText(file);
}

function bind(root) {
  const fileInput = root.querySelector("[data-plant-file]");
  const drop = root.querySelector("[data-feed-drop]");

  root.querySelector("[data-pick-photo]")?.addEventListener("click", () => fileInput?.click());

  fileInput?.addEventListener("change", () => {
    takeFile(root, fileInput.files?.[0]);
  });

  if (drop) {
    drop.addEventListener("dragover", (event) => {
      event.preventDefault();
      drop.classList.add("is-over");
    });
    drop.addEventListener("dragleave", () => drop.classList.remove("is-over"));
    drop.addEventListener("drop", (event) => {
      event.preventDefault();
      drop.classList.remove("is-over");
      takeFile(root, event.dataTransfer?.files?.[0]);
    });
  }

  root.addEventListener("paste", (event) => {
    const item = [...(event.clipboardData?.items || [])].find((i) => i.type.startsWith("image/"));
    if (!item) return;
    const file = item.getAsFile();
    if (file) {
      event.preventDefault();
      takeFile(root, file);
    }
  });

  root.querySelector("[data-feed-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    persistPost(root);
  });

  root.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-comment-form]");
    if (!form) return;
    event.preventDefault();
    persistComment(root, form);
  });

  root.addEventListener("click", (event) => {
    if (event.target.closest("[data-remove-post]")) {
      const card = event.target.closest("[data-post-id]");
      const me = loadMe();
      if (!card || !me) return;
      const feed = loadFeed();
      feed.posts = feed.posts.filter((p) => !(p.id === card.dataset.postId && p.authorId === me.id));
      saveFeed(feed);
      setStatus(root, "Foto tirada deste aparelho.");
      render(root);
      return;
    }
    if (event.target.closest("[data-export]")) {
      exportFeed();
      return;
    }
    if (event.target.closest("[data-import-trigger]")) {
      root.querySelector("[data-import]")?.click();
    }
  });

  root.querySelector("[data-import]")?.addEventListener("change", (event) => {
    importFeed(root, event.target.files?.[0]);
    event.target.value = "";
  });

  root.querySelector("[name=apelido]")?.addEventListener("change", (event) => {
    const value = event.target.value.trim();
    if (!value && !loadMe()) return;
    ensureMe(value);
    renderMe(root);
  });
}

const root = document.querySelector("[data-feed]");
if (root) {
  bind(root);
  render(root);
}
