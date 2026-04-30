// Integração ImperiumPay Gateway
// Docs: https://docs.imperiumpay.com.br

const IMPERIUM_BASE = 'https://api.imperiumpay.com.br/api';

const PUBLIC_KEY = process.env.IMPERIUM_PUBLIC_KEY!;
const PRIVATE_KEY = process.env.IMPERIUM_PRIVATE_KEY!;

export interface CriarPixParams {
  amountCentavos: number;          // ex: 4500 = R$ 45,00
  cliente: {
    nome: string;
    email: string;
    cpfOuCnpj: string;             // só dígitos
    telefone: string;              // só dígitos, ex: 11999999999
    tipoDocumento: 'cpf' | 'cnpj';
  };
  postbackUrl: string;
  metadata?: Record<string, any>;
}

export interface PixCriadoResponse {
  saleId: number;
  status: string;
  pixCopiaCola: string;
  qrCodeBase64: string;
  amount: string;
}

export async function criarPixAtivacao(params: CriarPixParams): Promise<PixCriadoResponse> {
  const body = {
    amount: params.amountCentavos,
    paymentMethod: 'PIX',
    customer: {
      name: params.cliente.nome,
      email: params.cliente.email,
      document: {
        type: params.cliente.tipoDocumento,
        number: params.cliente.cpfOuCnpj,
      },
      phone: params.cliente.telefone,
    },
    items: [
      {
        title: 'Depósito inicial DasBank',
        unitPrice: params.amountCentavos,
        quantity: 1,
        tangible: false,
      },
    ],
    postbackUrl: params.postbackUrl,
    metadata: params.metadata || {},
  };

  const r = await fetch(`${IMPERIUM_BASE}/sales`, {
    method: 'POST',
    headers: {
      'X-Api-Public-Key': PUBLIC_KEY,
      'X-Api-Private-Key': PRIVATE_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const j = await r.json();

  if (!r.ok) {
    console.error('[Imperium] Erro criar PIX:', j);
    throw new Error(j.message || j.error || 'Erro ao criar PIX no gateway');
  }

  const sale = j.sale;
  if (!sale?.payment?.pix) {
    throw new Error('Resposta inválida do gateway: PIX não retornado');
  }

  return {
    saleId: sale.id,
    status: sale.status,
    pixCopiaCola: sale.payment.pix.key,
    qrCodeBase64: sale.payment.pix.qrCodeBase64,
    amount: sale.amount,
  };
}

export interface BuscarTransacaoResponse {
  id: number;
  status: string;            // PENDENTE | PAGO | CANCELADO | etc
  amount: string;
  paymentMethod: string;
  customer: any;
  payment: any;
}

export async function buscarTransacao(saleId: number | string): Promise<BuscarTransacaoResponse> {
  const r = await fetch(`${IMPERIUM_BASE}/sales/${saleId}`, {
    method: 'GET',
    headers: {
      'X-Api-Public-Key': PUBLIC_KEY,
      'X-Api-Private-Key': PRIVATE_KEY,
    },
  });

  const j = await r.json();

  if (!r.ok) {
    console.error('[Imperium] Erro buscar transação:', j);
    throw new Error(j.message || 'Erro ao buscar transação');
  }

  return j.sale || j;
}

// Validação HMAC do webhook (postback por transação)
import crypto from 'crypto';

export function validarAssinaturaWebhook(payload: any, signature: string): boolean {
  const secret = process.env.IMPERIUM_POSTBACK_SECRET;

  // Se não tem secret configurado, aceitamos (modo dev/sem validação)
  // Em produção SEMPRE configure
  if (!secret) {
    console.warn('[Imperium] IMPERIUM_POSTBACK_SECRET não configurado — pulando validação HMAC');
    return true;
  }

  if (!signature) return false;

  try {
    const payloadJson = JSON.stringify(payload);
    const expected = crypto.createHmac('sha256', secret).update(payloadJson).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
  } catch (e) {
    console.error('[Imperium] Erro validando assinatura:', e);
    return false;
  }
}
