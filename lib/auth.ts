import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'vagacerta-dev-secret';

export function generateToken(cadastroId: string, email: string): string {
  return jwt.sign({ cadastroId, email }, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): { cadastroId: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return { cadastroId: decoded.cadastroId, email: decoded.email };
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);
  return req.cookies.get('vc_token')?.value || null;
}

export function getAuthFromRequest(req: NextRequest): { cadastroId: string; email: string } | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}
