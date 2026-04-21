import requests

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
                            content_body = ""
                            
                            # Se for uma Página ou Tarefa, tentamos pegar o corpo do texto via API
                            if item.get('type') in ['Page', 'Assignment'] and item.get('url'):
                                try:
                                    print(f"    [IA-Context] Extraindo texto de {item['title']}...")
                                    c_res = requests.get(item['url'], headers=self.headers)
                                    if c_res.status_code == 200:
                                        c_data = c_res.json()
                                        content_body = c_data.get('body', '') or c_data.get('description', '')
                                except:
                                    pass

                            materiais.append({
                                "id": f"api_{item['id']}", # Prefix to distinguish from scraping
                                "titulo": item.get('title', 'Sem Título'),
                                "link": item.get('html_url') or item.get('url'),
                                "disciplina": course_name,
                                "tipo_api": item.get('type'),
                                "body_content": content_body
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
