# Module.load (Node)

Inspeção curta. 2026-08-04.  
A linha do stack: `at Module.load (node:internal/modules/cjs/loader:…)`  

## O que é

Quando o Node (CommonJS) falha ao `require()` algo, o stack mostra funções internas do carregador:

- `node:internal/modules/cjs/loader` — arquivo interno do runtime  
- `Module._resolveFilename` — achar o caminho do módulo  
- `Module._load` / `Module.load` / `Module.require` — carregar e executar  

O número (`1577:32` ou outro) é **linha:coluna** nessa versão do Node. Muda entre Node 20, 22, etc. Não é bug do Painel REM por si só — é o sítio onde o runtime estava quando o erro estourou.

## Exemplo (neste ambiente)

`Cannot find module '…'` sobe por `_resolveFilename` → `_load` → `require`.  
A causa costuma estar **acima** no stack (o seu script) ou na mensagem (`Cannot find module`).

## No Painel REM

| Lado | Como carrega |
| --- | --- |
| `npm test` | `node -e "…"` — usa o loader CJS interno |
| `node --check assets/js/….js` | sintaxe; também Node |
| `npm start` (`npx serve`) | Node sobe o servidor estático |
| Navegador (Diário, Cultivo, Tônus) | `<script type="module">` — **ESM no browser**, não `Module.load` CJS |
| Diário / cultivo local | `localStorage` — sem `require` |

O site público no GitHub Pages **não** roda `Module.load` no visitante. Só quem roda Node no terminal (CI, `npm test`, `npm start`) vê essa linha.

## Com a cadeia do painel

| Inspeção | Ideia |
| --- | --- |
| [Anonymous](anonymous.html) | nome que some |
| [*In Time*](in-time.html) | sistema que **conta** o que existe no braço |
| [Timberlake](justin-timberlake.html) | cara com nome no cartaz |
| **Module.load** | runtime que **carrega pelo nome do módulo** — se o nome não resolve, estoura |

Anonimato vs nome no `require`. Contador vs carregador. O erro mostra o carregador; a falta é o módulo ausente (ou bug no script).

## Dados

Nada de dado pessoal N=1 passa por `Module.load`. Ver [segurança dos dados](seguranca-dados-pessoais.html).

## Página

[module-load.html](module-load.html) · tradução palavra a palavra: [palavras-do-stack.html](palavras-do-stack.html)

## Fontes

Stack Node.js CJS (`node:internal/modules/cjs/loader`) · Node 22 neste ambiente · docs Module
