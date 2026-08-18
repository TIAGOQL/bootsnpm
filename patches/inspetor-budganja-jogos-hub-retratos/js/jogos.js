(function () {
  'use strict';

  function i18n(key, fallback) {
    return window.BudGanjaI18n ? window.BudGanjaI18n.t(key, fallback) : fallback || '';
  }

  function locale() {
    return (window.BudGanjaI18n && window.BudGanjaI18n.getLocale()) || 'pt-BR';
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function formatDate(iso) {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString(locale(), { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      return iso;
    }
  }

  function isValidVideoId(id) {
    return /^[a-zA-Z0-9_-]{11}$/.test(String(id || ''));
  }

  var PAGE_SIZE = 24;
  var CREATORS = [
    {
      id: 'zangado',
      slugs: ['zangado', 'zangadoreview', 'tio-zangado'],
      href: '/jogos/zangado/',
      catalogUrl: '/content/channels/zangadoreview.json',
      hubId: 'zangado',
      nameKey: 'pages.games.zangadoTitle',
      nameFallback: 'Zangado',
      descKey: 'pages.games.zangadoDesc',
      descFallback:
        'Reviews, sagas e primeira meia hora — o ofício de crítico gamer. Crédito: Zangado — sem afiliação.',
      yt: 'https://www.youtube.com/@zangadoreview',
      inspection: '/posts/post-inspecao-canal-zangado.html',
      emptyKey: 'pages.games.emptyZangado',
      emptyFallback: 'Nenhum vídeo do Zangado no catálogo ainda.'
    },
    {
      id: 'aleff',
      slugs: ['aleff', 'aleph', 'paulinho', 'paulinho-loko', 'paulinholoko'],
      href: '/jogos/aleff/',
      catalogUrl: '/content/channels/paulinholoko.json',
      hubId: 'paulinho',
      nameKey: 'pages.games.aleffTitle',
      nameFallback: 'Aleff',
      descKey: 'pages.games.paulinhoDesc',
      descFallback:
        'Arquivo de histórias na ordem de postagem. Crédito à pessoa: Aleff (Aliffe Henrique de Carvalho) — sem afiliação.',
      yt: 'https://www.youtube.com/@PaulinhoLOKOoficial',
      inspection: '/posts/post-inspecao-figura-aleff.html',
      emptyKey: 'pages.games.emptyVideos',
      emptyFallback: 'Nenhum vídeo do Aleff no catálogo ainda.'
    }
  ];

  var HUB_SPOTLIGHTS = [
    {
      id: 'zangado',
      href: '/jogos/zangado/',
      watchHref: '/jogos/zangado/pg-Y4xPYjpo',
      photo: '/imagens/jogos/zangado.jpg',
      photoAlt: 'Zangado',
      nameKey: 'pages.games.zangadoTitle',
      nameFallback: 'Zangado',
      tagKey: 'pages.games.zangadoPick',
      tagFallback: 'Crítica gamer — sagas e primeira meia hora',
      descKey: 'pages.games.zangadoDesc',
      descFallback:
        'Reviews, sagas e primeira meia hora — o ofício de crítico gamer. Crédito: Zangado — sem afiliação.',
      videoId: 'pg-Y4xPYjpo',
      videoTitle: 'Saga Resident Evil (20 Anos) - Parte 1',
      ctaKey: 'pages.games.openCatalog',
      ctaFallback: 'Ver catálogo'
    },
    {
      id: 'aleff',
      href: '/jogos/aleff/',
      watchHref: '/jogos/aleff/65jRuKI6BQM',
      photo: '/imagens/jogos/aleff.jpg',
      photoAlt: 'Aleff',
      nameKey: 'pages.games.aleffTitle',
      nameFallback: 'Aleff',
      tagKey: 'pages.games.aleffPick',
      tagFallback: 'A pessoa — Aliffe de Machado',
      descKey: 'pages.games.aleffDesc',
      descFallback:
        'Aleff (Aliffe Henrique de Carvalho). O recorte é a pessoa, não só a persona de ecrã. Sem afiliação.',
      videoId: '65jRuKI6BQM',
      videoTitle: 'PAULINHO QUASE CHOROU JOGANDO o GTA 5 MODO HISTÓRIA',
      ctaKey: 'pages.games.openCatalog',
      ctaFallback: 'Ver catálogo'
    },
    {
      id: 'paulinho',
      href: '/jogos/paulinho/',
      watchHref: '/jogos/paulinho/l91NOA6K0eo',
      photo: '/imagens/jogos/paulinho.jpg',
      photoAlt: 'Paulinho o LOKO',
      nameKey: 'pages.games.paulinhoTitle',
      nameFallback: 'Paulinho o LOKO',
      tagKey: 'pages.games.paulinhoCrazyPick',
      tagFallback: 'O louco do GTA RP — humor e sessão',
      descKey: 'pages.games.paulinhoCrazyDesc',
      descFallback:
        'A persona louca no ecrã. Ficção de jogo, não manual de crime. Crédito: Paulinho o LOKO / Aleff — sem afiliação.',
      videoId: 'l91NOA6K0eo',
      videoTitle: '1 HORA de GTA ANTI RP (Paulinho o LOKO)',
      ctaKey: 'pages.games.openCatalog',
      ctaFallback: 'Ver catálogo'
    }
  ];

  var HUB_SECONDARY = [
    { href: '/jogos/broto/', nameKey: 'pages.games.brotoTitle', nameFallback: 'Broto' },
    { href: '/jogos/cadernos/', nameKey: 'pages.games.notebooksTitle', nameFallback: 'Cadernos' }
  ];

  var catalog = null;
  var activeCreator = null;
  var activeCategory = '';
  var activeQuery = '';
  var visibleCount = 0;
  var searchTimer = null;
  var bound = false;

  function pageMode() {
    var attr = String(document.body.getAttribute('data-jogos') || '');
    if (attr) return attr;
    var parts = pathParts();
    if (parts[0] !== 'jogos') return 'hub';
    if (!parts[1] || parts[1] === 'index.html') return 'hub';
    if (parts[1] === 'video.html') return 'watch';
    if (parts[1] === 'broto') return 'broto';
    if (parts[1] === 'cadernos') return 'cadernos';
    if (parts[2] && isValidVideoId(parts[2].replace(/\.html$/i, ''))) return 'watch';
    if (creatorBySlug(parts[1])) return 'catalog';
    return 'hub';
  }

  function creatorBySlug(raw) {
    var slug = String(raw || '').toLowerCase();
    for (var i = 0; i < CREATORS.length; i++) {
      if (CREATORS[i].id === slug) return CREATORS[i];
      if (CREATORS[i].slugs.indexOf(slug) !== -1) return CREATORS[i];
    }
    return null;
  }

  function creatorById(id) {
    return creatorBySlug(id) || CREATORS[0];
  }

  function pathParts() {
    return String(window.location.pathname || '')
      .replace(/\/+$/, '')
      .split('/')
      .filter(Boolean);
  }

  function queryParam(name) {
    try {
      return new URLSearchParams(window.location.search).get(name) || '';
    } catch (e) {
      return '';
    }
  }

  function resolveCreatorFromLocation() {
    var fromAttr = document.body.getAttribute('data-creator');
    var fromQuery = queryParam('canal') || queryParam('channel');
    var parts = pathParts();
    var fromPath = parts[0] === 'jogos' && parts[1] ? parts[1] : '';
    return creatorBySlug(fromAttr) || creatorBySlug(fromQuery) || creatorBySlug(fromPath);
  }

  function resolveVideoId() {
    var fromQuery = queryParam('id') || queryParam('v');
    if (isValidVideoId(fromQuery)) return fromQuery;
    var parts = pathParts();
    var last = parts[parts.length - 1] || '';
    if (last === 'video.html') return '';
    return isValidVideoId(last) ? last : '';
  }

  function videoHref(creator, id) {
    return creator.href + encodeURIComponent(id);
  }

  function redirectLegacyHub() {
    if (pageMode() !== 'hub') return false;
    var raw = String(queryParam('canal') || queryParam('channel') || '').toLowerCase();
    var creator = creatorBySlug(raw);
    if (!creator) return false;
    window.location.replace(creator.href);
    return true;
  }

  function spotlightFacadeHtml(item) {
    var title = escapeHtml(item.videoTitle || 'YouTube');
    var id = escapeHtml(item.videoId);
    return (
      '<div class="video-embed jogos-hub-embed yt-facade-skip">' +
      '<button type="button" class="yt-facade" data-youtube-id="' +
      id +
      '" data-youtube-title="' +
      title +
      '" aria-label="Play: ' +
      title +
      '">' +
      '<img class="yt-facade-thumb" src="https://i.ytimg.com/vi/' +
      id +
      '/hqdefault.jpg" alt="" loading="lazy" decoding="async" width="480" height="360">' +
      '<span class="video-card-play" aria-hidden="true"></span>' +
      '</button>' +
      '<p class="jogos-hub-watch-link">' +
      '<a href="' +
      escapeHtml(item.watchHref) +
      '">' +
      escapeHtml(i18n('pages.games.openWatchPage', 'Abrir na página do vídeo')) +
      '</a></p>' +
      '</div>'
    );
  }

  function bindHubFacades(root) {
    if (!root) return;
    root.querySelectorAll('.jogos-hub-embed .yt-facade').forEach(function (btn) {
      if (btn.dataset.hubBound === '1') return;
      btn.dataset.hubBound = '1';
      btn.addEventListener('click', function () {
        if (window.BudGanjaYoutubeFacade && typeof window.BudGanjaYoutubeFacade.load === 'function') {
          window.BudGanjaYoutubeFacade.load(btn, true);
          return;
        }
        var id = btn.getAttribute('data-youtube-id') || '';
        if (!isValidVideoId(id)) return;
        var iframe = document.createElement('iframe');
        iframe.src =
          'https://www.youtube-nocookie.com/embed/' +
          encodeURIComponent(id) +
          '?rel=0&modestbranding=1&autoplay=1';
        iframe.title = btn.getAttribute('data-youtube-title') || 'YouTube';
        iframe.setAttribute(
          'allow',
          'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
        );
        iframe.setAttribute('allowfullscreen', '');
        var wrap = btn.closest('.video-embed');
        btn.replaceWith(iframe);
        if (wrap) wrap.classList.add('is-playing');
      });
    });
  }

  function renderHub() {
    var nav = document.getElementById('jogos-names');
    if (!nav) return;
    nav.className = 'jogos-spotlight';
    nav.setAttribute('aria-label', i18n('pages.games.spotlightLabel', 'Criadores'));
    var cards = HUB_SPOTLIGHTS.map(function (item) {
      return (
        '<article class="jogos-creator-card" data-creator="' +
        escapeHtml(item.id) +
        '">' +
        '<a class="jogos-creator-photo" href="' +
        escapeHtml(item.href) +
        '">' +
        '<img src="' +
        escapeHtml(item.photo) +
        '" alt="' +
        escapeHtml(item.photoAlt) +
        '" width="1200" height="630" loading="lazy" decoding="async">' +
        '</a>' +
        '<div class="jogos-creator-body">' +
        '<p class="jogos-creator-tag">' +
        escapeHtml(i18n(item.tagKey, item.tagFallback)) +
        '</p>' +
        '<h2 class="jogos-creator-name">' +
        '<a href="' +
        escapeHtml(item.href) +
        '">' +
        escapeHtml(i18n(item.nameKey, item.nameFallback)) +
        '</a></h2>' +
        '<p class="jogos-creator-desc">' +
        escapeHtml(i18n(item.descKey, item.descFallback)) +
        '</p>' +
        spotlightFacadeHtml(item) +
        '<p class="jogos-creator-cta">' +
        '<a class="botao botao-outline" href="' +
        escapeHtml(item.href) +
        '">' +
        escapeHtml(i18n(item.ctaKey, item.ctaFallback)) +
        '</a></p>' +
        '</div></article>'
      );
    }).join('');
    var secondary =
      '<nav class="jogos-name-list jogos-name-list--secondary" aria-label="' +
      escapeHtml(i18n('pages.games.moreLabel', 'Mais')) +
      '">' +
      HUB_SECONDARY.map(function (item) {
        return (
          '<a class="jogos-name" href="' +
          escapeHtml(item.href) +
          '">' +
          escapeHtml(i18n(item.nameKey, item.nameFallback)) +
          '</a>'
        );
      }).join('') +
      '</nav>';
    nav.innerHTML = cards + secondary;
    bindHubFacades(nav);
  }

  function renderChannelMeta(creator) {
    var title = document.getElementById('jogos-catalog-title');
    var desc = document.getElementById('jogos-catalog-desc');
    var yt = document.getElementById('jogos-channel-yt');
    var insp = document.getElementById('jogos-channel-inspection');
    if (title) title.textContent = i18n(creator.nameKey, creator.nameFallback);
    if (desc) desc.textContent = i18n(creator.descKey, creator.descFallback);
    if (yt) {
      yt.href = creator.yt;
      yt.hidden = !creator.yt;
    }
    if (insp) {
      if (creator.inspection) {
        insp.href = creator.inspection;
        insp.hidden = false;
      } else {
        insp.hidden = true;
      }
    }
    if (document.title && creator) {
      document.title = i18n(creator.nameKey, creator.nameFallback) + ' | ' + i18n('pages.games.docTitle', 'Jogos | Inspetor BudGanja');
    }
  }

  function categoryLabel(id) {
    var cats = (catalog && catalog.categories) || [];
    for (var i = 0; i < cats.length; i++) {
      if (cats[i].id === id) {
        var loc = locale();
        if (loc === 'en' && cats[i].labelEn) return cats[i].labelEn;
        if (loc === 'es' && cats[i].labelEs) return cats[i].labelEs;
        return cats[i].label;
      }
    }
    return id;
  }

  function filteredVideos() {
    var list = (catalog && catalog.videos) || [];
    if (activeCategory) {
      list = list.filter(function (v) {
        return v.category === activeCategory;
      });
    }
    var q = activeQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(function (v) {
        return String(v.title || '').toLowerCase().indexOf(q) >= 0;
      });
    }
    return list.slice().sort(function (a, b) {
      var da = a.published ? Date.parse(a.published) : 0;
      var db = b.published ? Date.parse(b.published) : 0;
      if (da && db && da !== db) return db - da;
      if (da && !db) return -1;
      if (!da && db) return 1;
      var ia = Number.isFinite(a.pageIndex) ? a.pageIndex : 999999;
      var ib = Number.isFinite(b.pageIndex) ? b.pageIndex : 999999;
      if (ia !== ib) return ia - ib;
      return 0;
    });
  }

  function renderNotebooks(posts) {
    var box = document.getElementById('jogos-cadernos-list');
    if (!box) return;
    var loc = locale();
    var jogos = (posts || []).filter(function (p) {
      return p.series === 'cadernos-jogo' || /inspecao-jogo-/i.test(p.slug || '');
    });
    if (!jogos.length) return;
    box.innerHTML = jogos
      .map(function (p) {
        var title = p.title || '';
        if (loc === 'en' && p.titleEn) title = p.titleEn;
        if (loc === 'es' && p.titleEs) title = p.titleEs;
        var excerpt = p.excerpt || '';
        if (loc === 'en' && p.excerptEn) excerpt = p.excerptEn;
        if (loc === 'es' && p.excerptEs) excerpt = p.excerptEs;
        var href = p.url || '/posts/post-' + p.slug + '.html';
        var cover = p.coverImage
          ? '<img class="post-card-cover" src="' +
            escapeHtml(p.coverImage) +
            '" alt="" loading="lazy" decoding="async">'
          : '';
        return (
          '<article class="card post-card">' +
          '<a href="' +
          escapeHtml(href) +
          '">' +
          cover +
          '<h3>' +
          escapeHtml(title) +
          '</h3>' +
          '<p>' +
          escapeHtml(excerpt) +
          '</p>' +
          '<span class="post-card-date">' +
          escapeHtml(formatDate(p.date)) +
          '</span>' +
          '</a>' +
          '</article>'
        );
      })
      .join('');
  }

  function renderFilters() {
    var nav = document.getElementById('jogos-filters');
    if (!nav || !catalog) return;
    var cats = catalog.categories || [];
    nav.innerHTML =
      '<div class="videos-filters" role="toolbar" aria-label="' +
      escapeHtml(i18n('pages.games.filtersLabel', 'Filtrar por tipo')) +
      '">' +
      '<button type="button" class="videos-filter-chip' +
      (!activeCategory ? ' is-active' : '') +
      '" data-category="" aria-pressed="' +
      (!activeCategory ? 'true' : 'false') +
      '">' +
      escapeHtml(i18n('pages.games.filterAll', 'Todos')) +
      ' (' +
      ((catalog.videos || []).length) +
      ')</button>' +
      cats
        .map(function (c) {
          var on = activeCategory === c.id;
          return (
            '<button type="button" class="videos-filter-chip' +
            (on ? ' is-active' : '') +
            '" data-category="' +
            escapeHtml(c.id) +
            '" aria-pressed="' +
            (on ? 'true' : 'false') +
            '">' +
            escapeHtml(categoryLabel(c.id)) +
            ' (' +
            c.count +
            ')</button>'
          );
        })
        .join('') +
      '</div>';
  }

  function cardHtml(creator, v) {
    var title = v.title || '';
    var thumb = v.thumb || (isValidVideoId(v.id) ? 'https://i.ytimg.com/vi/' + v.id + '/hqdefault.jpg' : '');
    var href = videoHref(creator, v.id);
    return (
      '<article class="video-card card" data-video-id="' +
      escapeHtml(v.id) +
      '">' +
      '<a class="video-card-link" href="' +
      escapeHtml(href) +
      '">' +
      '<span class="video-card-media">' +
      (thumb
        ? '<img src="' + escapeHtml(thumb) + '" alt="" class="video-card-thumb" loading="lazy" decoding="async">'
        : '<span class="video-card-thumb video-card-thumb--empty"></span>') +
      '<span class="video-card-play" aria-hidden="true"></span>' +
      '</span>' +
      '<span class="video-card-body">' +
      '<span class="video-card-title">' +
      escapeHtml(title) +
      '</span>' +
      '<span class="video-card-date">' +
      escapeHtml(formatDate(v.published)) +
      '</span>' +
      '</span>' +
      '</a>' +
      '</article>'
    );
  }

  function renderVideos() {
    var grid = document.getElementById('jogos-videos');
    var more = document.getElementById('jogos-load-more');
    if (!grid || !activeCreator) return;
    if (!catalog || !catalog.videos) {
      grid.innerHTML =
        '<p class="empty-message">' + escapeHtml(i18n(activeCreator.emptyKey, activeCreator.emptyFallback)) + '</p>';
      if (more) more.hidden = true;
      return;
    }
    var list = filteredVideos();
    if (!list.length) {
      grid.innerHTML =
        '<p class="empty-message">' +
        escapeHtml(
          activeQuery
            ? i18n('pages.games.emptySearch', 'Nenhum vídeo com essas palavras.')
            : i18n('pages.games.emptyFilter', 'Nenhum vídeo neste filtro.')
        ) +
        '</p>';
      if (more) more.hidden = true;
      return;
    }
    var slice = list.slice(0, visibleCount);
    grid.innerHTML =
      '<div class="videos-grid">' +
      slice
        .map(function (v) {
          return cardHtml(activeCreator, v);
        })
        .join('') +
      '</div>';
    if (more) more.hidden = slice.length >= list.length;
  }

  function catalogFromHub(hub, creator) {
    if (!hub || !hub.videos) return null;
    var videos = hub.videos.filter(function (v) {
      return v.channel === creator.hubId;
    });
    return {
      channelName: i18n(creator.nameKey, creator.nameFallback),
      videos: videos.map(function (v) {
        return {
          id: v.id,
          title: v.title,
          published: v.published,
          url: v.url,
          thumb: v.thumb,
          category: (v.series && v.series[0]) || 'outros'
        };
      }),
      categories: (hub.seriesOptions || []).filter(function (s) {
        return s.channel === creator.hubId;
      })
    };
  }

  function loadCatalog(creator) {
    var grid = document.getElementById('jogos-videos');
    if (grid) {
      grid.innerHTML =
        '<p class="empty-message">' +
        escapeHtml(i18n('pages.games.loadingVideos', 'A carregar vídeos…')) +
        '</p>';
    }
    catalog = null;
    return fetch(creator.catalogUrl)
      .then(function (r) {
        return r.ok ? r.json() : Promise.reject(new Error('catalog'));
      })
      .catch(function () {
        return fetch('/content/videos-hub.json')
          .then(function (r) {
            return r.ok ? r.json() : null;
          })
          .then(function (hub) {
            return catalogFromHub(hub, creator);
          });
      })
      .then(function (doc) {
        catalog = doc;
        if (pageMode() === 'catalog') {
          renderFilters();
          renderVideos();
        }
        return doc;
      })
      .catch(function () {
        catalog = null;
        if (pageMode() === 'catalog') {
          renderFilters();
          renderVideos();
        }
        return null;
      });
  }

  function findVideo(id) {
    var list = (catalog && catalog.videos) || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function renderWatch(creator, video, id) {
    var box = document.getElementById('jogos-watch');
    var back = document.getElementById('jogos-back');
    if (back) {
      back.href = creator ? creator.href : '/jogos/';
      back.textContent = creator
        ? i18n(creator.nameKey, creator.nameFallback)
        : i18n('pages.games.backToGames', 'Jogos');
    }
    if (!box) return;
    if (!isValidVideoId(id)) {
      box.innerHTML =
        '<p class="empty-message">' +
        escapeHtml(i18n('pages.games.videoMissing', 'Vídeo não encontrado.')) +
        '</p>';
      return;
    }
    var title = (video && video.title) || i18n('pages.games.videoFallbackTitle', 'Vídeo');
    var date = video && video.published ? formatDate(video.published) : '';
    var yt = (video && video.url) || 'https://www.youtube.com/watch?v=' + id;
    document.title = title + ' | ' + i18n('pages.games.docTitle', 'Jogos | Inspetor BudGanja');
    box.innerHTML =
      '<div class="jogos-watch-player">' +
      '<div class="video-embed">' +
      '<iframe src="https://www.youtube-nocookie.com/embed/' +
      escapeHtml(id) +
      '?rel=0" title="' +
      escapeHtml(title) +
      '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>' +
      '</div>' +
      '<h1 class="jogos-watch-title">' +
      escapeHtml(title) +
      '</h1>' +
      (date ? '<p class="jogos-watch-date">' + escapeHtml(date) + '</p>' : '') +
      '<p class="jogos-watch-actions">' +
      '<a class="botao botao-outline" href="' +
      escapeHtml(yt) +
      '" target="_blank" rel="noopener noreferrer">' +
      escapeHtml(i18n('pages.videos.continueOnYoutube', 'Continuar no YouTube')) +
      '</a>' +
      '</p>' +
      '</div>';
  }

  function setCategory(id) {
    activeCategory = id || '';
    visibleCount = PAGE_SIZE;
    renderFilters();
    renderVideos();
  }

  function bindCatalog() {
    if (bound) return;
    bound = true;
    var nav = document.getElementById('jogos-filters');
    var more = document.getElementById('jogos-load-more');
    var search = document.getElementById('jogos-search');
    if (nav) {
      nav.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-category]');
        if (!btn) return;
        setCategory(btn.getAttribute('data-category') || '');
      });
    }
    if (more) {
      more.addEventListener('click', function () {
        visibleCount += PAGE_SIZE;
        renderVideos();
      });
    }
    if (search) {
      search.addEventListener('input', function () {
        window.clearTimeout(searchTimer);
        searchTimer = window.setTimeout(function () {
          activeQuery = search.value || '';
          visibleCount = PAGE_SIZE;
          renderVideos();
        }, 180);
      });
    }
  }

  function loadNotebooks() {
    fetch('/posts-public.json')
      .then(function (r) {
        return r.ok ? r.json() : [];
      })
      .then(function (posts) {
        renderNotebooks(Array.isArray(posts) ? posts : []);
      })
      .catch(function () {
        renderNotebooks([]);
      });
  }

  function load() {
    if (redirectLegacyHub()) return;
    var mode = pageMode();
    if (mode === 'hub') {
      renderHub();
      return;
    }
    if (mode === 'cadernos') {
      loadNotebooks();
      return;
    }
    if (mode === 'catalog') {
      activeCreator = resolveCreatorFromLocation() || CREATORS[0];
      visibleCount = PAGE_SIZE;
      bindCatalog();
      renderChannelMeta(activeCreator);
      loadCatalog(activeCreator);
      return;
    }
    if (mode === 'watch') {
      activeCreator = resolveCreatorFromLocation();
      var videoId = resolveVideoId();
      if (activeCreator) {
        loadCatalog(activeCreator).then(function () {
          renderWatch(activeCreator, findVideo(videoId), videoId);
        });
      } else if (isValidVideoId(videoId)) {
        renderWatch(null, { id: videoId, title: '', url: 'https://www.youtube.com/watch?v=' + videoId }, videoId);
      } else {
        renderWatch(null, null, '');
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
