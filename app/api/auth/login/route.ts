import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { email, senha } = await req.json();
    if (!email || !senha) {
      return NextResponse.json({ error: 'Email e senha obrigatórios' }, { status: 400 });
    }

    const { data: user, error } = await supabaseAdmin
      .from('cadastros')
      .select('id, email, nome, senha_hash')
      .eq('email', email.trim().toLowerCase())
      .single();

    if (error || !user || !user.senha_hash) {
      return NextResponse.json({ error: 'Email ou senha inválidos' }, { status: 401 });
    }

    const ok = await bcrypt.compare(senha, user.senha_hash);
    if (!ok) {
      return NextResponse.json({ error: 'Email ou senha inválidos' }, { status: 401 });
    }

    // Atualiza último acesso
    await supabaseAdmin
      .from('cadastros')
      .update({ ultimo_acesso: new Date().toISOString() })
      .eq('id', user.id);

    const token = generateToken(user.id, user.email);

    const res = NextResponse.json({ ok: true, nome: user.nome });
    res.cookies.set('vc_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
    return res;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
