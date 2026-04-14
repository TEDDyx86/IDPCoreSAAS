import os
import json
import time
import requests
from dotenv import load_dotenv
from notificar import enviar_notificacao

# Carrega configurações
load_dotenv()
with open("config.json", "r", encoding="utf-8") as f:
    CONFIG = json.load(f)

HISTORICO_PATH = ".tmp/github_detectados.json"

def carregar_historico():
    if os.path.exists(HISTORICO_PATH):
        try:
            with open(HISTORICO_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except: return {}
    return {}

def salvar_historico(historico):
    os.makedirs(".tmp", exist_ok=True)
    with open(HISTORICO_PATH, "w", encoding="utf-8") as f:
        json.dump(historico, f, indent=2, ensure_ascii=False)

def verificar_repo(disciplina):
    url = disciplina["github_url"]
    print(f"\n[GitHub] Verificando Repositório: {disciplina['nome']}")
    
    try:
        # Tenta pegar o hash do último commit via API pública (sem autenticação)
        # Se falhar, tentamos scrape básico (menos confiável)
        repo_path = url.split("github.com/")[1].rstrip("/")
        api_url = f"https://api.github.com/repos/{repo_path}/commits/main"
        
        response = requests.get(api_url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            last_sha = data["sha"]
            mensagem = data["commit"]["message"]
            autor = data["commit"]["author"]["name"]
            
            return {
                "sha": last_sha,
                "mensagem": mensagem,
                "autor": autor,
                "url": url
            }
        else:
            print(f"  Aviso: Não foi possível acessar a API do GitHub para {repo_path} (Status: {response.status_code})")
            return None
            
    except Exception as e:
        print(f"  Erro ao verificar GitHub de {disciplina['id']}: {e}")
        return None

def main():
    historico = carregar_historico()
    novos_globais = []

    for disciplina in CONFIG["disciplinas"]:
        if "GITHUB_REPO" in disciplina.get("monitorar", []) and "github_url" in disciplina:
            resultado = verificar_repo(disciplina)
            
            if resultado:
                disciplina_id = disciplina["id"]
                ultimo_sha_visto = historico.get(disciplina_id, {}).get("sha")
                
                if resultado["sha"] != ultimo_sha_visto:
                    print(f"  -> Novo commit detectado: {resultado['mensagem']}")
                    novos_globais.append({
                        "id": resultado["sha"],
                        "nome": f"GitHub Upgrade: {resultado['mensagem']}",
                        "url": resultado["url"],
                        "disciplina_nome": disciplina["nome"]
                    })
                    historico[disciplina_id] = resultado
                else:
                    print("  -> Sem novos commits.")

    if novos_globais:
        print(f"\nSucesso: {len(novos_globais)} atualizações encontradas no GitHub!")
        salvar_historico(historico)
        for novo in novos_globais:
            enviar_notificacao(
                titulo="🚀 Novo Commit no GitHub!",
                descricao=f"A disciplina **{novo['disciplina_nome']}** recebeu uma atualização.",
                url=novo["url"],
                campos=[{"name": "Mensagem", "value": novo["nome"], "inline": False}]
            )
    else:
        print("\nNenhuma novidade nos repositórios GitHub.")

if __name__ == "__main__":
    main()
