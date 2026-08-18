'use strict';

// Versão usada para "cache-busting" dos assets estáticos (?v=...).
// Incrementar este número quando for preciso forçar navegadores e a
// Cloudflare a descartarem versões antigas de JS/CSS/Service Worker.
const ASSET_VERSION = '315';

module.exports = { ASSET_VERSION };
