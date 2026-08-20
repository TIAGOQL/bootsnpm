const DATA_URL = new URL("../data/vinylzera-videos.json", import.meta.url);
const PAGE_SIZE = 12;

const KIND_LABEL = {
  video: "vídeo",
  short: "short",
  stream: "live",
};

const DECADE_LABEL = {
  "70s": "70s",
  "80s": "80s",
  mix: "70s + 80s",
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDuration(seconds) {
  if (seconds == null || Number.isNaN(Number(seconds))) return "—";
  const total = Math.max(0, Math.round(Number(seconds)));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatViews(views) {
  if (views == null || Number.isNaN(Number(views))) return "views n/d";
  const n = Number(views);
  if (n >= 1_000_000) {
    const mi = n / 1_000_000;
    const text = mi >= 10 ? String(Math.round(mi)) : mi.toFixed(1).replace(".", ",").replace(",0", "");
    return `${text} mi views`;
  }
  if (n >= 1_000) return `${Math.round(n / 1_000)} mil views`;
  return `${n} views`;
}

function decadeOf(title) {
  const t = String(title).toLowerCase();
  const has70 = t.includes("70s") || t.includes("70's");
  const has80 = t.includes("80s") || t.includes("80's");
  if (has70 && has80) return "mix";
  if (has70) return "70s";
  return "80s";
}

function normalize(text) {
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function applyFilters(items, { query, kind, decade, sort }) {
  const q = normalize(query).trim();
  let list = items.filter((item) => {
    if (kind !== "all" && item.kind !== kind) return false;
    if (decade !== "all" && decadeOf(item.title) !== decade) return false;
    if (q && !normalize(item.title).includes(q) && !normalize(item.id).includes(q)) return false;
    return true;
  });

  if (sort === "views") {
    list = [...list].sort((a, b) => (b.views || 0) - (a.views || 0));
  } else if (sort === "duration") {
    list = [...list].sort((a, b) => (b.duration || 0) - (a.duration || 0));
  } else if (sort === "az") {
    list = [...list].sort((a, b) => a.title.localeCompare(b.title, "pt"));
  }
  return list;
}

function thumbUrl(id) {
  return `https://i.ytimg.com/vi/${encodeURIComponent(id)}/mqdefault.jpg`;
}

function renderList(box, items) {
  if (!items.length) {
    box.innerHTML = `<p class="cultivo-empty">Nenhum mix com esse filtro. Limpa a busca e tenta de novo.</p>`;
    return;
  }

  box.innerHTML = items
    .map((item) => {
      const kind = KIND_LABEL[item.kind] || item.kind;
      const decade = DECADE_LABEL[decadeOf(item.title)] || "";
      const onRadio = Boolean(document.querySelector("[data-radio]"));
      const href = onRadio
        ? `#${encodeURIComponent(item.id)}`
        : `radio.html#${encodeURIComponent(item.id)}`;
      const duration = formatDuration(item.duration);
      const radioAttr = onRadio ? ` data-radio-track="${escapeHtml(item.id)}"` : "";
      return `<a class="catalog-video" href="${href}"${radioAttr}><span class="catalog-video-thumb"><img src="${thumbUrl(item.id)}" alt="" width="320" height="180" loading="lazy"><span class="catalog-video-duration">${escapeHtml(duration)}</span></span><span class="catalog-video-title">${escapeHtml(item.title)}</span><span class="catalog-video-meta">${escapeHtml(formatViews(item.views))} · ${escapeHtml(decade)} · ${escapeHtml(kind)}</span></a>`;
    })
    .join("");
}

function pageSlice(items, page) {
  const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safe = Math.min(Math.max(1, page), pages);
  const start = (safe - 1) * PAGE_SIZE;
  return { page: safe, pages, start, slice: items.slice(start, start + PAGE_SIZE) };
}

function bind(root, catalog) {
  const form = root.querySelector("[data-catalog-form]");
  const count = root.querySelector("[data-catalog-count]");
  const list = root.querySelector("[data-catalog-list]");
  const pager = root.querySelector("[data-catalog-pager]");
  const pageStatus = root.querySelector("[data-catalog-page]");
  const prev = root.querySelector("[data-catalog-prev]");
  const next = root.querySelector("[data-catalog-next]");
  if (!form || !count || !list) return;

  let page = 1;

  const paint = ({ resetPage } = {}) => {
    const query = form.query.value || "";
    const kind = form.kind.value || "all";
    const decade = form.decade.value || "all";
    const sort = form.sort.value || "channel";
    const shown = applyFilters(catalog.items, { query, kind, decade, sort });
    if (resetPage) page = 1;
    const paged = pageSlice(shown, page);
    page = paged.page;
    count.textContent = `${shown.length} de ${catalog.counts.total}`;
    renderList(list, paged.slice);
    if (pager && pageStatus && prev && next) {
      const from = shown.length ? paged.start + 1 : 0;
      const to = paged.start + paged.slice.length;
      pageStatus.textContent = shown.length ? `${from}–${to} · pág. ${paged.page}/${paged.pages}` : "";
      pager.hidden = shown.length <= PAGE_SIZE;
      prev.disabled = paged.page <= 1;
      next.disabled = paged.page >= paged.pages;
    }
  };

  form.addEventListener("input", () => paint({ resetPage: true }));
  form.addEventListener("change", () => paint({ resetPage: true }));
  form.addEventListener("submit", (event) => event.preventDefault());
  if (prev) {
    prev.addEventListener("click", () => {
      page -= 1;
      paint();
      list.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  }
  if (next) {
    next.addEventListener("click", () => {
      page += 1;
      paint();
      list.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  }
  paint();
}

async function init() {
  const root = document.querySelector("[data-catalog]");
  if (!root) return;
  const count = root.querySelector("[data-catalog-count]");
  const list = root.querySelector("[data-catalog-list]");
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const catalog = await res.json();
    if (!catalog || !Array.isArray(catalog.items)) throw new Error("catálogo inválido");
    bind(root, catalog);
  } catch {
    if (count) count.textContent = "erro";
    if (list) {
      list.innerHTML = `<p class="cultivo-empty">Não deu pra carregar o JSON. Abre <a href="../assets/data/vinylzera-videos.json">vinylzera-videos.json</a> direto ou o <a href="https://www.youtube.com/@VinylzeraMusic/videos" rel="noopener noreferrer" target="_blank">YouTube</a>.</p>`;
    }
  }
}

init();
