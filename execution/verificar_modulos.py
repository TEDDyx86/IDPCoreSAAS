import os
import pickle
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

PORTAL_URL = "https://ambientevirtual.idp.edu.br"

def extrair_disciplinas(driver):
    """Extrai IDs e nomes das disciplinas matriculadas no Canvas"""
    driver.get(f"{PORTAL_URL}/courses")
    time.sleep(3)
    
    disciplinas = []
    try:
        # Pega a tabela de cursos
        rows = driver.find_elements(By.CSS_SELECTOR, "table#my_courses_table tr.course-list-table-row")
        for row in rows:
            link_el = row.find_element(By.CSS_SELECTOR, "td.course-list-table-column a")
            href = link_el.get_attribute("href")
            id_curso = href.split("/")[-1]
            nome = link_el.text.strip()
            if id_curso.isdigit():
                disciplinas.append({"id": id_curso, "nome": nome})
    except Exception as e:
        print(f"Erro ao extrair disciplinas: {e}")
    
    return disciplinas

def verificar_materiais_usuario(user_id):
    """
    Verifica todos os materiais de todas as disciplinas para um usuário.
    Retorna uma lista de itens encontrados.
    """
    cookie_file = f".tmp/cookies_{user_id}.pkl"
    if not os.path.exists(cookie_file):
        print(f"Sessão não encontrada para {user_id}")
        return []

    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    
    materiais_totais = []

    try:
        driver.get(PORTAL_URL)
        with open(cookie_file, "rb") as f:
            cookies = pickle.load(f)
            for cookie in cookies:
                driver.add_cookie(cookie)
        
        driver.refresh()
        
        # 1. Descobrir disciplinas dinamicamente
        disciplinas = extrair_disciplinas(driver)
        print(f"Encontradas {len(disciplinas)} disciplinas para o usuário {user_id}")

        # 2. Varrer módulos de cada disciplina
        for disc in disciplinas:
            print(f"  Vascunhando módulos de: {disc['nome']}")
            driver.get(f"{PORTAL_URL}/courses/{disc['id']}/modules")
            
            try:
                # Aguarda itens carregarem
                WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CLASS_NAME, "ig-row")))
                items = driver.find_elements(By.CLASS_NAME, "ig-row")
                
                for item in items:
                    title_el = item.find_element(By.CLASS_NAME, "ig-title")
                    nome_item = title_el.text.strip()
                    link_el = item.find_element(By.TAG_NAME, "a")
                    url_item = link_el.get_attribute("href")
                    item_id = url_item.split("/")[-1] if "/" in url_item else nome_item

                    materiais_totais.append({
                        "id": item_id,
                        "titulo": nome_item,
                        "link": url_item,
                        "disciplina": disc['nome']
                    })
            except:
                continue # Disciplina sem módulos ou erro
                
    except Exception as e:
        print(f"Erro ao verificar materiais: {e}")
    finally:
        driver.quit()

    return materiais_totais
