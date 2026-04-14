import os
import json
import pickle
import requests
import time
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

load_dotenv()

# Configurações
with open("config.json", "r", encoding="utf-8") as f:
    CONFIG = json.load(f)

COOKIES_PATH = ".tmp/cookies.pkl"
COURSES_URL = f"{CONFIG['portal_url']}/courses"

def carregar_sessao():
    if not os.path.exists(COOKIES_PATH):
        return None
    
    session = requests.Session()
    with open(COOKIES_PATH, "rb") as f:
        cookies = pickle.load(f)
        for cookie in cookies:
            session.cookies.set(cookie['name'], cookie['value'])
    return session

def configurar_driver():
    modo_visual = CONFIG.get("configuracoes", {}).get("modo_visual", True)
    is_github_actions = os.getenv("GITHUB_ACTIONS") == "true"
    force_headless = os.getenv("HEADLESS") == "true"
    
    chrome_options = Options()
    if is_github_actions or force_headless or not modo_visual:
        print("Ativando Modo Headless...")
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
    
    service = Service(ChromeDriverManager().install())
    return webdriver.Chrome(service=service, options=chrome_options)

def descobrir_cursos():
    print("\n[Auto-Discovery] Iniciando busca de disciplinas no Canvas...")
    
    sessao = carregar_sessao()
    if not sessao:
        print("Erro: Sessão expirada ou inexistente. Por favor, execute o login primeiro.")
        return

    try:
        resp = sessao.get(COURSES_URL, timeout=15)
        if resp.status_code != 200:
            print(f"Erro ao acessar portal: {resp.status_code}")
            return

        soup = BeautifulSoup(resp.text, 'html.parser')
        tabela = soup.find('table', id='my_courses_table')
        
        if not tabela:
            print("Não foi possível encontrar a tabela de cursos. Verifique se o login foi bem sucedido.")
            return

        rows = tabela.find_all('tr', class_='course-list-table-row')
        novas_disciplinas = []
        
        print(f"Foram encontrados {len(rows)} itens na lista de cursos. Filtrando semestre atual...")

        for row in rows:
            # 1. Título e ID
            title_col = row.find('td', class_='course-list-course-title-column')
            if not title_col: continue
            
            link = title_col.find('a')
            if not link: continue
            
            nome = link.text.strip()
            href = link['href']
            id_curso = href.split('/')[-1]
            
            # 2. Período/Semestre
            term_col = row.find('td', class_='course-list-term-column')
            term = term_col.text.strip() if term_col else ""
            
            # Filtro para semestre atual (ou próximos) - Customizável
            # Aqui assumimos matérias com '2026' no nome do período
            if "2026" not in term:
                continue

            print(f"  + Detectada: {nome} (ID: {id_curso})")
            
            disciplina_obj = {
                "id": id_curso,
                "nome": nome,
                "monitorar": ["CANVAS_MODULES"] # Módulos sempre ativados conforme pedido
                # Notificações Discord desativadas por padrão conforme pedido (cor=0 ou apenas não colocar flag)
            }
            
            # Tentativa básica de detectar se a disciplina já tem indicação de GitHub
            # (Pode ser expandido para olhar os módulos no futuro)
            if "github" in nome.lower():
                disciplina_obj["monitorar"].append("GITHUB_REPO")
                disciplina_obj["github_url"] = "" # Deixa pronto para preencher
            
            novas_disciplinas.append(disciplina_obj)

        if novas_disciplinas:
            CONFIG["disciplinas"] = novas_disciplinas
            with open("config.json", "w", encoding="utf-8") as f:
                json.dump(CONFIG, f, indent=2, ensure_ascii=False)
            print(f"\nSucesso: {len(novas_disciplinas)} disciplinas configuradas automaticamente!")
        else:
            print("\nNenhum curso do semestre atual foi encontrado.")

    except Exception as e:
        print(f"Falha na autodescoberta: {e}")

if __name__ == "__main__":
    descobrir_cursos()
