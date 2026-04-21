import time
import os
import json
from supabase_handler import SupabaseHandler
from canvas_api_handler import verificar_materiais_via_api, CanvasAPIClient
from gerenciar_ia import resumir_item_premium

def run_orchestrator():
    print("\n" + "="*50)
    print(f"ONYX ENGINE v3.0 - MONITORAMENTO: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*50)
    
    handler = SupabaseHandler()
    configs = handler.get_active_configs()
    
    if not configs:
        print("Nenhum usuário ativo para processamento.")
        return

    print(f"Total de usuários: {len(configs)}")
    stats = {"sucesso": 0, "falha": 0, "novos_itens": 0}

    for cfg in configs:
        user_id = cfg['user_id']
        config_id = cfg['id']
        token = cfg.get('canvas_token')
        student_name_db = cfg.get('student_name')
        
        print(f"\n>>> Processando Perfil: {student_name_db or 'Novo Aluno'}")
        
        if not token:
            print(" [!] Ignorado: Este usuário não possui um Canvas API Token configurado.")
            continue
            
        try:
            # 1. Sincronização de Perfil (Nome e Cursos)
            api_client = CanvasAPIClient(token)
            profile = api_client.get_user_profile()
            courses = api_client.get_active_courses() # Captura lista total de matérias
            
            if profile and profile.get('name'):
                nome_real = profile['name']
                print(f" [+] Sincronizando Perfil: {nome_real} | {len(courses)} matérias detectadas.")
                handler.update_profile_info(config_id, nome_real, courses_list=courses)
            
            # 2. Extração via API
            print(" [API] Iniciando busca de conteúdos em tempo real...")
            materiais_atuais = verificar_materiais_via_api(token)
            print(f" [+] {len(materiais_atuais)} itens mapeados no Canvas.")

            # 3. Cruzamento e Deduplicação (Usando origin_id)
            from supabase_handler import SUPABASE_URL, SUPABASE_SERVICE_KEY, requests
            # Buscamos origin_ids e resumos para identificar novos itens E itens marcados para regeneração
            url_check = f"{SUPABASE_URL}/rest/v1/academic_updates?user_id=eq.{user_id}&select=origin_id,resumo"
            headers = {"apikey": SUPABASE_SERVICE_KEY, "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}"}
            res_check = requests.get(url_check, headers=headers)
            
            existing_records = []
            if res_check.status_code == 200:
                existing_records = res_check.json()
            
            ids_vistos = [str(r['origin_id']) for r in existing_records if r.get('origin_id')]
            ids_regenerar = [str(r['origin_id']) for r in existing_records if r.get('resumo') and "[REGENERAÇÃO SOLICITADA]" in r['resumo']]

            # Filtramos o que é NOVO ou solicita REGENERAÇÃO
            itens_para_processar = [
                m for m in materiais_atuais 
                if str(m['id']) not in ids_vistos or str(m['id']) in ids_regenerar
            ]
            
            if itens_para_processar:
                print(f" [*] {len(itens_para_processar)} ITENS PARA PROCESSAMENTO (IA)!")
                for item in itens_para_processar:
                    try:
                        print(f"   > Analisando: {item['titulo']}...")
                        
                        raw_res = resumir_item_premium(item['titulo'], item['disciplina'])
                        
                        try:
                            ai_data = json.loads(raw_res, strict=False)
                            resumo_final = ai_data.get("summary", "Falha ao gerar resumo.")
                            quiz_final = ai_data.get("quiz", [])
                        except Exception as e:
                            # Fallback caso não venha JSON válido
                            print(f"   [!] Erro JSON (ia): {e}")
                            resumo_final = "Erro no processamento da IA. (JSON Inválido)"
                            quiz_final = []

                        handler.save_update(
                            user_id=user_id,
                            disciplina=item['disciplina'],
                            titulo=item['titulo'],
                            tipo="MATERIAL",
                            resumo=resumo_final,
                            origin_id=item['id'],
                            links={"url": item['link']},
                            quiz=quiz_final
                        )
                    except Exception as inner_e:
                        print(f"   [!] Erro ao processar item: {inner_e}")
                stats["novos_itens"] += len(itens_para_processar)
            else:
                print(" [-] Sincronizado. Nenhuma novidade encontrada.")

            handler.update_last_run(config_id)
            stats["sucesso"] += 1
            
        except Exception as e:
            print(f" [X] ERRO CRÍTICO no ciclo API para {user_id}: {e}")
            stats["falha"] += 1

    print("\n" + "="*50)
    print("RELATÓRIO IDP CORE v3.0")
    print(f"Sucesso: {stats['sucesso']} | Falhas: {stats['falha']}")
    print(f"Novidades: {stats['novos_itens']}")
    print("="*50 + "\n")

if __name__ == "__main__":
    is_github_actions = os.getenv("GITHUB_ACTIONS") == "true"

    if is_github_actions:
        print("Modo: GitHub Actions (IDP Core v3.0)")
        run_orchestrator()
    else:
        print("Modo: Local Onyx (Loop 1h)")
        while True:
            try:
                run_orchestrator()
                time.sleep(3600)
            except Exception as e:
                print(f"ERRO DE SISTEMA: {e}")
                time.sleep(60)
