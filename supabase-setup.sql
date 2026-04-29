-- Cole isso no SQL Editor do Supabase e rode uma vez

create table if not exists cadastros (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null unique,
  whatsapp text not null,
  cidade text not null,
  idade int,
  area text not null,
  experiencia text not null,
  disponibilidade text not null,
  salario text not null,
  bio text not null,
  linkedin text,
  status text not null default 'novo' check (status in ('novo', 'contatado', 'agendado', 'descartado')),
  observacao text,
  created_at timestamptz not null default now()
);

-- Índice pra buscas mais rápidas no painel admin
create index if not exists idx_cadastros_created_at on cadastros (created_at desc);
create index if not exists idx_cadastros_status on cadastros (status);

-- RLS (Row Level Security) — bloqueia acesso direto pelo cliente
-- A API usa o service_role key que bypassa isso, então tá seguro
alter table cadastros enable row level security;

-- Política: ninguém pode acessar via cliente público (só via API com service_role)
-- (não criar policy = ninguém acessa por default)
