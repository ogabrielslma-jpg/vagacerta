import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validarAssinaturaWebhook } from '@/lib/imperium';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALOR_ATIVACAO = 45.00;

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const signature = req.headers.get('x-signature') || '';

    console.log('[Webhook Imperium] Recebido:', JSON.stringify(payload).slice(0, 300));

    // Valida HMAC (se IMPERIUM_POSTBACK_SECRET estiver setado)
    if (!validarAssinaturaWebhook(payload, signature)) {
      console.warn('[Webhook] Assinatura inválida');
      return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 });
    }

    const saleId = String(payload.id);
    const status = payload.status;

    if (!saleId) {
      return NextResponse.json({ error: 'Sale ID ausente' }, { status: 400 });
    }

    // Procura o cliente associado a esse PIX
    const { data: cliente } = await supabaseAdmin
      .from('clientes')
      .select('*')
      .eq('pix_ativacao_id', saleId)
      .maybeSingle();

    if (!cliente) {
      console.warn('[Webhook] Cliente não encontrado para sale_id:', saleId);
      // Retorna 200 mesmo assim pra não ficar fazendo retry
      return NextResponse.json({ ok: true, ignored: true });
    }

    // Idempotência: se já estava ativada, ignora
    if (cliente.conta_ativada && status === 'PAGO') {
      return NextResponse.json({ ok: true, alreadyProcessed: true });
    }

    if (status === 'PAGO') {
      await supabaseAdmin.from('clientes').update({
        conta_ativada: true,
        pix_ativacao_status: 'PAGO',
        pix_ativacao_pago_em: new Date().toISOString(),
        saldo: VALOR_ATIVACAO,
        status: 'aprovado',
        aprovado_em: new Date().toISOString(),
      }).eq('id', cliente.id);

      console.log('[Webhook] Conta ativada:', cliente.email);
    } else {
      // Outros status (CANCELADO, RECUSADO, etc) — só atualiza
      await supabaseAdmin.from('clientes').update({
        pix_ativacao_status: status,
      }).eq('id', cliente.id);
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('[Webhook] Erro:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// Permite GET pra verificar que a rota existe (útil pra debug)
export async function GET() {
  return NextResponse.json({ ok: true, message: 'Webhook ImperiumPay endpoint ativo' });
}
