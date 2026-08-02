const KEY = "rem-diario-v1";
const MODULES = ["M0", "M1", "M2", "M3", "M4", "M4.1", "M5", "M6", "M7"];
const METRICS = [
  { id: "calma", label: "Calma" },
  { id: "sono", label: "Sono" },
  { id: "sonhos", label: "Sonhos / voos" },
  { id: "craving", label: "Craving (menor = melhor)" },
  { id: "medo", label: "Medo (menor = melhor)" },
  { id: "gi", label: "Intestino / corpo" },
];
const WEEKS = [
  { id: 1, label: "Semana 1", focus: "M0 + M2 + M3", tip: "Higiene, calma, sono" },
  { id: 2, label: "Semana 2", focus: "+ M1", tip: "Humor pós-movimento" },
  { id: 3, label: "Semana 3", focus: "+ M4 / M4.1 / M5", tip: "Energia, GI, craving" },
  { id: 4, label: "Semana 4", focus: "+ M6 / M7", tip: "Medo, craving, voos" },
];

function todayKey() {
  return formatDay(new Date());
}

function formatDay(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function shiftDay(day, delta) {
  const [y, m, d] = day.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + delta);
  return formatDay(date);
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

function getActiveDay(root) {
  return root.dataset.day || todayKey();
}

function setActiveDay(root, day) {
  root.dataset.day = day;
}

function renderHistory(root, data, activeDay) {
  const days = Object.keys(data).sort().reverse().slice(0, 14);
  if (!days.length) {
    return `<p class="diario-history-empty">Sem histórico ainda — hoje é o primeiro registro.</p>`;
  }
  return `
    <div class="diario-history" role="list">
      ${days
        .map((day) => {
          const entry = data[day];
          const mods = (entry.modules || []).join(" · ") || "—";
          const calma = entry.scores?.calma ?? "·";
          return `
          <button type="button" class="diario-history-item ${day === activeDay ? "is-active" : ""}" data-open-day="${day}" role="listitem">
            <strong>${day}</strong>
            <span>${mods}</span>
            <em>calma ${calma}</em>
          </button>`;
        })
        .join("")}
    </div>`;
}

function render() {
  const root = document.querySelector("[data-diario]");
  if (!root) return;

  const data = load();
  if (!root.dataset.day) setActiveDay(root, todayKey());
  const day = getActiveDay(root);
  const entry = data[day] || { scores: {}, note: "", modules: [], week: 1 };
  const week = entry.week || 1;

  root.innerHTML = `
    <div class="diario-weeks" role="group" aria-label="Semana do protocolo N=1">
      ${WEEKS.map(
        (w) => `
        <button type="button" class="diario-week ${week === w.id ? "is-active" : ""}" data-week="${w.id}" title="${w.tip}">
          <strong>${w.label}</strong>
          <span>${w.focus}</span>
        </button>`
      ).join("")}
    </div>

    <div class="diario-nav">
      <button type="button" data-day-shift="-1" aria-label="Dia anterior">←</button>
      <p class="diario-date"><time datetime="${day}">${day}</time>${day === todayKey() ? " · hoje" : ""}</p>
      <button type="button" data-day-shift="1" aria-label="Próximo dia">→</button>
      <button type="button" data-day-today class="diario-today">Hoje</button>
    </div>

    <div class="diario-modules" role="group" aria-label="Módulos do dia">
      ${MODULES.map(
        (m) => `
        <label class="diario-chip">
          <input type="checkbox" data-module="${m}" ${entry.modules?.includes(m) ? "checked" : ""}>
          <span>${m}</span>
        </label>`
      ).join("")}
    </div>

    <div class="diario-metrics">
      ${METRICS.map((metric) => {
        const value = entry.scores?.[metric.id] ?? 3;
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

    <div class="diario-toolbar">
      <button type="button" class="music-btn" data-export>Exportar JSON</button>
      <button type="button" class="diario-secondary" data-import-trigger>Importar</button>
      <input type="file" accept="application/json,.json" data-import hidden>
      <p class="diario-saved" data-saved hidden>Salvo neste aparelho.</p>
    </div>

    <section class="diario-history-wrap" aria-label="Histórico">
      <h2 class="panel-section-label">Últimos registros</h2>
      ${renderHistory(root, data, day)}
    </section>
  `;

  const flashSaved = () => {
    const saved = root.querySelector("[data-saved]");
    if (!saved) return;
    saved.hidden = false;
    window.clearTimeout(flashSaved._t);
    flashSaved._t = window.setTimeout(() => {
      saved.hidden = true;
    }, 1400);
  };

  const persist = () => {
    const modules = [...root.querySelectorAll("[data-module]:checked")].map((el) => el.dataset.module);
    const scores = {};
    root.querySelectorAll("[data-score]").forEach((el) => {
      scores[el.dataset.score] = Number(el.value);
    });
    const note = root.querySelector("[data-note]")?.value || "";
    const weekBtn = root.querySelector(".diario-week.is-active");
    data[day] = {
      modules,
      scores,
      note,
      week: Number(weekBtn?.dataset.week || week || 1),
      updatedAt: new Date().toISOString(),
    };
    save(data);
    flashSaved();
  };

  root.onclick = (event) => {
    const shift = event.target.closest("[data-day-shift]");
    if (shift) {
      persist();
      setActiveDay(root, shiftDay(day, Number(shift.dataset.dayShift)));
      render();
      return;
    }
    if (event.target.closest("[data-day-today]")) {
      persist();
      setActiveDay(root, todayKey());
      render();
      return;
    }
    const weekEl = event.target.closest("[data-week]");
    if (weekEl) {
      root.querySelectorAll(".diario-week").forEach((el) => el.classList.remove("is-active"));
      weekEl.classList.add("is-active");
      persist();
      return;
    }
    const openDay = event.target.closest("[data-open-day]");
    if (openDay) {
      persist();
      setActiveDay(root, openDay.dataset.openDay);
      render();
      return;
    }
    if (event.target.closest("[data-export]")) {
      persist();
      const blob = new Blob([JSON.stringify(load(), null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `diario-rem-${todayKey()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    if (event.target.closest("[data-import-trigger]")) {
      root.querySelector("[data-import]")?.click();
    }
  };

  root.onchange = (event) => {
    if (event.target.matches("[data-import]")) {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result || "{}"));
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            save({ ...load(), ...parsed });
            render();
          }
        } catch {
          const status = root.querySelector("[data-saved]");
          if (status) {
            status.hidden = false;
            status.textContent = "JSON inválido.";
          }
        }
      };
      reader.readAsText(file);
      return;
    }
    if (event.target.matches("[data-score]")) {
      const out = root.querySelector(`[data-out="${event.target.dataset.score}"]`);
      if (out) out.textContent = event.target.value;
    }
    persist();
  };

  root.oninput = (event) => {
    if (event.target.matches("[data-score]")) {
      const out = root.querySelector(`[data-out="${event.target.dataset.score}"]`);
      if (out) out.textContent = event.target.value;
    }
    if (event.target.matches("[data-note], [data-score], [data-module]")) persist();
  };
}

render();
