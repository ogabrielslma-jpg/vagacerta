'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { LogoMark } from '@/components/Logo';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro ao entrar');
        setLoading(false);
        return;
      }
      router.push('/painel');
    } catch {
      setError('Erro de conexão');
      setLoading(false);
    }
  };

  return (
    <div className="admin-shell">
      <div className="admin-login">
        <div className="admin-login-card">
          <a href="/" className="logo" style={{ marginBottom: 24, justifyContent: 'center' }}>
            <LogoMark size={32} />
            VagaCerta
          </a>
          <h1>Entrar no seu painel</h1>
          <p>Acompanhe as vagas que selecionamos pra você.</p>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" autoFocus required />
            </div>
            <div className="field">
              <label>Senha</label>
              <input type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••" required />
            </div>
            {error && <div className="form-error">{error}</div>}
            <button type="submit" className="btn-form-submit" style={{ width: '100%', marginTop: 16 }} disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--ink-dim)' }}>
            Ainda não tem conta? <a href="/#cadastro" style={{ color: 'var(--lime)', fontWeight: 600 }}>Cadastre-se grátis</a>
          </div>
        </div>
      </div>
    </div>
  );
}
