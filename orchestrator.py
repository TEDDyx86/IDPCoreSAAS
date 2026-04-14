import subprocess
import time
import os
import json

def run_script(script_name):
    print(f"\n>>> Executando {script_name}...")
    try:
        # Usa o mesmo interpretador python atual
        result = subprocess.run(["python", script_name], capture_output=False, text=True)
        return result.returncode == 0
    except Exception as e:
        print(f"Erro ao executar {script_name}: {e}")
        return False

def load_config():
    with open("config.json", "r", encoding="utf-8") as f:
        return json.load(f)

def main():
    print("=== INICIANDO MONITOR ACADÊMICO INTELIGENTE ===")
    
    config = load_config()
    
    # Verifica se precisa de autoconfiguração inicial
    if not config.get("disciplinas"):
        print("\n[!] Configuração inicial detectada: Buscando suas matérias no Canvas...")
        # Primeiro login para garantir cookies
        if run_script("execution/login_portal.py"):
            # Depois autodescoberta
            if run_script("execution/configurador_cursos.py"):
                print("[!] Configuração concluída com sucesso. Reiniciando fluxo...")
                config = load_config() # Recarrega com os novos dados
            else:
                print("!!! Falha na autodescoberta de disciplinas.")
                return
        else:
            print("!!! Falha no login inicial.")
            return

    scripts = [
        "execution/verificar_modulos.py",
        "execution/verificar_github.py",
        "execution/baixar_materiais.py",
        "execution/gerenciar_ia.py",
        "execution/exportar_dashboard.py"
    ]

    for script in scripts:
        if not run_script(script):
            print(f"!!! Interrompendo: Falha no script {script}")
            # Se falhar o módulo, não faz sentido continuar para download/IA
            if "verificar" in script:
                break
                
    print("\n=== FLUXO DE MONITORAMENTO CONCLUÍDO ===")

if __name__ == "__main__":
    main()
