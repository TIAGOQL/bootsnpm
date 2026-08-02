# Painel de poesias

Atalhos para abrir as poesias publicadas — e criar novas pelo Cursor.

## Acessar

- Painel: `index.html`
- Poesias: `poemas/minhas-lagrimas-sao-suas.html`, `poemas/homenagem-a-pixar.html`

```shell
npm start
```

Abra <http://localhost:3000>.

## Criar outra

No Cursor, diga:

> cria outra poesia para o painel

A regra em `.cursor/rules/poesia.mdc` faz o agente escrever a página em `poemas/` e colocar o atalho no painel.

## Publicação

O código está em `main`. Deploy automático no GitHub Pages a cada push.

URL: <https://tiagoql.github.io/bootsnpm/>

**Uma vez só:** em [Settings → Pages](https://github.com/TIAGOQL/bootsnpm/settings/pages), escolha **Source: GitHub Actions** e salve. Depois rode de novo o workflow *Deploy GitHub Pages*, ou faça um push em `main`.
