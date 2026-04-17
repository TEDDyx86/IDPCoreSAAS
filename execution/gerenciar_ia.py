import os
import re
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def processar_com_gemini(texto, nome_arquivo):
    """
    Processa o conteúdo textual através da IA para gerar um resumo magistral.
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

def resumir_item_simples(titulo, disciplina):
    """Fallback quando não temos o conteúdo do arquivo, apenas o título do módulo."""
    prompt = f"Gere uma pequena introdução sobre o que provavelmente se trata o material '{titulo}' na disciplina de '{disciplina}'. Retorne um texto de 3-4 parágrafos focados em fundamentos."
    if not GEMINI_API_KEY: return "IA não configurada."
    
    model = genai.GenerativeModel('gemini-1.5-flash')
    try:
        response = model.generate_content(prompt)
        return response.text
    except:
        return "Resumo indisponível no momento."
