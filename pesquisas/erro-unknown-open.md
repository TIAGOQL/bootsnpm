# UNKNOWN · open (writeFileSync)

Inspeção + tradução. 2026-08-20.

Erro no PC Windows, outro projeto (`ProjectBudGanja`). O Painel REM traduz a pilha para não assustar.

## O golpe

`scripts/regenerate-posts.js` linha 32: `writeFileSync` tentou gravar

`posts\post-inspecao-expressao-templo-de-cristo-corpo-e-alma.html`

Windows: `UNKNOWN` · `syscall: open` · `errno: -4094`.

Não abriu o caminho. `Module.load` no stack é só o Node a carregar o script.

## Palavras

| Inglês | Português |
| --- | --- |
| Error | erro |
| UNKNOWN | desconhecido |
| open | abrir (ficheiro) |
| writeFileSync | escrever arquivo e esperar |
| anonymous | função sem nome — não é o grupo Anonymous |
| Module.load | carregar módulo — porteiro |
| errno / code / syscall / path | número · código · chamada ao sistema · caminho |

## O que fazer

1. Criar a pasta `posts` se não existir  
2. Fechar o HTML no editor  
3. OneDrive no Desktop: ficheiro local, ou projeto fora da nuvem  
4. Correr o script outra vez  

## Página

[erro-unknown-open.html](erro-unknown-open.html) · [module-load.html](module-load.html) · [palavras-do-stack.html](palavras-do-stack.html) · [letra X](letra-x.html) (outro desconhecido: a letra / o nome novo)
