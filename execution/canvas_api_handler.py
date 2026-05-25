import requests

# ---------------------------------------------------------------------------
# Classificação de conteúdo Canvas
# ---------------------------------------------------------------------------

# Palavras-chave que identificam itens administrativos (sem valor de aula)
_SKIP_TITLE_KEYWORDS = [
    # Calendários e cronogramas administrativos
    "calendário acadêmico", "calendario academico",
    "agenda acadêmica", "agenda academica",
    "datas importantes",
    # Planos e ementas
    "plano de ensino", "plano de aula", "ementa", "programa da disciplina",
    "programa de ensino",
    # Instruções e avisos administrativos (frases específicas para evitar falsos positivos)
    "instrução acadêmica", "instrucao academica",
    "orientações gerais", "orientacoes gerais",
    "normas do curso", "normas gerais da disciplina",
    "regulamento interno", "regulamento acadêmico", "regulamento do curso",
    "procedimento acadêmico", "procedimentos da secretaria",
    "guia de uso", "manual do aluno",
    "aviso importante", "aviso ao aluno", "aviso da coordenação", "aviso da coordenacao",
    "comunicado oficial", "comunicado da coordenação", "comunicado da secretaria",
    "informativo acadêmico", "informativo da secretaria",
    "boas-vindas", "bem-vindo", "bem-vinda", "como usar",
    "apresentação da disciplina", "apresentacao da disciplina",
    "sobre a disciplina", "acesso ao curso",
]

# Tipos Canvas que nunca têm conteúdo de aula relevante
_SKIP_CANVAS_TYPES = {"SubHeader", "ExternalUrl"}


def classificar_item(titulo: str, canvas_type: str) -> str:
    """
    Retorna a categoria do item Canvas.

    AULA         → conteúdo acadêmico real, processa com IA
    ATIVIDADE    → tarefa/prova/questionário, processa com IA
    ADMIN        → calendário, instrução, aviso — ignora IA
    PLANO_ENSINO → plano de ensino ou ementa — extrai calendário
    """
    titulo_lower = titulo.lower()

    # Intercepta exclusivamente "Calendário Acadêmico" para extração de datas
    cal_kws = ["calendário acadêmico", "calendario academico", "calendário academico", "calendario acadêmico"]
    for kw in cal_kws:
        if kw in titulo_lower:
            return "PLANO_ENSINO"

    # Tipo Canvas que nunca vale a pena processar
    if canvas_type in _SKIP_CANVAS_TYPES:
        return "ADMIN"

    # Palavras-chave administrativas no título (prioridade sobre tipo)
    for kw in _SKIP_TITLE_KEYWORDS:
        if kw in titulo_lower:
            # Garante que não sobresscreva o plano de ensino se o kw coincidir
            return "ADMIN"

    # Palavras-chave que indicam avaliação/atividade
    activity_kws = ["atividade", "trabalho", "prova", "avaliação", "avaliacao",
                    "exercício", "exercicio", "tarefa", "questionário", "questionario",
                    "entrega", "seminário", "seminario"]
    for kw in activity_kws:
        if kw in titulo_lower:
            return "ATIVIDADE"

    # Canvas type Assignment/Quiz/Discussion = atividade mesmo sem keyword no título
    if canvas_type in {"Assignment", "Quiz", "Discussion"}:
        return "ATIVIDADE"

    # Tudo o mais (Page, File sem keyword administrativa) = conteúdo de aula
    return "AULA"


class CanvasAPIClient:
    def __init__(self, token):
        self.token = token
        self.base_url = "https://ambientevirtual.idp.edu.br/api/v1"
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Accept": "application/json"
        }

    def get_user_profile(self):
        """Fetch basic user info (name, id)"""
        print("  [API] Capturando perfil do aluno...")
        url = f"{self.base_url}/users/self/profile"
        try:
            res = requests.get(url, headers=self.headers)
            if res.status_code == 200:
                data = res.json()
                return {"id": data.get('id'), "name": data.get('name')}
            return None
        except Exception as e:
            print(f"  [!] Erro ao capturar perfil: {e}")
            return None

    def get_active_courses(self):
        """Fetch ongoing courses for the user"""
        print("  [API] Buscando cursos ativos via Canvas API...")
        url = f"{self.base_url}/courses?enrollment_state=active&per_page=100"
        try:
            res = requests.get(url, headers=self.headers)
            if res.status_code == 200:
                courses = res.json()
                # Canvas lists courses by 'id' and 'name'
                return [{"id": c['id'], "nome": c.get('name') or c.get('course_code')} for c in courses if 'id' in c]
            else:
                print(f"  [!] Erro API Cursos: {res.status_code}")
                return []
        except Exception as e:
            print(f"  [!] Erro de conexo na API de Cursos: {e}")
            return []

    def get_module_items(self, course_id, course_name):
        """Fetch all items from all modules of a specific course"""
        print(f"  [API] Extraindo materiais de: {course_name}...")
        url = f"{self.base_url}/courses/{course_id}/modules?include=items&per_page=50"
        materiais = []
        try:
            res = requests.get(url, headers=self.headers)
            if res.status_code == 200:
                modules = res.json()
                for mod in modules:
                    items = mod.get('items', [])
                    for item in items:
                        # Map to our standard format
                        # Types to ignore or handle: 'SubHeader', 'ExternalUrl', 'File', 'Page', 'Assignment'
                        if item.get('type') not in ['SubHeader']:
                            titulo_item = item.get('title', 'Sem Título')
                            canvas_type = item.get('type', '')
                            categoria   = classificar_item(titulo_item, canvas_type)
                            content_body = ""

                            # Só busca o corpo do texto para itens que a IA vai processar
                            if categoria != "ADMIN" and canvas_type in ['Page', 'Assignment'] and item.get('url'):
                                try:
                                    print(f"    [IA-Context] Extraindo texto de {titulo_item}...")
                                    c_res = requests.get(item['url'], headers=self.headers)
                                    if c_res.status_code == 200:
                                        c_data = c_res.json()
                                        content_body = c_data.get('body', '') or c_data.get('description', '')
                                except:
                                    pass

                            materiais.append({
                                "id": f"api_{item['id']}",
                                "titulo": titulo_item,
                                "link": item.get('html_url') or item.get('url'),
                                "disciplina": course_name,
                                "tipo_api": canvas_type,
                                "body_content": content_body,
                                "categoria": categoria,
                            })
                return materiais
            else:
                print(f"  [!] Erro API Módulos: {res.status_code}")
                return []
        except Exception as e:
            print(f"  [!] Erro de conexão na API de Módulos: {e}")
            return []

def verificar_materiais_via_api(token):
    """EntryPoint para o orquestrador usar a API"""
    client = CanvasAPIClient(token)
    courses = client.get_active_courses()
    
    total_materiais = []
    for course in courses:
        itens = client.get_module_items(course['id'], course['nome'])
        total_materiais.extend(itens)
        
    return total_materiais
