import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthFromRequest } from '@/lib/auth';
import { criarPixAtivacao } from '@/lib/imperium';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALOR_ATIVACAO_CENTAVOS = 4500; // R$ 45,00

export async function POST(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  try {
    const { data: cliente, error } = await supabaseAdmin
      .from('clientes')
      .select('*')
      .eq('id', auth.clienteId)
      .single();

    if (error || !cliente) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    // Se já tem PIX gerado e ainda está pendente, retorna o existente
    if (cliente.pix_ativacao_id && cliente.pix_ativacao_status === 'PENDENTE' && cliente.pix_ativacao_codigo) {
      return NextResponse.json({
        ok: true,
        reaproveitado: true,
        saleId: cliente.pix_ativacao_id,
        pixCopiaCola: cliente.pix_ativacao_codigo,
        qrCodeBase64: cliente.pix_ativacao_qrcode,
        amount: VALOR_ATIVACAO_CENTAVOS,
      });
    }

    // Se conta já está ativada, não precisa gerar
    if (cliente.conta_ativada) {
      return NextResponse.json({ error: 'Conta já está ativada' }, { status: 400 });
    }

    // Construir URL absoluta do postback
    const proto = req.headers.get('x-forwarded-proto') || 'https';
    const host = req.headers.get('host') || req.nextUrl.host;
    const postbackUrl = `${proto}://${host}/api/webhook/imperium`;

    const tipoDoc = cliente.tipo_conta === 'PJ' ? 'cnpj' : 'cpf';
    const nomeCliente = cliente.tipo_conta === 'PJ'
      ? (cliente.responsavel || cliente.razao_social || cliente.nome)
      : cliente.nome;

    const pix = await criarPixAtivacao({
      amountCentavos: VALOR_ATIVACAO_CENTAVOS,
      cliente: {
        nome: nomeCliente,
        email: cliente.email,
        cpfOuCnpj: cliente.documento,
        telefone: cliente.whatsapp,
        tipoDocumento: tipoDoc,
      },
      postbackUrl,
      metadata: {
        clienteId: cliente.id,
        tipo: 'deposito_inicial',
      },
    });

    // Salva no banco
    await supabaseAdmin.from('clientes').update({
      pix_ativacao_id: String(pix.saleId),
      pix_ativacao_codigo: pix.pixCopiaCola,
      pix_ativacao_qrcode: pix.qrCodeBase64,
      pix_ativacao_status: pix.status,
    }).eq('id', cliente.id);

    return NextResponse.json({
      ok: true,
      saleId: pix.saleId,
      pixCopiaCola: pix.pixCopiaCola,
      qrCodeBase64: pix.qrCodeBase64,
      amount: VALOR_ATIVACAO_CENTAVOS,
    });
  } catch (e: any) {
    console.error('Erro gerando PIX:', e);
    return NextResponse.json({ error: e.message || 'Erro ao gerar PIX' }, { status: 500 });
  }
}
