const DATA_URL = new URL("../data/vinylzera-videos.json", import.meta.url);

function shortTitle(title) {
  const cut = String(title).split(/[\u{1F3B5}\u{1F48E}\u{1F39E}\u{1F3A7}\u{1FAA9}\u{1F698}\u{1F50A}\u{1F499}\u{1F339}\u{1F680}\u{2728}]/u)[0];
  const text = (cut || title).trim();
  return text.length > 52 ? `${text.slice(0, 50).trim()}…` : text;
}

function embedHtml(id, title) {
  const safeId = encodeURIComponent(id);
  const label = String(title || "Vinylzera").replace(/"/g, "");
  return (
    '<iframe title="' +
    label +
    '" width="560" height="315" src="https://www.youtube-nocookie.com/embed/' +
    safeId +
    '?autoplay=1&rel=0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe>'
  );
}

function mostViewedIndex(items) {
  let best = 0;
  for (let i = 1; i < items.length; i += 1) {
    if ((items[i].views || 0) > (items[best].views || 0)) best = i;
  }
  return best;
}

async function init() {
  const root = document.querySelector("[data-radio]");
  if (!root) return;

  const now = root.querySelector("[data-radio-now]");
  const playBtn = root.querySelector("[data-radio-play]");
  const nextBtn = root.querySelector("[data-radio-next]");
  const frame = root.querySelector("[data-radio-frame]");
  if (!playBtn || !frame) return;

  let items = [];
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const catalog = await res.json();
    items = Array.isArray(catalog.items) ? catalog.items : [];
  } catch {
    if (now) now.textContent = "Rádio sem mix — abre o catálogo.";
    playBtn.disabled = true;
    return;
  }

  if (!items.length) {
    if (now) now.textContent = "Rádio sem mix.";
    playBtn.disabled = true;
    return;
  }

  let index = mostViewedIndex(items);
  let loaded = false;

  const current = () => items[index];

  const paintNow = () => {
    const track = current();
    if (now && track) now.textContent = shortTitle(track.title);
  };

  const play = (nextIndex) => {
    if (typeof nextIndex === "number") index = nextIndex;
    const track = current();
    if (!track) return;
    frame.hidden = false;
    frame.innerHTML = embedHtml(track.id, track.title);
    loaded = true;
    playBtn.textContent = "Abrir de novo";
    paintNow();
    if (location.pathname.includes("radio") || location.hash) {
      history.replaceState(null, "", `#${track.id}`);
    }
  };

  playBtn.addEventListener("click", () => {
    if (!loaded) {
      play();
      return;
    }
    const iframe = frame.querySelector("iframe");
    if (iframe) iframe.src = iframe.src;
  });

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      index = (index + 1) % items.length;
      play();
    });
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest("[data-radio-track]");
    if (!link) return;
    const id = link.getAttribute("data-radio-track");
    const found = items.findIndex((item) => item.id === id);
    if (found < 0) return;
    event.preventDefault();
    play(found);
    frame.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });

  const hashId = decodeURIComponent(location.hash.replace(/^#/, ""));
  const fromHash = hashId ? items.findIndex((item) => item.id === hashId) : -1;
  if (fromHash >= 0) {
    play(fromHash);
  } else {
    paintNow();
  }
}

init();
