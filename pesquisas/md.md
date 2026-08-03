# MD

Documento de leitura. Registro da pesquisa sobre o formato.  
Data: 2026-08-03.

---

## O que é

**MD** é a abreviação de **Markdown**.

O arquivo termina em **`.md`**.

É texto quase puro, com poucos sinais:

- `#` título
- `**negrito**`
- listas com `-`
- links `[texto](url)`

Abre em qualquer editor. No GitHub, aparece formatado.

---

## Origem

Markdown foi criado em **2004** por John Gruber (com Aaron Swartz na ideia inicial) para escrever web sem carregar HTML pesado.

A extensão `.md` pegou. Às vezes `.markdown`. O jeito mais comum hoje: `.md`.

---

## Por que importa no Painel REM

Aqui a pesquisa costuma ter **par**:

| Lado | Papel |
| --- | --- |
| **`.html`** | Página do painel — visual, atalho, leitura rápida |
| **`.md`** | Núcleo — texto completo para reler e editar |

Exemplos: `esqueceremos.html` + `esqueceremos.md` · `valeu.html` + `valeu.md`.

**Não é lei.** Tem página só HTML. Tem ideia só `.md` no cultivo. O `.md` de `pesquisas/` entra quando o assunto vira documento de verdade.

---

## O que as pessoas usam no lugar

Quem não quer `.md` usa, entre outras coisas:

- Google Docs / Word
- Notion / Obsidian (muitos usam Markdown *por baixo*)
- só HTML
- papel e foto

Nada disso está “errado”. O painel escolheu `.md` porque vive no Git: diff claro, leve, legível no celular do GitHub.

---

## Resumo para reler

**MD** = Markdown = arquivo de texto com marcação leve.

No REM: **HTML mostra · MD guarda o miolo.**

---

## Ligação com o Painel REM

| Onde | Relação |
| --- | --- |
| [Cultivo](cultivo-ideias.html) | Sementes em `cultivo/ideias/*.md` |
| [Valeu](valeu.html) | Par html + md |
| [Esqueceremos](esqueceremos.html) | Par html + md |
| Página no painel | [md.html](md.html) |
| Cultivo | [cultivo/ideias/md.md](../cultivo/ideias/md.md) |

---

## Fontes consultadas

- John Gruber — Daring Fireball / Markdown
- Uso corrente em GitHub — README.md, wikis, Issues
- Prática do próprio repositório Painel REM — pares html/md em `pesquisas/`
