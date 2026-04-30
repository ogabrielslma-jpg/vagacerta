-- ============================================
-- DASBANK — SETUP DO BANCO DE DADOS
-- ============================================
-- IMPORTANTE: como vamos usar o MESMO projeto Supabase do VagaCerta,
-- vamos criar uma TABELA NOVA chamada "clientes" (ao invés de mexer
-- com a "cadastros" do VagaCerta).
--
-- Cole tudo isso no SQL Editor do Supabase e clique RUN.
-- ============================================

create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),

  -- Tipo de conta
  tipo_conta text not null check (tipo_conta in ('PF','PJ')),

  -- Identidade
  nome text not null,                    -- nome PF ou razão social PJ
  razao_social text,                     -- só PJ
  responsavel text,                      -- só PJ
  documento text not null,               -- CPF ou CNPJ
  data_nascimento date,                  -- só PF

  -- Contato
  email text not null unique,
  whatsapp text not null,

  -- Endereço
  cep text,
  logradouro text,
  numero text,
  bairro text,
  cidade text,
  estado text,

  -- Atividade econômica
  profissao text,
  renda text,

  -- Documentos (apenas flag — não armazenamos os arquivos na demo)
  docs_enviados boolean default false,

  -- Auth
  senha_hash text,
  ultimo_acesso timestamptz,

  -- Conta bancária (gerados no cadastro)
  agencia text default '0001',
  numero_conta text,
  numero_cartao text,
  saldo numeric default 0,

  -- Status / aprovação
  status text default 'em_analise' check (status in ('em_analise','aprovado','reprovado','pendente_docs')),
  observacao text,
  aprovado_em timestamptz,

  created_at timestamptz default now()
);

create index if not exists idx_clientes_email on clientes (email);
create index if not exists idx_clientes_status on clientes (status);
create index if not exists idx_clientes_created_at on clientes (created_at desc);

-- IMPORTANTE: NÃO ATIVAR RLS — segurança é via service_role no backend
