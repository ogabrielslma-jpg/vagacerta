-- v3: Adicionar autenticação de candidatos + estrutura de vagas
-- Cole no SQL Editor do Supabase e clique em RUN

-- 1. Adiciona campo de senha (hash) na tabela cadastros
alter table cadastros add column if not exists senha_hash text;
alter table cadastros add column if not exists ultimo_acesso timestamptz;

-- 2. Tabela de vagas (lançadas pelo admin)
create table if not exists vagas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  empresa text not null,
  descricao text not null,
  requisitos text,
  beneficios text,
  modalidade text not null check (modalidade in ('CLT', 'PJ', 'Freelancer', 'Estágio', 'Temporário')),
  carga_horaria text,
  salario_min numeric,
  salario_max numeric,
  salario_label text,
  area text,
  ativa boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_vagas_ativa on vagas (ativa, created_at desc);

-- 3. Tabela de associação vaga ↔ candidato (vagas enviadas pra cada um)
create table if not exists vagas_candidatos (
  id uuid primary key default gen_random_uuid(),
  vaga_id uuid not null references vagas(id) on delete cascade,
  cadastro_id uuid not null references cadastros(id) on delete cascade,
  status text not null default 'enviada' check (status in ('enviada', 'visualizada', 'interessado', 'agendado', 'recusado')),
  horario_entrevista timestamptz,
  observacao text,
  created_at timestamptz not null default now(),
  unique(vaga_id, cadastro_id)
);

create index if not exists idx_vc_cadastro on vagas_candidatos (cadastro_id, status);
create index if not exists idx_vc_vaga on vagas_candidatos (vaga_id);

-- 4. Tabela de mensagens enviadas pro candidato (vai aparecer no painel dele)
create table if not exists mensagens (
  id uuid primary key default gen_random_uuid(),
  cadastro_id uuid not null references cadastros(id) on delete cascade,
  titulo text not null,
  corpo text not null,
  tipo text not null default 'sistema' check (tipo in ('sistema', 'whatsapp', 'email', 'entrevista')),
  lida boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_mensagens_cadastro on mensagens (cadastro_id, lida, created_at desc);

-- 5. RLS para as novas tabelas
alter table vagas enable row level security;
alter table vagas_candidatos enable row level security;
alter table mensagens enable row level security;
