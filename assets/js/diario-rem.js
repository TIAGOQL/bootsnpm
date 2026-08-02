const KEY = "rem-diario-v1";
const METRICS = [
  { id: "calma", label: "Calma" },
  { id: "sono", label: "Sono" },
  { id: "sonhos", label: "Sonhos / voos" },
  { id: "craving", label: "Craving (menor = melhor)", invert: true },
  { id: "medo", label: "Medo (menor = melhor)", invert: true },
  { id: "gi", label: "Intestino / corpo" },
];

function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

function render() {
  const root = document.querySelector("[data-diario]");
  if (!root) return;

  const data = load();
  const day = todayKey();
  const entry = data[day] || { scores: {}, note: "", modules: [] };

  root.innerHTML = `
    <p class="diario-date">Hoje · <time datetime="${day}">${day}</time></p>
    <div class="diario-modules" role="group" aria-label="Módulos de hoje">
      ${["M1", "M2", "M3", "M4.1", "M5", "M6", "M7"]
        .map(
          (m) => `
        <label class="diario-chip">
          <input type="checkbox" data-module="${m}" ${entry.modules.includes(m) ? "checked" : ""}>
          <span>${m}</span>
        </label>`
        )
        .join("")}
    </div>
    <div class="diario-metrics">
      ${METRICS.map((metric) => {
        const value = entry.scores[metric.id] ?? 3;
        return `
        <label class="diario-metric">
          <span>${metric.label}</span>
          <input type="range" min="1" max="5" step="1" value="${value}" data-score="${metric.id}">
          <output data-out="${metric.id}">${value}</output>
        </label>`;
      }).join("")}
    </div>
    <label class="diario-note">
      <span>Nota do peito</span>
      <textarea rows="3" data-note placeholder="O que ativou hoje…">${entry.note || ""}</textarea>
    </label>
    <p class="diario-saved" data-saved hidden>Salvo neste aparelho.</p>
  `;

  const persist = () => {
    const modules = [...root.querySelectorAll("[data-module]:checked")].map((el) => el.dataset.module);
    const scores = {};
    root.querySelectorAll("[data-score]").forEach((el) => {
      scores[el.dataset.score] = Number(el.value);
    });
    const note = root.querySelector("[data-note]").value;
    data[day] = { modules, scores, note, updatedAt: new Date().toISOString() };
    save(data);
    const saved = root.querySelector("[data-saved]");
    saved.hidden = false;
    window.clearTimeout(persist._t);
    persist._t = window.setTimeout(() => {
      saved.hidden = true;
    }, 1600);
  };

  root.addEventListener("input", (event) => {
    const score = event.target.getAttribute("data-score");
    if (score) {
      const out = root.querySelector(`[data-out="${score}"]`);
      if (out) out.textContent = event.target.value;
    }
    persist();
  });
  root.addEventListener("change", persist);
}

render();
