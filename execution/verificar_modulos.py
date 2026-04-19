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
    """Extrai IDs e nomes das disciplinas matriculadas no Canvas com maior robustez"""
    print("Capturando lista de disciplinas...")
    driver.get(f"{PORTAL_URL}/courses")
    
    try:
        # Aguarda a tabela ou qualquer link de curso carregar
        wait = WebDriverWait(driver, 20)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "a[href*='/courses/']")))
        
        disciplinas = []
        
        # Tenta pelo seletor de tabela oficial primeiro
        rows = driver.find_elements(By.CSS_SELECTOR, "table#my_courses_table tr.course-list-table-row, table.course-list-table tr")
        
        for row in rows:
            try:
                link_el = row.find_element(By.CSS_SELECTOR, "a[href*='/courses/']")
                href = link_el.get_attribute("href")
                id_curso = href.split("/")[-1]
                nome = link_el.text.strip()
                
                if id_curso.isdigit() and nome:
                    disciplinas.append({"id": id_curso, "nome": nome})
            except:
                continue

        # Fallback: Se não achou na tabela, busca por todos os links na página que seguem o padrão
        if not disciplinas:
            print("Aviso: Tabela não encontrada. Tentando extração via links diretos...")
            links = driver.find_elements(By.CSS_SELECTOR, "a[href*='/courses/']")
            for l in links:
                href = l.get_attribute("href")
                nome = l.text.strip()
                if href and nome:
                    id_c = href.split("/")[-1]
                    if id_c.isdigit() and len(nome) > 3:
                        # Evita duplicatas se já houver
                        if not any(d['id'] == id_c for d in disciplinas):
                            disciplinas.append({"id": id_c, "nome": nome})

        # Remove duplicatas por ID
        vistos = set()
        unique_discs = []
        for d in disciplinas:
            if d['id'] not in vistos:
                vistos.add(d['id'])
                unique_discs.append(d)
        
        return unique_discs

    except Exception as e:
        print(f"Erro crítico ao extrair disciplinas: {e}")
        return []

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
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    
    materiais_totais = []

    try:
        print(f"Carregando sessão para usuário {user_id}...")
        driver.get(PORTAL_URL)
        with open(cookie_file, "rb") as f:
            cookies = pickle.load(f)
            for cookie in cookies:
                driver.add_cookie(cookie)
        
        driver.refresh()
        
        # 1. Descobrir disciplinas dinamicamente
        disciplinas = extrair_disciplinas(driver)
        print(f"Sucesso: {len(disciplinas)} disciplinas identificadas.")

        # 2. Varrer módulos de cada disciplina
        for disc in disciplinas:
            print(f" > Analisando: {disc['nome']} (ID: {disc['id']})")
            driver.get(f"{PORTAL_URL}/courses/{disc['id']}/modules")
            
            try:
                # Aguarda itens carregarem (Canvas modules usam .ig-row para cada item)
                wait_mod = WebDriverWait(driver, 15)
                wait_mod.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".ig-row, .content")))
                
                items = driver.find_elements(By.CLASS_NAME, "ig-row")
                
                for item in items:
                    try:
                        title_el = item.find_element(By.CLASS_NAME, "ig-title")
                        nome_item = title_el.text.strip()
                        link_el = item.find_element(By.TAG_NAME, "a")
                        url_item = link_el.get_attribute("href")
                        
                        # Extrai ID do material da URL ou usa o nome
                        item_id = url_item.split("/")[-1] if url_item and "/" in url_item else nome_item

                        if nome_item and url_item:
                            materiais_totais.append({
                                "id": item_id,
                                "titulo": nome_item,
                                "link": url_item,
                                "disciplina": disc['nome']
                            })
                    except:
                        continue
            except Exception as e:
                print(f"   Aviso: Sem módulos visíveis em {disc['nome']}.")
                continue
                
    except Exception as e:
        print(f"Erro fatal na verificação de materiais: {e}")
    finally:
        driver.quit()

    return materiais_totais
