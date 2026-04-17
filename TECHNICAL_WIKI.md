# 📖 IDP Core: Wiki Técnica Mestre

Este documento é a referência única de verdade para a arquitetura, operação e manutenção do ecossistema **IDP Core**.

---

## 1. Arquitetura e Filosofia (Three-Layer Model)

O projeto é estruturado em três camadas distintas para garantir resiliência contra as incertezas da IA e as mudanças frequentes em plataformas web.

### 🏛️ Layer 1: Diretivas (Intenção)
- **Onde**: `/directives/`
- **O que são**: Documentos Markdown que atuam como SOPs (Procedimentos Operacionais Padrão).
- **Função**: Definem o "estado de sucesso" e os passos lógicos. Exemplos: `monitorar_plataforma.md`, `debug_scraping.md`.

### 🧠 Layer 2: Orquestração (Agente)
- **Onde**: `orchestrator.py`
- **O que é**: O "cérebro" do sistema.
- **Função**: Lê as diretivas e decide quais scripts da Layer 3 executar. Gerencia o fluxo entre descoberta de commits, download de materiais e geração de resumos.

### ⚙️ Layer 3: Execução (Operação)
- **Onde**: `/execution/`
- **O que são**: Scripts Python determinísticos.
- **Função**: Fazem o trabalho pesado (Web Scraping, API calls, I/O de arquivos). Se um script falha, a Layer 2 intervém.

---

## 2. Referência de Scripts (`/execution/`)

Abaixo, os motores que movem o IDP Core:

| Script | Função | Dependências Principais |
| :--- | :--- | :--- |
| `login_portal.py` | Autenticação no Canvas/IDP e persistência de cookies. | Selenium/Playwright, `.env` |
| `verificar_modulos.py` | Detecta novos arquivos em módulos do Canvas ou Ambientevirtual. | `.tmp/cookies.pkl` |
| `verificar_github.py` | Monitora repositórios de disciplinas para novos commits/materiais. | GitHub API / Git Client |
| `baixar_materiais.py` | Realiza o download físico de PDFs e Slides. | `requests` (sessão persistente) |
| `gerenciar_ia.py` | O "Professor Mentor". Gera resumos PRO (`.txt`, `.docx`) via Gemini. | `google-generativeai`, `python-docx` |
| `notificar.py` | Despacha alertas formatados para o Discord. | Discord Webhook URL |
| `exportar_dashboard.py` | Consolida metadados em `db.json` para o frontend React. | JSON parser, `os` |
| `configurador_cursos.py` | Script de setup inicial para autodescoverta de matérias. | Portal login |

---

## 3. Infraestrutura e Supabase

O projeto utiliza Supabase para persistência de longo prazo e segurança.

### 🗄️ Database Schema
O arquivo `supabase_setup.sql` define a base do sistema:
- `monitor_configs`: Configurações globais por usuário.
- `academic_updates`: Histórico completo de detecções e resumos.

### 🔐 Segurança e RLS
- **Row Level Security**: Garante que estudantes acessem apenas seus próprios dados acadêmicos.
- **Supabase Vault**: Utilizado para armazenar `canvas_token` e `github_token` de forma criptografada, evitando exposição no banco de dados.

---

## 4. Desenvolvimento do Dashboard

O Dashboard é uma SPA em React (Vite) localizada na pasta `/dashboard/`.

- **Alimentação de Dados**: O dashboard consome `dashboard/src/data/db.json`, gerado pelo script `exportar_dashboard.py`.
- **Estética**: Foco em **Dark Mode Profundo**, **Glassmorphism** e **Micro-animações**.
- **Comandos Úteis**:
  - `cd dashboard && npm install`
  - `npm run dev` (Inicia o servidor de desenvolvimento em `localhost:5173`)

---

## 🛡️ Protocolo de Resiliência (Auto-anneal)

Este é o diferencial sênior do IDP Core. Quando um script de execução quebra:
1.  **Diagnóstico**: O agente analisa o stack trace e tira um screenshot do portal.
2.  **Reparo**: O agente sugere/aplica a correção no script de execução (ex: novo seletor CSS).
3.  **Documentação**: O erro e a correção são registrados na Wiki para evitar regressões.

---
*Wiki atualizada em Abril de 2026.*
