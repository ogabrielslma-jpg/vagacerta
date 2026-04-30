import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function checkAdmin(req: NextRequest): boolean {
  const senha = req.headers.get('x-admin-password');
  return senha === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const busca = searchParams.get('busca');

  let query = supabaseAdmin.from('clientes').select('*').order('created_at', { ascending: false });
  if (status && status !== 'todos') query = query.eq('status', status);
  if (busca) query = query.or(`nome.ilike.%${busca}%,email.ilike.%${busca}%,documento.ilike.%${busca}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Remove senhas
  const cleaned = (data || []).map((c: any) => { const { senha_hash, ...rest } = c; return rest; });

  return NextResponse.json({ cadastros: cleaned });
}
