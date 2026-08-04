# Commit · push · PR

Documento de leitura. Registro da pesquisa sobre as palavras e a família.  
Data: 2026-08-04.

---

## O que as palavras são

Três gestos do **meio** do fluxo Git / GitHub:

| Palavra | Quer dizer |
| --- | --- |
| **Commit** | Gravar a mudança com mensagem (histórico da branch) |
| **Push** | Enviar a branch para o remoto (GitHub / `origin`) |
| **PR** | *Pull Request* — pedido para juntar a branch na `main` |

Não são sinônimos. São **passos**.

Antônimo útil do ciclo: **só no aparelho** (localStorage, sem Git) — some se limpar o browser.

---

## Família (o que completa o mapa)

Sem estas, o trio fica solto:

| Palavra | Quer dizer | Relação |
| --- | --- | --- |
| **Branch** | Trilho paralelo | Onde você committa sem quebrar a `main` |
| **Add** | Escolher o que entra | Antes do commit (`git add`) |
| **Pull** | Trazer o remoto pra você | Inverso do push; raiz de *Pull* Request |
| **Merge** | Juntar de verdade | Depois do PR aprovado |
| **Main** | Linha oficial | Destino do merge; origem do deploy |
| **Deploy** | Desdobrar no ar | Pages a partir de `main` (Actions) |
| **Origin** | O remoto (GitHub) | Para onde o push vai |
| **Draft** | PR em rascunho | Pedido aberto, merge ainda não |

Ordem completa:

**branch → add → commit → push → PR → merge → main → deploy**

---

## Origem

Inglês técnico de versionamento:

- **Commit** — latim *committere* (entregar, confiar). Pacote ao histórico.
- **Push** — empurrar. Commits do PC → servidor.
- **Pull** — puxar. Servidor → PC. **Pull Request** = pedido de puxar o seu trabalho pra `main`.
- **Branch** — ramo. Linha que se afasta e pode voltar (merge).
- **Merge** — fundir. Duas histórias viram uma.
- **Deploy** — francês *desployer* / inglês — desdobrar em campo. Aqui: GitHub Pages.

No Brasil: “commitar”, “dar push”, “abrir PR”, “mergear”, “subir o deploy”.

---

## Por que as palavras importam

1. **Separam gravar de publicar** — commit marca; push publica a branch; PR pede; merge junta; deploy mostra.
2. **Dão tempo de revisar** — PR (sobretudo draft) é porta com campainha, não arrombamento.
3. **No REM, espelham o cultivo** — canteiro local (aparelho) × semente no repositório (Git) × painel no ar (Pages).

Sinais são palavras. Esta família carrega notebook, nuvem, campainha e site público.

---

## Três gestos + o que falta se pular

| Passo | Sem ele… |
| --- | --- |
| Branch | Trabalho direto na `main` — risco de quebrar o painel |
| Add | Commit sem o que você pensou escolher |
| Commit | Mudança solta, sem histórico nomeado |
| Push | Branch só no PC — PR impossível |
| PR | Mudança no remoto, sem pedido formal de entrada |
| Merge | PR aberto, `main` ainda velha |
| Deploy | Código na `main`, site público ainda antigo (ou Pages mal ligado) |

Regra curta: **não misturar os gestos**. Commit não é push. Push não é merge. Merge não é deploy.

---

## Neste repositório

1. Branch `cursor/…`
2. `git add` + `git commit`
3. `git push -u origin …`
4. Abrir **PR** (draft por padrão nos agentes)
5. Merge em **`main`**
6. **Deploy** — `.github/workflows/pages.yml` → GitHub Pages  
   CI — `.github/workflows/ci.yml` roda `npm test`

**Uma vez só:** Settings → Pages → Source: **GitHub Actions**. Sem isso o deploy falha.

LocalStorage do [Diário](diario-rem.html) **não** entra no deploy. O que vai ao Pages é HTML/CSS/JS e as sementes em `cultivo/ideias/`.

---

## Eco no REM

| Gesto | Eco |
| --- | --- |
| **Add / commit** | Marcar no diário — escolher o que fica |
| **Push** | Tirar do aparelho — backup / outra pessoa |
| **PR / draft** | Pedir revisão — sem forçar a entrada |
| **Merge / main** | Oficializar o passo |
| **Deploy** | Tornar visível — painel no ar |
| **Pull** | Receber o que o mundo já tem — não inventar do zero |

Quando a cabeça pesou: um gesto só ([Sinais](sinais.html), [M0](higiene-mental.html)).

---

## Resumo para reler

**Commit · push · PR** é o meio do ciclo:

- **gravar** (marcar o momento)
- **enviar** (sair do notebook)
- **pedir revisão** (abrir a porta sem arrombar)

A família completa acrescenta: **branch · add · pull · merge · main · deploy · draft · origin**.

No painel: Diário salva no aparelho; cultivo permanente passa por este fluxo; o site público só depois do merge na `main`.

---

## Ligação com o Painel REM

| Onde | Relação |
| --- | --- |
| [Diário REM](diario-rem.html) | Salvar / Exportar JSON — gravar o N=1 |
| [Cultivo de ideias](cultivo-ideias.html) | Local × “No repositório” (Git) |
| [Higiene mental (M0)](higiene-mental.html) | Um passo; sem misturar commit com merge |
| [Sinais](sinais.html) | Quando a cabeça pesou — um gesto só |
| [Protocolo N=1](protocolo-n1.html) | Stack e ordem importam |
| README | Settings → Pages → GitHub Actions |
| Página no painel | [commit-push-pr.html](commit-push-pr.html) |
| Cultivo | [cultivo/ideias/commit-push-pr.md](../cultivo/ideias/commit-push-pr.md) |

---

## Fontes consultadas

- Documentação Git — *commit*, *push*, *pull*, *branch*, *merge*, *add*
- GitHub Docs — *About pull requests*, Pages + Actions
- Este repo — `.github/workflows/pages.yml`, `ci.yml`, `README.md`
- Inspeção irmã (branch aberta) — *commit · push · deploy*
- Etimologia — *committere*; *deploy* / *desployer*
