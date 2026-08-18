# Retirar Netlify — correr local como antes

Repo: **tqltql-max/ProjectBudGanja**

## O que muda
- Apaga `netlify.toml` e `netlify/functions/*`
- Store só SQL local (+ uploads em disco)
- Remove dependência `@netlify/blobs`
- README: `npm start` e `npm run deploy:online` (Cloudflare)

## Aplicar
```bash
cd ProjectBudGanja
git am path/to/0001-retirar-netlify.patch
# ou: git apply ...
npm install
cp -n .env.example .env
npm run db:migrate
npm start
# http://localhost:8080
```

No PC Windows (como antes):
```powershell
npm run deploy:online
# ou .\deploy\start-site.ps1
```

**No painel Netlify:** desligar o site / apagar o site ligado a este repo (DNS volta para o túnel Cloudflare se já tiveres `fix-dns.ps1`).
