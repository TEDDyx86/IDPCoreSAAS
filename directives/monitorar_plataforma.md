# Diretiva: Monitorar Plataforma Acadêmica

## Objetivo
Acessar o portal do aluno, verificar a seção de arquivos, baixar novos materiais postados, notificar o usuário via Discord e gerar resumos inteligentes.

## Entradas
- `USUARIO_FACUL`: Usuário do portal (vindo do `.env`).
- `SENHA_FACUL`: Senha do portal (vindo do `.env`).
- `ULTIMA_VERIFICACAO`: Data da última execução (armazenada em `.tmp/status.json`).

## Ferramentas de Execução
1. `execution/login_portal.py`: Realiza a autenticação e gerencia cookies.
2. `execution/verificar_novos_arquivos.py`: Compara arquivos no portal com `.tmp/arquivos_baixados.json`.
3. `execution/baixar_arquivo.py`: Faz o download para `.tmp/downloads/`.
4. `execution/notificar_discord.py`: Envia alertas sobre novos materiais.
5. `execution/gerar_resumo_ia.py`: Processa o conteúdo e gera resumos.
6. `execution/salvar_localmente.py`: Organiza os arquivos na pasta final de destino.

## Fluxo de Trabalho
1. Executar login e persistir sessão.
2. Navegar até a lista de materiais/arquivos.
3. Extrair metadados dos arquivos e filtrar os novos.
4. Para cada item novo:
    - Baixar o arquivo.
    - Notificar via Discord.
    - Extrair texto e gerar resumo via IA.
    - Mover arquivo original e resumo para a estrutura de pastas da disciplina.
5. Atualizar `.tmp/status.json` com a data atual.

## Tratamento de Erros
- **Falha no Login**: Tentar novamente. Se persistir, notificar erro no Discord e encerrar.
- **Mudança de Layout**: Se seletores CSS ou fluxos falharem, ativar imediatamente o protocolo de **[Auto-anneal (Debug & Scraping)](file:///c:/Users/Administrator/Documents/GitHub/antigravity/directives/debug_scraping.md)** para diagnosticar e corrigir os scripts em `execution/`.
- **Arquivo já existente**: Ignorar e prosseguir para o próximo.
