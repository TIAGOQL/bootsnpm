# Painel REM

**Painel N=1 de relaxamento endocanabinoide — pesquisa pessoal, dados só no seu aparelho.**

Site estático (HTML/CSS/JS). Sem login, sem backend, sem nuvem do diário. Não é app médico nem clínica.

## Começar agora

1. [Protocolo N=1](pesquisas/protocolo-n1.html) — 4 semanas  
2. [Diário REM](pesquisas/diario-rem.html) — marcar o dia · **Salvar** · **Exportar JSON**  
3. [Tônus](pesquisas/musica-tonus.html) — áudio de estudo  
4. [Cultivo de ideias](pesquisas/cultivo-ideias.html) — plantar dúvidas  
5. [Checklist do dono](pesquisas/checklist-dono.html) — hábito semanal + backup  

Se a cabeça pesou: [Sinais](pesquisas/sinais.html) → [Higiene mental](pesquisas/higiene-mental.html) (M0).

```shell
npm start
```

Abre http://localhost:3000

## Núcleo vs resto

| Núcleo (usar todo dia) | Fora do fluxo diário |
| --- | --- |
| Protocolo, Diário, Tônus, Cultivo | Biblioteca / cultivo expandido |
| Mapa REM, Endocanabinoidoma, Sementinha | Poesia, filmes, inspeções de stack |
| Checklist do dono, dados pessoais | Homenagens e palavras avulsas |

Fotos dos cards: `assets/img/card-*.jpg`.

## Dados pessoais

- **Só no aparelho** (`localStorage`): Diário REM, cultivo local, volume do áudio, data do último export.  
- **Público (Git / Pages):** páginas, mapa, poesias, ideias em `cultivo/ideias/`.  
- **Backup:** no Diário, **Exportar JSON** toda semana. Quem não exporta e limpa o navegador perde o histórico.

Detalhe: [pesquisas/seguranca-dados-pessoais.html](pesquisas/seguranca-dados-pessoais.html).

## Nome do repositório

Opcional. O código vive em `TIAGOQL/bootsnpm`. Se não conseguir entrar na conta GitHub, **ignore o rename** — o painel funciona igual.

Se um dia entrar: Settings → General → Repository name → `painel-rem`, e confirme Pages → GitHub Actions.

Site: https://tiagoql.github.io/bootsnpm/

## Plantar ideia

- No canteiro do painel, ou  
- `cultivo/ideias/<slug>.md` pelo `_modelo.md`, ou  
- no Cursor: `planta no cultivo: …`

## Publicação

Deploy via GitHub Actions em `main`.

**Uma vez só:** Settings → Pages → Source: **GitHub Actions**.  
Sem isso o workflow de Pages falha.

## Testes

```shell
npm test
node --check assets/js/diario-rem.js
node --check assets/js/cultivo-ideias.js
node --check assets/js/musica-rem.js
```
