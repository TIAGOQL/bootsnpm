# Segurança dos dados pessoais

Para quem chega de fora. 2026-08-04.  
Do que se trata o Painel REM e onde ficam (ou não) os dados.

## O que é este projeto

Site estático de **Relaxamento Endocanabinoide Modular** (REM): protocolo N=1, diário, cultivo de ideias, música Tônus, mapa M0–M8 + M4.1, pesquisas e poesias.

Não é app médico. Não é clínica. Não é rede social. Não há login.

## Arquitetura (por que importa para privacidade)

- Só front-end (HTML/CSS/JS).  
- Hospedagem: GitHub Pages (arquivos públicos do repo).  
- Sem backend, sem banco, sem API que receba diário ou cultivo local.

## O que fica no aparelho

| Chave | Onde | Conteúdo |
| --- | --- | --- |
| `rem-diario-v1` | Diário REM | Marcas N=1 do dia |
| `rem-cultivo-v1` | Cultivo (navegador) | Ideias plantadas localmente |
| `rem-music-volume` | Tônus / painel | Volume do áudio |

Isso vive em `localStorage`. Não sobe para o servidor do projeto.

## O que é público

- Páginas em `pesquisas/`, `poemas/`, `index.html`  
- Ideias permanentes em `cultivo/ideias/*.md` (Git)  
- Scripts e imagens em `assets/`

Quem abre o site ou clona o repositório vê o mesmo conteúdo estático.  
Não committe no Git o que deveria ficar só no diário pessoal.

## Backup e perda

- **Exportar JSON** no Diário = backup sob seu controle.  
- Limpar dados do site / trocar de aparelho sem export = perda do histórico.  
- Cultivo local some com o mesmo limpeza; ideias no Git permanecem.

## Lente Simplificamais (referência)

Política de Privacidade e Cookies — Simplifica+ (nov/2025), seção *Segurança dos dados pessoais*:

- Medidas técnicas e organizacionais contra acesso indevido, perda, alteração ou tratamento inadequado  
- Integridade e confidencialidade  
- Aviso em prazo legal se violação com alto impacto a direitos  
- Isenção por culpa exclusiva de terceiros ou do usuário  

**Aqui:** a medida principal é **não coletar** o registro N=1 no servidor. Você é titular do que marca; o projeto não opera esse dado em nuvem.

## Papéis LGPD (mapa mental)

| Papel | No texto Simplificamais | No Painel REM |
| --- | --- | --- |
| Titular | Pessoa dos dados | Você (diário / cultivo local) |
| Controladora | Decide o tratamento (cadastro na plataforma) | Você decide o que marca; o site não controla diário em nuvem |
| Operadora | Trata em nome do estabelecimento | Não se aplica ao diário local |

## Mapa do projeto

| Área | Onde |
| --- | --- |
| Painel | [index.html](../index.html) |
| Protocolo / Diário / Tônus | [protocolo-n1](protocolo-n1.html) · [diario-rem](diario-rem.html) · [musica-tonus](musica-tonus.html) |
| Cultivo | [cultivo-ideias](cultivo-ideias.html) · `cultivo/ideias/` |
| Mapa REM | [relaxamento-endocanabinoide](relaxamento-endocanabinoide.html) |
| Higiene / Sinais | [higiene-mental](higiene-mental.html) · [sinais](sinais.html) |
| Esta página | [seguranca-dados-pessoais.html](seguranca-dados-pessoais.html) |

## Fonte externa

[Política de Privacidade Simplificamais (PDF)](https://materiais.simplificamais.com.br/resources/SIMPLIFICAMAIS-POLITICA-DE-PRIVACIDADE.pdf) · nov/2025 · DPO: lgpd@simplificamais.com.br
