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
| Dados / privacidade | `pesquisas/seguranca-dados-pessoais.html` + `.md` |
| Stack Node (`Module.load`) | `pesquisas/module-load.html` + `.md` |

## Dados pessoais (para quem chega de fora)

Site estático. Sem login, sem backend, sem nuvem do diário.

- **Só no aparelho** (`localStorage`): Diário REM, cultivo local, volume do áudio.  
- **Público (Git / Pages):** páginas, mapa, poesias, ideias permanentes em `cultivo/ideias/`.  
- **Backup:** Exportar JSON no Diário — quem não exporta e limpa o navegador perde o histórico.

Detalhe: [pesquisas/seguranca-dados-pessoais.html](pesquisas/seguranca-dados-pessoais.html).

## Plantar ideia

- No canteiro do painel, ou  
- `cultivo/ideias/<slug>.md` pelo `_modelo.md`, ou  
- no Cursor: `planta no cultivo: …`

## Publicação

Deploy via GitHub Actions em `main`.

**Uma vez só:** Settings → Pages → Source: **GitHub Actions**.  
Sem isso o workflow de Pages falha (token sem permissão de criar o site).
