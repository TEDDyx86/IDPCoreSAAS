import json
import os
from datetime import datetime

# Caminhos de entrada
MODULOS_PATH = ".tmp/modulos_detectados.json"
CONFIG_PATH = "config.json"
GITHUB_PATH = ".tmp/github_detectados.json"

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

    # 2. Adicionamos o histórico do GitHub se existir
    if os.path.exists(GITHUB_PATH):
        try:
            with open(GITHUB_PATH, "r", encoding="utf-8") as f:
                github_data = json.load(f)
            for disc_id, data in github_data.items():
                disc_nome = next((d["nome"] for d in config.get("disciplinas", []) if d["id"] == disc_id), "Disciplina")
                entry = {
                    "id": data.get("sha", "code")[:8],
                    "data": datetime.now().strftime("%d/%m/%Y"),
                    "disciplina": disc_nome,
                    "titulo": f"GitHub: {data.get('mensagem', '').splitlines()[0]}",
                    "tipo": "CODE",
                    "status": "REPO",
                    "resumo": f"Última atualização por {data.get('autor', 'Autor')}. Clique para abrir o repositório.",
                    "links": {
                        "original": data.get("url")
                    }
                }
                dashboard_db["historico"].append(entry)
        except Exception as e:
            print(f"!!! Erro ao ler GitHub para export: {e}")

    # Inverte a ordem para mostrar os mais novos primeiro
    # (Nota: O ideal seria sortear por timestamp real, mas o append seguido de reverse funciona para logs recentes)
    dashboard_db["historico"].reverse()

    # Salva no diretório do Dashboard
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(dashboard_db, f, indent=2, ensure_ascii=False)
        
    print(f"  -> Sucesso! Dados exportados para {OUTPUT_PATH}")

if __name__ == "__main__":
    exportar()
