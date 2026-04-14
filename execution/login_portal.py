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

# Carrega variáveis do .env
load_dotenv()

USUARIO = os.getenv("USUARIO_FACUL")
SENHA = os.getenv("SENHA_FACUL")
URL_LOGIN = "https://ambientevirtual.idp.edu.br/login/ldap"

def login_idp():
    if not USUARIO or not SENHA or USUARIO == "seu_usuario":
        print("Erro: Credenciais não configuradas no arquivo .env")
        print("Por favor, preencha USUARIO_FACUL e SENHA_FACUL no arquivo .env")
        return

    print("Configurando navegador...")
    
    # Carrega flag de modo visual do config.json
    modo_visual = True
    try:
        with open("config.json", "r", encoding="utf-8") as f:
            config = json.load(f)
            modo_visual = config.get("configuracoes", {}).get("modo_visual", True)
    except:
        pass

    # Força headless se estiver no GitHub Actions ou se configurado
    is_github_actions = os.getenv("GITHUB_ACTIONS") == "true"
    force_headless = os.getenv("HEADLESS") == "true"
    
    chrome_options = Options()
    if is_github_actions or force_headless or not modo_visual:
        print("Ativando Modo Headless (Invisível)...")
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
    else:
        print("Iniciando Modo Visual...")
    
    # Inicializa o driver
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)

    try:
        print(f"Navegando para {URL_LOGIN}...")
        driver.get(URL_LOGIN)

        # Aguarda os campos ficarem disponíveis
        wait = WebDriverWait(driver, 15)
        
        user_field = wait.until(EC.presence_of_element_located((By.ID, "pseudonym_session_unique_id")))
        pass_field = driver.find_element(By.ID, "pseudonym_session_password")
        
        print("Preenchendo credenciais...")
        user_field.clear()
        user_field.send_keys(USUARIO)
        pass_field.clear()
        pass_field.send_keys(SENHA)

        print("Clicando no botão de Login...")
        login_btn = driver.find_element(By.CSS_SELECTOR, "button.Button--login")
        login_btn.click()

        # Aguarda o redirecionamento ou carregamento do dashboard
        print("Aguardando carregamento do Painel de Controle...")
        
        # Espera até 20 segundos por um elemento que só existe no dashboard do Canvas
        wait_dashboard = WebDriverWait(driver, 20)
        try:
            # Tenta encontrar o menu global do Canvas ou o título do Painel
            wait_dashboard.until(EC.presence_of_element_located((By.ID, "global_nav_dashboard_link")))
            print("Login realizado com sucesso! (Dashboard detectado)")
            
            # Salva cookies
            os.makedirs(".tmp", exist_ok=True)
            cookies = driver.get_cookies()
            with open(".tmp/cookies.pkl", "wb") as f:
                pickle.dump(cookies, f)
            print("Sessão (cookies) persistida em .tmp/cookies.pkl")
            
        except:
            if "login" not in driver.current_url.lower():
                print("Login concluído (detecção por URL).")
            else:
                print("Erro: O login parece ter falhado ou demorou demais para redirecionar.")

    except Exception as e:
        print(f"Ocorreu um erro durante o processo de login: {e}")
    finally:
        print("Fechando navegador em 5 segundos...")
        time.sleep(5)
        driver.quit()

if __name__ == "__main__":
    login_idp()
