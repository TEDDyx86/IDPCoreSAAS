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

    def save_update(self, user_id, disciplina, titulo, tipo, resumo, origin_id, links=None, quiz=None):
        """Salva ou atualiza uma atualização acadêmica (Upsert lógico)"""
        # Primeiro verificamos se já existe
        check_url = f"{self.base_url}/academic_updates?user_id=eq.{user_id}&origin_id=eq.{origin_id}"
        check_res = requests.get(check_url, headers=self.headers)
        
        # Garante que links seja um dicionário e adiciona o quiz se fornecido
        links_data = links or {}
        if quiz:
            links_data["quiz"] = quiz
        
        payload = {
            "user_id": user_id,
            "disciplina": disciplina,
            "titulo": titulo,
            "tipo": tipo,
            "resumo": resumo,
            "origin_id": str(origin_id),
            "links": links_data
        }

        if check_res.status_code == 200 and len(check_res.json()) > 0:
            # Update existente
            row_id = check_res.json()[0]['id']
            url = f"{self.base_url}/academic_updates?id=eq.{row_id}"
            response = requests.patch(url, headers=self.headers, json=payload)
        else:
            # Novo registro
            url = f"{self.base_url}/academic_updates"
            response = requests.post(url, headers=self.headers, json=payload)
            
        return response.json() if response.status_code in [200, 201] else None

    def mark_for_regeneration(self, user_id, origin_id):
        """Sinaliza que um resumo específico precisa ser refeito pelo robô"""
        url = f"{self.base_url}/academic_updates?user_id=eq.{user_id}&origin_id=eq.{origin_id}"
        payload = {"resumo": "[REGENERAÇÃO SOLICITADA] O robô reprocessará este item no próximo ciclo..."}
        response = requests.patch(url, headers=self.headers, json=payload)
        return response.status_code == 200

    def update_profile_info(self, config_id, student_name, courses_list=None):
        """Sincroniza o nome real do aluno e opcionalmente a lista de cursos"""
        url = f"{self.base_url}/profiles?id=eq.{config_id}"
        payload = {"student_name": student_name}
        if courses_list:
            payload["courses_list"] = courses_list
        response = requests.patch(url, headers=self.headers, json=payload)
        return response.status_code == 200

    def update_last_run(self, config_id):
        """Atualiza o timestamp da última verificação bem-sucedida"""
        from datetime import datetime
        url = f"{self.base_url}/profiles?id=eq.{config_id}"
        payload = {"last_verification_date": datetime.now().isoformat()}
        response = requests.patch(url, headers=self.headers, json=payload)
        return response.status_code == 200

if __name__ == "__main__":
    # Teste rápido
    handler = SupabaseHandler()
    print(f"Buscando configs ativas em: {SUPABASE_URL}")
    configs = handler.get_active_configs()
    print(f"Total de alunos ativos: {len(configs)}")
