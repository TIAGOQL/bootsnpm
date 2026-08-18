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
| Conta Google / Apple | `pesquisas/conta.html` + `.md` |
| Relação Conta · Google · Apple | `pesquisas/conta-google-apple.html` |
| Guia de palavras | `pesquisas/guia-de-palavras.html` + `.md` |
| GitHub (inspeção) | `pesquisas/github.html` + `.md` |
| Peito / luz | `pesquisas/cadeia-peito-luz.html` · `filhodosol.html` |

## Dados pessoais (para quem chega de fora)

Site estático. Sem backend de diário / sem nuvem do N=1.

- **Só no aparelho** (`localStorage`): Diário REM, cultivo local, volume, sessão Google/Apple (opcional).  
- **Conta:** `pesquisas/conta.html` — cadastro/entrada com Google ou Apple (Client IDs em Conta ou `assets/js/auth-config.js`).  
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
