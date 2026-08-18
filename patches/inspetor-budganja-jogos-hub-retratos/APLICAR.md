# Hub Jogos — retratos + vídeo pra começar

Repo alvo: **tqltql-max/ProjectBudGanja** (branch de produção, ex. `feat/unify-icons-and-updates`).

O agente Cursor neste workspace (**bootsnpm**) **não tem permissão de push** em BudGanja. Aplica este patch no clone local e faz deploy.

## O que muda

- `/jogos/` deixa de ser só nomes em texto.
- Três cards: **Zangado**, **Aleff**, **Paulinho o LOKO** — cada um com foto, vídeo pra começar (play no hub) e botão pro catálogo.
- Broto e Cadernos ficam como links secundários.
- Fotos em `/imagens/jogos/{zangado,aleff,paulinho}.jpg`.
- Cache-bust: `lib/asset-version.js` → **316** (depois `node scripts/stamp-assets.js`).

## Como aplicar

```bash
cd ProjectBudGanja
git checkout feat/unify-icons-and-updates   # ou a branch que está no Netlify

# 1) ficheiros
cp path/to/patches/inspetor-budganja-jogos-hub-retratos/js/jogos.js js/jogos.js
cp path/to/patches/inspetor-budganja-jogos-hub-retratos/js/i18n-data.js js/i18n-data.js
cp path/to/patches/inspetor-budganja-jogos-hub-retratos/jogos/index.html jogos/index.html
cp path/to/patches/inspetor-budganja-jogos-hub-retratos/lib/asset-version.js lib/asset-version.js
mkdir -p imagens/jogos
cp path/to/patches/inspetor-budganja-jogos-hub-retratos/imagens/jogos/*.jpg imagens/jogos/

# 2) CSS — substitui o bloco antigo .jogos-name-list / .jogos-name pelo snippet
#    (ou aplica o diff)
git apply path/to/patches/inspetor-budganja-jogos-hub-retratos/css/style-jogos-hub.diff
# fallback: cola css/jogos-spotlight.css no lugar do bloco .jogos-page .jogos-name-list

# 3) site-features — play in-page no hub
git apply path/to/patches/inspetor-budganja-jogos-hub-retratos/js/site-features.diff
# ou: em bindYoutubeFacadeButton, trocar
#   btn.closest('.home-vida-embed')
# por
#   btn.closest('.home-vida-embed, .jogos-hub-embed')

# 4) cache
node scripts/stamp-assets.js
# copia ícones versionados se o stamp apontar para .v316.* ainda inexistentes:
#   for f in favicon.v313.* imagens/*v313*; do cp "$f" "${f/v313/v316}"; done

git add -A
git commit -m "Beleza no hub Jogos: retratos e vídeo pra Zangado, Aleff e Paulinho"
git push
```

## Teste local

```bash
npx --yes serve -l 8080 .
# http://localhost:8080/jogos/
# Confirma: 3 fotos, 3 players, botões Ver catálogo, Broto/Cadernos em baixo.
```
