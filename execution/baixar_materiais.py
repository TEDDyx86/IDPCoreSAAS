import os
import json
import pickle
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv

# Carrega configurações
load_dotenv()
with open("config.json", "r", encoding="utf-8") as f:
    CONFIG = json.load(f)

COOKIES_PATH = ".tmp/cookies.pkl"
MODULOS_PATH = ".tmp/modulos_detectados.json"
HISTORICO_PATH = ".tmp/historico_processados.json"
DOWNLOAD_DIR = ".tmp/downloads"

def carregar_historico():
    if os.path.exists(HISTORICO_PATH):
        with open(HISTORICO_PATH, "r", encoding="utf-8") as f:
            return set(json.load(f))
    return set()

def salvar_historico(historico):
    with open(HISTORICO_PATH, "w", encoding="utf-8") as f:
        json.dump(list(historico), f, indent=2)

def baixar_materiais_rapido():
    if not os.path.exists(MODULOS_PATH) or not os.path.exists(COOKIES_PATH):
        print("Erro: Arquivos de base não encontrados.")
        return

    with open(MODULOS_PATH, "r", encoding="utf-8") as f:
        materiais = json.load(f)
    
    with open(COOKIES_PATH, "rb") as f:
        cookies_list = pickle.load(f)

    session = requests.Session()
    for cookie in cookies_list:
        session.cookies.set(cookie['name'], cookie['value'])

    historico = carregar_historico()
    os.makedirs(DOWNLOAD_DIR, exist_ok=True)
    
    novos_caminhos = False

    for item in materiais:
        item_id = str(item.get("id"))
        
        # Pula se já temos o caminho local e o registro no histórico
        if item_id in historico and item.get("caminho_local"):
            continue
            
        if not item.get("url") or "{{" in item["url"]:
            continue

        print(f"Verificando: {item['nome']} (via HTTP rápido)...")
        try:
            # 1. Busca a página do item do módulo
            resp = session.get(item["url"], timeout=10)
            if resp.status_code != 200: continue
            
            # 2. Extrai link de download
            soup = BeautifulSoup(resp.text, 'html.parser')
            link_el = soup.find('a', href=lambda x: x and '/download' in x)
            
            if not link_el:
                print(f"  -> Link de download não encontrado para {item['nome']}")
                continue

            url_real = link_el['href']
            if not url_real.startswith('http'):
                url_real = CONFIG["portal_url"].rstrip('/') + url_real

            # 3. Define extensão e caminho
            ext = "pdf" if ".pdf" in url_real.lower() else "ppt"
            caminho_local = os.path.join(DOWNLOAD_DIR, f"{item_id}.{ext}")

            # 4. Faz o download binário
            if not os.path.exists(caminho_local):
                print(f"  -> Baixando {ext.upper()}...")
                file_resp = session.get(url_real, stream=True, timeout=30)
                file_resp.raise_for_status()
                with open(caminho_local, "wb") as f:
                    for chunk in file_resp.iter_content(chunk_size=8192):
                        f.write(chunk)
            
            item["caminho_local"] = caminho_local
            historico.add(item_id)
            novos_caminhos = True
            
        except Exception as e:
            print(f"  -> Erro ao processar {item['nome']}: {e}")

    if novos_caminhos:
        with open(MODULOS_PATH, "w", encoding="utf-8") as f:
            json.dump(materiais, f, indent=2, ensure_ascii=False)
        salvar_historico(historico)
        print("\nSincronização de arquivos concluída com sucesso.")
    else:
        print("\nNenhum material novo para baixar.")

if __name__ == "__main__":
    baixar_materiais_rapido()
