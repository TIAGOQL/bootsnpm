/**
 * Drone de tradução instantânea.
 * Entre os dois idiomas escolhidos: se a palavra já está em um, vai para o outro.
 * Ex.: português → inglês; inglês → português. Não fica preso num destino só.
 */
(function (root) {
  const LANGS = {
    pt: "Português",
    en: "Inglês",
    es: "Espanhol",
    fr: "Francês",
  };

  const STORE = "rem-drone-langs";

  const EN_TO_PT = {
    gift: "presente / dom",
    present: "presente",
    sun: "sol",
    son: "filho",
    hello: "olá",
    hi: "oi",
    "good morning": "bom dia",
    good: "bom",
    morning: "manhã",
    life: "vida",
    light: "luz",
    heart: "coração",
    love: "amor",
    water: "água",
    dream: "sonho",
    sleep: "sono",
    peace: "paz",
    fear: "medo",
    share: "compartilhar",
    load: "carregar",
    node: "nó",
    module: "módulo",
    stack: "pilha",
    analysis: "análise",
    god: "deus",
    rain: "chuva",
    body: "corpo",
    mind: "mente",
    breath: "respiração",
    relax: "relaxar",
    today: "hoje",
    thanks: "obrigado",
    thank: "obrigado",
    please: "por favor",
    yes: "sim",
    no: "não",
    and: "e",
    or: "ou",
    with: "com",
    from: "de",
    to: "para",
    you: "você",
    we: "nós",
    they: "eles",
    day: "dia",
    night: "noite",
    world: "mundo",
    time: "tempo",
    house: "casa",
    home: "lar",
    friend: "amigo",
    word: "palavra",
    language: "idioma",
    english: "inglês",
    portuguese: "português",
    translate: "traduzir",
    translation: "tradução",
    drone: "drone",
    winter: "inverno",
    win: "ganhar",
    winner: "vencedor",
    champion: "campeão",
    victory: "vitória",
  };

  const PT_TO_EN = {
    presente: "gift",
    dom: "gift",
    sol: "sun",
    filho: "son",
    ola: "hello",
    oi: "hi",
    "bom dia": "good morning",
    bom: "good",
    manha: "morning",
    vida: "life",
    luz: "light",
    coracao: "heart",
    amor: "love",
    agua: "water",
    sonho: "dream",
    sono: "sleep",
    paz: "peace",
    medo: "fear",
    compartilhar: "share",
    carregar: "load",
    modulo: "module",
    pilha: "stack",
    analise: "analysis",
    deus: "god",
    chuva: "rain",
    corpo: "body",
    mente: "mind",
    respiracao: "breath",
    relaxar: "relax",
    hoje: "today",
    obrigado: "thanks",
    obrigada: "thanks",
    "por favor": "please",
    sim: "yes",
    nao: "no",
    ou: "or",
    com: "with",
    de: "from",
    para: "to",
    voce: "you",
    nos: "we",
    eles: "they",
    dia: "day",
    noite: "night",
    mundo: "world",
    tempo: "time",
    casa: "house",
    lar: "home",
    amigo: "friend",
    palavra: "word",
    idioma: "language",
    ingles: "english",
    portugues: "portuguese",
    traduzir: "translate",
    traducao: "translation",
    drone: "drone",
    inverno: "winter",
    ganhar: "win",
    vencedor: "winner",
    campeao: "champion",
    vitoria: "victory",
  };

  const PT_MARKERS = /\b(nao|você|voce|que|uma|para|com|dos|das|pelo|pela|hoje|vida|luz|coração|coracao|olá|ola|oi|bom|dia|ainda|sem|pelo|esta|está|são|sao)\b/i;
  const EN_MARKERS = /\b(the|and|with|from|this|that|your|have|for|not|life|light|hello|hi|good|morning|share|gift|sun)\b/i;

  function normalize(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ");
  }

  function otherLang(detected, langA, langB) {
    if (detected === langA) return langB;
    if (detected === langB) return langA;
    return langB;
  }

  function scorePt(text) {
    let score = 0;
    if (/[áàâãéêíóôõúç]/i.test(text)) score += 4;
    if (/(ção|ções|nh|lh|ões)\b/i.test(text) || /[ãõ]/.test(text)) score += 3;
    if (PT_MARKERS.test(text)) score += 3;
    if (PT_TO_EN[normalize(text)]) score += 5;
    return score;
  }

  function scoreEn(text) {
    let score = 0;
    if (EN_MARKERS.test(text)) score += 3;
    if (/(ing|tion|ness|ment)\b/i.test(text)) score += 2;
    if (EN_TO_PT[normalize(text)]) score += 5;
    return score;
  }

  function guessLang(text, langA, langB) {
    const pair = [langA, langB];
    const n = normalize(text);
    if (!n) return null;

    const inEn = pair.includes("en") && EN_TO_PT[n];
    const inPt = pair.includes("pt") && PT_TO_EN[n];
    if (inEn && inPt) {
      return /[áàâãéêíóôõúç]/i.test(text) ? "pt" : "en";
    }
    if (inEn) return "en";
    if (inPt) return "pt";

    const pt = pair.includes("pt") ? scorePt(text) : -1;
    const en = pair.includes("en") ? scoreEn(text) : -1;

    if (pt > en && pt > 0) return "pt";
    if (en > pt && en > 0) return "en";
    return null;
  }

  function glossaryOut(text, from, to) {
    const n = normalize(text);
    if (from === "en" && to === "pt" && EN_TO_PT[n]) return EN_TO_PT[n];
    if (from === "pt" && to === "en" && PT_TO_EN[n]) return PT_TO_EN[n];
    return null;
  }

  /**
   * Decide direção e, se houver no mapa local, a tradução.
   * Sempre o outro idioma do par — nunca o mesmo de origem.
   */
  function route(text, langA, langB) {
    const trimmed = String(text || "").trim();
    if (!trimmed) return null;
    if (langA === langB) {
      return { from: langA, to: langB, out: trimmed, same: true };
    }
    const from = guessLang(trimmed, langA, langB);
    if (!from) {
      return { from: null, to: null, out: null, pending: true };
    }
    const to = otherLang(from, langA, langB);
    const out = glossaryOut(trimmed, from, to);
    return { from, to, out, pending: !out };
  }

  async function translateNetwork(text, from, to) {
    const gtx = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(
      from
    )}&tl=${encodeURIComponent(to)}&dt=t&q=${encodeURIComponent(text)}`;
    try {
      const res = await fetch(gtx);
      if (res.ok) {
        const data = await res.json();
        const out = (data[0] || []).map((row) => row[0]).join("");
        const detected = data[2] || from;
        if (out) return { out, detected };
      }
    } catch {
      /* tenta MyMemory */
    }

    const pair = `${from}|${to}`;
    const mem = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(pair)}`;
    const res = await fetch(mem);
    if (!res.ok) throw new Error("tradução indisponível");
    const data = await res.json();
    const out = data && data.responseData && data.responseData.translatedText;
    if (!out) throw new Error("tradução vazia");
    return { out, detected: from };
  }

  function label(code) {
    return LANGS[code] || code;
  }

  function loadLangs() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE) || "null");
      if (raw && LANGS[raw.a] && LANGS[raw.b]) return raw;
    } catch {
      /* padrão */
    }
    return { a: "pt", b: "en" };
  }

  function saveLangs(a, b) {
    try {
      localStorage.setItem(STORE, JSON.stringify({ a, b }));
    } catch {
      /* sem storage */
    }
  }

  function bind(root) {
    const box = (root || document).querySelector("[data-drone]");
    if (!box) return;

    const selA = box.querySelector("[data-drone-lang-a]");
    const selB = box.querySelector("[data-drone-lang-b]");
    const input = box.querySelector("[data-drone-input]");
    const outEl = box.querySelector("[data-drone-out]");
    const dirEl = box.querySelector("[data-drone-dir]");
    const swapBtn = box.querySelector("[data-drone-swap]");
    if (!selA || !selB || !input || !outEl) return;

    const stored = loadLangs();
    selA.value = stored.a;
    selB.value = stored.b;

    let timer = 0;
    let token = 0;

    function setDir(from, to) {
      if (!dirEl) return;
      if (!from || !to) return;
      if (from === to) {
        dirEl.textContent = "Escolha dois idiomas diferentes.";
        return;
      }
      dirEl.textContent = `${label(from)} → ${label(to)}`;
    }

    async function run() {
      const text = input.value;
      const langA = selA.value;
      const langB = selB.value;
      saveLangs(langA, langB);

      if (!text.trim()) {
        outEl.textContent = "";
        setDir(langA, langB);
        return;
      }

      const step = route(text, langA, langB);
      if (!step) return;
      if (step.from && step.to) setDir(step.from, step.to);

      if (step.same) {
        outEl.textContent = text.trim();
        return;
      }

      if (step.out) {
        outEl.textContent = step.out;
        return;
      }

      const mine = ++token;
      outEl.textContent = "…";
      try {
        const q = text.trim();
        let result;
        if (!step.from) {
          result = await translateNetwork(q, "auto", langA);
          const detected = String(result.detected || "").slice(0, 2).toLowerCase();
          if (detected === langA) {
            result = await translateNetwork(q, langA, langB);
            setDir(langA, langB);
          } else {
            setDir(detected === langB ? langB : detected || langB, langA);
          }
        } else {
          let from = step.from;
          let to = step.to;
          result = await translateNetwork(q, from, to);
          const detected = String(result.detected || from).slice(0, 2).toLowerCase();
          if (detected === to) {
            from = to;
            to = otherLang(from, langA, langB);
            result = await translateNetwork(q, from, to);
            setDir(from, to);
          }
        }

        if (mine !== token) return;
        outEl.textContent = result.out;
      } catch {
        if (mine !== token) return;
        outEl.textContent = "Sem rede para essa palavra. Tente gift, sol, life, vida…";
      }
    }

    function schedule() {
      window.clearTimeout(timer);
      const text = input.value.trim();
      const langA = selA.value;
      const langB = selB.value;
      const step = text ? route(text, langA, langB) : null;
      if (step && step.out) {
        setDir(step.from, step.to);
        outEl.textContent = step.out;
        return;
      }
      timer = window.setTimeout(run, 280);
    }

    input.addEventListener("input", schedule);
    selA.addEventListener("change", run);
    selB.addEventListener("change", run);
    if (swapBtn) {
      swapBtn.addEventListener("click", () => {
        const a = selA.value;
        selA.value = selB.value;
        selB.value = a;
        run();
      });
    }

    setDir(selA.value, selB.value);
  }

  const api = {
    LANGS,
    normalize,
    otherLang,
    guessLang,
    glossaryOut,
    route,
    bind,
  };

  root.DroneTraducao = api;
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => bind());
    } else {
      bind();
    }
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
