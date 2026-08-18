# Fix: layout quebrado em `/biblioteca/inspecoes/`

Repo alvo: **tqltql-max/ProjectBudGanja** (branch de produção com hub, ex. `feat/unify-icons-and-updates`).

## O que este patch corrige

1. **Filtros** — deixa de esconder as outras chips ao escolher uma série (isso “quebrava” o topo da página).
2. **Mobile** — chips em scroll horizontal em vez de empilhar em 5–6 linhas.
3. **Banner Instalar app** — padding no conteúdo para não cobrir os cards.
4. **Capas** — normaliza `/images/` → `/imagens/` quando a API manda o path errado.
5. **Cache** — sobe `ASSET_VERSION` para `314` (depois rode `node scripts/stamp-assets.js`).

## Como aplicar

```bash
cd ProjectBudGanja
git checkout feat/unify-icons-and-updates   # ou a branch que está no Netlify
git apply path/to/fix.patch
# ou:
# git apply patches/inspetor-budganja-inspecoes-layout/fix.patch

# bump cache sitewide
node scripts/stamp-assets.js

git add -A
git commit -m "Corrigir layout quebrado do hub de Inspeções"
git push
```

O agente Cursor neste workspace (**bootsnpm**) **não tem permissão de push** em `tqltql-max/ProjectBudGanja`. Abre o repo BudGanja no Cursor (ou cola este patch lá) para merge/deploy no Netlify.
