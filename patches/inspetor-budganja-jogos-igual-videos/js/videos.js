(function () {
  'use strict';

  function i18n(key, fallback) {
    return window.BudGanjaI18n ? window.BudGanjaI18n.t(key, fallback) : (fallback || '');
  }

  function videoLocale() {
    return (window.BudGanjaI18n && window.BudGanjaI18n.getLocale()) || 'pt-BR';
  }

  function formatDate(iso) {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString(videoLocale(), { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      return iso;
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function localizedField(v, field) {
    var loc = videoLocale();
    if (loc === 'en' && v[field + 'En']) return v[field + 'En'];
    if (loc === 'es' && v[field + 'Es']) return v[field + 'Es'];
    return v[field] || '';
  }

  function isValidVideoId(id) {
    return /^[a-zA-Z0-9_-]{11}$/.test(String(id || ''));
  }

  function videoThumb(v) {
    if (!v) return '';
    if (v.thumb) return String(v.thumb);
    if (isValidVideoId(v.id)) return 'https://i.ytimg.com/vi/' + v.id + '/hqdefault.jpg';
    return '';
  }

  var CHANNEL_ALIASES = {
    inspetor: 'inspetor',
    'inspetor-budganja': 'inspetor',
    'canal-inspetor': 'inspetor',
    movrecam: 'movrecam',
    'canal-movrecam': 'movrecam',
    canabinall: 'canabinall',
    'canal-canabinall': 'canabinall',
    disneyjr: 'disneyjr',
    'canal-disneyjr': 'disneyjr',
    'disney-jr': 'disneyjr',
    disneyjrbr: 'disneyjr',
    'disney-jr-brasil': 'disneyjr',
    desenhos: 'disneyjr',
    paulinho: 'paulinho',
    'paulinho-loko': 'paulinho',
    paulinholoko: 'paulinho',
    zangado: 'zangado',
    zangadoreview: 'zangado',
    'canal-zangado': 'zangado',
    'tio-zangado': 'zangado',
    lair: 'lair',
    'canal-lair': 'lair',
    'dr-lair': 'lair',
    drlair: 'lair',
    'lair-ribeiro': 'lair',
    drlairribeiro: 'lair',
    drlairribeirooficiall: 'lair',
    'divulgacao-lair': 'lair',
    davis: 'davis',
    'canal-davis': 'davis',
    'william-davis': 'davis',
    williamdavis: 'davis',
    williamdavismd: 'davis',
    'wheat-belly': 'davis',
    'dr-davis': 'davis',
    all: 'all',
    todos: 'all'
  };

  var SERIES_ALIASES = {
    xiv: 'xiv',
    'xiv-edicao': 'xiv',
    'xiv-edição': 'xiv',
    conceitos: 'conceitos',
    'conceitos-basicos': 'conceitos',
    'conceitos-básicos': 'conceitos',
    'plantas-sagradas': 'plantas-sagradas',
    'plantas sagradas': 'plantas-sagradas',
    eliana: 'eliana',
    'eliana-rodrigues': 'eliana',
    gabrielle: 'gabrielle',
    'gabrielle-dainezi': 'gabrielle',
    'gabi-dainezi': 'gabrielle',
    dainezi: 'gabrielle',
    sidarta: 'sidarta',
    'sidarta-ribeiro': 'sidarta',
    'padre-ticao': 'padre-ticao',
    ticao: 'padre-ticao',
    ticão: 'padre-ticao',
    cannabis: 'cannabis',
    acucar: 'acucar',
    açucar: 'acucar',
    'gluten-leite': 'gluten-leite',
    'glúten-leite': 'gluten-leite',
    diabetes: 'diabetes',
    cerebro: 'cerebro',
    cérebro: 'cerebro',
    coracao: 'coracao',
    coração: 'coracao',
    inflamacao: 'inflamacao',
    inflamação: 'inflamacao',
    hormonios: 'hormonios',
    hormônios: 'hormonios',
    longevidade: 'longevidade',
    agua: 'agua',
    água: 'agua',
    oleos: 'oleos',
    óleos: 'oleos',
    nutricao: 'nutricao',
    nutrição: 'nutricao',
    exercicio: 'exercicio',
    exercício: 'exercicio',
    sono: 'sono',
    imunidade: 'imunidade',
    autoajuda: 'autoajuda',
    lives: 'lives',
    trailers: 'trailers',
    outros: 'outros',
    'trigo-gluten': 'trigo-gluten',
    'trigo-glúten': 'trigo-gluten',
    microbioma: 'microbioma',
    'diabetes-peso': 'diabetes-peso',
    'tireoide-hormonios': 'tireoide-hormonios',
    tireoide: 'tireoide-hormonios',
    suplementos: 'suplementos',
    undoctored: 'undoctored',
    programas: 'programas',
    entrevistas: 'entrevistas',
    sagas: 'sagas',
    'vale-a-pena': 'vale-a-pena',
    'primeira-meia-hora': 'primeira-meia-hora',
    'nao-vale': 'nao-vale',
    trilogias: 'trilogias',
    demo: 'demo',
    unboxing: 'unboxing',
    'bate-papo': 'bate-papo',
    minuto: 'minuto',
    'nerd-extra': 'nerd-extra',
    retrospectiva: 'retrospectiva',
    gameplay: 'gameplay',
    lives: 'lives',
    listas: 'listas',
    especiais: 'especiais'
  };

  var TOPIC_ALIASES = {
    cultivo: 'cultivo',
    unifesp: 'unifesp',
    'aulas-unifesp': 'unifesp',
    aulas: 'unifesp',
    saude: 'saude',
    saúde: 'saude',
    'saude-e-usos': 'saude',
    plantas: 'plantas',
    ciencia: 'ciencia',
    ciência: 'ciencia'
  };

  var TOPIC_ORDER = ['cultivo', 'unifesp', 'saude', 'plantas', 'ciencia'];

  var CHANNEL_ORDER_ALL = ['movrecam', 'canabinall', 'inspetor', 'lair', 'davis', 'disneyjr', 'zangado', 'paulinho'];
  var CHANNEL_ORDER_JOGOS = ['zangado', 'paulinho'];
  var isJogosPage =
    typeof document !== 'undefined' &&
    document.body &&
    document.body.getAttribute('data-page') === 'jogos';
  var CHANNEL_ORDER = isJogosPage ? CHANNEL_ORDER_JOGOS.slice() : CHANNEL_ORDER_ALL.slice();

  var cachedHub = null;
  var selectedId = '';
  var activeChannel = 'all';
  var activeSeries = '';
  var activeTopic = '';
  var activeQuery = '';
  var searchTimer = null;
  var playingId = '';
  var lastFiltered = [];
  var gridEl = null;
  var filtersEl = null;
  var searchEl = null;
  var loadMoreBtn = null;
  var PAGE_SIZE = 12;
  var visibleCount = 0;
  function resolveChannel(raw) {
    var key = String(raw || '')
      .trim()
      .toLowerCase();
    if (!key) return '';
    if (CHANNEL_ALIASES[key]) return CHANNEL_ALIASES[key];
    return '';
  }

  function resolveSeries(raw) {
    var key = String(raw || '')
      .trim()
      .toLowerCase();
    if (!key) return '';
    if (SERIES_ALIASES[key]) return SERIES_ALIASES[key];
    // series=canal-movrecam → channel alias handled separately
    if (CHANNEL_ALIASES[key] && CHANNEL_ALIASES[key] !== 'all') return '';
    return key;
  }

  function resolveTopic(raw) {
    var key = String(raw || '')
      .trim()
      .toLowerCase();
    if (!key) return '';
    if (TOPIC_ALIASES[key]) return TOPIC_ALIASES[key];
    if (TOPIC_ORDER.indexOf(key) >= 0) return key;
    return '';
  }

  function readRequestedId() {
    try {
      var params = new URLSearchParams(window.location.search);
      var fromQuery = params.get('v');
      if (isValidVideoId(fromQuery)) return fromQuery;
    } catch (e) { /* ignore */ }

    var hash = String(window.location.hash || '').replace(/^#/, '');
    if (hash.indexOf('v=') === 0) hash = hash.slice(2);
    if (hash.indexOf('video-') === 0) hash = hash.slice(6);
    return isValidVideoId(hash) ? hash : '';
  }

  function readFilterFromUrl() {
    var channel = 'all';
    var series = '';
    var topic = '';
    var q = '';
    try {
      var params = new URLSearchParams(window.location.search);
      var chRaw = params.get('channel') || params.get('canal') || '';
      var seriesRaw = params.get('series') || '';
      var topicRaw = params.get('topic') || '';
      var resolvedCh = resolveChannel(chRaw);
      var resolvedSeriesAsChannel = resolveChannel(seriesRaw);
      var resolvedSeries = resolveSeries(seriesRaw);
      var resolvedTopic = resolveTopic(topicRaw);

      if (resolvedCh) channel = resolvedCh;
      else if (!chRaw && resolvedSeriesAsChannel) channel = resolvedSeriesAsChannel;

      if (resolvedSeries && !resolvedSeriesAsChannel) series = resolvedSeries;

      if (!resolvedCh && !resolvedSeriesAsChannel && series) {
        if (series === 'xiv') channel = 'movrecam';
        else if (series === 'conceitos' || series === 'plantas-sagradas') channel = 'canabinall';
      }
      if (resolvedTopic) topic = resolvedTopic;
      q = String(params.get('q') || '').trim();
    } catch (e) { /* ignore */ }
    return { channel: channel, series: series, topic: topic, q: q };
  }

  function writeFilterToUrl(channel, series, videoId, replace) {
    var params = new URLSearchParams();
    if (channel && channel !== 'all') params.set('channel', channel);
    if (series) params.set('series', series);
    if (activeTopic) params.set('topic', activeTopic);
    if (activeQuery) params.set('q', activeQuery);
    var qs = params.toString();
    var next = window.location.pathname + (qs ? '?' + qs : '');
    if (isValidVideoId(videoId)) next += '#' + videoId;
    var current = window.location.pathname + window.location.search + window.location.hash;
    if (current === next) return;
    if (replace) history.replaceState(null, '', next);
    else history.pushState(null, '', next);
  }

  function foldText(s) {
    return String(s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function tokenizeQuery(q) {
    return foldText(q)
      .split(/[^a-z0-9]+/)
      .filter(Boolean);
  }

  function videoSearchBlob(v) {
    if (!v) return '';
    var topicLabels = ((v.topics || []) || []).map(function (id) {
      return topicLabel(id);
    });
    return foldText(
      [
        v.title,
        v.titleEn,
        v.titleEs,
        v.summary,
        v.summaryEn,
        v.summaryEs,
        channelLabel(v.channel),
        ((v.series || []) || []).join(' '),
        ((v.topics || []) || []).join(' '),
        topicLabels.join(' ')
      ].join(' ')
    );
  }

  function videoMatchesQuery(v, tokens) {
    if (!tokens || !tokens.length) return true;
    var blob = videoSearchBlob(v);
    for (var i = 0; i < tokens.length; i++) {
      if (blob.indexOf(tokens[i]) < 0) return false;
    }
    return true;
  }

  function youtubeCcLangPref() {
    var lang = '';
    try {
      if (window.BudGanjaI18n && typeof window.BudGanjaI18n.getLocale === 'function') {
        lang = String(window.BudGanjaI18n.getLocale() || '');
      }
    } catch (e) { /* ignore */ }
    if (!lang && document.documentElement) lang = String(document.documentElement.lang || '');
    lang = lang.toLowerCase();
    if (lang.indexOf('en') === 0) return 'en';
    if (lang.indexOf('es') === 0) return 'es';
    return 'pt';
  }

  function embedSrc(id, autoplay) {
    var cc = youtubeCcLangPref();
    var src =
      'https://www.youtube-nocookie.com/embed/' +
      encodeURIComponent(id) +
      '?rel=0&modestbranding=1&playsinline=1&hl=' +
      encodeURIComponent(cc) +
      '&cc_load_policy=1&cc_lang_pref=' +
      encodeURIComponent(cc);
    try {
      src += '&origin=' + encodeURIComponent(window.location.origin);
    } catch (e) { /* ignore */ }
    if (autoplay) src += '&autoplay=1';
    return src;
  }

  function youtubeWatchUrl(id) {
    return 'https://www.youtube.com/watch?v=' + encodeURIComponent(id);
  }

  function videoPageShareUrl(id) {
    var path = (isJogosPage ? '/jogos/' : '/videos/') + '#' + encodeURIComponent(id);
    try {
      if (/localhost|127\.0\.0\.1/i.test(window.location.hostname || '')) {
        return 'https://inspetorbudganja.com.br' + path;
      }
      return window.location.origin + path;
    } catch (e) {
      return 'https://inspetorbudganja.com.br' + path;
    }
  }

  /** WhatsApp só gera preview/player embutido com link do YouTube (não com /videos/#…). */
  function whatsAppShareUrl(text) {
    return 'https://api.whatsapp.com/send?text=' + encodeURIComponent(String(text || ''));
  }

  function youtubeShareMessage(title, id) {
    var watch = youtubeWatchUrl(id);
    var t = String(title || '').trim();
    return t ? t + '\n' + watch : watch;
  }

  function openWhatsAppShare(text) {
    var url = whatsAppShareUrl(text);
    var isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
    if (isMobile) {
      window.location.assign(url);
      return;
    }
    var win = window.open(url, '_blank', 'noopener,noreferrer');
    if (!win) window.location.assign(url);
  }

  function bindCopyVideoLinkButton(root) {
    if (!root) return;
    var btn = root.querySelector('[data-copy-video-link]');
    if (!btn || btn.dataset.bound === '1') return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-copy-video-link') || '';
      if (!isValidVideoId(id)) return;
      var url = videoPageShareUrl(id);
      var label = btn.querySelector('[data-copy-label]') || btn;
      var original = i18n('pages.videos.copyLink', 'Copiar link');
      var done = function () {
        label.textContent = i18n('pages.videos.linkCopied', 'Link copiado!');
        btn.classList.add('is-copied');
        window.setTimeout(function () {
          label.textContent = original;
          btn.classList.remove('is-copied');
        }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done).catch(function () {
          try {
            if (window.prompt) window.prompt(original + ':', url);
          } catch (e) { /* ignore */ }
          done();
        });
        return;
      }
      try {
        if (window.prompt) window.prompt(original + ':', url);
      } catch (e) { /* ignore */ }
      done();
    });
  }

  function bindPlayVideoButton(root) {
    if (!root) return;
    var btn = root.querySelector('[data-play-video]');
    if (!btn || btn.dataset.bound === '1') return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', function () {
      var facade = root.querySelector('.yt-facade[data-youtube-id]');
      if (!facade) return;
      if (window.BudGanjaYoutubeFacade && typeof window.BudGanjaYoutubeFacade.load === 'function') {
        window.BudGanjaYoutubeFacade.load(facade, true);
      } else {
        facade.click();
      }
      btn.hidden = true;
    });
  }

  function bindShareVideoButton(root, title) {
    if (!root) return;
    var btn = root.querySelector('[data-share-video]');
    if (!btn || btn.dataset.bound === '1') return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-share-video') || '';
      if (!isValidVideoId(id)) return;
      // Link do YouTube → preview/player no WhatsApp e noutras apps.
      var url = youtubeWatchUrl(id);
      var shareTitle = title || i18n('pages.videos.nowPlaying', 'Vídeo do YouTube');
      var label = btn.querySelector('[data-share-label]') || btn;
      var original = i18n('common.share', 'Compartilhar');
      var markCopied = function () {
        label.textContent = i18n('common.shareCopied', 'Link copiado!');
        btn.classList.add('is-copied');
        window.setTimeout(function () {
          label.textContent = original;
          btn.classList.remove('is-copied');
        }, 1800);
      };
      var copyFallback = function () {
        var text = youtubeShareMessage(shareTitle, id);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(markCopied).catch(function () {
            try {
              if (window.prompt) window.prompt(original + ':', text);
            } catch (e) { /* ignore */ }
            markCopied();
          });
          return;
        }
        try {
          if (window.prompt) window.prompt(original + ':', text);
        } catch (e) { /* ignore */ }
        markCopied();
      };
      if (typeof navigator.share === 'function') {
        navigator
          .share({ title: shareTitle, text: shareTitle, url: url })
          .catch(function () {
            copyFallback();
          });
        return;
      }
      copyFallback();
    });
  }

  function bindWhatsAppVideoButton(root, title) {
    if (!root) return;
    var btn = root.querySelector('[data-share-video-wa]');
    if (!btn || btn.dataset.bound === '1') return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-share-video-wa') || '';
      if (!isValidVideoId(id)) return;
      var shareTitle = title || i18n('pages.videos.nowPlaying', 'Vídeo do YouTube');
      openWhatsAppShare(youtubeShareMessage(shareTitle, id));
    });
  }

  /** Tenta abrir a app YouTube (melhor para áudio com ecrã desligado). */
  function openYouTubeAppOrWeb(id) {
    if (!isValidVideoId(id)) return;
    var web = youtubeWatchUrl(id);
    var ua = navigator.userAgent || '';
    if (/Android/i.test(ua)) {
      window.location.href =
        'intent://www.youtube.com/watch?v=' +
        encodeURIComponent(id) +
        '#Intent;package=com.google.android.youtube;scheme=https;S.browser_fallback_url=' +
        encodeURIComponent(web) +
        ';end';
      return;
    }
    if (/iPhone|iPad|iPod/i.test(ua)) {
      var started = Date.now();
      window.location.href = 'youtube://www.youtube.com/watch?v=' + encodeURIComponent(id);
      window.setTimeout(function () {
        if (Date.now() - started < 1600 && !document.hidden) {
          window.open(web, '_blank', 'noopener,noreferrer');
        }
      }, 750);
      return;
    }
    window.open(web, '_blank', 'noopener,noreferrer');
  }

  function bindContinueYouTubeButton(root) {
    if (!root) return;
    var btn = root.querySelector('[data-continue-youtube]');
    if (!btn || btn.dataset.bound === '1') return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', function (ev) {
      var id = btn.getAttribute('data-continue-youtube') || '';
      if (!isValidVideoId(id)) return;
      ev.preventDefault();
      openYouTubeAppOrWeb(id);
    });
  }

  function renderEmbed(id, title, autoplay) {
    var safeTitle = escapeHtml(title || i18n('pages.videos.nowPlaying', 'Vídeo do YouTube'));
    if (autoplay) {
      return (
        '<div class="video-embed is-playing">' +
        '<iframe src="' +
        escapeHtml(embedSrc(id, true)) +
        '" title="' +
        safeTitle +
        '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ' +
        'referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>' +
        '</div>'
      );
    }
    var facade =
      window.BudGanjaYoutubeFacade && typeof window.BudGanjaYoutubeFacade.html === 'function'
        ? window.BudGanjaYoutubeFacade.html(id, title || i18n('pages.videos.nowPlaying', 'Vídeo do YouTube'))
        : '';
    if (facade) {
      return '<div class="video-embed">' + facade + '</div>';
    }
    return (
      '<div class="video-embed">' +
      '<iframe src="' +
      escapeHtml(embedSrc(id, false)) +
      '" title="' +
      safeTitle +
      '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ' +
      'referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>' +
      '</div>'
    );
  }

  function findVideo(videos, id) {
    for (var i = 0; i < videos.length; i++) {
      if (videos[i].id === id) return videos[i];
    }
    return null;
  }

  function findChannelMeta(id) {
    var channels = (cachedHub && cachedHub.channels) || [];
    for (var i = 0; i < channels.length; i++) {
      if (channels[i].id === id) return channels[i];
    }
    return null;
  }

  function filterVideos(videos, channel, series, topic, query) {
    var list = videos || [];
    if (channel && channel !== 'all') {
      list = list.filter(function (v) {
        return v.channel === channel;
      });
    }
    if (series) {
      list = list.filter(function (v) {
        return (v.series || []).indexOf(series) >= 0;
      });
    }
    if (topic) {
      list = list.filter(function (v) {
        return (v.topics || []).indexOf(topic) >= 0;
      });
    }
    var tokens = tokenizeQuery(query != null ? query : activeQuery);
    if (tokens.length) {
      list = list.filter(function (v) {
        return videoMatchesQuery(v, tokens);
      });
    }
    return list;
  }

  function aulaNumber(title) {
    var m = String(title || '').match(/(\d+)\s*ª?\s*Aula|Aula\s+(\d+)/i);
    if (!m) return 999;
    return Number(m[1] || m[2] || 999);
  }

  function sortChannelVideos(list, channelId) {
    if (channelId === 'movrecam') {
      return list.slice().sort(function (a, b) {
        var na = aulaNumber(a.title);
        var nb = aulaNumber(b.title);
        var aXiv = (a.series || []).indexOf('xiv') >= 0;
        var bXiv = (b.series || []).indexOf('xiv') >= 0;
        if (aXiv !== bXiv) return aXiv ? -1 : 1;
        if (aXiv && bXiv && na !== nb) return na - nb;
        var da = a.published ? new Date(a.published).getTime() : 0;
        var db = b.published ? new Date(b.published).getTime() : 0;
        if (db !== da) return db - da;
        return String(a.title || '').localeCompare(String(b.title || ''), 'pt-BR');
      });
    }
    if (channelId === 'inspetor') return list.slice();
    return list.slice().sort(function (a, b) {
      var da = a.published ? new Date(a.published).getTime() : 0;
      var db = b.published ? new Date(b.published).getTime() : 0;
      if (db !== da) return db - da;
      return String(a.title || '').localeCompare(String(b.title || ''), 'pt-BR');
    });
  }

  function sortForView(list, channel, series) {
    if (channel === 'all') {
      var grouped = [];
      for (var i = 0; i < CHANNEL_ORDER.length; i++) {
        var id = CHANNEL_ORDER[i];
        var chunk = list.filter(function (v) {
          return v.channel === id;
        });
        grouped = grouped.concat(sortChannelVideos(chunk, id));
      }
      var rest = list.filter(function (v) {
        return CHANNEL_ORDER.indexOf(v.channel) < 0;
      });
      return grouped.concat(sortChannelVideos(rest, ''));
    }
    if (channel === 'movrecam' && series === 'xiv') {
      return list.slice().sort(function (a, b) {
        var na = aulaNumber(a.title);
        var nb = aulaNumber(b.title);
        if (na !== nb) return na - nb;
        return String(a.published || '').localeCompare(String(b.published || ''));
      });
    }
    return sortChannelVideos(list, channel);
  }

  function channelLabel(id) {
    if (id === 'all') return i18n('pages.videos.filterAll', 'Todos');
    var meta = findChannelMeta(id);
    if (meta && meta.label) return meta.label;
    if (id === 'inspetor') return 'Inspetor BudGanja';
    if (id === 'movrecam') return 'MovReCam';
    if (id === 'canabinall') return 'CANABinALL';
    if (id === 'lair') return 'Dr. Lair Ribeiro';
    if (id === 'davis') return 'William Davis, MD';
    if (id === 'disneyjr') return 'Disney Jr. Brasil';
    if (id === 'zangado') return 'Zangado';
    if (id === 'paulinho') return 'Paulinho o LOKO';
    return id;
  }

  function seriesLabel(id) {
    if (id === 'xiv') return i18n('pages.videos.seriesXiv', 'XIV edição');
    if (id === 'conceitos') return i18n('pages.videos.seriesBasics', 'Conceitos básicos');
    if (id === 'plantas-sagradas') return i18n('pages.videos.seriesSacred', 'Plantas Sagradas');
    var opts = (cachedHub && cachedHub.seriesOptions) || [];
    var i;
    if (activeChannel && activeChannel !== 'all') {
      for (i = 0; i < opts.length; i++) {
        if (opts[i].id === id && opts[i].channel === activeChannel) return opts[i].label;
      }
    }
    for (i = 0; i < opts.length; i++) {
      if (opts[i].id === id) return opts[i].label;
    }
    return id;
  }

  function topicLabel(id) {
    if (id === 'cultivo') return i18n('pages.videos.topicCultivo', 'Cultivo');
    if (id === 'unifesp') return i18n('pages.videos.topicUnifesp', 'Aulas UNIFESP');
    if (id === 'saude') return i18n('pages.videos.topicSaude', 'Saúde e usos');
    if (id === 'plantas') return i18n('pages.videos.topicPlantas', 'Plantas');
    if (id === 'ciencia') return i18n('pages.videos.topicCiencia', 'Ciência');
    if (id === 'desenhos') return i18n('pages.videos.topicDesenhos', 'Desenhos');
    var opts = (cachedHub && cachedHub.topicOptions) || [];
    for (var i = 0; i < opts.length; i++) {
      if (opts[i].id === id) return opts[i].label;
    }
    return id;
  }

  function syncActiveCards() {
    if (!gridEl) return;
    var cards = gridEl.querySelectorAll('.video-card');
    for (var i = 0; i < cards.length; i++) {
      var active = cards[i].getAttribute('data-video-id') === selectedId;
      cards[i].classList.toggle('is-active', active);
      var btn = cards[i].querySelector('.video-card-link');
      if (btn) btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    }
  }

  function stopInlinePlayer(opts) {
    opts = opts || {};
    playingId = '';
    if (opts.clearHash !== false) {
      writeFilterToUrl(activeChannel, activeSeries, '', opts.replaceUrl !== false);
    }
    if (lastFiltered && lastFiltered.length) {
      renderGrid(lastFiltered);
      bindPlayingCardActions();
    }
    syncActiveCards();
  }

  function bindPlayingCardActions() {
    if (!gridEl || !playingId || !cachedHub) return;
    var card = gridEl.querySelector('.video-card.is-playing[data-video-id="' + playingId + '"]');
    if (!card) return;
    var video = findVideo(cachedHub.videos || [], playingId);
    if (!video) return;
    var title = localizedField(video, 'title');
    bindContinueYouTubeButton(card);
    bindCopyVideoLinkButton(card);
    bindShareVideoButton(card, title);
    bindWhatsAppVideoButton(card);
    var stopBtn = card.querySelector('[data-stop-video]');
    if (stopBtn && stopBtn.dataset.bound !== '1') {
      stopBtn.dataset.bound = '1';
      stopBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        stopInlinePlayer({ clearHash: true, replaceUrl: true });
      });
    }
    if (card.scrollIntoView) {
      window.setTimeout(function () {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 40);
    }
  }

  function renderPlayingActions(video) {
    var watchUrl =
      video.url && String(video.url).indexOf('http') === 0
        ? String(video.url)
        : youtubeWatchUrl(video.id);
    return (
      '<div class="video-card-actions">' +
      '<button type="button" class="botao botao-outline botao-sm" data-stop-video aria-label="' +
      escapeHtml(i18n('pages.videos.closePlayer', 'Fechar vídeo')) +
      '">' +
      escapeHtml(i18n('pages.videos.closePlayer', 'Fechar vídeo')) +
      '</button>' +
      '<button type="button" class="botao botao-outline botao-sm videos-copy-link" data-copy-video-link="' +
      escapeHtml(video.id) +
      '"><span data-copy-label>' +
      escapeHtml(i18n('pages.videos.copyLink', 'Copiar link do site')) +
      '</span></button>' +
      '<button type="button" class="botao botao-outline botao-sm videos-share-btn" data-share-video="' +
      escapeHtml(video.id) +
      '" aria-label="' +
      escapeHtml(i18n('pages.videos.shareAria', 'Compartilhar link do YouTube')) +
      '"><span data-share-label>' +
      escapeHtml(i18n('common.share', 'Compartilhar')) +
      '</span></button>' +
      '<button type="button" class="botao botao-outline botao-sm videos-share-wa" data-share-video-wa="' +
      escapeHtml(video.id) +
      '">' +
      escapeHtml(i18n('pages.videos.shareWhatsApp', 'WhatsApp')) +
      '</button>' +
      '<a class="botao botao-outline botao-sm videos-continue-yt" href="' +
      escapeHtml(watchUrl) +
      '" data-continue-youtube="' +
      escapeHtml(video.id) +
      '" target="_blank" rel="noopener noreferrer">' +
      escapeHtml(i18n('pages.videos.continueOnYoutube', 'Continuar no YouTube')) +
      '</a>' +
      '</div>'
    );
  }

  function seriesChipsForChannel(channel) {
    var opts = (cachedHub && cachedHub.seriesOptions) || [];
    return opts.filter(function (o) {
      return o.channel === channel;
    });
  }

  function orderedChannels() {
    var byId = {};
    var list = (cachedHub && cachedHub.channels) || [];
    for (var i = 0; i < list.length; i++) byId[list[i].id] = list[i];
    var ordered = [];
    for (var j = 0; j < CHANNEL_ORDER.length; j++) {
      if (byId[CHANNEL_ORDER[j]]) ordered.push(byId[CHANNEL_ORDER[j]]);
    }
    for (var k = 0; k < list.length; k++) {
      if (CHANNEL_ORDER.indexOf(list[k].id) < 0) ordered.push(list[k]);
    }
    return ordered;
  }

  function topicChipsWithCounts() {
    var opts = (cachedHub && cachedHub.topicOptions) || [];
    if (!opts.length) {
      opts = TOPIC_ORDER.map(function (id) {
        return { id: id, label: topicLabel(id) };
      });
    }
    var base = filterVideos(cachedHub.videos || [], activeChannel, activeSeries, '', '');
    var chips = [];
    for (var i = 0; i < opts.length; i++) {
      var id = opts[i].id;
      var count = 0;
      for (var j = 0; j < base.length; j++) {
        if ((base[j].topics || []).indexOf(id) >= 0) count++;
      }
      if (count > 0) {
        chips.push({ id: id, label: topicLabel(id), count: count });
      }
    }
    return chips;
  }

  function renderFilters() {
    if (!filtersEl || !cachedHub) return;
    var channels = [{ id: 'all', label: i18n('pages.videos.filterAll', 'Todos'), count: (cachedHub.videos || []).length }]
      .concat(orderedChannels());
    // Com canal selecionado, só "Todos" + o ativo — as outras categorias ficam ocultas.
    if (activeChannel && activeChannel !== 'all') {
      channels = channels.filter(function (ch) {
        return ch.id === 'all' || ch.id === activeChannel;
      });
    }

    var seriesOpts = seriesChipsForChannel(activeChannel);
    if (activeSeries) {
      seriesOpts = seriesOpts.filter(function (opt) {
        return opt.id === activeSeries;
      });
    }

    var topicOpts = topicChipsWithCounts();
    if (activeTopic) {
      topicOpts = topicOpts.filter(function (opt) {
        return opt.id === activeTopic;
      });
    }

    filtersEl.innerHTML =
      '<div class="videos-filters" role="toolbar" aria-label="' +
      escapeHtml(i18n('pages.videos.filtersLabel', 'Filtrar por canal')) +
      '">' +
      channels
        .map(function (ch) {
          var pressed = activeChannel === ch.id;
          return (
            '<button type="button" class="videos-filter-chip' +
            (pressed ? ' is-active' : '') +
            '" data-channel="' +
            escapeHtml(ch.id) +
            '" aria-pressed="' +
            (pressed ? 'true' : 'false') +
            '">' +
            escapeHtml(ch.label || channelLabel(ch.id)) +
            (typeof ch.count === 'number' ? ' <span class="videos-filter-count">' + ch.count + '</span>' : '') +
            '</button>'
          );
        })
        .join('') +
      '</div>' +
      (seriesOpts.length || activeSeries
        ? '<div class="videos-series-filters" role="toolbar" aria-label="' +
          escapeHtml(i18n('pages.videos.seriesLabel', 'Filtrar por série')) +
          '">' +
          '<button type="button" class="videos-filter-chip videos-filter-chip--series' +
          (!activeSeries ? ' is-active' : '') +
          '" data-series="" aria-pressed="' +
          (!activeSeries ? 'true' : 'false') +
          '">' +
          escapeHtml(i18n('pages.videos.seriesAll', 'Todas as séries')) +
          '</button>' +
          seriesOpts
            .map(function (opt) {
              var pressed = activeSeries === opt.id;
              return (
                '<button type="button" class="videos-filter-chip videos-filter-chip--series' +
                (pressed ? ' is-active' : '') +
                '" data-series="' +
                escapeHtml(opt.id) +
                '" aria-pressed="' +
                (pressed ? 'true' : 'false') +
                '">' +
                escapeHtml(seriesLabel(opt.id)) +
                '</button>'
              );
            })
            .join('') +
          '</div>'
        : '') +
      (topicOpts.length || activeTopic
        ? '<div class="videos-topic-filters" role="toolbar" aria-label="' +
          escapeHtml(i18n('pages.videos.topicsLabel', 'Filtrar por tema')) +
          '">' +
          '<button type="button" class="videos-filter-chip videos-filter-chip--topic' +
          (!activeTopic ? ' is-active' : '') +
          '" data-topic="" aria-pressed="' +
          (!activeTopic ? 'true' : 'false') +
          '">' +
          escapeHtml(i18n('pages.videos.topicAll', 'Todos os temas')) +
          '</button>' +
          topicOpts
            .map(function (opt) {
              var pressed = activeTopic === opt.id;
              return (
                '<button type="button" class="videos-filter-chip videos-filter-chip--topic' +
                (pressed ? ' is-active' : '') +
                '" data-topic="' +
                escapeHtml(opt.id) +
                '" aria-pressed="' +
                (pressed ? 'true' : 'false') +
                '">' +
                escapeHtml(opt.label) +
                ' <span class="videos-filter-count">' +
                opt.count +
                '</span></button>'
              );
            })
            .join('') +
          '</div>'
        : '');
  }

  function renderVideoCard(v) {
    var title = localizedField(v, 'title');
    var summary = localizedField(v, 'summary');
    var thumb = videoThumb(v);
    var playing = v.id === playingId;
    var active = playing || v.id === selectedId;
    if (playing) {
      return (
        '<article class="video-card card is-playing is-active" data-video-id="' +
        escapeHtml(v.id) +
        '" data-channel="' +
        escapeHtml(v.channel || '') +
        '">' +
        renderEmbed(v.id, title, true) +
        '<div class="video-card-body">' +
        '<p class="videos-player-channel">' +
        escapeHtml(channelLabel(v.channel)) +
        '</p>' +
        '<h2 class="video-card-title videos-player-title">' +
        escapeHtml(title) +
        '</h2>' +
        (summary ? '<p class="video-card-summary">' + escapeHtml(summary) + '</p>' : '') +
        '<span class="video-card-date">' +
        escapeHtml(formatDate(v.published)) +
        '</span>' +
        '</div>' +
        renderPlayingActions(v) +
        '</article>'
      );
    }
    return (
      '<article class="video-card card' +
      (active ? ' is-active' : '') +
      '" data-video-id="' +
      escapeHtml(v.id) +
      '" data-channel="' +
      escapeHtml(v.channel || '') +
      '">' +
      '<button type="button" class="video-card-link" aria-pressed="' +
      (active ? 'true' : 'false') +
      '" aria-label="' +
      escapeHtml(i18n('pages.videos.watchHere', 'Assistir') + ': ' + title) +
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
      (summary ? '<span class="video-card-summary">' + escapeHtml(summary) + '</span>' : '') +
      '<span class="video-card-date">' +
      escapeHtml(formatDate(v.published)) +
      '</span>' +
      '</span>' +
      '</button>' +
      '</article>'
    );
  }

  function renderChannelSection(channelId, videos, totalCount) {
    if (!videos.length) return '';
    var meta = findChannelMeta(channelId);
    var label = channelLabel(channelId);
    var count = totalCount != null ? totalCount : videos.length;
    var inspect =
      meta && meta.inspectionUrl
        ? ' <a class="videos-channel-inspect" href="' +
          escapeHtml(meta.inspectionUrl) +
          '">' +
          escapeHtml(i18n('pages.videos.viewInspection', 'Ver inspeção')) +
          '</a>'
        : '';
    return (
      '<section class="videos-channel-section" data-channel-section="' +
      escapeHtml(channelId) +
      '">' +
      '<header class="videos-channel-section-head">' +
      '<h2 class="videos-list-heading">' +
      escapeHtml(label) +
      ' <span class="videos-list-count">(' +
      count +
      ')</span></h2>' +
      inspect +
      '</header>' +
      '<div class="videos-grid">' +
      videos.map(renderVideoCard).join('') +
      '</div>' +
      '</section>'
    );
  }

  function perChannelTake(count) {
    var pages = Math.max(1, Math.ceil(count / PAGE_SIZE));
    var per = Math.max(1, Math.ceil(PAGE_SIZE / CHANNEL_ORDER.length));
    return pages * per;
  }

  function channelBuckets(videos) {
    var buckets = {};
    var i;
    for (i = 0; i < CHANNEL_ORDER.length; i++) buckets[CHANNEL_ORDER[i]] = [];
    var other = [];
    for (i = 0; i < videos.length; i++) {
      var v = videos[i];
      var ch = v && v.channel;
      if (ch && buckets[ch]) buckets[ch].push(v);
      else other.push(v);
    }
    return { buckets: buckets, other: other };
  }

  function hasMoreVideos(videos) {
    if (!videos.length) return false;
    if (activeChannel !== 'all') return visibleCount < videos.length;
    var take = perChannelTake(visibleCount);
    var parts = channelBuckets(videos);
    var i;
    for (i = 0; i < CHANNEL_ORDER.length; i++) {
      if (parts.buckets[CHANNEL_ORDER[i]].length > take) return true;
    }
    return parts.other.length > take;
  }

  function syncLoadMoreButton(videos) {
    if (!loadMoreBtn) return;
    var list = videos || lastFiltered || [];
    var hasMore = hasMoreVideos(list);
    loadMoreBtn.hidden = !hasMore;
    loadMoreBtn.disabled = false;
    loadMoreBtn.textContent = i18n('pages.videos.loadMore', 'Carregar mais');
  }

  function ensureVisibleIncludesId(videos, id) {
    if (!id || !videos.length) return;
    var idx = -1;
    var i;
    for (i = 0; i < videos.length; i++) {
      if (videos[i] && videos[i].id === id) {
        idx = i;
        break;
      }
    }
    if (idx < 0) return;

    if (activeChannel !== 'all') {
      var need = Math.ceil((idx + 1) / PAGE_SIZE) * PAGE_SIZE;
      visibleCount = Math.min(videos.length, Math.max(visibleCount, need));
      return;
    }

    var video = videos[idx];
    var ch = video.channel || '';
    var parts = channelBuckets(videos);
    var bucket = parts.buckets[ch] || parts.other;
    var pos = -1;
    for (i = 0; i < bucket.length; i++) {
      if (bucket[i].id === id) {
        pos = i;
        break;
      }
    }
    if (pos < 0) return;
    var per = Math.max(1, Math.ceil(PAGE_SIZE / CHANNEL_ORDER.length));
    var pagesNeeded = Math.ceil((pos + 1) / per);
    visibleCount = Math.max(visibleCount, pagesNeeded * PAGE_SIZE);
  }

  function renderGrid(videos) {
    if (!gridEl) return;
    if (!videos.length) {
      visibleCount = 0;
      var emptyMsg = activeQuery
        ? i18n('pages.videos.emptySearch', 'Nenhum vídeo com essas palavras.')
        : i18n('pages.videos.emptyFilter', 'Nenhum vídeo neste filtro.');
      gridEl.innerHTML =
        '<div class="empty-state">' +
        '<p class="empty-message">' +
        escapeHtml(emptyMsg) +
        '</p>' +
        '</div>';
      syncLoadMoreButton([]);
      return;
    }

    if (visibleCount < 1) visibleCount = Math.min(PAGE_SIZE, videos.length);

    if (activeChannel === 'all') {
      var take = perChannelTake(visibleCount);
      var parts = channelBuckets(videos);
      var html = '';
      var c;
      for (c = 0; c < CHANNEL_ORDER.length; c++) {
        var id = CHANNEL_ORDER[c];
        var totalChunk = parts.buckets[id];
        html += renderChannelSection(id, totalChunk.slice(0, take), totalChunk.length);
      }
      if (parts.other.length) {
        html += renderChannelSection(
          'other',
          parts.other.slice(0, take),
          parts.other.length
        );
      }
      gridEl.innerHTML = html;
      syncLoadMoreButton(videos);
      return;
    }

    visibleCount = Math.min(visibleCount, videos.length);
    var slice = videos.slice(0, visibleCount);
    var heading = channelLabel(activeChannel);
    if (activeSeries) heading += ' · ' + seriesLabel(activeSeries);
    if (activeTopic) heading += ' · ' + topicLabel(activeTopic);

    gridEl.innerHTML =
      '<p class="videos-list-heading">' +
      escapeHtml(heading) +
      ' <span class="videos-list-count">(' +
      videos.length +
      ')</span></p>' +
      '<div class="videos-grid">' +
      slice.map(renderVideoCard).join('') +
      '</div>';
    syncLoadMoreButton(videos);
  }

  function loadMoreVideos() {
    if (!lastFiltered.length) return;
    if (!hasMoreVideos(lastFiltered)) {
      syncLoadMoreButton(lastFiltered);
      return;
    }
    if (loadMoreBtn) loadMoreBtn.disabled = true;
    visibleCount += PAGE_SIZE;
    renderGrid(lastFiltered);
    bindPlayingCardActions();
    syncActiveCards();
  }

  function injectVideoJsonLd(videos) {
    var existing = document.getElementById('jsonld-videos');
    if (existing) existing.remove();
    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'jsonld-videos';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: videos.slice(0, 8).map(function (v, i) {
        return {
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'VideoObject',
            name: v.title,
            description: v.summary || '',
            thumbnailUrl: videoThumb(v),
            uploadDate: v.published,
            url:
              'https://inspetorbudganja.com.br' +
              (isJogosPage ? '/jogos/' : '/videos/') +
              '#' +
              v.id,
            embedUrl: 'https://www.youtube.com/embed/' + v.id,
            contentUrl: v.url
          }
        };
      })
    });
    document.head.appendChild(script);
  }

  function applyView(opts) {
    opts = opts || {};
    if (!cachedHub || !gridEl) return;

    var all = cachedHub.videos || [];
    var requested = opts.requestedId || readRequestedId();
    var filtered = sortForView(
      filterVideos(all, activeChannel, activeSeries, activeTopic),
      activeChannel,
      activeSeries
    );

    if (requested) {
      var inView = findVideo(filtered, requested);
      if (!inView) {
        var anywhere = findVideo(all, requested);
        if (anywhere) {
          if (activeChannel !== 'all') {
            activeChannel = anywhere.channel || 'all';
            activeSeries = '';
          }
          if (activeTopic && (anywhere.topics || []).indexOf(activeTopic) < 0) {
            activeTopic = '';
          }
          filtered = sortForView(
            filterVideos(all, activeChannel, activeSeries, activeTopic),
            activeChannel,
            activeSeries
          );
        }
      }
    }

    renderFilters();
    lastFiltered = filtered;
    visibleCount = Math.min(PAGE_SIZE, filtered.length);

    if (!filtered.length) {
      selectedId = '';
      playingId = '';
      renderGrid([]);
      writeFilterToUrl(activeChannel, activeSeries, '', opts.replaceUrl !== false);
      return;
    }

    if (opts.openPlayer || opts.autoplay) {
      var openTarget = requested
        ? findVideo(filtered, requested) || findVideo(all, requested)
        : null;
      if (openTarget) {
        playingId = openTarget.id;
        selectedId = openTarget.id;
      }
    } else if (playingId && !findVideo(filtered, playingId)) {
      playingId = '';
    }

    if (selectedId && !findVideo(filtered, selectedId) && selectedId !== playingId) {
      selectedId = '';
    }

    ensureVisibleIncludesId(filtered, playingId || selectedId || requested || '');
    renderGrid(filtered);
    injectVideoJsonLd(filtered);
    bindPlayingCardActions();
    syncActiveCards();
    writeFilterToUrl(
      activeChannel,
      activeSeries,
      playingId || '',
      opts.replaceUrl !== false
    );
  }

  function selectById(id) {
    if (!cachedHub) return;
    gridEl = document.getElementById('videos-list') || gridEl;
    if (!gridEl) return;

    var all = cachedHub.videos || [];
    var video =
      findVideo(filterVideos(all, activeChannel, activeSeries, activeTopic), id) ||
      findVideo(all, id);
    if (!video) return;

    if (video.channel && video.channel !== activeChannel && activeChannel !== 'all') {
      activeChannel = video.channel;
      activeSeries = '';
    }

    applyView({
      requestedId: id,
      openPlayer: true,
      autoplay: true,
      replaceUrl: false
    });
  }

  function setChannel(channel, series) {
    activeChannel = channel || 'all';
    activeSeries = series || '';
    if (activeChannel === 'all') activeSeries = '';
    var seriesOpts = seriesChipsForChannel(activeChannel);
    var validSeries = false;
    for (var i = 0; i < seriesOpts.length; i++) {
      if (seriesOpts[i].id === activeSeries) validSeries = true;
    }
    if (!validSeries) activeSeries = '';
    if (activeTopic) {
      var topicOpts = topicChipsWithCounts();
      var validTopic = false;
      for (var t = 0; t < topicOpts.length; t++) {
        if (topicOpts[t].id === activeTopic) validTopic = true;
      }
      if (!validTopic) activeTopic = '';
    }
    applyView({ replaceUrl: false, autoplay: false });
  }

  function setTopic(topic) {
    activeTopic = resolveTopic(topic) || '';
    applyView({ replaceUrl: false, autoplay: false });
  }

  function setSearchQuery(raw, opts) {
    opts = opts || {};
    var next = String(raw || '').trim();
    if (next === activeQuery && !opts.force) return;
    activeQuery = next;
    if (searchEl && searchEl.value.trim() !== activeQuery) {
      searchEl.value = activeQuery;
    }
    applyView({
      replaceUrl: opts.replaceUrl !== false,
      requestedId: opts.keepSelection
        ? playingId || selectedId || readRequestedId()
        : undefined,
      openPlayer: !!(opts.keepSelection && playingId),
      autoplay: !!(opts.keepSelection && playingId)
    });
  }

  function scopeHubForPage(hub) {
    if (!hub || !isJogosPage) return hub;
    var allowed = {};
    for (var i = 0; i < CHANNEL_ORDER.length; i++) allowed[CHANNEL_ORDER[i]] = true;
    var videos = (hub.videos || []).filter(function (v) {
      return allowed[v.channel];
    });
    var channels = (hub.channels || []).filter(function (ch) {
      return allowed[ch.id];
    });
    var seriesOptions = (hub.seriesOptions || []).filter(function (s) {
      return allowed[s.channel];
    });
    // Games page mirrors Videos UX; topic chips are for lab channels, not game catalogs.
    return {
      channels: channels,
      videos: videos,
      seriesOptions: seriesOptions,
      topicOptions: []
    };
  }

  function renderHub(grid, hub) {
    cachedHub = scopeHubForPage(hub);
    gridEl = grid;
    filtersEl = document.getElementById('videos-filters');
    searchEl = document.getElementById('videos-search') || searchEl;

    var fromUrl = readFilterFromUrl();
    activeChannel = fromUrl.channel || 'all';
    if (activeChannel !== 'all' && CHANNEL_ORDER.indexOf(activeChannel) < 0) {
      activeChannel = 'all';
    }
    activeSeries = fromUrl.series || '';
    activeTopic = isJogosPage ? '' : fromUrl.topic || '';
    activeQuery = fromUrl.q || activeQuery || '';
    if (searchEl) searchEl.value = activeQuery;

    hub = cachedHub;
    if (!(hub && hub.videos && hub.videos.length)) {
      playingId = '';
      selectedId = '';
      lastFiltered = [];
      visibleCount = 0;
      if (filtersEl) filtersEl.innerHTML = '';
      grid.innerHTML =
        '<div class="empty-state">' +
        '<p class="empty-message">' +
        escapeHtml(
          i18n(
            isJogosPage ? 'pages.games.emptyVideos' : 'pages.videos.empty',
            isJogosPage ? 'Nenhum vídeo disponível.' : 'Nenhum vídeo disponível.'
          )
        ) +
        '</p>' +
        '</div>';
      syncLoadMoreButton([]);
      return;
    }

    var deepLink = readRequestedId();
    applyView({
      replaceUrl: true,
      requestedId: deepLink,
      openPlayer: !!deepLink,
      autoplay: !!deepLink
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var grid = document.getElementById('videos-list');
    filtersEl = document.getElementById('videos-filters');
    searchEl = document.getElementById('videos-search');
    loadMoreBtn = document.getElementById('videos-load-more');
    if (!grid) return;

    gridEl = grid;

    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', function () {
        loadMoreVideos();
      });
    }

    grid.addEventListener('click', function (e) {
      if (e.target.closest('.video-card-actions, .video-embed, a, [data-stop-video]')) return;
      var btn = e.target.closest('.video-card-link');
      if (!btn || !grid.contains(btn)) return;
      e.preventDefault();
      var card = btn.closest('.video-card');
      if (!card) return;
      var id = card.getAttribute('data-video-id');
      if (!id) return;
      selectById(id);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && playingId) {
        e.preventDefault();
        stopInlinePlayer({ clearHash: true, replaceUrl: true });
      }
    });

    if (filtersEl) {
      filtersEl.addEventListener('click', function (e) {
        var chip = e.target.closest('[data-channel], [data-series], [data-topic]');
        if (!chip || !filtersEl.contains(chip)) return;
        if (chip.hasAttribute('data-channel')) {
          var nextCh = chip.getAttribute('data-channel') || 'all';
          // Clicar de novo no canal ativo limpa o filtro e volta a mostrar todos.
          if (nextCh !== 'all' && nextCh === activeChannel) setChannel('all', '');
          else setChannel(nextCh, '');
        } else if (chip.hasAttribute('data-series')) {
          var nextSeries = chip.getAttribute('data-series') || '';
          if (nextSeries && nextSeries === activeSeries) setChannel(activeChannel, '');
          else setChannel(activeChannel, nextSeries);
        } else if (chip.hasAttribute('data-topic')) {
          var nextTopic = chip.getAttribute('data-topic') || '';
          if (nextTopic && nextTopic === activeTopic) setTopic('');
          else setTopic(nextTopic);
        }
      });
    }

    if (searchEl) {
      searchEl.addEventListener('input', function () {
        var value = searchEl.value;
        if (searchTimer) window.clearTimeout(searchTimer);
        searchTimer = window.setTimeout(function () {
          searchTimer = null;
          setSearchQuery(value, { replaceUrl: true, keepSelection: true });
        }, 180);
      });
      searchEl.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          if (playingId) {
            stopInlinePlayer({ clearHash: true, replaceUrl: true });
            return;
          }
          searchEl.value = '';
          if (searchTimer) window.clearTimeout(searchTimer);
          searchTimer = null;
          setSearchQuery('', { replaceUrl: true, keepSelection: true });
        }
      });
    }

    function onNavChange() {
      var next = readFilterFromUrl();
      var id = readRequestedId();
      var qChanged = (next.q || '') !== activeQuery;
      var topicChanged = (next.topic || '') !== activeTopic;
      if (
        next.channel !== activeChannel ||
        next.series !== activeSeries ||
        topicChanged ||
        qChanged
      ) {
        activeChannel = next.channel;
        activeSeries = next.series;
        activeTopic = next.topic || '';
        activeQuery = next.q || '';
        if (searchEl) searchEl.value = activeQuery;
        applyView({
          requestedId: id,
          replaceUrl: true,
          openPlayer: !!id,
          autoplay: !!id
        });
        return;
      }
      if (id && id !== playingId) selectById(id);
      if (!id && playingId) stopInlinePlayer({ clearHash: false, replaceUrl: true });
    }

    window.addEventListener('hashchange', onNavChange);
    window.addEventListener('popstate', onNavChange);

    function load() {
      fetch('/api/videos-hub')
        .then(function (r) {
          return r.ok ? r.json() : Promise.reject(new Error('api'));
        })
        .catch(function () {
          return fetch('/content/videos-hub.json').then(function (r) {
            return r.ok ? r.json() : null;
          });
        })
        .catch(function () {
          return fetch('/api/youtube-feed')
            .then(function (r) {
              return r.ok ? r.json() : Promise.reject(new Error('feed'));
            })
            .then(function (feed) {
              return {
                channels: [
                  {
                    id: 'inspetor',
                    label: (feed && feed.channelName) || 'Inspetor BudGanja',
                    channelUrl: (feed && feed.channelUrl) || 'https://www.youtube.com/@InspetorBudGanja',
                    inspectionUrl: null,
                    count: ((feed && feed.videos) || []).length
                  }
                ],
                videos: ((feed && feed.videos) || []).map(function (v) {
                  return {
                    id: v.id,
                    title: v.title,
                    titleEn: v.titleEn,
                    titleEs: v.titleEs,
                    summary: v.summary,
                    summaryEn: v.summaryEn,
                    summaryEs: v.summaryEs,
                    published: v.published,
                    url: v.url,
                    thumb: v.thumb,
                    channel: 'inspetor',
                    series: [],
                    topics: ['cultivo']
                  };
                }),
                seriesOptions: [],
                topicOptions: [
                  { id: 'cultivo', label: 'Cultivo' },
                  { id: 'unifesp', label: 'Aulas UNIFESP' },
                  { id: 'saude', label: 'Saúde e usos' },
                  { id: 'plantas', label: 'Plantas' },
                  { id: 'ciencia', label: 'Ciência' }
                ]
              };
            });
        })
        .then(function (hub) {
          gridEl = document.getElementById('videos-list') || grid;
          filtersEl = document.getElementById('videos-filters') || filtersEl;
          renderHub(gridEl, hub);
        })
        .catch(function () {
          renderHub(grid, null);
        });
    }

    load();
    window.addEventListener('budganja:locale-change', function () {
      gridEl = document.getElementById('videos-list') || gridEl;
      filtersEl = document.getElementById('videos-filters') || filtersEl;
      if (cachedHub && gridEl) {
        applyView({
          replaceUrl: true,
          requestedId: playingId || '',
          openPlayer: !!playingId,
          autoplay: !!playingId
        });
      } else load();
    });
  });
})();
