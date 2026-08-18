# Login persistente no SQLite

Corrige o “entra e sai” do login: a sessão era gravada e logo apagada
porque `getUserSession` / `createUserSession` faziam `DELETE FROM user_sessions`
e reescreviam a tabela inteira (corrida entre `/api/user/me` e `/api/me`).

## O que muda

- Sessão de utilizador e admin: INSERT/DELETE **por token**
- Cookie `SameSite=Lax` (sobrevive redirect Google / túnel)
- Teste em `scripts/test-db-persistence.js`

## Aplicar no ProjectBudGanja

```bash
cp patches/inspetor-budganja-login-persistencia/lib/* ./lib/
cp patches/inspetor-budganja-login-persistencia/scripts/test-db-persistence.js ./scripts/
node scripts/test-db-persistence.js
# reiniciar o servidor
PORT=8080 node server/index.js
```
