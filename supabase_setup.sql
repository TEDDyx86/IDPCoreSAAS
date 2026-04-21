-- 1. Habilitar extensões necessárias
create extension if not exists vault with schema vault;
create extension if not exists "uuid-ossp";

-- 2. Tabela de Configurações de Monitoramento
create table public.monitor_configs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  canvas_token text,
  student_name text,
  courses_list jsonb,
  active boolean default true,
  last_run timestamp with time zone,
  created_at timestamp with time zone default now(),
  constraint unique_user_config unique(user_id)
);

-- 3. Tabela de Atualizações Acadêmicas (Histórico)
create table public.academic_updates (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  disciplina text not null,
  titulo text not null,
  tipo text check (tipo in ('CODE', 'MATERIAL', 'SLIDE', 'ADMIN', 'ATIVIDADE')),
  resumo text,
  links jsonb,
  data_detectado timestamp with time zone default now()
);

-- 4. Habilitar Row Level Security (RLS)
alter table public.monitor_configs enable row level security;
alter table public.academic_updates enable row level security;

-- 5. Criar Políticas de Segurança
-- Configurações
create policy "Users can view their own config" on public.monitor_configs
  for select using (auth.uid() = user_id);

create policy "Users can insert their own config" on public.monitor_configs
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own config" on public.monitor_configs
  for update using (auth.uid() = user_id);

-- Atualizações (Histórico)
create policy "Users can view their own updates" on public.academic_updates
  for select using (auth.uid() = user_id);

create policy "Service role can manage all updates" on public.academic_updates
  for all using (true); -- Permitir que o robô (com service role) escreva
