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

No Windows: `start-now.ps1` (sobe o mesmo servidor em http://localhost:3000).

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

Deploy via GitHub Actions em `main`.

**Uma vez só:** Settings → Pages → Source: **GitHub Actions**.  
Sem isso o workflow de Pages falha (token sem permissão de criar o site).
