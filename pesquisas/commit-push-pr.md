# Commit · push · PR

Documento de leitura. Registro da pesquisa sobre as palavras.  
Data: 2026-08-04.

---

## O que as palavras são

Três termos do fluxo **Git / GitHub**, nessa ordem:

| Palavra | Quer dizer |
| --- | --- |
| **Commit** | Gravar a mudança com mensagem (histórico local da branch) |
| **Push** | Enviar a branch para o remoto (GitHub) |
| **PR** | *Pull Request* — pedido para juntar a branch na `main` |

Não são sinônimos. São **passos**.

Antônimo útil do ciclo: **só no aparelho** (localStorage, sem Git) — some se limpar o browser.

---

## Origem

Inglês técnico de versionamento:

- **Commit** — do latim *committere* (entregar, confiar). No Git: “entregar” um pacote de mudanças ao histórico.
- **Push** — empurrar. Empurra commits do seu computador para o servidor.
- **Pull Request** — pedido de *pull* (puxar). Você pede que a linha principal puxe o seu trabalho. Na prática: revisão + merge.

No Brasil, fala-se “abrir um PR”, “dar push”, “commitar”.

---

## Por que as palavras importam

1. **Separam gravar de publicar** — commit marca; push publica a branch; PR pede entrada na `main`.
2. **Dão tempo de revisar** — PR não é merge automático; é porta com campainha.
3. **No REM, espelham o cultivo** — canteiro local (aparelho) × semente no repositório (Git).

Sinais são palavras. Estas carregam notebook, nuvem e pedido de entrada.

---

## Três passos (resumo)

| Passo | Sem ele… |
| --- | --- |
| Commit | Mudança solta, sem histórico nomeado |
| Push | Branch só no seu PC — PR impossível |
| PR | Mudança no remoto, mas fora da `main` / do site |

Regra curta: **commit → push → PR**. Não pule.

---

## Resumo para reler

**Commit · push · PR** junta três gestos:

- **gravar** (marcar o momento)
- **enviar** (sair do notebook)
- **pedir revisão** (abrir a porta sem arrombar)

No painel: Diário salva no aparelho; cultivo permanente passa por este fluxo.

---

## Ligação com o Painel REM

| Onde | Relação |
| --- | --- |
| [Diário REM](diario-rem.html) | Salvar / Exportar JSON — gravar o N=1 |
| [Cultivo de ideias](cultivo-ideias.html) | Local × “No repositório” (Git) |
| [Higiene mental (M0)](higiene-mental.html) | Um passo; sem misturar commit com merge |
| [Sinais](sinais.html) | Quando a cabeça pesou — um gesto só |
| [Protocolo N=1](protocolo-n1.html) | Stack e ordem importam |
| Página no painel | [commit-push-pr.html](commit-push-pr.html) |
| Cultivo | [cultivo/ideias/commit-push-pr.md](../cultivo/ideias/commit-push-pr.md) |

---

## Fontes consultadas

- Documentação Git — *commit*, *push*
- GitHub Docs — *About pull requests*
- Uso corrente em equipes — “commitar”, “dar push”, “abrir PR”
