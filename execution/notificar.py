import os
import requests
import json
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

DISCORD_WEBHOOK_URL = os.getenv("DISCORD_WEBHOOK_URL")

def enviar_notificacao(titulo, descricao, url=None, campos=None, cor=3447003):
    if not DISCORD_WEBHOOK_URL or "webhook" not in DISCORD_WEBHOOK_URL:
        print("Erro: Webhook do Discord não configurado no .env")
        return False
    
    payload = {
        "username": "Monitor Acadêmico IDP",
        "avatar_url": "https://ambientevirtual.idp.edu.br/accounts/1/files/1106739/download",
        "embeds": [{
            "title": titulo,
            "description": descricao,
            "url": url,
            "color": cor,
            "timestamp": datetime.utcnow().isoformat(),
            "footer": {
                "text": "IDP Core AI Academic Agent • Auto-anneal Protocol"
            }
        }]
    }

    if campos:
        payload["embeds"][0]["fields"] = campos

    try:
        response = requests.post(DISCORD_WEBHOOK_URL, json=payload)
        response.raise_for_status()
        return True
    except Exception as e:
        print(f"Erro ao enviar para Discord: {e}")
        return False

def notificar_item_ia(item):
    """Envia uma notificação detalhada com os resumos da IA para um item específico"""
    ia = item.get("ia_processado")
    if not ia:
        return

    cor = 15158332 if ia["classe"] == "ATIVIDADE" else 3447003 # Laranja para Atividade, Azul para Slides
    
    campos = [
        {"name": "📝 Resumo Rápido", "value": ia["resumo_topicos"][:1024], "inline": False},
        {"name": "📖 Detalhes", "value": ia["resumo_detalhado"][:1024], "inline": False}
    ]
    
    if ia.get("prazos_detectados"):
        campos.append({"name": "📅 Prazos/Datas", "value": f"**{ia['prazos_detectados']}**", "inline": False})

    enviar_notificacao(
        titulo=f"✨ {ia['classe']}: {item['nome']}",
        descricao=f"Disciplina: **{item['disciplina_nome']}**",
        url=item["url"],
        campos=campos,
        cor=cor
    )

def notificar_novos_materiais(arquivos):
    """Agrupa e envia notificações de arquivos novos"""
    if not arquivos:
        return
    
    campos = []
    for arq in arquivos[:10]: # Limita a 10 para o embed não ficar gigante
        campos.append({
            "name": arq["disciplina_nome"],
            "value": f"📄 [{arq['nome']}]({arq['url']})",
            "inline": False
        })
    
    extra = f"\n... e mais {len(arquivos) - 10} itens." if len(arquivos) > 10 else ""
    
    enviar_notificacao(
        titulo="📌 Novos Materiais Detectados!",
        descricao=f"Foram encontrados {len(arquivos)} novos itens nos módulos do Canvas.{extra}",
        campos=campos
    )

if __name__ == "__main__":
    # Teste rápido se rodar o script diretamente
    enviar_notificacao("Teste de Sistema", "O monitor acadêmico foi conectado com sucesso!")
