# Conta (Google / Apple)

- **Estágio:** broto
- **Módulo REM:** projeto · aparelho
- **Plantada em:** 2026-08-18
- **Próximo passo:** colar Client IDs reais (Google Cloud / Apple Developer) em Conta ou em `auth-config.js`

## Nota

Login social no Painel REM: **Google Identity Services** e **Sign in with Apple**. Cadastro = mesma tela de entrada. Sessão em `localStorage` (`rem-auth-v1`). Diário continua local.

## Por que importa

Quem pedia “conta Google ou Apple que funcione” precisa de OAuth real — não de botão falso. Client IDs são públicos; secrets não entram no site estático.

## Ligar

1. Abra `pesquisas/conta.html`.
2. Em «Ligar provedores», cole o Google Client ID (e/ou Apple Services ID).
3. Salvar no aparelho → botão oficial aparece → entrar.
4. Opcional permanente no repo: `assets/js/auth-config.js`.
