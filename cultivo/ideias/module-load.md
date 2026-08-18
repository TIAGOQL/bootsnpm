# Module.load (Node)

- **Estágio:** colheita
- **Módulo REM:** palavra · projeto · técnico
- **Plantada em:** 2026-08-04
- **Próximo passo:** se o terminal gritar stack — ler de cima; `Module.load` é o carregador, não a causa

## Nota

Linha típica de stack: `at Module.load (node:internal/modules/cjs/loader:NNNN:NN)`. É o Node puxando um arquivo CommonJS. No Painel REM: `npm test` e `node --check` passam por isso; o site no navegador carrega JS de outro jeito (`<script type="module">`). Liga a Anonymous (nome no load) e a *In Time* (sistema que conta/carrega o que existe).

## Por que importa

Quem chega de fora vê o erro; precisa saber do que se trata a linha — e que o diário não passa por ela.
