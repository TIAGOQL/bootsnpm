function basePrefix() {
  const path = location.pathname || "";
  if (path.includes("/pesquisas/") || path.includes("/poemas/")) return "..";
  return ".";
}

function isHome(path) {
  return !path.includes("/pesquisas/") && !path.includes("/poemas/");
}

function initSiteBar() {
  if (document.querySelector("[data-site-bar]")) return;

  const base = basePrefix();
  const path = location.pathname || "";
  const links = [
    { href: `${base}/pesquisas/sinais.html`, label: "Sinais", test: /\/sinais(\.html)?$/ },
    { href: `${base}/pesquisas/diario-rem.html`, label: "Diário", test: /\/diario-rem(\.html)?$/ },
    { href: `${base}/pesquisas/cultivo-ideias.html`, label: "Cultivo", test: /\/cultivo-ideias(\.html)?$/ },
    { href: `${base}/pesquisas/radio.html`, label: "Rádio", test: /\/radio(\.html)?$/ },
  ];

  const nav = document.createElement("nav");
  nav.className = "site-bar";
  nav.setAttribute("data-site-bar", "");
  nav.setAttribute("aria-label", "Casa");

  const mark = document.createElement("a");
  mark.className = "site-mark";
  mark.href = `${base}/index.html`;
  mark.textContent = "Painel REM";
  if (isHome(path)) mark.setAttribute("aria-current", "page");

  const list = document.createElement("span");
  list.className = "site-links";
  for (const item of links) {
    const a = document.createElement("a");
    a.href = item.href;
    a.textContent = item.label;
    if (item.test.test(path)) a.setAttribute("aria-current", "page");
    list.appendChild(a);
  }

  nav.appendChild(mark);
  nav.appendChild(list);
  document.body.insertBefore(nav, document.body.firstChild);
  document.body.classList.add("has-site-bar");
}

initSiteBar();
