import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

function checkAuth(req: NextRequest): boolean {
  const authHeader = req.headers.get('x-admin-password');
  return authHeader === process.env.ADMIN_PASSWORD;
}

// Lista cadastros
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const search = searchParams.get('q');

  let query = supabaseAdmin
    .from('cadastros')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);

  if (status && status !== 'todos') {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.or(`nome.ilike.%${search}%,email.ilike.%${search}%,whatsapp.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Contadores por status
  const { data: counts } = await supabaseAdmin
    .from('cadastros')
    .select('status');

  const stats = {
    total: counts?.length || 0,
    novo: counts?.filter(c => c.status === 'novo').length || 0,
    contatado: counts?.filter(c => c.status === 'contatado').length || 0,
    agendado: counts?.filter(c => c.status === 'agendado').length || 0,
    descartado: counts?.filter(c => c.status === 'descartado').length || 0,
  };

  return NextResponse.json({ cadastros: data, stats });
}

// Atualiza status de um cadastro
export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id, status, observacao } = await req.json();
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

  const update: any = {};
  if (status) update.status = status;
  if (observacao !== undefined) update.observacao = observacao;

  const { error } = await supabaseAdmin
    .from('cadastros')
    .update(update)
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
