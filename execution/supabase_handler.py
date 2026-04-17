import os
import requests
from dotenv import load_dotenv

# Carrega variáveis
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

class SupabaseHandler:
    def __init__(self):
        self.base_url = f"{SUPABASE_URL}/rest/v1"
        self.headers = {
            "apikey": SUPABASE_SERVICE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

    def get_active_configs(self):
        """Busca todos os alunos ativos para monitoramento"""
        url = f"{self.base_url}/monitor_configs?active=eq.true"
        response = requests.get(url, headers=self.headers)
        return response.json() if response.status_code == 200 else []

    def save_update(self, user_id, disciplina, titulo, tipo, resumo, links=None):
        """Salva uma nova atualização acadêmica"""
        url = f"{self.base_url}/academic_updates"
        payload = {
            "user_id": user_id,
            "disciplina": disciplina,
            "titulo": titulo,
            "tipo": tipo,
            "resumo": resumo,
            "links": links or {}
        }
        response = requests.post(url, headers=self.headers, json=payload)
        return response.json()

    def update_last_run(self, config_id):
        """Atualiza o timestamp da última execução do bot para aquele usuário"""
        from datetime import datetime
        url = f"{self.base_url}/monitor_configs?id=eq.{config_id}"
        payload = {"last_run": datetime.now().isoformat()}
        requests.patch(url, headers=self.headers, json=payload)

if __name__ == "__main__":
    # Teste rápido
    handler = SupabaseHandler()
    print(f"Buscando configs ativas em: {SUPABASE_URL}")
    configs = handler.get_active_configs()
    print(f"Total de alunos ativos: {len(configs)}")
