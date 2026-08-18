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

# 0) Se home.css tiver CRLF (comum no ficheiro em produção):
sed -i 's/\r$//' css/pages/home.css

# 1) Aplica o diff (ou cola hero-flag-dourado.css no bloco .hero-flag)
git apply path/to/patches/inspetor-budganja-hero-flag-dourado/home-hero-flag.diff

# 2) Cache-bust — copia asset-version.js (314) ou sobe à mão
cp path/to/patches/inspetor-budganja-hero-flag-dourado/asset-version.js lib/asset-version.js
node scripts/stamp-assets.js
```

Se o `git apply` falhar por drift, abre `css/pages/home.css`, encontra `body[data-page="home"] .hero--inverno .hero-flag` e substitui até ao `@media (prefers-reduced-motion… hero-flag-dot)` pelo conteúdo de `hero-flag-dourado.css`.

## Verificar

1. Sobe o site local → http://localhost:8080/
2. No hero, o badge «Inspeção de arte · Em destaque» deve brilhar em dourado (texto + borda + ponto).
