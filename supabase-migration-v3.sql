-- ============================================
-- DASBANK v3 — MIGRATION: Integração ImperiumPay
-- ============================================
-- Adiciona colunas para rastrear pagamento PIX de ativação
-- via gateway ImperiumPay (R$ 45 que vira saldo)
--
-- Cole no SQL Editor do Supabase e clique RUN.
-- ============================================

alter table clientes
  add column if not exists conta_ativada boolean default false,
  add column if not exists pix_ativacao_id text,
  add column if not exists pix_ativacao_codigo text,
  add column if not exists pix_ativacao_qrcode text,
  add column if not exists pix_ativacao_status text default 'nao_gerado',
  add column if not exists pix_ativacao_pago_em timestamptz;

create index if not exists idx_clientes_pix_id on clientes (pix_ativacao_id);
create index if not exists idx_clientes_conta_ativada on clientes (conta_ativada);
