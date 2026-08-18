'use strict';

const fs = require('fs');
const path = require('path');
const { readPostsFrom } = require('../lib/publish-static.js');
const { ROOT } = require('../lib/paths.js');
const OUT = path.join(ROOT, 'sitemap.xml');

const BASE = (process.env.SITE_URL || process.env.URL || 'https://inspetorbudganja.com.br').replace(/\/$/, '');

const { CALCULADORAS, getCalculadoraUrl } = require('../lib/calculadoras-registry.js');

const STATIC = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/index.html', priority: '1.0', changefreq: 'weekly' },
  { loc: '/guia/cultivo-basico.html', priority: '0.95', changefreq: 'monthly' },
  { loc: '/guia/palavras.html', priority: '0.9', changefreq: 'monthly' },
  { loc: '/videos/', priority: '0.9', changefreq: 'weekly' },
  { loc: '/jogos/', priority: '0.9', changefreq: 'weekly' },
  { loc: '/jogos/broto/', priority: '0.7', changefreq: 'monthly' },
  { loc: '/biblioteca/pesquisas/', priority: '0.9', changefreq: 'weekly' },
  { loc: '/biblioteca/inspecoes/', priority: '0.9', changefreq: 'weekly' },
  { loc: '/biblioteca/unifesp/', priority: '0.95', changefreq: 'monthly' },
  { loc: '/plantas/', priority: '0.95', changefreq: 'weekly' },
  { loc: '/animais/', priority: '0.95', changefreq: 'weekly' },
  { loc: '/vida/', priority: '0.9', changefreq: 'monthly' },
  { loc: '/vida/diario/', priority: '0.8', changefreq: 'monthly' },
  { loc: '/comunidade/', priority: '0.9', changefreq: 'daily' },
  { loc: '/radio/', priority: '0.8', changefreq: 'weekly' },
  { loc: '/equipamentos/', priority: '0.9', changefreq: 'monthly' },
  { loc: '/calculadoras/', priority: '0.8', changefreq: 'monthly' },
  ...CALCULADORAS.map((c) => ({
    loc: getCalculadoraUrl(c),
    priority: '0.7',
    changefreq: 'monthly'
  })),
  { loc: '/sorteios/', priority: '0.8', changefreq: 'weekly' },
  { loc: '/info/sobre.html', priority: '0.6', changefreq: 'monthly' },
  { loc: '/info/contato.html', priority: '0.5', changefreq: 'yearly' },
  { loc: '/info/privacidade.html', priority: '0.4', changefreq: 'yearly' },
  { loc: '/equipamentos/clonadora-6-estacas.html', priority: '0.75', changefreq: 'yearly' },
  { loc: '/equipamentos/clonadora-12-estacas.html', priority: '0.75', changefreq: 'yearly' },
  { loc: '/equipamentos/manual-clonadora.html', priority: '0.5', changefreq: 'yearly' },
  { loc: '/equipamentos/manual-hidrocloradora.html', priority: '0.5', changefreq: 'yearly' },
  { loc: '/biblioteca/pesquisas/substratos.html', priority: '0.7', changefreq: 'yearly' }
];

function buildSitemap() {
  const urls = STATIC.slice();
  const posts = readPostsFrom(ROOT).filter((p) => p.published !== false);
  posts.forEach((p) => {
    const file = p.url || p.filename;
    if (!file) return;
    urls.push({
      loc: '/' + String(file).replace(/^\//, ''),
      priority: '0.7',
      changefreq: 'monthly'
    });
  });

  try {
    const { readPlantas, getPlantUrl } = require('../lib/plantas-service.js');
    const catalog = readPlantas();
    catalog.plants.forEach((plant) => {
      urls.push({
        loc: getPlantUrl(plant),
        priority: '0.75',
        changefreq: 'monthly'
      });
    });
  } catch (e) { /* optional */ }

  try {
    const { readAnimais, getAnimalUrl } = require('../lib/animais-service.js');
    const catalog = readAnimais();
    catalog.animals.forEach((animal) => {
      urls.push({
        loc: getAnimalUrl(animal),
        priority: '0.75',
        changefreq: 'monthly'
      });
    });
  } catch (e) { /* optional */ }

  const body = urls.map((u) =>
    '  <url><loc>' + BASE + u.loc + '</loc><changefreq>' + u.changefreq + '</changefreq><priority>' + u.priority + '</priority></url>'
  ).join('\n');

  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + body + '\n</urlset>\n';
  fs.writeFileSync(OUT, xml, 'utf8');
  console.log('sitemap.xml gerado com base', BASE, '(' + urls.length + ' URLs)');
}

buildSitemap();
