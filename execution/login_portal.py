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

URL_LOGIN = "https://ambientevirtual.idp.edu.br/login/ldap"

def login_idp(usuario, senha, user_id):
    """
    Realiza o login no portal IDP e salva os cookies para um usuário específico.
    Retorna True se o login for bem-sucedido.
    """
    if not usuario or not senha:
        print(f"Erro: Credenciais faltando para o usuário {user_id}")
        return False

    print(f"Iniciando login para {usuario}...")
    
    chrome_options = Options()
    # Sempre headless para o orquestrador multi-usuário
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)

    try:
        driver.get(URL_LOGIN)
        wait = WebDriverWait(driver, 15)
        
        user_field = wait.until(EC.presence_of_element_located((By.ID, "pseudonym_session_unique_id")))
        pass_field = driver.find_element(By.ID, "pseudonym_session_password")
        
        user_field.send_keys(usuario)
        pass_field.send_keys(senha)

        login_btn = driver.find_element(By.CSS_SELECTOR, "button.Button--login")
        login_btn.click()

        # Aguarda dashboard
        wait_dashboard = WebDriverWait(driver, 20)
        wait_dashboard.until(EC.presence_of_element_located((By.ID, "global_nav_dashboard_link")))
        
        # Salva cookies específicos do usuário
        os.makedirs(".tmp", exist_ok=True)
        cookie_file = f".tmp/cookies_{user_id}.pkl"
        with open(cookie_file, "wb") as f:
            pickle.dump(driver.get_cookies(), f)
            
        print(f"Login OK para {usuario}. Cookies salvos.")
        return True

    except Exception as e:
        print(f"Erro no login de {usuario}: {e}")
        return False
    finally:
        driver.quit()

if __name__ == "__main__":
    # Teste unitário apenas se rodado diretamente
    from dotenv import load_dotenv
    load_dotenv()
    u = os.getenv("USUARIO_FACUL")
    s = os.getenv("SENHA_FACUL")
    login_idp(u, s, "test_user")
