# Markdown

Documento de leitura. Registro da pesquisa sobre a palavra.  
Data: 2026-08-04.

---

## O que a palavra é

**Markdown** é um **substantivo** (também usado como nome próprio da linguagem).

Quer dizer: **texto marcado de leve** — escrita quase normal, com poucos sinais, que o computador (ou o GitHub) transforma em página.

Extensão de arquivo: **`.md`**.

Antônimo prático no painel: **HTML** — a página pronta pro navegador. Os dois convivem: o `.md` é o núcleo; o `.html` é a vitrine.

---

## Origem

Criado em **2004** por **John Gruber** (com ajuda de Aaron Swartz).

O nome junta:

- **mark** — marcar, assinalar
- **down** — “pra baixo”, no sentido de **reduzir** a marcação

A ideia: menos código do que HTML. Você escreve quase como num caderno; um programa “renderiza” títulos, listas e links.

No GitHub, README e ideias em `cultivo/` usam Markdown o tempo todo.

---

## Sinais básicos (o suficiente)

| Você escreve | Vira |
| --- | --- |
| `# Título` | Título grande |
| `## Subtítulo` | Título médio |
| `**negrito**` | **negrito** |
| `*itálico*` | *itálico* |
| `- item` | lista |
| `[texto](url)` | link |
| `---` | linha / separador |

Não precisa decorar tudo. Poucos sinais bastam.

---

## Por que a palavra importa

1. **É o formato do núcleo** — pesquisas e cultivo permanentes ficam em `.md`.
2. **É legível sem máquina** — abre no Bloco de Notas e ainda faz sentido.
3. **É o meio-termo** — entre papel (só prosa) e HTML (só tela).

No REM: plantar ideia = escrever Markdown pequeno. Virar página = HTML no painel.

---

## O bom e o ruim

| Lado | Sentido |
| --- | --- |
| **Bom** | Leve, versionável no Git, fácil de reler, padrão do repositório |
| **Ruim** | Confundir `.md` com página do site; achar que Markdown sozinho “abre bonito” no painel |

No navegador do painel, o atalho aponta pro **HTML**. O `.md` é o texto de estudo e o arquivo do cultivo.

---

## Resumo para reler

**Markdown** é importante porque junta três coisas:

- **marca** (poucos sinais)
- **texto** (ainda humano)
- **arquivo `.md`** (núcleo no Git)

É a língua do canteiro permanente — antes da página, depois da ideia.

---

## Ligação com o Painel REM

| Onde | Relação |
| --- | --- |
| [Cultivo](cultivo-ideias.html) | Ideias permanentes = `cultivo/ideias/<slug>.md` |
| [Guia do cultivo](../cultivo/README.md) | Como inserir `.md` no repositório |
| Modelo | [cultivo/ideias/_modelo.md](../cultivo/ideias/_modelo.md) |
| Ex.: [esqueceremos.md](esqueceremos.md) | Núcleo de inspeção de palavra |
| Página no painel | [markdown.html](markdown.html) |
| Cultivo | [cultivo/ideias/markdown.md](../cultivo/ideias/markdown.md) |

---

## Fontes consultadas

- John Gruber — *Markdown* (síntaxe original, 2004)
- GitHub Docs — arquivos `.md` / README / Flavored Markdown
- Uso no próprio repositório Painel REM — `cultivo/`, `pesquisas/*.md`
