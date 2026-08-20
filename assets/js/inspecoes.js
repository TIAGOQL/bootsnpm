(function () {
  var DATA_URL = new URL("../data/inspecoes.json", document.currentScript.src);

  function catName(data, id) {
    var c = data.categorias.find(function (x) {
      return x.id === id;
    });
    return c ? c.nome : id;
  }

  function eixoName(data, id) {
    var e = data.eixos.find(function (x) {
      return x.id === id;
    });
    return e ? e.nome : id;
  }

  function byId(data, id) {
    return data.itens.find(function (x) {
      return x.id === id;
    });
  }

  function relatedOf(data, item) {
    var seen = {};
    var out = [];
    function add(id) {
      if (!id || id === item.id || seen[id]) return;
      var other = byId(data, id);
      if (!other) return;
      seen[id] = true;
      out.push(other);
    }
    (item.rel || []).forEach(add);
    data.itens.forEach(function (other) {
      if (other.id === item.id) return;
      var shares = (other.eixos || []).some(function (e) {
        return (item.eixos || []).indexOf(e) !== -1;
      });
      if (shares && (other.rel || []).indexOf(item.id) !== -1) add(other.id);
    });
    return out;
  }

  function el(tag, className, html) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (html != null) node.innerHTML = html;
    return node;
  }

  function linkFor(item) {
    var a = document.createElement("a");
    a.className = "module-link";
    a.href = item.href;
    a.innerHTML =
      "<span>" +
      escapeHtml((item.categorias && item.categorias[0]) || "inspeção") +
      "</span><strong>" +
      escapeHtml(item.titulo) +
      "</strong><em>" +
      escapeHtml(item.kicker || "") +
      "</em>";
    return a;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderRelated(data, item, mount) {
    var rel = relatedOf(data, item);
    if (!rel.length) return;
    var box = el("section", "inspecao-rel");
    box.setAttribute("aria-label", "Relações");
    var h = document.createElement("h2");
    h.textContent = "Relações";
    box.appendChild(h);
    var meta = el("p", "inspecao-rel-meta");
    var cats = (item.categorias || []).map(function (id) {
      return catName(data, id);
    });
    var eixos = (item.eixos || []).map(function (id) {
      return eixoName(data, id);
    });
    meta.textContent =
      (cats.length ? cats.join(" · ") : "Inspeção") +
      (eixos.length ? " · eixo: " + eixos.join(", ") : "");
    box.appendChild(meta);
    var nav = el("nav", "module-map");
    rel.forEach(function (other) {
      nav.appendChild(linkFor(other));
    });
    box.appendChild(nav);
    var hub = document.createElement("p");
    hub.className = "inspecao-rel-hub";
    hub.innerHTML = '<a href="inspecoes.html">Todas as inspeções</a> · categorias e eixos';
    box.appendChild(hub);
    var note = mount.querySelector(".research-note");
    if (note) mount.insertBefore(box, note);
    else mount.appendChild(box);
  }

  function renderHub(data, root) {
    var state = { cat: "", eixo: "", q: "" };

    var intro = el("p");
    intro.innerHTML =
      "<strong>" +
      data.itens.length +
      " inspeções</strong> em categorias. Os <em>eixos</em> são as relações: peito/luz, stack, tempo, oficina, traduzir, música.";
    root.appendChild(intro);

    var filters = el("div", "inspecao-filters");
    var catWrap = el("div", "inspecao-chips");
    catWrap.setAttribute("aria-label", "Categorias");
    function chip(label, key, value) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "inspecao-chip";
      b.textContent = label;
      b.dataset.key = key;
      b.dataset.value = value;
      return b;
    }
    catWrap.appendChild(chip("Todas", "cat", ""));
    data.categorias.forEach(function (c) {
      catWrap.appendChild(chip(c.nome, "cat", c.id));
    });
    filters.appendChild(catWrap);

    var eixoWrap = el("div", "inspecao-chips inspecao-chips-eixo");
    eixoWrap.setAttribute("aria-label", "Eixos (relações)");
    eixoWrap.appendChild(chip("Todos os eixos", "eixo", ""));
    data.eixos.forEach(function (e) {
      eixoWrap.appendChild(chip(e.nome, "eixo", e.id));
    });
    filters.appendChild(eixoWrap);

    var search = document.createElement("input");
    search.type = "search";
    search.className = "inspecao-search";
    search.placeholder = "Buscar inspeção";
    search.setAttribute("aria-label", "Buscar inspeção");
    filters.appendChild(search);
    root.appendChild(filters);

    var count = el("p", "inspecao-count");
    root.appendChild(count);

    var groups = el("div", "inspecao-groups");
    root.appendChild(groups);

    function matches(item) {
      if (state.cat && (item.categorias || []).indexOf(state.cat) === -1) return false;
      if (state.eixo && (item.eixos || []).indexOf(state.eixo) === -1) return false;
      if (state.q) {
        var blob = (item.titulo + " " + (item.kicker || "") + " " + (item.categorias || []).join(" ")).toLowerCase();
        if (blob.indexOf(state.q) === -1) return false;
      }
      return true;
    }

    function paintChips() {
      filters.querySelectorAll(".inspecao-chip").forEach(function (b) {
        var on = state[b.dataset.key] === b.dataset.value;
        b.setAttribute("aria-pressed", on ? "true" : "false");
        b.classList.toggle("is-on", on);
      });
    }

    function paint() {
      paintChips();
      var shown = data.itens.filter(matches);
      count.textContent = shown.length + " no recorte";
      groups.innerHTML = "";
      var cats = state.cat
        ? data.categorias.filter(function (c) {
            return c.id === state.cat;
          })
        : data.categorias;
      cats.forEach(function (c) {
        var items = shown.filter(function (it) {
          return (it.categorias || []).indexOf(c.id) !== -1;
        });
        if (!items.length) return;
        var sec = el("section", "inspecao-group");
        var h = document.createElement("h2");
        h.textContent = c.nome;
        sec.appendChild(h);
        var nav = el("nav", "module-map");
        items.forEach(function (it) {
          var a = linkFor(it);
          var extra = relatedOf(data, it)
            .slice(0, 3)
            .map(function (r) {
              return r.titulo;
            })
            .join(" · ");
          if (extra) {
            var em = a.querySelector("em");
            if (em) em.textContent = (it.kicker || "") + " → " + extra;
          }
          nav.appendChild(a);
        });
        sec.appendChild(nav);
        groups.appendChild(sec);
      });
      if (!groups.children.length) {
        groups.appendChild(el("p", "", "Nada nesse filtro."));
      }
    }

    filters.addEventListener("click", function (ev) {
      var b = ev.target.closest(".inspecao-chip");
      if (!b) return;
      state[b.dataset.key] = b.dataset.value;
      paint();
    });
    search.addEventListener("input", function () {
      state.q = search.value.trim().toLowerCase();
      paint();
    });
    paint();
  }

  function boot(data) {
    var hub = document.querySelector("[data-inspecoes-hub]");
    if (hub) renderHub(data, hub);
    var id = document.body && document.body.getAttribute("data-inspecao");
    if (id) {
      var item = byId(data, id);
      var article = document.querySelector("article.research-body") || document.querySelector("article");
      if (item && article) renderRelated(data, item, article);
    }
  }

  fetch(DATA_URL)
    .then(function (r) {
      if (!r.ok) throw new Error("inspecoes.json");
      return r.json();
    })
    .then(boot)
    .catch(function () {
      var hub = document.querySelector("[data-inspecoes-hub]");
      if (hub) hub.textContent = "Não deu para carregar o mapa de inspeções.";
    });
})();
