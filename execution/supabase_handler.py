import os
import requests
from datetime import datetime
from dotenv import load_dotenv

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
        url = f"{self.base_url}/monitor_configs?id=eq.{config_id}"
        payload = {"student_name": student_name}
        if courses_list:
            payload["courses_list"] = courses_list
        response = requests.patch(url, headers=self.headers, json=payload)
        return response.status_code == 200

    def update_last_run(self, config_id):
        """Atualiza o timestamp da última verificação bem-sucedida"""
        url = f"{self.base_url}/monitor_configs?id=eq.{config_id}"
        payload = {"last_run": datetime.now().isoformat()}
        response = requests.patch(url, headers=self.headers, json=payload)
        return response.status_code == 200

    # ------------------------------------------------------------------
    # Cache compartilhado de resumos (evita chamadas duplicadas de IA)
    # ------------------------------------------------------------------

    def get_cached_summary(self, content_hash: str) -> dict | None:
        """Retorna resumo+quiz do cache se existir. Atualiza contadores."""
        url = f"{self.base_url}/ai_summaries_cache?content_hash=eq.{content_hash}&select=resumo,quiz,model_used&limit=1"
        res = requests.get(url, headers=self.headers)
        if res.status_code == 200 and res.json():
            row = res.json()[0]
            # Incrementa uso sem bloquear o fluxo principal
            self._bump_cache_hit(content_hash)
            return {"resumo": row["resumo"], "quiz": row.get("quiz", []), "model_used": row.get("model_used")}
        return None

    def save_cached_summary(self, content_hash: str, titulo: str, disciplina: str,
                            resumo: str, quiz: list, model_used: str = "unknown"):
        """Persiste um novo resumo no cache."""
        url = f"{self.base_url}/ai_summaries_cache"
        payload = {
            "content_hash": content_hash,
            "titulo": titulo,
            "disciplina": disciplina,
            "resumo": resumo,
            "quiz": quiz,
            "model_used": model_used,
        }
        requests.post(url, headers=self.headers, json=payload)

    def save_calendar_events(self, user_id, disciplina, events):
        """Limpa eventos antigos daquela disciplina e insere os novos extraídos no Supabase"""
        print(f"   [DB] Atualizando calendário acadêmico para: {disciplina}...")
        
        # 1. Deletar eventos anteriores do usuário nesta matéria
        del_url = f"{self.base_url}/academic_calendar?user_id=eq.{user_id}&disciplina=eq.{disciplina}"
        try:
            requests.delete(del_url, headers=self.headers)
        except Exception as e:
            print(f"   [!] Erro ao limpar calendário antigo: {e}")
            
        # 2. Inserir em lote se houver eventos novos
        if not events:
            print("   [DB] Nenhum evento novo para inserir.")
            return True
            
        ins_url = f"{self.base_url}/academic_calendar"
        payloads = []
        for e in events:
            payloads.append({
                "user_id": user_id,
                "disciplina": disciplina,
                "titulo": e["titulo"],
                "descricao": e.get("descricao", ""),
                "tipo": e.get("tipo", "ATIVIDADE"),
                "data_evento": e["data_evento"]
            })
            
        try:
            res = requests.post(ins_url, headers=self.headers, json=payloads)
            if res.status_code in [200, 201]:
                print(f"   [DB] Sucesso! {len(events)} eventos adicionados ao calendário.")
                return True
            else:
                print(f"   [!] Erro ao inserir calendário (Status {res.status_code}): {res.text}")
                return False
        except Exception as e:
            print(f"   [!] Falha de conexão ao salvar calendário: {e}")
            return False


    def _bump_cache_hit(self, content_hash: str):
        """Incrementa use_count e atualiza last_used_at (best-effort)."""
        try:
            url = f"{self.base_url}/rpc/increment_cache_hit"
            requests.post(url, headers=self.headers, json={"p_hash": content_hash})
        except Exception:
            pass

if __name__ == "__main__":
    # Teste rápido
    handler = SupabaseHandler()
    print(f"Buscando configs ativas em: {SUPABASE_URL}")
    configs = handler.get_active_configs()
    print(f"Total de alunos ativos: {len(configs)}")
