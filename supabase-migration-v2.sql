-- Cole isso no SQL Editor do Supabase e clique em RUN
-- Adiciona os novos campos sem perder os cadastros existentes

alter table cadastros add column if not exists data_nascimento date;
alter table cadastros add column if not exists sexo text;
alter table cadastros add column if not exists cep text;
alter table cadastros add column if not exists estado text;
alter table cadastros add column if not exists escolaridade text;
alter table cadastros add column if not exists turno text;
alter table cadastros add column if not exists areas_interesse jsonb default '[]'::jsonb;
alter table cadastros add column if not exists experiencias jsonb default '[]'::jsonb;

-- A coluna 'area' (singular) agora é apenas a primeira da lista pra compatibilidade
-- A coluna 'experiencia' (singular) também fica como resumo
-- 'idade' continua sendo calculada a partir de data_nascimento
