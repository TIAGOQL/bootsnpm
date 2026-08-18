/**
 * Config pública do login social (Google / Apple).
 * Client IDs de OAuth web são públicos por desenho — não coloque secrets aqui.
 *
 * Pode deixar vazio e colar os IDs na página Conta (ficam só no aparelho).
 * Origins autorizados típicos:
 *   - http://localhost:3000
 *   - https://tiagoql.github.io
 */
export const REM_AUTH_CONFIG = {
  googleClientId: "",
  appleClientId: "",
  appleRedirectURI: "",
};
