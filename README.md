# Painel REM (nível 4)

Sistema de **Relaxamento Endocanabinoide Modular** — pesquisa, diário N=1, cultivo de ideias e música Tônus.

## Começar agora

1. `pesquisas/protocolo-n1.html` — 4 semanas  
2. `pesquisas/diario-rem.html` — registrar + exportar JSON  
3. `pesquisas/musica-tonus.html` — áudio de estudo  
4. `pesquisas/cultivo-ideias.html` — plantar dúvidas  

Fotos dos cards do painel: `assets/img/card-*.jpg`. 

```shell
npm start
```

## Mapa do projeto

| Área | Onde |
| --- | --- |
| Painel | `index.html` |
| Mapa REM | `pesquisas/relaxamento-endocanabinoide.html` + `.md` |
| Endocanabinoidoma | `pesquisas/endocanabinoidoma.html` |
| Sementinha | `pesquisas/sementinha.html` |
| Cultivo (Git) | `cultivo/ideias/` |
| Poesias | `poemas/` |

## Plantar ideia

- No canteiro do painel, ou  
- `cultivo/ideias/<slug>.md` pelo `_modelo.md`, ou  
- no Cursor: `planta no cultivo: …`

## Publicação

Cada push em `main` publica o site na branch `gh-pages` (Actions → Deploy GitHub Pages).

**Uma vez só** (dono do repo):

1. Settings → Pages  
2. Build and deployment → Source: **Deploy from a branch**  
3. Branch: `gh-pages` / `/ (root)` → Save  

Site: https://tiagoql.github.io/bootsnpm/
