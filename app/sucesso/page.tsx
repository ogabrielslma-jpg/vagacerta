'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogoMark } from '@/components/Logo';

export default function Sucesso() {
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
      const t = setTimeout(() => router.push('/login'), 3000);
      return () => clearTimeout(t);
    });
  }, [router]);

  return (
    <div className="sucesso-shell">
      <div className="sucesso-card">
        <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'center' }}>
          <LogoMark size={48} />
        </div>

        <div className="sucesso-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        <h1>Conta criada com sucesso! 🎉</h1>
        <p>
          Bem-vindo ao DasBank! Seu cadastro foi <strong style={{color:'white'}}>aprovado em pré-análise</strong>.
          Faça login pra acessar sua conta global e começar a movimentar.
        </p>

        <div className="sucesso-info">
          <div className="sucesso-info-titulo">🌍 O que te espera</div>
          <div className="sucesso-info-desc">
            Conta global multi-moeda, recebimento de mais de 140 países, câmbio comercial
            sem IOF e cartão internacional sem anuidade.
          </div>
        </div>

        <button
          onClick={() => router.push('/login')}
          style={{
            width: '100%',
            padding: '14px',
            background: '#00FFB3',
            color: '#0A0A0A',
            border: 'none',
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 15,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Acessar minha conta →
        </button>

        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 14 }}>
          Redirecionando automaticamente em 3 segundos...
        </p>
      </div>
    </div>
  );
}
