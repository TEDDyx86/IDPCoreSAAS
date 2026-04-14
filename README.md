# IDP Core Academic Monitor 🎓✨

O seu assistente acadêmico inteligente de alto nível. Este projeto automatiza o monitoramento de portais Canvas e repositórios GitHub, baixando materiais, classificando-os e gerando resumos didaticamente fundamentados usando a **IA Gemini 1.5 Flash**.

## 🚀 Funcionalidades

- **Zero Configuration (Autodescoberta)**: No primeiro acesso, o robô identifica suas matérias do semestre automaticamente no Canvas e configura o sistema para você.
- **Monitoramento Híbrido**: Verifica novos commits no GitHub e novos itens nos Módulos do Canvas.
- **Download Inteligente**: Captura arquivos (.pdf, .ppt) ignorando o overhead do navegador via requisições HTTP rápidas.
- **Motor de IA "Professor Mentor"**: 
    - **Classificação por Intenção**: Diferencia automaticamente entre Slides Teóricos e Atividades Práticas.
    - **Resumos Duplos**: Gera tópicos rápidos e explicações didáticas aprofundadas.
    - **Persona Didática**: A IA explica o "porquê" dos conceitos, não apenas os fatos.
- **Exportação Multiformato**: Gera automaticamente arquivos `.txt` e `.docx` organizados por disciplina.
- **Notificações em Tempo Real**: Alertas visuais no Discord via Webhook com cores dinâmicas.

## 🏗️ Arquitetura

O projeto segue um protocolo de **Auto-cura (Auto-anneal)** e uma estrutura de 3 camadas:
1. **Verificação**: Scripts que detectam mudanças no DOM e APIs.
2. **Execução**: Motor de download e processamento de documentos.
3. **Distribuição**: Gerenciamento de notificações e persistência física.

## 🛠️ Configuração Rápida (Windows)

1. **Prepare as credenciais**:
   - Renomeie o arquivo `.env.example` para `.env`.
   - Preencha com sua **API Key do Gemini** e seu login do **Canvas**.

2. **Dê um duplo clique**:
   - Execute o arquivo `run.bat`.
   - O robô irá instalar as dependências, buscar suas matérias automaticamente e começar o monitoramento!

---

## 🛠️ Configuração Manual (Outros Sistemas)

1. **Instale as dependências**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Execute o orquestrador**:
   ```bash
   python orchestrator.py
   ```

## 📂 Estrutura de Pastas

- `execution/`: Scripts de núcleo do sistema.
- `resumos/`: (Ignorado no Git) Onde seus arquivos `.docx` e `.txt` são salvos.
- `.tmp/`: Cache de sessão, cookies e metadados.

---
*Desenvolvido com o protocolo IDP Core para Excelência Acadêmica.*
