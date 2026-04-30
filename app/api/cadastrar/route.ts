import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.nome || !body.email || !body.whatsapp || !body.senha || !body.tipo_conta) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }
    if (body.senha.length < 6) {
      return NextResponse.json({ error: 'Senha precisa ter no mínimo 6 caracteres' }, { status: 400 });
    }

    const email = String(body.email).toLowerCase().trim();

    const { data: existente } = await supabaseAdmin
      .from('clientes')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existente) {
      return NextResponse.json({ error: 'Esse email já está cadastrado. Faça login.' }, { status: 409 });
    }

    const senha_hash = await bcrypt.hash(body.senha, 10);

    // Gera dados de "conta" fake
    const numeroConta = String(Math.floor(100000 + Math.random() * 899999)) + '-' + Math.floor(Math.random() * 10);
    const numeroCartao = '5234 ' + Math.floor(1000 + Math.random()*8999) + ' ' + Math.floor(1000 + Math.random()*8999) + ' ' + Math.floor(1000 + Math.random()*8999);

    const insertData: any = {
      tipo_conta: body.tipo_conta,
      nome: body.nome,
      razao_social: body.razao_social || null,
      responsavel: body.responsavel || null,
      documento: body.documento,
      data_nascimento: body.data_nascimento || null,
      email,
      whatsapp: body.whatsapp,
      cep: body.cep || null,
      logradouro: body.logradouro || null,
      numero: body.numero || null,
      bairro: body.bairro || null,
      cidade: body.cidade || null,
      estado: body.estado || null,
      profissao: body.profissao || null,
      renda: body.renda || null,
      docs_enviados: body.docs_enviados || true,
      senha_hash,
      ultimo_acesso: new Date().toISOString(),
      status: 'em_analise',
      numero_conta: numeroConta,
      numero_cartao: numeroCartao,
      saldo: 0,
      agencia: '0001',
    };

    const { data: novo, error } = await supabaseAdmin
      .from('clientes')
      .insert(insertData)
      .select('id, email, nome')
      .single();

    if (error) {
      console.error('Erro inserindo:', error);
      return NextResponse.json({ error: 'Erro ao salvar cadastro' }, { status: 500 });
    }

    // NÃO auto-loga: limpa qualquer cookie residual e deixa o cliente
    // ir pra /login com email/senha. Evita estado inconsistente entre
    // múltiplos cadastros na mesma sessão.
    const response = NextResponse.json({ ok: true, id: novo.id });
    response.cookies.set('db_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (e: any) {
    console.error('Erro na API cadastrar:', e);
    return NextResponse.json({ error: e.message || 'Erro interno' }, { status: 500 });
  }
}
