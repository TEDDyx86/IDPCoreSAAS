import os
import re
import time
import google.generativeai as genai
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# --- Configurações Gemini ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
    except Exception as e:
        print(f" [!] Erro ao configurar Gemini: {e}")

# --- Configurações Groq ---
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

def resumir_com_groq(titulo, disciplina, texto_extra=""):
    """Backup: Gera resumo usando Groq (Llama-3 70B)"""
    if not GROQ_API_KEY:
        print(" [!] ERRO: GROQ_API_KEY não encontrada nos segredos do GitHub.")
        return None

    try:
        client = Groq(api_key=GROQ_API_KEY)
        print(f" [GROQ] Iniciando processamento de backup (Llama-3 70B)...")
        
        prompt = f"""
        TAREFA: Gere um guia de estudo e um quiz estruturado para '{titulo}' ({disciplina}).
        CONTEÚDO: {texto_extra[:15000]}
        
        RETORNO: JSON PURO (summary, quiz).
        """

        completion = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        return completion.choices[0].message.content
    except Exception as e:
        print(f" [!] Erro no Groq Backup: {e}")
        return None

def resumir_item_premium(titulo, disciplina, texto_extra=""):
    """
    Gera um guia de estudo completo e um QUIZ estruturado.
    LÓGICA HÍBRIDA: Tenta Gemini -> Se QUALQUER erro -> Tenta Groq (Failover Universal).
    """
    if not GEMINI_API_KEY and not GROQ_API_KEY:
        return '{"summary": "Nenhuma IA configurada no ambiente (Secrets).", "quiz": []}'

    # Configuração de Segurança Gemini
    safety_settings = [
        {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
        {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
        {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
        {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
    ]

    # 1. TENTATIVA COM GEMINI
    if GEMINI_API_KEY:
        try:
            print(f" [IA] Tentando processar com Gemini (models/gemini-1.5-flash)...")
            model = genai.GenerativeModel('models/gemini-1.5-flash')
            
            prompt = f"""
            TAREFA: Como Mentor Acadêmico, gere um guia de estudo e 5 questões de quiz para '{titulo}' ({disciplina}).
            CONTEÚDO: {texto_extra[:25000]}
            RETORNO: JSON PURO (summary, quiz).
            """
            
            response = model.generate_content(prompt, safety_settings=safety_settings)
            
            if response and response.candidates:
                text = response.text
                if "```json" in text:
                    text = text.split("```json")[1].split("```")[0].strip()
                elif "```" in text:
                    text = text.split("```")[1].split("```")[0].strip()
                
                if "{" in text and "}" in text:
                    print(" [+] Sucesso via Gemini.")
                    return text[text.find('{'):text.rfind('}')+1]
        except Exception as e:
            print(f" [!] Falha no Gemini: {e}")
            print(" [-->] Ativando Failover Automático para Groq...")

    # 2. FAILOVER AUTOMÁTICO PARA GROQ (Executa se Gemini falhar ou não estiver disponível)
    if GROQ_API_KEY:
        backup_res = resumir_com_groq(titulo, disciplina, texto_extra)
        if backup_res:
            print(" [+] Sucesso via Groq (Resiliência Ativada).")
            return backup_res

    return '{"summary": "Erro crítico: Todas as engines de IA falharam ou não possuem chaves válidas.", "quiz": []}'

def processar_com_gemini(texto, nome_arquivo):
    """Mantido para compatibilidade legado"""
    if not GEMINI_API_KEY: return {"classe": "ADMIN", "resumo_detalhado": "IA Offline."}
    try:
        model = genai.GenerativeModel('models/gemini-1.5-flash')
        response = model.generate_content(f"Sintetize em JSON: {texto[:10000]}")
        return {"classe": "MATERIAL", "resumo_detalhado": response.text}
    except: return {"classe": "ADMIN", "resumo_detalhado": "Erro."}
