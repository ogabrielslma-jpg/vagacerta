import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set('db_token', '', { maxAge: 0, path: '/' });
  return response;
}
