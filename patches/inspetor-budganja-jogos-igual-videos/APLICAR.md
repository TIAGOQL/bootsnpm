# Games = Vídeos (layout idêntico)

Aplica no clone do **ProjectBudGanja** (branch a partir do tip de produção).

## O que muda

- `/jogos/` usa o **mesmo shell** de `/videos/` (filtros, busca, lista, carregar mais) e o mesmo `videos.js`.
- Em `data-page="jogos"`, o hub fica só **Zangado + Paulinho**.
- Query antiga `?canal=` continua a funcionar (além de `?channel=`).
- **Broto** passou para `/jogos/broto/`.
- Cache-bust: `lib/asset-version.js` → **315** (depois corre `node scripts/stamp-assets.js`).

## Como aplicar

```bash
cd /caminho/ProjectBudGanja
cp -R patches/inspetor-budganja-jogos-igual-videos/jogos ./
cp patches/inspetor-budganja-jogos-igual-videos/js/* ./js/
cp patches/inspetor-budganja-jogos-igual-videos/lib/asset-version.js ./lib/
cp patches/inspetor-budganja-jogos-igual-videos/scripts/build-sitemap.js ./scripts/
# opcional: content/pages.json (entrada jogos)
node scripts/stamp-assets.js
npm start   # ou npm run facil
```

Abrir http://localhost:8080/jogos/ e comparar com /videos/.
