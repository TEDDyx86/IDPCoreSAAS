import os
import time
import hashlib
from google import genai
from groq import Groq
import requests
import json
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

# --- Configurações OpenRouter ---
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# --- TEMPLATE DE PROMPT ACADÊMICO (ONYX MENTOR) ---
ONYX_PROMPT_TEMPLATE = """
VOCÊ É O 'ONYX MENTOR', UM ASSISTENTE ACADÊMICO DE NÍVEL PHD.
Sua missão é transformar o conteúdo bruto fornecido em uma experiência de aprendizado profunda e estruturada.

TAREFA:
1. Explore o tema '{titulo}' da disciplina '{disciplina}' com rigor acadêmico.
2. Crie um GUIA DE ESTUDO COMPLETO em Markdown Estético (use tabelas para comparações, tópicos para conceitos e negrito para termos técnicos).
3. O Guia deve conter:
   - [VISÃO GERAL]: Um parágrafo contextualizando a importância do tema.
   - [CONCEITOS CHAVE]: Explicações profundas dos pilares do conteúdo.
   - [APLICAÇÃO PRÁTICA]: Como isso se aplica no mercado ou na vida real.
   - [DICA DO MENTOR]: Um insight exclusivo sobre como dominar esse assunto.
4. Elabore 5 QUESTÕES DE QUIZ de nível moderado a difícil para fixação.

CONTEÚDO PARA ANÁLISE:
{conteudo}

FORMATO DE RETORNO (JSON PURO):
{{
  "summary": "Resumo completo em Markdown...",
  "quiz": [
    {{
      "question": "Pergunta 1?",
      "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
      "correct_index": 0
    }},
    ... (total 5)
  ]
}}
"""

def limpar_json_ia(text):
    """Remove blocos de código Markdown e extrai apenas o conteúdo JSON."""
    if not text:
        return None
    
    # Remove blocos de código markdown se existirem
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0].strip()
    elif "```" in text:
        text = text.split("```")[1].split("```")[0].strip()
    
    # Tenta encontrar o primeiro { e o último } para garantir que pegamos apenas o objeto
    start = text.find("{")
    end = text.rfind("}")
    
    if start != -1 and end != -1:
        return text[start:end+1]
    return text.strip()

def resumir_com_groq(titulo, disciplina, texto_extra=""):
    """Backup: Gera resumo usando Groq (Llama-3 70B)"""
    if not GROQ_API_KEY:
        print(" [!] ERRO: GROQ_API_KEY não encontrada nos segredos do GitHub.")
        return None

    try:
        client = Groq(api_key=GROQ_API_KEY)
        print(f" [GROQ] Iniciando processamento de backup (Llama-3 70B)...")
        
        prompt = ONYX_PROMPT_TEMPLATE.format(
            titulo=titulo,
            disciplina=disciplina,
            conteudo=texto_extra[:20000] # Expandido para 20k tokens
        )

        # Modelo atualizado para llama-3.3-70b-versatile (mais estável e potente)
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        return limpar_json_ia(completion.choices[0].message.content)
    except Exception as e:
        print(f" [!] Erro no Groq Backup: {e}")
        return None

def resumir_com_openrouter(titulo, disciplina, texto_extra=""):
    """Terceira linha de defesa: OpenRouter (Llama-3 70B via Multi-Provider)"""
    if not OPENROUTER_API_KEY:
        print(" [!] Ignorando OpenRouter: API Key não configurada.")
        return None

    try:
        print(f" [OPENROUTER] Ativando reserva final (Llama-3 70B)...")
        
        prompt = ONYX_PROMPT_TEMPLATE.format(
            titulo=titulo,
            disciplina=disciplina,
            conteudo=texto_extra[:20000]
        )

        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "HTTP-Referer": "https://github.com/TEDDyx86/IDPCoreSAAS", # Necessário para OpenRouter
                "X-Title": "Onyx Academic Mentor",
            },
            data=json.dumps({
                "model": "meta-llama/llama-3-70b-instruct", # Escolha robusta
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.7
            })
        )

        if response.status_code == 200:
            result = response.json()
            return limpar_json_ia(result['choices'][0]['message']['content'])
        else:
            print(f" [!] Erro OpenRouter (Status {response.status_code}): {response.text}")
            return None
    except Exception as e:
        print(f" [!] Falha crítica no OpenRouter: {e}")
        return None

def resumir_item_premium(titulo, disciplina, texto_extra=""):
    """
    Gera guia de estudo + quiz. Retorna tupla (json_str, model_used).
    Hierarquia: Gemini -> Groq -> OpenRouter.
    """
    if not GEMINI_API_KEY and not GROQ_API_KEY:
        return '{"summary": "Nenhuma IA configurada no ambiente (Secrets).", "quiz": []}', "none"

    # 1. GEMINI
    if client_gemini:
        try:
            print(f" [IA] Tentando processar com Gemini (gemini-1.5-flash)...")
            prompt = ONYX_PROMPT_TEMPLATE.format(
                titulo=titulo,
                disciplina=disciplina,
                conteudo=texto_extra[:30000]
            )
            try:
                response = client_gemini.models.generate_content(model="gemini-1.5-flash", contents=prompt)
            except Exception as e_inner:
                if "404" in str(e_inner):
                    response = client_gemini.models.generate_content(model="models/gemini-1.5-flash", contents=prompt)
                else:
                    raise e_inner

            if response and response.text:
                text = limpar_json_ia(response.text)
                if text and "{" in text and "}" in text:
                    print(f" [+] Sucesso via Gemini para: {titulo}")
                    return text, "gemini-1.5-flash"
                raise ValueError("Resposta do Gemini sem JSON válido.")

        except Exception as e:
            print(f" [!] Falha no Gemini: {e} — ativando Groq...")

    # 2. GROQ
    if GROQ_API_KEY:
        backup_res = resumir_com_groq(titulo, disciplina, texto_extra)
        if backup_res:
            print(f" [+] Sucesso via Groq para: {titulo}")
            return backup_res, "groq-llama-3.3-70b"

    # 3. OPENROUTER
    if OPENROUTER_API_KEY:
        final_res = resumir_com_openrouter(titulo, disciplina, texto_extra)
        if final_res:
            print(f" [+] Sucesso via OpenRouter para: {titulo}")
            return final_res, "openrouter-llama-3-70b"

    return '{"summary": "Erro crítico: Todas as engines de IA falharam.", "quiz": []}', "failed"

def gerar_content_hash(titulo: str, disciplina: str, body_content: str) -> str:
    """Hash SHA-256 determinístico do conteúdo. Mesma matéria = mesmo hash."""
    key = f"{disciplina}::{titulo}::{body_content[:500]}"
    return hashlib.sha256(key.encode("utf-8")).hexdigest()


if __name__ == "__main__":
    print("Testando motor de IA...")
    test_res, model_usado = resumir_item_premium("Teste de Conexão", "Sistemas", "Conteúdo de teste para validar a nova SDK.")
    print(f"Modelo usado: {model_usado}")
    print(test_res[:200])
