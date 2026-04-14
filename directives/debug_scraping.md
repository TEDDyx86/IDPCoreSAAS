# Diretiva: Auto-anneal (Debug & Scraping)

## Propósito
Esta diretiva deve ser ativada sempre que um script da camada de **Execução (`execution/`)** falhar. O objetivo é realizar um diagnóstico sênior, identificar a causa raiz (geralmente mudanças no DOM ou rede) e aplicar uma correção permanente.

## Procedimento de Diagnóstico

### 1. Análise de Erro (Stack Trace)
- Identificar se o erro é:
    - `TimeoutError / ElementNotFound`: Seletor CSS ou XPath mudou.
    - `AuthenticationError`: Cookies expirados ou mudança no fluxo de login.
    - `Intercepted / Bot Detection`: O portal implementou proteções novas (WAF, Captcha).

### 2. Inspeção Visual e Estrutural
- Use a ferramenta `take_screenshot` para ver o que o navegador está exibindo.
- Use `take_snapshot` para obter a árvore de acessibilidade (A11y) e identificar novos UIDs/Seletores.
- Use `mcp_chrome-devtools-mcp_list_network_requests` para verificar se dados estão sendo carregados via XHR/Fetch que possamos consumir diretamente.

### 3. Loop de Correção (The "Anneal")
Ao identificar a mudança:
1.  **Ajuste o Script**: Modifique o script correspondente em `execution/` (ex: `login_portal.py`).
2.  **Teste Local**: Execute o script no terminal para garantir que ele retorna `Exit 0`.
3.  **Documente o Aprendizado**: Atualize a seção "Histórico de Mudanças" em `directives/monitorar_plataforma.md`.

## Protocolo de Monitoramento de Rede (XHR)
Se os seletores de UI forem muito instáveis, priorize:
- Identificar a URL do endpoint de API que o portal consome.
- Capturar os headers necessários (incluindo Cookies e Tokens).
- Propor uma mudança para um script baseado em `requests` ou `fetch`, que é mais resiliente que automação visual.

## Casos de Borda
- **Captcha**: Se encontrar um Captcha, notifique o usuário via Discord e pause a execução para intervenção manual.
- **Mudança Estrutural Crítica**: Se o portal mudar a URL base ou tecnologia (ex: migração para App Single Page complexa), peça ajuda ao usuário para mapear o novo fluxo.
