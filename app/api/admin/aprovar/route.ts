import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function checkAdmin(req: NextRequest): boolean {
  const senha = req.headers.get('x-admin-password');
  return senha === process.env.ADMIN_PASSWORD;
}

export async function PATCH(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  const { id, status, observacao } = await req.json();
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

  const updates: any = {};
  if (status) updates.status = status;
  if (observacao !== undefined) updates.observacao = observacao;

  // Se aprovando, dá um saldo de boas-vindas pra demo ficar bonito
  if (status === 'aprovado') {
    updates.saldo = 1247.85;
    updates.aprovado_em = new Date().toISOString();
  }

  const { error } = await supabaseAdmin.from('clientes').update(updates).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
