# Hero flag dourado — «Inspeção de arte · Em destaque»

Repo alvo: **tqltql-max/ProjectBudGanja** (branch de produção com o hero `hero--inverno`, ex. a que está no ar em inspetorbudganja.com.br).

O workspace **bootsnpm** não faz push no BudGanja. Aplica este patch no clone local e faz deploy.

## O que muda

O texto da home:

`Inspeção de arte · Em destaque`

(`.hero-flag` / `pages.home.heroFlag`) fica **bem dourado** com:

- gradiente de marca no texto (sheen `heroGoldSheen`)
- brilho / glow no pill
- varredura de luz (`::before`)
- pulso mais forte no ponto dourado
- respeito a `prefers-reduced-motion`

## Como aplicar

```bash
cd ProjectBudGanja
# branch que já tem o hero-flag na home (produção / Netlify)

# 1) Substitui o bloco antigo .hero-flag … prefers-reduced-motion
#    em css/pages/home.css pelo conteúdo de hero-flag-dourado.css
#    (ou aplica o diff)
git apply path/to/patches/inspetor-budganja-hero-flag-dourado/home-hero-flag.diff

# 2) Cache-bust
#    Em lib/asset-version.js, sobe a versão (ex. 313 → 314)
#    depois: node scripts/stamp-assets.js
```

Se o `git apply` falhar por drift, abre `css/pages/home.css`, encontra `body[data-page="home"] .hero--inverno .hero-flag` e cola o ficheiro `hero-flag-dourado.css` no lugar desse bloco (inclui keyframes e reduced-motion).

## Verificar

1. `npm start` (ou o comando local do BudGanja) → http://localhost:8080/
2. No hero, o badge «Inspeção de arte · Em destaque» deve brilhar em dourado (texto + borda + ponto).
