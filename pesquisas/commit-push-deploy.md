# Commit · Push · Deploy

Documento de leitura. Inspeção de três verbos.  
Data: 2026-08-03.

---

## A frase

**Commit. Push. Deploy.**

Três passos. Ordem importa. Sem o primeiro, o segundo não carrega nada. Sem o segundo, o terceiro não vê o mundo.

---

## Quebra das palavras

| Verbo | Origem / sentido | No Git / Pages |
| --- | --- | --- |
| **Commit** | Latim *committere* — confiar, entregar, juntar | Grava um pacote local com mensagem |
| **Push** | Inglês — empurrar | Envia commits ao remoto (`origin`) |
| **Deploy** | Francês *desployer* / inglês — desdobrar, colocar em campo | Publica o site para quem acessa |

No Painel REM este trio é o caminho do canteiro até a página pública.

---

## O fluxo neste repositório

1. **Commit** — `git add` + `git commit` (mensagem clara).
2. **Push** — `git push` da branch (PR ou `main`).
3. **Deploy** — em `main`, o workflow `.github/workflows/pages.yml` monta `_site/` e publica no GitHub Pages.

Antes: `npm test` (CI em `.github/workflows/ci.yml`) verifica se o painel ainda tem as superfícies certas.

**Uma vez só:** Settings → Pages → Source: **GitHub Actions**. Sem isso o deploy falha (token sem permissão de criar o site).

---

## Por que a sequência importa

| Se faltar… | O que acontece |
| --- | --- |
| Commit | Mudança só no rascunho — some com o disco |
| Push | Commit existe na máquina; remoto e CI não veem |
| Deploy (ou Pages mal ligado) | Código no GitHub; site antigo ou morto |

Commit sem push = diário só no aparelho.  
Push sem deploy = ideia no Git, página pública ainda velha.  
Deploy sem commit novo = republicar o que já estava.

---

## Eco no REM

| Verbo | Eco |
| --- | --- |
| **Commit** | Marcar no [Diário](diario-rem.html) — escolher o que fica |
| **Push** | Mandar para fora do aparelho — backup / PR / outra pessoa |
| **Deploy** | Tornar visível — como o painel no ar |

LocalStorage do diário **não** entra no deploy: vive no browser. O que vai ao Pages é HTML/CSS/JS e as sementes em `cultivo/ideias/`.

---

## Dois lados

| Lado | Sentido |
| --- | --- |
| **Útil** | Ritual curto: salvar → enviar → publicar |
| **Ruim** | Push na pressa sem testar; deploy quebrado e culpar o “demo” |
| **Higiene** | Mensagem de commit limpa = menos ruído mental depois |

---

## Resumo para reler

**Commit** = confiar o pacote ao histórico.  
**Push** = empurrar ao remoto.  
**Deploy** = desdobrar no ar (Pages).  

No Painel REM: branch → PR → `main` → Actions → site.

---

## Ligação com o Painel REM

| Onde | Relação |
| --- | --- |
| [Cultivo](cultivo-ideias.html) | Ideias no Git só “existem” de verdade após commit + push |
| [Diário REM](diario-rem.html) | Commit local do dia; exportar JSON = outro tipo de push |
| [Higiene mental](higiene-mental.html) | Mensagem clara, um passo de cada vez |
| README | Settings → Pages → GitHub Actions |
| Página no painel | [commit-push-deploy.html](commit-push-deploy.html) |
| Cultivo | [cultivo/ideias/commit-push-deploy.md](../cultivo/ideias/commit-push-deploy.md) |

---

## Fontes consultadas

- Git documentation — `commit`, `push`
- GitHub Docs — Pages + Actions (`deploy-pages`)
- Este repo — `.github/workflows/pages.yml`, `ci.yml`, `README.md`
- Etimologia comum — *committere*; *deploy* / *desployer*
