import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';

function calcularIdade(dataNascimento: string): number | null {
  if (!dataNascimento) return null;
  const nasc = new Date(dataNascimento);
  if (isNaN(nasc.getTime())) return null;
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const required = ['nome', 'email', 'whatsapp', 'data_nascimento', 'sexo', 'cep', 'cidade', 'estado', 'escolaridade', 'disponibilidade', 'turno', 'salario', 'bio', 'senha'];
    for (const field of required) {
      if (!body[field] || String(body[field]).trim() === '') {
        return NextResponse.json({ error: `Campo obrigatório: ${field}` }, { status: 400 });
      }
    }

    if (!Array.isArray(body.areas_interesse) || body.areas_interesse.length === 0) {
      return NextResponse.json({ error: 'Selecione ao menos uma área de interesse' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    if (body.senha.length < 6) {
      return NextResponse.json({ error: 'Senha deve ter ao menos 6 caracteres' }, { status: 400 });
    }

    const idade = calcularIdade(body.data_nascimento);
    const senha_hash = await bcrypt.hash(body.senha, 10);

    const { data, error } = await supabaseAdmin
      .from('cadastros')
      .insert({
        nome: body.nome.trim(),
        email: body.email.trim().toLowerCase(),
        whatsapp: body.whatsapp.trim(),
        data_nascimento: body.data_nascimento,
        idade,
        sexo: body.sexo,
        cep: body.cep.trim(),
        cidade: body.cidade.trim(),
        estado: body.estado.trim(),
        escolaridade: body.escolaridade,
        areas_interesse: body.areas_interesse,
        area: body.areas_interesse[0] || '',
        experiencia: Array.isArray(body.experiencias) && body.experiencias.length > 0 ? `${body.experiencias.length} experiência(s)` : 'Sem experiência',
        experiencias: body.experiencias || [],
        disponibilidade: body.disponibilidade,
        turno: body.turno,
        salario: body.salario.trim(),
        bio: body.bio.trim(),
        linkedin: body.linkedin?.trim() || null,
        status: 'novo',
        senha_hash,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Este email já está cadastrado. Faça login no painel.' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Erro ao salvar cadastro' }, { status: 500 });
    }

    // Cria mensagem de boas-vindas
    await supabaseAdmin.from('mensagens').insert({
      cadastro_id: data.id,
      titulo: 'Bem-vindo(a) à VagaCerta! 🎉',
      corpo: `Olá ${data.nome.split(' ')[0]}! Seu perfil foi cadastrado com sucesso. A partir de agora, vamos te enviar vagas home office sob medida pra você. Fique de olho neste painel — entrevistas costumam ser marcadas em até 7 dias.`,
      tipo: 'sistema',
    });

    // Gera token e retorna
    const token = generateToken(data.id, data.email);

    const res = NextResponse.json({ ok: true, id: data.id, token });
    res.cookies.set('vc_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 dias
      path: '/',
    });
    return res;
  } catch (err: any) {
    console.error('Cadastro error:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
