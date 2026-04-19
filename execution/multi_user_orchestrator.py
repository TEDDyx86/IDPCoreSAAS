import time
import os
from supabase_handler import SupabaseHandler
from login_portal import login_idp
from verificar_modulos import verificar_materiais_usuario
from gerenciar_ia import resumir_item_simples

def run_orchestrator():
    print("\n" + "="*50)
    print(f"CICLO DE MONITORAMENTO: {time.strftime('%Y-%m-%d %H:%M:%S')}")
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
        usuario = cfg['student_id']
        senha = cfg['student_password']
        
        print(f"\n>>> Processando: {usuario}")
        
        try:
            # 1. Login e Sessão
            if not login_idp(usuario, senha, user_id):
                print(f" [!] Falha de login para {usuario}.")
                stats["falha"] += 1
                continue
                
            # 2. Scrape do Canvas
            materiais_atuais = verificar_materiais_usuario(user_id)
            print(f" [+] {len(materiais_atuais)} itens detectados.")

            # 3. Cruzamento e IA
            # Buscamos os IDs já registrados
            from supabase_handler import SUPABASE_URL, SUPABASE_SERVICE_KEY, requests
            url_check = f"{SUPABASE_URL}/rest/v1/academic_updates?user_id=eq.{user_id}&select=id"
            headers = {"apikey": SUPABASE_SERVICE_KEY, "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}"}
            res_check = requests.get(url_check, headers=headers)
            ids_vistos = [str(r['id']) for r in res_check.json()] if res_check.status_code == 200 else []

            novos_itens = [m for m in materiais_atuais if str(m['id']) not in ids_vistos]
            
            if novos_itens:
                print(f" [*] {len(novos_itens)} NOVAS ATUALIZAÇÕES IDENTIFICADAS!")
                for item in novos_itens:
                    try:
                        resumo = resumir_item_simples(item['titulo'], item['disciplina'])
                        handler.save_update(
                            user_id=user_id,
                            disciplina=item['disciplina'],
                            titulo=item['titulo'],
                            tipo="MATERIAL",
                            resumo=resumo,
                            links={"url": item['link']}
                        )
                    except Exception as inner_e:
                        print(f"   [!] Erro ao salvar item '{item.get('id')}': {inner_e}")
                stats["novos_itens"] += len(novos_itens)
            else:
                print(" [-] Nenhuma novidade.")

            handler.update_last_run(cfg['id'])
            stats["sucesso"] += 1
            
        except Exception as e:
            print(f" [X] ERRO ao processar {usuario}: {e}")
            stats["falha"] += 1

    print("\n" + "="*50)
    print("RELATÓRIO DE EXECUÇÃO")
    print(f"Sucesso: {stats['sucesso']} | Falhas: {stats['falha']}")
    print(f"Novidades: {stats['novos_itens']}")
    print("="*50 + "\n")

if __name__ == "__main__":
    is_github_actions = os.getenv("GITHUB_ACTIONS") == "true"

    if is_github_actions:
        print("Modo: GitHub Actions (Single Run)")
        run_orchestrator()
    else:
        print("Modo: Local (Loop 1h)")
        while True:
            try:
                run_orchestrator()
                time.sleep(3600)
            except Exception as e:
                print(f"ERRO CRÍTICO: {e}")
                time.sleep(60)
