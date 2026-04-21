import os
import re
import time
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
        print(" [!] ERRO: GEMINI_API_KEY não encontrada no ambiente!")
        return '{"summary": "IA não configurada.", "quiz": []}'
    else:
        # Print de diagnóstico seguro (mostra 2 primeiros e 2 últimos caracteres)
        print(f" [OK] IA configurada. Key: {GEMINI_API_KEY[:2]}...{GEMINI_API_KEY[-2:]}")

    # Configuração de Segurança: Desativa bloqueios para evitar falsos positivos acadêmicos
    safety_settings = [
        {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
        {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
        {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
        {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
    ]

    model = genai.GenerativeModel('gemini-flash-latest')
    
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
    
    max_retries = 3
    text = ""
    
    for attempt in range(max_retries):
        try:
            response = model.generate_content(prompt, safety_settings=safety_settings)
            
            # Diagnóstico de BLOQUEIO
            if not response.candidates:
                print(f" [!] Erro IA: Nenhum candidato retornado. Feedback: {response.prompt_feedback}")
                return '{"summary": "Erro: Resposta Bloqueada pela IA.", "quiz": []}'

            text = response.text
            break # Sucesso, sai do loop de retry
        except Exception as e:
            err_msg = str(e)
            if "429" in err_msg or "quota" in err_msg.lower():
                wait_time = 15 * (attempt + 1)
                print(f" [!] Cota excedida (429). Tentativa {attempt+1}/{max_retries}. Aguardando {wait_time}s...")
                time.sleep(wait_time)
            elif "500" in err_msg or "503" in err_msg:
                print(f" [!] Erro de servidor (50x). Aguardando 5s...")
                time.sleep(5)
            else:
                print(f" [!] Erro crítico na IA: {e}")
                return '{"summary": "Erro no processamento da IA.", "quiz": []}'
            
            if attempt == max_retries - 1:
                print(" [!] Esgotadas as tentativas de re-processamento por cota.")
                return '{"summary": "Erro de cota na IA (429).", "quiz": []}'

    # Processamento do texto (fora do loop de retry)
    if not text:
        return '{"summary": "IA retornou vazio.", "quiz": []}'

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
