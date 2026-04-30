'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogoMark } from '@/components/Logo';

export default function Sucesso() {
  const router = useRouter();

  return (
    <div className="sucesso-shell">
      <div className="sucesso-card">
        <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'center' }}>
          <LogoMark size={48} />
        </div>

        <div className="sucesso-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0B3D3A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        <h1>Cadastro recebido! 🎉</h1>
        <p>
          Obrigado por escolher o DasBank! Estamos analisando seus documentos
          e em até <strong style={{color:'white'}}>24 horas úteis</strong> sua conta estará liberada.
        </p>

        <div className="sucesso-info">
          <div className="sucesso-info-titulo">📧 O que acontece agora?</div>
          <div className="sucesso-info-desc">
            Você receberá um email assim que sua conta for aprovada com seus
            dados de acesso. Enquanto isso, você já pode entrar com seu email e senha.
          </div>
        </div>

        <button
          onClick={() => router.push('/painel')}
          style={{
            width: '100%',
            padding: '14px',
            background: '#00D4A0',
            color: '#0B3D3A',
            border: 'none',
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 15,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Ir para o painel →
        </button>
      </div>
    </div>
  );
}
