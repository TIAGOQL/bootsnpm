const DATA_URL = new URL("../data/paulinho-videos.json", import.meta.url);

const KIND_LABEL = {
  video: "vídeo",
  short: "short",
  stream: "live",
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

function seriesOf(title) {
  const t = String(title).toUpperCase();
  if (t.includes("ANTI RP") || t.includes("ANTI-RP") || t.includes("ANTI ROLEPLAY")) return "anti-rp";
  if (t.includes("GTA")) return "gta-rp";
  return "outro";
}

function normalize(text) {
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function applyFilters(items, { query, kind, series, sort }) {
  const q = normalize(query).trim();
  let list = items.filter((item) => {
    if (kind !== "all" && item.kind !== kind) return false;
    if (series !== "all" && seriesOf(item.title) !== series) return false;
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

function renderList(box, items) {
  if (!items.length) {
    box.innerHTML = `<p class="cultivo-empty">Nenhum vídeo com esse filtro. Limpa a busca e tenta de novo.</p>`;
    return;
  }

  box.innerHTML = items
    .map((item) => {
      const kind = KIND_LABEL[item.kind] || item.kind;
      const href = `https://www.youtube.com/watch?v=${encodeURIComponent(item.id)}`;
      return `<a class="module-link" href="${href}" rel="noopener noreferrer" target="_blank"><span>${escapeHtml(formatDuration(item.duration))}</span><strong>${escapeHtml(item.title)}</strong><em>${escapeHtml(kind)} · ${escapeHtml(formatViews(item.views))}</em></a>`;
    })
    .join("");
}

function bind(root, catalog) {
  const form = root.querySelector("[data-catalog-form]");
  const count = root.querySelector("[data-catalog-count]");
  const list = root.querySelector("[data-catalog-list]");
  if (!form || !count || !list) return;

  const paint = () => {
    const query = form.query.value || "";
    const kind = form.kind.value || "all";
    const series = form.series.value || "all";
    const sort = form.sort.value || "channel";
    const shown = applyFilters(catalog.items, { query, kind, series, sort });
    count.textContent = `${shown.length} de ${catalog.counts.total}`;
    renderList(list, shown);
  };

  form.addEventListener("input", paint);
  form.addEventListener("change", paint);
  form.addEventListener("submit", (event) => event.preventDefault());
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
      list.innerHTML = `<p class="cultivo-empty">Não deu pra carregar o JSON. Abre <a href="../assets/data/paulinho-videos.json">paulinho-videos.json</a> direto ou o <a href="https://www.youtube.com/@PaulinhoLOKOoficial/videos" rel="noopener noreferrer" target="_blank">YouTube</a>.</p>`;
    }
  }
}

init();
