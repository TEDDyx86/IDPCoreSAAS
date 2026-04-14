import json
import os
from datetime import datetime

# Caminhos de entrada
MODULOS_PATH = ".tmp/modulos_detectados.json"
CONFIG_PATH = "config.json"

# Caminho de saída (Dashboard)
OUTPUT_PATH = "dashboard/src/data/db.json"

def exportar():
    print("\n[Export] Consolidando dados para o Dashboard...")
    
    if not os.path.exists(MODULOS_PATH):
        print("!!! Nenhum dado de módulo encontrado para exportar.")
        return

    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        config = json.load(f)
        
    with open(MODULOS_PATH, "r", encoding="utf-8") as f:
        modulos = json.load(f)

    # Preparamos o objeto final
    dashboard_db = {
        "metadados": {
            "ultima_atualizacao": datetime.now().isoformat(),
            "instituicao": config.get("instituicao", "IDP"),
            "total_disciplinas": len(config.get("disciplinas", [])),
            "total_materiais": len(modulos)
        },
        "disciplinas": config.get("disciplinas", []),
        "historico": []
    }

    # Formatamos o histórico de materiais para o formato do Dashboard
    for item in modulos:
        # Se tiver IA, usamos os dados reais, senão usamos placeholders amigáveis
        ia = item.get("ia_processado", {})
        
        entry = {
            "id": item.get("id"),
            "data": item.get("data_descoberta", datetime.now().strftime("%d/%m/%Y")),
            "disciplina": item.get("disciplina_nome"),
            "titulo": item.get("nome"),
            "tipo": ia.get("classe", "MATERIAL"),
            "status": "PROCESSADO" if "ia_processado" in item else "PENDENTE",
            "resumo": ia.get("resumo_topicos", "Aguardando processamento da IA..."),
            "links": {
                "original": item.get("url"),
                "resumo_docx": f"/resumos/{item.get('disciplina_nome')}/{item.get('id')}_Resumo_PRO.docx".replace(" ", "%20")
            }
        }
        dashboard_db["historico"].append(entry)

    # Inverte a ordem para mostrar os mais novos primeiro
    dashboard_db["historico"].reverse()

    # Salva no diretório do Dashboard
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(dashboard_db, f, indent=2, ensure_ascii=False)
        
    print(f"  -> Sucesso! Dados exportados para {OUTPUT_PATH}")

if __name__ == "__main__":
    exportar()
