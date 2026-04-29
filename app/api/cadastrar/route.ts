import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validação básica
    const required = ['nome', 'email', 'whatsapp', 'cidade', 'idade', 'area', 'experiencia', 'disponibilidade', 'salario', 'bio'];
    for (const field of required) {
      if (!body[field] || String(body[field]).trim() === '') {
        return NextResponse.json({ error: `Campo obrigatório: ${field}` }, { status: 400 });
      }
    }

    // Email válido
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    // Insere no Supabase
    const { data, error } = await supabaseAdmin
      .from('cadastros')
      .insert({
        nome: body.nome.trim(),
        email: body.email.trim().toLowerCase(),
        whatsapp: body.whatsapp.trim(),
        cidade: body.cidade.trim(),
        idade: parseInt(body.idade) || null,
        area: body.area,
        experiencia: body.experiencia,
        disponibilidade: body.disponibilidade,
        salario: body.salario.trim(),
        bio: body.bio.trim(),
        linkedin: body.linkedin?.trim() || null,
        status: 'novo',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      // Se for email duplicado
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Este email já está cadastrado' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Erro ao salvar cadastro' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: data.id });
  } catch (err: any) {
    console.error('Cadastro error:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
