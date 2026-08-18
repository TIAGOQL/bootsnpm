# Barra desktop = barra móvel

Repo alvo: **tqltql-max/ProjectBudGanja** (branch de produção com hub, ex. `feat/unify-icons-and-updates`).

## O que muda

A barra do **desktop** passa a usar a mesma composição do **telemóvel**:

1. **Sem faixa de atalhos** (`header-quick-nav`) — UNIFESP / Biblioteca / Vídeos etc. ficam só no menu ☰
2. **Grelha de 3 colunas** — logo + Comunidade | cluster (rádio + atalhos + idioma) | busca + menu
3. **Cluster junto** — deixa de se “dissolver” (`display: contents`) no desktop
4. **Cache** — `ASSET_VERSION` → `316` (depois rode `node scripts/stamp-assets.js`)

## Como aplicar

```bash
cd /caminho/ProjectBudGanja
git checkout feat/unify-icons-and-updates   # ou a branch no Netlify

git apply patches/inspetor-budganja-barra-desktop-igual-movel/barra-desktop-igual-movel.patch
# ou, se o patch estiver noutro clone:
# git apply /caminho/bootsnpm/patches/inspetor-budganja-barra-desktop-igual-movel/barra-desktop-igual-movel.patch

node scripts/stamp-assets.js

git add css/style.css lib/asset-version.js
# (stamp também atualiza HTMLs com ?v= — inclua-os se quiser cache-bust total)
git commit -m "Barra desktop igual à versão móvel"
git push
```

O agente Cursor neste workspace (**bootsnpm**) **não tem permissão de push** em `tqltql-max/ProjectBudGanja`. Abre o BudGanja no Cursor (ou cola este patch lá) para merge/deploy.

## Teste local

```bash
npm start
# http://localhost:8080/
# Desktop largo: barra = logo+comunidade | cluster dourado | busca+☰
# Sem fila horizontal de chips UNIFESP/Biblioteca/Vídeos na barra
# Reduzir a janela: a barra não muda de estrutura
```
