# Painel de poesias

Atalhos para abrir as poesias publicadas — e criar novas pelo Cursor.

## Acessar

- Painel: `index.html`
- Poesia atual: `poemas/minhas-lagrimas-sao-suas.html`

```shell
npm start
```

Abra <http://localhost:3000>.

## Criar outra

No Cursor, diga:

> cria outra poesia para o painel

A regra em `.cursor/rules/poesia.mdc` faz o agente escrever a página em `poemas/` e colocar o atalho no painel.

## Publicação

Deploy automático no GitHub Pages a cada push em `main`:

<https://tiagoql.github.io/bootsnpm/>
