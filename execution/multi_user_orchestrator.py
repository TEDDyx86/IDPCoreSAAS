import time
import os
from supabase_handler import SupabaseHandler
from login_portal import login_idp
from verificar_modulos import verificar_materiais_usuario
from gerenciar_ia import resumir_item_simples

def run_orchestrator():
    print("=== INICIANDO ORQUESTRADOR MULTI-USUÁRIO IDP CORE ===")
    handler = SupabaseHandler()
    
    # 1. Busca todos os alunos que ativaram o monitoramento
    configs = handler.get_active_configs()
    print(f"Encontrados {len(configs)} usuários ativos para processamento.")

    for cfg in configs:
        user_id = cfg['user_id']
        usuario = cfg['student_id']
        senha = cfg['student_password'] # Recuperado do DB (protegido por RLS para o user, mas aberto para service_role)
        
        print(f"\n>>> Processando Aluno: {usuario} (ID: {user_id})")
        
        # 2. Realiza o login para atualizar cookies
        login_success = login_idp(usuario, senha, user_id)
        if not login_success:
            print(f"PULANDO: Falha no login para {usuario}")
            continue
            
        # 3. Verifica materiais atuais no Canvas
        materiais_atuais = verificar_materiais_usuario(user_id)
        print(f"Sucesso: {len(materiais_atuais)} materiais mapeados no total.")

        # 4. Compara com o que já existe no Supabase para este usuário
        # Buscamos os IDs já registrados para evitar duplicidade
        from supabase_handler import SUPABASE_URL, SUPABASE_SERVICE_KEY, requests
        url_check = f"{SUPABASE_URL}/rest/v1/academic_updates?user_id=eq.{user_id}&select=id"
        headers = {
            "apikey": SUPABASE_SERVICE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}"
        }
        res_check = requests.get(url_check, headers=headers)
        ids_vistos = [str(r['id']) for r in res_check.json()] if res_check.status_code == 200 else []

        novos_itens = [m for m in materiais_atuais if str(m['id']) not in ids_vistos]
        
        if novos_itens:
            print(f"IDENTIFICADO: {len(novos_itens)} novas atualizações!")
            for item in novos_itens:
                print(f"  - [{item['disciplina']}] {item['titulo']}")
                
                # 5. Gera resumo inteligente via IA (baseado apenas no título por enquanto para maior velocidade)
                resumo = resumir_item_simples(item['titulo'], item['disciplina'])
                
                # 6. Salva no Supabase
                handler.save_update(
                    user_id=user_id,
                    disciplina=item['disciplina'],
                    titulo=item['titulo'],
                    tipo="MATERIAL",
                    resumo=resumo,
                    links={"url": item['link']}
                )
        else:
            print("Nenhuma novidade encontrada.")

        # 7. Atualiza timestamp da execução
        handler.update_last_run(cfg['id'])
        print(f"Concluído para {usuario}.")

    print("\n=== CICLO DE ORQUESTRAÇÃO FINALIZADO ===")

if __name__ == "__main__":
    while True:
        try:
            run_orchestrator()
            print("\nAguardando 30 minutos para o próximo ciclo...")
            time.sleep(1800) # Roda a cada 30 minutos
        except Exception as e:
            print(f"ERRO CRÍTICO NO ORQUESTRADOR: {e}")
            time.sleep(60)
