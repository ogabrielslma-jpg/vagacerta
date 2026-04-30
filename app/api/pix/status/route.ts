import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthFromRequest } from '@/lib/auth';
import { buscarTransacao } from '@/lib/imperium';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const { data: cliente } = await supabaseAdmin
    .from('clientes')
    .select('id, pix_ativacao_id, pix_ativacao_status, conta_ativada, saldo')
    .eq('id', auth.clienteId)
    .single();

  if (!cliente) return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });

  // Se já está ativada, retorna direto
  if (cliente.conta_ativada) {
    return NextResponse.json({
      ok: true,
      status: 'PAGO',
      contaAtivada: true,
      saldo: cliente.saldo,
    });
  }

  if (!cliente.pix_ativacao_id) {
    return NextResponse.json({ ok: true, status: 'nao_gerado', contaAtivada: false });
  }

  // Consulta no gateway pra ter status real (caso webhook ainda não tenha chegado)
  try {
    const tx = await buscarTransacao(cliente.pix_ativacao_id);

    // Se acabou de constatar PAGO mas o webhook não chegou ainda, atualiza
    if (tx.status === 'PAGO' && !cliente.conta_ativada) {
      const VALOR = 45.00;
      await supabaseAdmin.from('clientes').update({
        conta_ativada: true,
        pix_ativacao_status: 'PAGO',
        pix_ativacao_pago_em: new Date().toISOString(),
        saldo: VALOR,
        status: 'aprovado',
      }).eq('id', cliente.id);

      return NextResponse.json({
        ok: true,
        status: 'PAGO',
        contaAtivada: true,
        saldo: VALOR,
      });
    }

    // Atualiza status
    if (tx.status !== cliente.pix_ativacao_status) {
      await supabaseAdmin.from('clientes')
        .update({ pix_ativacao_status: tx.status })
        .eq('id', cliente.id);
    }

    return NextResponse.json({
      ok: true,
      status: tx.status,
      contaAtivada: false,
    });
  } catch (e: any) {
    return NextResponse.json({
      ok: true,
      status: cliente.pix_ativacao_status,
      contaAtivada: false,
    });
  }
}
