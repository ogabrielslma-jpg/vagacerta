import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthFromRequest } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  // Dados do perfil
  const { data: perfil, error } = await supabaseAdmin
    .from('cadastros')
    .select('id, nome, email, whatsapp, cidade, estado, areas_interesse, status, created_at')
    .eq('id', auth.cadastroId)
    .single();

  if (error || !perfil) {
    return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
  }

  // Vagas enviadas pro candidato
  const { data: vagasRaw } = await supabaseAdmin
    .from('vagas_candidatos')
    .select(`
      id, status, horario_entrevista, created_at,
      vagas (id, titulo, empresa, descricao, requisitos, beneficios, modalidade, carga_horaria, salario_label, area, ativa)
    `)
    .eq('cadastro_id', auth.cadastroId)
    .order('created_at', { ascending: false });

  const vagas = (vagasRaw || []).map((v: any) => ({
    id: v.id,
    status: v.status,
    horario_entrevista: v.horario_entrevista,
    enviada_em: v.created_at,
    vaga: v.vagas,
  })).filter(v => v.vaga); // remove se a vaga foi deletada

  // Mensagens
  const { data: mensagens } = await supabaseAdmin
    .from('mensagens')
    .select('*')
    .eq('cadastro_id', auth.cadastroId)
    .order('created_at', { ascending: false })
    .limit(20);

  return NextResponse.json({
    perfil,
    vagas,
    mensagens: mensagens || [],
    stats: {
      total_vagas: vagas.length,
      novas: vagas.filter(v => v.status === 'enviada').length,
      agendadas: vagas.filter(v => v.status === 'agendado').length,
      mensagens_nao_lidas: (mensagens || []).filter(m => !m.lida).length,
    },
  });
}
