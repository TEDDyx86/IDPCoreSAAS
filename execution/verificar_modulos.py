import os
import json
import pickle
import time
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from notificar import notificar_novos_materiais

# Carrega configurações
load_dotenv()
with open("config.json", "r", encoding="utf-8") as f:
    CONFIG = json.load(f)

COOKIES_PATH = ".tmp/cookies.pkl"
HISTORICO_PATH = ".tmp/modulos_detectados.json"

def carregar_historico():
    if os.path.exists(HISTORICO_PATH):
        try:
            with open(HISTORICO_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except: return []
    return []

def salvar_historico(historico):
    os.makedirs(".tmp", exist_ok=True)
    with open(HISTORICO_PATH, "w", encoding="utf-8") as f:
        json.dump(historico, f, indent=2, ensure_ascii=False)

def extrair_modulos(driver, disciplina):
    print(f"\n[Canvas] Verificando Módulos: {disciplina['nome']}")
    url_modules = f"{CONFIG['portal_url']}/courses/{disciplina['id']}/modules"
    driver.get(url_modules)
    
    # Aguarda carregamento dos módulos
    try:
        WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.CLASS_NAME, "item-group-condensed")))
    except:
        print(f"  Nota: Módulos ainda não carregaram ou estão vazios para {disciplina['nome']}.")
    
    itens_encontrados = []
    
    try:
        # No Canvas, itens de módulos ficam em objetos com a classe 'module-item'
        items = driver.find_elements(By.CLASS_NAME, "ig-row")
        
        for item in items:
            try:
                # Título do item
                title_el = item.find_element(By.CLASS_NAME, "ig-title")
                nome = title_el.text.strip()
                
                # Link do item
                link_el = item.find_element(By.TAG_NAME, "a")
                href = link_el.get_attribute("href")
                
                # ID do item no Canvas (extraído do href)
                item_id = href.split("/")[-1] if "/" in href else nome
                
                itens_encontrados.append({
                    "id": item_id,
                    "nome": nome,
                    "url": href,
                    "disciplina_id": disciplina["id"],
                    "disciplina_nome": disciplina["nome"],
                    "timestamp": time.time()
                })
            except:
                continue
                
    except Exception as e:
        print(f"  Erro ao vasculhar módulos de {disciplina['id']}: {e}")
        
    return itens_encontrados

def main():
    if not os.path.exists(COOKIES_PATH):
        print("Erro: Sessão não encontrada. Execute o login_portal.py primeiro.")
        return

    chrome_options = Options()
    if not CONFIG["configuracoes"].get("modo_visual", True):
        chrome_options.add_argument("--headless")

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    
    try:
        driver.get(CONFIG["portal_url"])
        with open(COOKIES_PATH, "rb") as f:
            cookies = pickle.load(f)
            for cookie in cookies:
                driver.add_cookie(cookie)
        
        driver.refresh()
        time.sleep(2)

        historico = carregar_historico()
        ids_vistos = {str(item["id"]) for item in historico}
        
        novos_globais = []

        for disciplina in CONFIG["disciplinas"]:
            if "CANVAS_MODULES" in disciplina.get("monitorar", []):
                itens = extrair_modulos(driver, disciplina)
                
                novos = [i for i in itens if str(i["id"]) not in ids_vistos]
                
                if novos:
                    print(f"  -> {len(novos)} novos itens detectados!")
                    novos_globais.extend(novos)
                    historico.extend(novos)
                else:
                    print("  -> Tudo atualizado.")

        if novos_globais:
            print(f"\nSucesso: {len(novos_globais)} novos conteúdos encontrados no Canvas!")
            salvar_historico(historico)
            notificar_novos_materiais(novos_globais)
        else:
            print("\nNenhuma novidade nos módulos das disciplinas.")

    finally:
        driver.quit()

if __name__ == "__main__":
    main()
