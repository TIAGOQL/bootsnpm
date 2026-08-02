const KEY = "rem-cultivo-v1";
const STAGES = [
  { id: "semente", label: "Semente" },
  { id: "broto", label: "Broto" },
  { id: "planta", label: "Planta" },
  { id: "colheita", label: "Colheita" },
];

function uid() {
  return `idea-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function save(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderList(root, list) {
  const box = root.querySelector("[data-cultivo-lista]");
  if (!box) return;

  if (!list.length) {
    box.innerHTML = `<p class="cultivo-empty">Canteiro vazio. Plante a primeira ideia acima.</p>`;
    return;
  }

  const ordered = [...list].sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  box.innerHTML = ordered
    .map((idea) => {
      const stageOptions = STAGES.map(
        (s) =>
          `<option value="${s.id}" ${idea.stage === s.id ? "selected" : ""}>${s.label}</option>`
      ).join("");
      return `
      <article class="cultivo-card" data-id="${escapeHtml(idea.id)}">
        <header class="cultivo-card-head">
          <h3>${escapeHtml(idea.title)}</h3>
          <select data-stage aria-label="Estágio da ideia">${stageOptions}</select>
        </header>
        <p class="cultivo-meta">${escapeHtml(idea.module || "sem módulo")} · ${escapeHtml(
          (idea.updatedAt || "").slice(0, 10)
        )}</p>
        <p class="cultivo-body">${escapeHtml(idea.note || "")}</p>
        <div class="cultivo-actions">
          <button type="button" data-export>Gerar markdown</button>
          <button type="button" class="is-quiet" data-remove>Remover</button>
        </div>
        <pre class="cultivo-md" hidden data-md></pre>
      </article>`;
    })
    .join("");
}

function toMarkdown(idea) {
  return `# ${idea.title}

- **Estágio:** ${idea.stage}
- **Módulo REM:** ${idea.module || "nenhum"}
- **Plantada em:** ${(idea.createdAt || "").slice(0, 10)}
- **Próximo passo:** …

## Nota

${idea.note || "…"}

## Por que importa

…
`;
}

function bind(root) {
  const form = root.querySelector("[data-cultivo-form]");
  const list = () => load();

  const refresh = () => renderList(root, list());

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const title = form.querySelector("[name=title]").value.trim();
    const note = form.querySelector("[name=note]").value.trim();
    const module = form.querySelector("[name=module]").value.trim();
    if (!title) return;

    const now = new Date().toISOString();
    const ideas = list();
    ideas.push({
      id: uid(),
      title,
      note,
      module,
      stage: "semente",
      createdAt: now,
      updatedAt: now,
    });
    save(ideas);
    form.reset();
    refresh();
  });

  root.addEventListener("change", (event) => {
    const select = event.target.closest("[data-stage]");
    if (!select) return;
    const card = select.closest("[data-id]");
    const ideas = list();
    const idea = ideas.find((item) => item.id === card.dataset.id);
    if (!idea) return;
    idea.stage = select.value;
    idea.updatedAt = new Date().toISOString();
    save(ideas);
    refresh();
  });

  root.addEventListener("click", (event) => {
    const card = event.target.closest("[data-id]");
    if (!card) return;
    const ideas = list();
    const idea = ideas.find((item) => item.id === card.dataset.id);
    if (!idea) return;

    if (event.target.closest("[data-remove]")) {
      save(ideas.filter((item) => item.id !== idea.id));
      refresh();
      return;
    }

    if (event.target.closest("[data-export]")) {
      const pre = card.querySelector("[data-md]");
      pre.hidden = false;
      pre.textContent = toMarkdown(idea);
      pre.focus?.();
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(pre.textContent).catch(() => {});
      }
    }
  });

  refresh();
}

const root = document.querySelector("[data-cultivo]");
if (root) bind(root);
