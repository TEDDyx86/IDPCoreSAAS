import os
import re
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def resumir_item_premium(titulo, disciplina, texto_extra=""):
    """
    Gera um guia de estudo completo e um QUIZ estruturado.
    Retorna uma string JSON contendo 'summary' e 'quiz'.
    """
    if not GEMINI_API_KEY:
        return '{"summary": "IA não configurada.", "quiz": []}'

    model = genai.GenerativeModel('gemini-1.5-flash')
    
    prompt = f"""
    PERSONA: Mentor Acadêmico de Elite (Estilo NotebookLM).
    CONTEXTO: O aluno recebeu um novo material chamado '{titulo}' na disciplina de '{disciplina}'.
    CONTEÚDO ADICIONAL: {texto_extra[:20000]}

    TAREFA: Gere um guia de estudo e um questionário de fixação.
    
    RETORNO ESPERADO: Responda APENAS em formato JSON puro.
    
    ESTRUTURA DO JSON (MUITO IMPORTANTE):
    {{
        "summary": "O guia de estudo completo em Markdown (💎 RESUMO MAGISTRAL, 📚 GLOSSÁRIO, 🔗 CONEXÕES ONYX). Use parágrafos claros, negrito (**) e listas. IMPORTANTE: Use apenas '\\n' para quebras de linha dentro do texto.",
        "quiz": [
            {{
                "question": "Pergunta 1...",
                "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
                "correct_index": 0
            }}
        ]
    }}
    Gere 5 questões no quiz.
    """
    
    try:
        response = model.generate_content(prompt)
        text = response.text
        
        # Limpeza agressiva de blocos de código
        if "```" in text:
            blocks = re.findall(r'```(?:json)?\s*(.*?)\s*```', text, re.DOTALL)
            if blocks:
                text = blocks[0]
        
        # Busca o primeiro '{' e o último '}' para garantir JSON puro
        start = text.find('{')
        end = text.rfind('}')
        if start != -1 and end != -1:
            return text[start:end+1].strip()
            
        return text.strip()
    except Exception as e:
        print(f"Erro no Resumo Premium: {e}")
        return '{"summary": "Erro no processamento da IA.", "quiz": []}'

def processar_com_gemini(texto, nome_arquivo):
    """
    Processa o conteúdo textual através da IA para gerar um resumo magistral.
    MANTIDO PARA COMPATIBILIDADE COM PROCESSAMENTO DE ARQUIVOS.
    """
    if not GEMINI_API_KEY:
        return {"classe": "ADMIN", "resumo_detalhado": "IA não configurada."}

    model = genai.GenerativeModel('gemini-1.5-flash')
    
    prompt = f"""
    PERSONA: Professor Mentor de Alto Nível.
    TAREFA: Transformar o material abaixo em uma explicação densa, magistral e direta ao ponto.
    FOCO: Identificar o que é mais importante para um aluno de graduação em tecnologia.
    
    RETORNO: Responda APENAS em JSON:
    {{
        "classe": "SLIDE | ATIVIDADE | ADMIN | MATERIAL",
        "resumo_detalhado": "O conteúdo magistral completo, estruturado e rico em detalhes (mínimo 500 palavras)."
    }}

    DADOS DO MATERIAL ({nome_arquivo}):
    {texto[:30000]} 
    """
    
    try:
        response = model.generate_content(prompt)
        import json
        json_text = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(json_text)
    except Exception as e:
        print(f"Erro na IA para {nome_arquivo}: {e}")
        return {"classe": "ADMIN", "resumo_detalhado": f"Erro no processamento: {str(e)}"}
