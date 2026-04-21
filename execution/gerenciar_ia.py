import os
import re
import time
from google import genai
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# --- Configurações Gemini (Nova SDK google-genai) ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client_gemini = None
if GEMINI_API_KEY:
    try:
        # A nova biblioteca utiliza genai.Client
        client_gemini = genai.Client(api_key=GEMINI_API_KEY)
    except Exception as e:
        print(f" [!] Erro ao configurar Gemini (google-genai): {e}")

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
        
        RETORNO: JSON PURO com campos 'summary' (string rica em markdown) e 'quiz' (array de objetos com question e options).
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
    LÓGICA HÍBRIDA: Tenta Gemini (google-genai) -> Se QUALQUER erro -> Tenta Groq.
    """
    if not GEMINI_API_KEY and not GROQ_API_KEY:
        return '{"summary": "Nenhuma IA configurada no ambiente (Secrets).", "quiz": []}'

    # 1. TENTATIVA COM GEMINI (New Client SDK)
    if client_gemini:
        try:
            print(f" [IA] Tentando processar com Gemini (gemini-1.5-flash)...")
            
            prompt = f"""
            TAREFA: Como Mentor Acadêmico, gere um guia de estudo profundo e 5 questões de quiz para '{titulo}' ({disciplina}).
            CONTEÚDO: {texto_extra[:20000]}
            RETORNO: JSON PURO (summary, quiz).
            O campo 'summary' deve conter o conteúdo do resumo formatado em Markdown estético.
            O campo 'quiz' deve ser um array de 5 objetos contendo 'question', 'options' (array) e 'correct_index' (0-3).
            """
            
            # Na nova SDK, o método é client.models.generate_content
            response = client_gemini.models.generate_content(
                model="gemini-1.5-flash",
                contents=prompt
            )
            
            if response and response.text:
                text = response.text
                # Limpeza de markdown de código se necessário
                if "```json" in text:
                    text = text.split("```json")[1].split("```")[0].strip()
                elif "```" in text:
                    text = text.split("```")[1].split("```")[0].strip()
                
                # Garantir que temos um JSON válido
                if "{" in text and "}" in text:
                    print(f" [+] Sucesso via Gemini para: {titulo}")
                    return text[text.find('{'):text.rfind('}')+1]
                else:
                    raise ValueError("Resposta do Gemini não contém um JSON válido.")
                    
        except Exception as e:
            print(f" [!] Falha no Gemini (google-genai): {e}")
            print(" [-->] Ativando Failover Automático para Groq...")

    # 2. FAILOVER AUTOMÁTICO PARA GROQ
    if GROQ_API_KEY:
        backup_res = resumir_com_groq(titulo, disciplina, texto_extra)
        if backup_res:
            print(f" [+] Sucesso via Groq (Resiliência Ativada) para: {titulo}")
            return backup_res

    return '{"summary": "Erro crítico: Todas as engines de IA falharam ou não possuem chaves válidas.", "quiz": []}'

if __name__ == "__main__":
    # Teste rápido se rodar diretamente
    print("Testando motor de IA...")
    test_res = resumir_item_premium("Teste de Conexão", "Sistemas", "Conteúdo de teste para validar a nova SDK.")
    print(test_res[:200])
