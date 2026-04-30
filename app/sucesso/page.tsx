'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogoMark } from '@/components/Logo';

export default function Sucesso() {
  const router = useRouter();

  // Faz logout antes de redirecionar pro login (limpa qualquer cookie residual)
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

        <h1>Cadastro recebido! 🎉</h1>
        <p>
          Seus documentos foram aprovados em pré-análise. <strong style={{color:'white'}}>Faça login</strong> com
          seus dados pra acessar sua conta DasBank e finalizar a abertura.
        </p>

        <div className="sucesso-info">
          <div className="sucesso-info-titulo">⚡ Próximo passo</div>
          <div className="sucesso-info-desc">
            Após o login, você fará um depósito inicial de <strong style={{color:'var(--mint)'}}>R$ 45</strong> que
            fica como saldo na sua conta — disponível pra sacar em até 48h.
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
