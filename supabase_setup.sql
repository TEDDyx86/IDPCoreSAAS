-- 1. Habilitar extensões necessárias
create extension if not exists "uuid-ossp";

-- 2. Tabela de Configurações de Monitoramento
create table if not exists public.monitor_configs (
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
create table if not exists public.academic_updates (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  disciplina text not null,
  titulo text not null,
  tipo text check (tipo in ('CODE', 'MATERIAL', 'SLIDE', 'ADMIN', 'ATIVIDADE')),
  data_detectado timestamp with time zone default now(),
  resumo_ia text,
  link_original text,
  metadata jsonb default '{}'::jsonb
);

-- 4. Habilitar RLS (Row Level Security)
alter table public.monitor_configs enable row level security;
alter table public.academic_updates enable row level security;

-- 5. Políticas de Segurança (Configurações)
drop policy if exists "Users can manage their own config" on public.monitor_configs;
create policy "Users can manage their own config" on public.monitor_configs
  for all using (auth.uid() = user_id);

-- 6. Políticas de Segurança (Histórico)
drop policy if exists "Users can view their own updates" on public.academic_updates;
create policy "Users can view their own updates" on public.academic_updates
  for select using (auth.uid() = user_id);

drop policy if exists "Service role full access" on public.academic_updates;
create policy "Service role full access" on public.academic_updates
  to service_role
  using (true)
  with check (true);
