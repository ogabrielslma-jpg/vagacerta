'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { LogoMark } from '@/components/Logo';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [showSenha, setShowSenha] = useState(false);

  async function entrar(e: FormEvent) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Erro ao entrar');
      router.push('/painel');
    } catch (err: any) {
      setErro(err.message);
      setCarregando(false);
    }
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <a href="/" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', textDecoration: 'none' }}>
          <LogoMark size={36} />
          <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em', color: '#0F1A1A' }}>
            Das<span style={{ color: '#00B788' }}>Bank</span>
          </span>
        </a>

        <h1>Entrar na sua conta</h1>
        <p>Acesse seu painel DasBank.</p>

        <form onSubmit={entrar}>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com" required />
          </div>
          <div className="field" style={{ position: 'relative' }}>
            <label>Senha</label>
            <input
              type={showSenha ? 'text' : 'password'}
              value={senha}
              onChange={e=>setSenha(e.target.value)}
              placeholder="Sua senha"
              required
              style={{ paddingRight: 40 }}
            />
            <button type="button" className="toggle-senha" onClick={()=>setShowSenha(!showSenha)} style={{ top: '70%' }}>
              {showSenha ? '🙈' : '👁️'}
            </button>
          </div>
          {erro && <div className="form-error" style={{ marginBottom: 10 }}>{erro}</div>}
          <button
            type="submit"
            disabled={carregando}
            style={{
              width: '100%',
              padding: '13px',
              background: '#00D4A0',
              color: '#0B3D3A',
              border: 'none',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 15,
              cursor: carregando ? 'not-allowed' : 'pointer',
              opacity: carregando ? 0.6 : 1,
              fontFamily: 'inherit',
              marginTop: 4,
            }}
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="login-link">
          Não tem conta? <a href="/">Abra a sua grátis</a>
        </div>
      </div>
    </div>
  );
}
