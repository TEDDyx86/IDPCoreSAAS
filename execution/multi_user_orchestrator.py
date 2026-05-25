import time
import os
import json
import sys

# Forçar UTF-8 para evitar erros de encoding no Windows (charmap)
if sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except:
        pass

from supabase_handler import SupabaseHandler
from canvas_api_handler import verificar_materiais_via_api, CanvasAPIClient
from gerenciar_ia import resumir_item_premium, gerar_content_hash

def extrair_texto_de_arquivo_local(caminho_arquivo):
    """Lê arquivos locais binários (.pdf e .docx) e extrai o texto bruto para análise"""
    import os
    if not os.path.exists(caminho_arquivo):
        print(f"   [!] Arquivo local não encontrado: {caminho_arquivo}")
        return ""
        
    ext = caminho_arquivo.split('.')[-1].lower()
    texto = ""
    
    if ext == 'pdf':
        try:
            import fitz  # PyMuPDF
            print(f"   [Parser] Extraindo texto de PDF ({os.path.basename(caminho_arquivo)})...")
            doc = fitz.open(caminho_arquivo)
            for page in doc:
                texto += page.get_text()
            doc.close()
            print(f"   [Parser] PDF processado. {len(texto)} caracteres lidos.")
        except Exception as e:
            print(f"   [Parser] Erro ao ler PDF com PyMuPDF: {e}")
            
    elif ext in ['docx', 'doc']:
        try:
            import docx
            print(f"   [Parser] Extraindo texto de DOCX ({os.path.basename(caminho_arquivo)})...")
            doc = docx.Document(caminho_arquivo)
            texto = "\n".join([p.text for p in doc.paragraphs])
            print(f"   [Parser] DOCX processado. {len(texto)} caracteres lidos.")
        except Exception as e:
            print(f"   [Parser] Erro ao ler DOCX: {e}")
            
    return texto

# CONFIGURAÇÕES
MAX_ITEMS_PER_RUN = 100
DELAY_BETWEEN_ITEMS = 10  # segundos entre chamadas reais de IA (rate limit)

# Categorias que recebem processamento de IA (resumo + quiz)
CATEGORIAS_COM_IA = {"AULA", "ATIVIDADE"}

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
            # Aumentamos o limite para 2000 para garantir que pegamos todo o histórico do aluno
            url_check = f"{SUPABASE_URL}/rest/v1/academic_updates?user_id=eq.{user_id}&select=origin_id,resumo&limit=2000"
            headers = {"apikey": SUPABASE_SERVICE_KEY, "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}"}
            res_check = requests.get(url_check, headers=headers)
            
            existing_records = []
            if res_check.status_code == 200:
                existing_records = res_check.json()
            
            # Mapeamos resumos por ID para decisões rápidas
            resumo_por_id = {str(r['origin_id']): r.get('resumo', '') for r in existing_records if r.get('origin_id')}
            
            ids_vistos = list(resumo_por_id.keys())
            
            itens_para_processar = []
            print(f" [DB] {len(ids_vistos)} registros encontrados no histórico.")

            for m in materiais_atuais:
                m_id = str(m['id'])
                resumo_atual = resumo_por_id.get(m_id, "")
                
                # Critérios de Processamento:
                # 1. Não existe no banco (Item Novo)
                # 2. Usuário solicitou regeneração manual
                # 3. O processamento anterior resultou em erro genérico ou está incompleto
                is_novo = m_id not in ids_vistos
                
                # Detecção aprimorada de erro:
                # - Contém palavras-chave de erro
                # - É excessivamente curto (menos de 150 caracteres de conteúdo real)
                # - Está vazio
                is_regen_solicitada = "[REGENERAÇÃO SOLICITADA]" in resumo_atual.upper()
                is_falha_detectada = any(msg in resumo_atual.upper() for msg in [
                    "ERRO NO PROCESSAMENTO DA IA",
                    "FALHA AO GERAR RESUMO",
                    "JSON INVÁLIDO",
                    "NENHUMA IA CONFIGURADA",
                    "ERRO CRÍTICO",
                    "ERRO CRITICO",
                    "ITEM ADMINISTRATIVO",  # reclassificados: eram ADMIN, agora são AULA/ATIVIDADE
                ])
                is_muito_curto = len(resumo_atual.strip()) < 150 and not is_novo
                
                if is_novo or is_regen_solicitada or is_falha_detectada or is_muito_curto:
                    itens_para_processar.append(m)
                    status = "NOVO" if is_novo else ("REGENERAÇÃO" if is_regen_solicitada else "AUTO-CORREÇÃO")
                    print(f"   [+] Incluído: {m['titulo']} ({status})")
            
            if itens_para_processar:
                # Priorizar itens de REGENERAÇÃO (solicitados pelo usuário)
                itens_para_processar.sort(key=lambda x: "[REGENERAÇÃO SOLICITADA]" in resumo_por_id.get(str(x['id']), "").upper(), reverse=True)
                
                itens_da_rodada = itens_para_processar[:MAX_ITEMS_PER_RUN]
                print(f" [*] {len(itens_para_processar)} pendentes. PROCESSANDO APENAS {len(itens_da_rodada)} NESTA RODADA (Cota Safe).")
                
                itens_gerados = []
                for item in itens_da_rodada:
                    try:
                        categoria = item.get("categoria", "AULA")
                        
                        # --- PLANO DE ENSINO: fluxo inteligente de extração de cronograma ---
                        if categoria == "PLANO_ENSINO":
                            print(f"   [PLANNER] Interceptado Plano/Calendário: {item['titulo']}")
                            
                            # 1. Obter arquivo binário
                            pdf_bytes = None
                            texto_extraido = ""
                            
                            # Caso seja Page, tentamos encontrar anexo de arquivo dentro de body_content
                            if item.get('tipo_api') == 'Page' and item.get('body_content'):
                                try:
                                    from bs4 import BeautifulSoup
                                    import re
                                    soup = BeautifulSoup(item['body_content'], 'html.parser')
                                    link_el = soup.find('a', attrs={'data-api-endpoint': True})
                                    file_api_url = None
                                    if link_el:
                                        file_api_url = link_el['data-api-endpoint']
                                    else:
                                        link_el = soup.find('a', href=re.compile(r'/files/\d+'))
                                        if link_el:
                                            href = link_el['href']
                                            match = re.search(r'/files/(\d+)', href)
                                            if match:
                                                file_id = match.group(1)
                                                if item.get('link'):
                                                    course_match = re.search(r'/courses/(\d+)', item['link'])
                                                    if course_match:
                                                        cid = course_match.group(1)
                                                        file_api_url = f"https://ambientevirtual.idp.edu.br/api/v1/courses/{cid}/files/{file_id}"
                                    
                                    if file_api_url:
                                        print(f"   [PLANNER] Encontrada API do arquivo anexo: {file_api_url}")
                                        import requests as req_bin
                                        headers_canvas = {"Authorization": f"Bearer {token}"}
                                        res_file_info = req_bin.get(file_api_url, headers=headers_canvas, timeout=15)
                                        if res_file_info.status_code == 200:
                                            file_data = res_file_info.json()
                                            url_download = file_data.get('url')
                                            if url_download:
                                                filename = file_data.get('display_name', 'calendario.pdf')
                                                ext = filename.split('.')[-1].lower() if '.' in filename else 'pdf'
                                                caminho_temp = f".tmp/downloads/plano_{item['id']}.{ext}"
                                                
                                                os.makedirs(".tmp/downloads", exist_ok=True)
                                                print(f"   [PLANNER] Baixando arquivo anexo ({filename})...")
                                                res_bin = req_bin.get(url_download, stream=True, timeout=30)
                                                if res_bin.status_code == 200:
                                                    with open(caminho_temp, "wb") as f_temp:
                                                        for chunk in res_bin.iter_content(chunk_size=8192):
                                                            f_temp.write(chunk)
                                                    
                                                    if ext == 'pdf':
                                                        with open(caminho_temp, "rb") as f_bytes:
                                                            pdf_bytes = f_bytes.read()
                                                    else:
                                                        texto_extraido = extrair_texto_de_arquivo_local(caminho_temp)
                                                        
                                                    if os.path.exists(caminho_temp):
                                                        os.remove(caminho_temp)
                                except Exception as e_page_file:
                                    print(f"   [!] Falha ao baixar anexo da página de calendário: {e_page_file}")

                            # Caso seja um File direto
                            elif item.get('tipo_api') == 'File' and item.get('link'):
                                try:
                                    import requests as req_bin
                                    print(f"   [PLANNER] Buscando metadados do arquivo na API do Canvas...")
                                    headers_canvas = {"Authorization": f"Bearer {token}"}
                                    res_file_info = req_bin.get(item['link'], headers=headers_canvas, timeout=15)
                                    if res_file_info.status_code == 200:
                                        file_data = res_file_info.json()
                                        url_download = file_data.get('url')
                                        if url_download:
                                            filename = file_data.get('display_name', 'plano.pdf')
                                            ext = filename.split('.')[-1].lower() if '.' in filename else 'pdf'
                                            caminho_temp = f".tmp/downloads/plano_{item['id']}.{ext}"
                                            
                                            os.makedirs(".tmp/downloads", exist_ok=True)
                                            print(f"   [PLANNER] Baixando binário ({ext.upper()}) do Canvas...")
                                            res_bin = req_bin.get(url_download, stream=True, timeout=30)
                                            if res_bin.status_code == 200:
                                                with open(caminho_temp, "wb") as f_temp:
                                                    for chunk in res_bin.iter_content(chunk_size=8192):
                                                        f_temp.write(chunk)
                                                        
                                                if ext == 'pdf':
                                                    with open(caminho_temp, "rb") as f_bytes:
                                                        pdf_bytes = f_bytes.read()
                                                else:
                                                    texto_extraido = extrair_texto_de_arquivo_local(caminho_temp)
                                                
                                                if os.path.exists(caminho_temp):
                                                    os.remove(caminho_temp)
                                except Exception as e_bin:
                                    print(f"   [!] Falha ao baixar ou extrair binário do plano: {e_bin}")
                                    
                            # Se não temos arquivo/bytes, usamos o corpo do texto de página
                            if not texto_extraido and not pdf_bytes:
                                texto_extraido = item.get('body_content', "")
                                
                            if texto_extraido or pdf_bytes:
                                from gerenciar_ia import extrair_cronograma_de_plano
                                # Extrai datas usando IA
                                cronograma_json = extrair_cronograma_de_plano(item['titulo'], item['disciplina'], texto_extraido, pdf_bytes=pdf_bytes)
                                eventos = cronograma_json.get("events", [])
                                
                                if eventos:
                                    # Salva os eventos na tabela academic_calendar
                                    handler.save_calendar_events(user_id, item['disciplina'], eventos)
                                    resumo_status = f"📅 Calendário acadêmico extraído com sucesso! {len(eventos)} eventos de provas/atividades foram integrados ao calendário."
                                else:
                                    resumo_status = "⚠️ Calendário acadêmico analisado, mas nenhuma data de prova ou atividade importante foi encontrada."
                            else:
                                resumo_status = "❌ Falha ao extrair texto do arquivo de Calendário Acadêmico."
 
                            # Salva a atualização acadêmica como histórico
                            handler.save_update(
                                user_id=user_id,
                                disciplina=item['disciplina'],
                                titulo=item['titulo'],
                                tipo="ADMIN",  # Salva no histórico padrão como ADMIN para visualização simples
                                resumo=resumo_status,
                                origin_id=item['id'],
                                links={"url": item['link']},
                                quiz=[],
                            )
                            itens_gerados.append(f"📅 {item['titulo']} ({item['disciplina']})")
                            continue

                        # --- ITEM ADMINISTRATIVO: ignora e remove do feed se já existia ---
                        if categoria not in CATEGORIAS_COM_IA:
                            print(f"   [SKIP] Conteúdo administrativo — ignorado.")
                            if str(item['id']) in resumo_por_id:
                                handler.delete_update(user_id, item['id'])
                                print(f"   [DB] Removido do feed: {item['titulo']}")
                            continue

                        # --- AULA / ATIVIDADE: consulta cache e chama IA se necessário ---
                        contexto_ia = item.get('body_content', "")
                        content_hash = gerar_content_hash(item['titulo'], item['disciplina'], contexto_ia)

                        _ERROS_CACHE = {"ERRO CRÍTICO", "ERRO CRITICO", "ERRO NO PROCESSAMENTO DA IA", "FALHA AO GERAR RESUMO"}
                        cached = handler.get_cached_summary(content_hash)
                        if cached and not any(kw in (cached.get("resumo") or "").upper() for kw in _ERROS_CACHE):
                            print(f"   [CACHE HIT] Espelhando resumo para: {item['titulo']}")
                            resumo_final = cached["resumo"]
                            quiz_final   = cached["quiz"]
                        else:
                            if cached:
                                print(f"   [CACHE INVÁLIDO] Erro detectado no cache — removendo e regenerando: {item['titulo']}")
                                handler.delete_cached_summary(content_hash)
                            raw_res, model_used = resumir_item_premium(
                                item['titulo'], item['disciplina'], texto_extra=contexto_ia
                            )
                            try:
                                ai_data = json.loads(raw_res, strict=False)
                                resumo_final = ai_data.get("summary", "Falha ao gerar resumo.")
                                quiz_final   = ai_data.get("quiz", [])
                            except Exception as e:
                                print(f"   [!] Erro JSON: {e}")
                                resumo_final = "Erro no processamento da IA. (JSON Inválido)"
                                quiz_final   = []

                            _ERROS_IA = {"ERRO CRÍTICO", "ERRO CRITICO", "ERRO NO PROCESSAMENTO DA IA", "FALHA AO GERAR RESUMO"}
                            resumo_valido = resumo_final and not any(kw in resumo_final.upper() for kw in _ERROS_IA)
                            if resumo_valido:
                                handler.save_cached_summary(
                                    content_hash=content_hash,
                                    titulo=item['titulo'],
                                    disciplina=item['disciplina'],
                                    resumo=resumo_final,
                                    quiz=quiz_final,
                                    model_used=model_used,
                                )
                                print(f"   [CACHE MISS] Gerado via {model_used}.")
                            else:
                                print(f"   [CACHE SKIP] Resumo com erro — não cacheado para outros usuários.")
                            print(f"   [...] Aguardando {DELAY_BETWEEN_ITEMS}s (rate limit)...")
                            time.sleep(DELAY_BETWEEN_ITEMS)

                        handler.save_update(
                            user_id=user_id,
                            disciplina=item['disciplina'],
                            titulo=item['titulo'],
                            tipo=categoria,
                            resumo=resumo_final,
                            origin_id=item['id'],
                            links={"url": item['link']},
                            quiz=quiz_final,
                        )
                        itens_gerados.append(f"✅ {item['titulo']} ({item['disciplina']})")

                    except Exception as inner_e:
                        print(f"   [!] Erro ao processar item: {inner_e}")

                if itens_gerados:
                    print("\n   [RELATÓRIO DE PROCESSAMENTO]")
                    for ig in itens_gerados:
                        print(f"   {ig}")
                
                stats["novos_itens"] += len(itens_gerados)
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
