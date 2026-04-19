import time
import os
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
            # Buscamos apenas os origin_ids já vistos para este usuário
            url_check = f"{SUPABASE_URL}/rest/v1/academic_updates?user_id=eq.{user_id}&select=origin_id"
            headers = {"apikey": SUPABASE_SERVICE_KEY, "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}"}
            res_check = requests.get(url_check, headers=headers)
            
            ids_vistos = []
            if res_check.status_code == 200:
                ids_vistos = [str(r['origin_id']) for r in res_check.json() if r.get('origin_id')]

            # Filtramos o que é REALMENTE novo
            novos_itens = [m for m in materiais_atuais if str(m['id']) not in ids_vistos]
            
            if novos_itens:
                print(f" [*] {len(novos_itens)} NOVAS ATUALIZAÇÕES DETECTADAS!")
                for item in novos_itens:
                    try:
                        print(f"   > Analisando: {item['titulo']}...")
                        from gerenciar_ia import resumir_item_premium
                        resumo = resumir_item_premium(item['titulo'], item['disciplina'])
                        
                        handler.save_update(
                            user_id=user_id,
                            disciplina=item['disciplina'],
                            titulo=item['titulo'],
                            tipo="MATERIAL",
                            resumo=resumo,
                            origin_id=item['id'],
                            links={"url": item['link']}
                        )
                    except Exception as inner_e:
                        print(f"   [!] Erro ao processar item: {inner_e}")
                stats["novos_itens"] += len(novos_itens)
            else:
                print(" [-] Sincronizado. Nenhuma novidade encontrada.")

            handler.update_last_run(config_id)
            stats["sucesso"] += 1
            
        except Exception as e:
            print(f" [X] ERRO CRÍTICO no ciclo API para {user_id}: {e}")
            stats["falha"] += 1

    print("\n" + "="*50)
    print("RELATÓRIO ONYX v3.0")
    print(f"Sucesso: {stats['sucesso']} | Falhas: {stats['falha']}")
    print(f"Novidades: {stats['novos_itens']}")
    print("="*50 + "\n")

if __name__ == "__main__":
    is_github_actions = os.getenv("GITHUB_ACTIONS") == "true"

    if is_github_actions:
        print("Modo: GitHub Actions (Onyx Engine v3.0)")
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
