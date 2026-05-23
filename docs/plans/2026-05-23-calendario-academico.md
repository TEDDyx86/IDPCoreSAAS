# Calendário Acadêmico via Planos de Ensino - Plano de Desenvolvimento

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Extrair de forma automática datas de provas e atividades dos arquivos de Plano de Ensino das matérias do Canvas e exibi-las em uma visualização de calendário no dashboard.

**Architecture:** O monitor do Canvas intercepta arquivos que contêm "Plano de Ensino". O orquestrador baixa o binário temporariamente, extrai o texto bruto via PyMuPDF/python-docx e o Gemini realiza o parse estruturado das datas em JSON. Os dados são persistidos na nova tabela `academic_calendar` no Supabase e consumidos em tempo real pelo dashboard em um componente React estilizado.

**Tech Stack:** Python (PyMuPDF/fitz, Canvas API, Gemini SDK), SQL (Supabase/PostgreSQL), React (TypeScript, Vite, Lucide React).

---

### Task 1: Banco de Dados (Supabase DDL)

**Files:**
- Modify: `supabase_setup.sql:64`

**Step 1: Escrever DDL e Políticas de RLS para a tabela `academic_calendar`**
Adicionar o bloco abaixo ao final de `supabase_setup.sql`:
```sql
-- Tabela de Calendário Acadêmico
create table if not exists public.academic_calendar (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  disciplina text not null,
  titulo text not null,
  descricao text,
  tipo text check (tipo in ('PROVA', 'TRABALHO', 'ATIVIDADE', 'APRESENTACAO', 'OUTRO')),
  data_evento date not null,
  created_at timestamp with time zone default now()
);

-- Políticas RLS
alter table public.academic_calendar enable row level security;

drop policy if exists "Users can manage their own calendar" on public.academic_calendar;
create policy "Users can manage their own calendar" on public.academic_calendar
  for all using (auth.uid() = user_id);

drop policy if exists "Service role full access on calendar" on public.academic_calendar;
create policy "Service role full access on calendar" on public.academic_calendar
  to service_role using (true) with check (true);
```

**Step 2: Rodar o script DDL no console do Supabase**
- Instruir o usuário a executar o script SQL acima no SQL Editor do painel do Supabase para atualizar a infraestrutura de dados.

---

### Task 2: Classificação e Coleta de Itens do Canvas

**Files:**
- Modify: `execution/canvas_api_handler.py:10-25`
- Modify: `execution/canvas_api_handler.py:28-60`

**Step 1: Ajustar classificação para planos de ensino**
Modificar `classificar_item` para que retorne `"PLANO_ENSINO"` se o título contiver termos associados a planos de ensino (ao invés de `"ADMIN"`).
```python
# Em canvas_api_handler.py
def classificar_item(titulo: str, canvas_type: str) -> str:
    titulo_lower = titulo.lower()
    
    # Se contiver plano de ensino, ementa ou cronograma, classifica como PLANO_ENSINO
    plano_kws = ["plano de ensino", "plano de aula", "ementa", "cronograma de atividades", "cronograma da disciplina"]
    for kw in plano_kws:
        if kw in titulo_lower:
            return "PLANO_ENSINO"
            
    # Lógica antiga...
```

---

### Task 3: Integração do Supabase Handler

**Files:**
- Modify: `execution/supabase_handler.py`

**Step 1: Adicionar funções de gerenciamento de dados de calendário**
Escrever as rotas de upsert e delete-insert para evitar duplicidade de cronograma na mesma disciplina.
```python
    def save_calendar_events(self, user_id, disciplina, events):
        """Limpa eventos antigos daquela disciplina e insere os novos extraídos"""
        # 1. Limpeza
        del_url = f"{self.base_url}/academic_calendar?user_id=eq.{user_id}&disciplina=eq.{disciplina}"
        requests.delete(del_url, headers=self.headers)
        
        # 2. Inserção em lote
        if not events:
            return
            
        ins_url = f"{self.base_url}/academic_calendar"
        payloads = []
        for e in events:
            payloads.append({
                "user_id": user_id,
                "disciplina": disciplina,
                "titulo": e["titulo"],
                "descricao": e.get("descricao", ""),
                "tipo": e.get("tipo", "ATIVIDADE"),
                "data_evento": e["data_evento"]
            })
        
        response = requests.post(ins_url, headers=self.headers, json=payloads)
        return response.status_code in [200, 201]
```

---

### Task 4: Parser do Gemini para Plano de Ensino

**Files:**
- Modify: `execution/gerenciar_ia.py`

**Step 1: Adicionar o prompt e a função de extração acadêmica de cronogramas**
```python
ONYX_CALENDAR_PROMPT = """
Você é o 'Onyx Academic Planner', especialista em analisar planos de ensino e extrair calendários acadêmicos.
Sua tarefa é analisar o texto do Plano de Ensino da disciplina '{disciplina}' e listar todas as datas de avaliações, provas, trabalhos e entregas de atividades importantes.

REGRAS:
1. Extraia apenas avaliações e datas de entregas reais que valem nota ou exigem presença física.
2. Normalize a data para o formato 'YYYY-MM-DD'. O ano atual é 2026.
3. Classifique o tipo da atividade entre: 'PROVA', 'TRABALHO', 'ATIVIDADE', 'APRESENTACAO' ou 'OUTRO'.

RETORNO (JSON PURO):
{{
  "events": [
    {{
      "titulo": "Nome da avaliação (ex: Prova Escrita 1)",
      "tipo": "PROVA",
      "data_evento": "2026-06-15",
      "descricao": "Detalhes curtos, peso ou capítulos cobrados se houver"
    }}
  ]
}}
"""

def extrair_cronograma_de_plano(titulo, disciplina, texto_plano):
    """Utiliza Gemini para analisar plano de ensino e retornar estrutura JSON de eventos"""
    if not GEMINI_API_KEY:
        return {"events": []}
    
    prompt = ONYX_CALENDAR_PROMPT.format(disciplina=disciplina, texto_plano=texto_plano[:40000])
    try:
        response = client_gemini.models.generate_content(model="gemini-1.5-flash", contents=prompt)
        if response and response.text:
            cleaned = limpar_json_ia(response.text)
            return json.loads(cleaned)
    except Exception as e:
        print(f"Erro ao extrair calendário por IA: {e}")
    return {"events": []}
```

---

### Task 5: Orquestração e Extração de Texto de Arquivos

**Files:**
- Modify: `execution/multi_user_orchestrator.py`

**Step 1: Escrever rotina de download e extração local de arquivos binários**
Adicionar suporte para ler PDFs com PyMuPDF (`fitz`) e DOCX com `python-docx`.
```python
import fitz  # PyMuPDF
import docx

def extrair_texto_de_arquivo_local(caminho_arquivo):
    ext = caminho_arquivo.split('.')[-1].lower()
    texto = ""
    if ext == 'pdf':
        try:
            doc = fitz.open(caminho_arquivo)
            for page in doc:
                texto += page.get_text()
            doc.close()
        except Exception as e:
            print(f"Erro PyMuPDF: {e}")
    elif ext in ['docx', 'doc']:
        try:
            doc = docx.Document(caminho_arquivo)
            texto = "\n".join([p.text for p in doc.paragraphs])
        except Exception as e:
            print(f"Erro DOCX: {e}")
    return texto
```

**Step 2: Integrar o fluxo de processamento de PLANO_ENSINO no loop principal**
- Se `categoria == "PLANO_ENSINO"`:
  - Fazer download do arquivo binário na pasta temporária `.tmp/downloads/plano_<id>.<ext>`.
  - Ler texto bruto do arquivo usando `extrair_texto_de_arquivo_local`.
  - Chamar `extrair_cronograma_de_plano` do Gemini.
  - Salvar os eventos no Supabase usando `save_calendar_events`.
  - Excluir o arquivo temporário.

---

### Task 6: Criação do Componente React `AcademicCalendar`

**Files:**
- Create: `dashboard/src/components/AcademicCalendar.tsx`

**Step 1: Criar o componente de calendário estético com Glassmorphism**
- Desenhar uma interface que liste os eventos em linha do tempo cronológica agrupados por disciplina ou ordenados por data.
- Usar badges coloridas para identificar provas (Red), trabalhos (Cyan) e apresentações (Purple).
- Adicionar cálculo em dias: "Faltam X dias".

---

### Task 7: Integração no App React

**Files:**
- Modify: `dashboard/src/App.tsx`

**Step 1: Mapear consulta de dados do calendário via Supabase**
- Realizar chamada de API `supabase.from('academic_calendar').select('*')` e armazenar no estado `calendarEvents`.
- Renderizar o componente `AcademicCalendar` como um painel central sob um novo seletor de guias ("Aulas/Resumos" vs "Calendário Provas").
