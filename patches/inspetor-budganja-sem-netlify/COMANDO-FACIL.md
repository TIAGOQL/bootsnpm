# Comando fácil de deploy local

No ProjectBudGanja:

```bash
npm run facil
```

Equivale a: `.env` → `npm install` → `db:migrate` → `npm start`

Abre: http://localhost:8080

Ficheiros a copiar para o repo BudGanja:
- `scripts/deploy-facil.js`
- `deploy/facil.ps1`
- em `package.json`: `"facil": "node scripts/deploy-facil.js"`
