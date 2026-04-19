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
    Gera um guia de estudo completo no estilo NotebookLM.
    Foca em Pedagogia, Retenção e Conexão de Conhecimento.
    """
    if not GEMINI_API_KEY:
        return "IA não configurada."

    # Usamos o alias latest para garantir compatibilidade com a chave do usuário
    model = genai.GenerativeModel('gemini-flash-latest')
    
    prompt = f"""
    PERSONA: Mentor Acadêmico de Elite (Estilo NotebookLM).
    CONTEXTO: O aluno recebeu um novo material chamado '{titulo}' na disciplina de '{disciplina}'.
    CONTEÚDO ADICIONAL: {texto_extra[:20000]}

    TAREFA: Gere um GUIA DE ESTUDO MAGISTRAL seguindo EXATAMENTE esta estrutura Markdown:

    # 💎 RESUMO MAGISTRAL
    (Um texto denso, fluido e profundo sobre o tema. Não use bullet points aqui. Escreva como um capítulo de livro de alto nível.)

    # 📚 GLOSSÁRIO DO ESPECIALISTA
    - **Termo 1**: Definição técnica e simplificada.
    - **Termo 2**: Definição técnica e simplificada.

    # 🧠 DESAFIO DE FIXAÇÃO (QUIZ)
    1. [Pergunta instigante sobre o tema?]
    2. [Pergunta de aplicação prática?]

    # 🔗 CONEXÕES ONYX
    (Explique como este assunto se conecta com a carreira de tecnologia e o que o aluno deve estudar a seguir para se aprofundar.)

    REGRAS:
    - Use um tom inspirador e técnico.
    - Mínimo de 600 palavras no total.
    - Idioma: Português do Brasil.
    """
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Erro no Resumo Premium: {e}")
        # Fallback para o Flash se o Pro falhar ou não estiver disponível
        try:
            model_flash = genai.GenerativeModel('gemini-1.5-flash')
            response = model_flash.generate_content(prompt)
            return response.text
        except:
            return "O motor de IA está processando muitos dados. Tente novamente em breve."

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
