import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase';
import { generateToken } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email, senha } = await req.json();
    if (!email || !senha) {
      return NextResponse.json({ error: 'Email e senha obrigatórios' }, { status: 400 });
    }

    const { data: user } = await supabaseAdmin
      .from('clientes')
      .select('id, email, nome, senha_hash, status')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (!user || !user.senha_hash) {
      return NextResponse.json({ error: 'Email ou senha incorretos' }, { status: 401 });
    }

    const ok = await bcrypt.compare(senha, user.senha_hash);
    if (!ok) {
      return NextResponse.json({ error: 'Email ou senha incorretos' }, { status: 401 });
    }

    await supabaseAdmin.from('clientes').update({ ultimo_acesso: new Date().toISOString() }).eq('id', user.id);

    const token = generateToken(user.id, user.email);
    const response = NextResponse.json({ ok: true, status: user.status, nome: user.nome });
    response.cookies.set('db_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return response;
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erro interno' }, { status: 500 });
  }
}
