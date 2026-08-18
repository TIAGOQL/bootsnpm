# Remover Plantas e Animais da barra (index)

Repo alvo: **tqltql-max/ProjectBudGanja** (tip de produção / Netlify).

## O que muda

Tira os atalhos **Plantas** e **Animais** do chrome do site (index e demais páginas):

1. **Quick-nav** (barra de atalhos com label) — primeiros dois botões
2. **Cluster da toolbar** — ícones SVG ao lado do rádio / idioma
3. **Menu mobile → Explorar** — mesmas entradas

Mantém as páginas `/plantas/` e `/animais/`, cards da home e links do rodapé.

## Como aplicar

```bash
cd /caminho/ProjectBudGanja

# Opção A — ficheiro completo (recomendado)
cp patches/inspetor-budganja-sem-plantas-animais-toolbar/js/layout.js ./js/layout.js

# Opção B — diff unificado
# git apply patches/inspetor-budganja-sem-plantas-animais-toolbar/remove-plantas-animais-toolbar.patch

# cache-bust
# editar lib/asset-version.js (subir 1) e:
node scripts/stamp-assets.js

git add js/layout.js lib/asset-version.js
git commit -m "Remover Plantas e Animais da barra de ferramentas"
git push
```

O agente Cursor neste workspace (**bootsnpm**) **não tem permissão de push** em `tqltql-max/ProjectBudGanja`. Abre o BudGanja no Cursor (ou cola este patch lá) para merge/deploy.

## Teste local

```bash
npm start
# http://localhost:8080/
# Header: sem botões Plantas / Animais na quick-nav nem no cluster.
```
