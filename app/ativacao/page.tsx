'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogoMark } from '@/components/Logo';

export default function Ativacao() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [pix, setPix] = useState<{ codigo: string; qrcode: string; saleId: number } | null>(null);
  const [status, setStatus] = useState<string>('PENDENTE');
  const [contaAtivada, setContaAtivada] = useState(false);
  const [copiado, setCopiado] = useState(false);

  // Gera o PIX ao carregar
  useEffect(() => {
    let cancelado = false;

    async function gerar() {
      try {
        const r = await fetch('/api/pix/gerar', { method: 'POST' });
        const j = await r.json();

        if (cancelado) return;

        if (r.status === 401) { router.push('/login'); return; }
        if (!r.ok) throw new Error(j.error || 'Erro ao gerar PIX');

        setPix({
          codigo: j.pixCopiaCola,
          qrcode: j.qrCodeBase64,
          saleId: j.saleId,
        });
        setLoading(false);
      } catch (e: any) {
        if (cancelado) return;
        setErro(e.message);
        setLoading(false);
      }
    }

    gerar();
    return () => { cancelado = true; };
  }, [router]);

  // Polling do status a cada 4 segundos
  useEffect(() => {
    if (!pix || contaAtivada) return;

    const interval = setInterval(async () => {
      try {
        const r = await fetch('/api/pix/status');
        if (!r.ok) return;
        const j = await r.json();

        setStatus(j.status);

        if (j.contaAtivada || j.status === 'PAGO') {
          setContaAtivada(true);
          clearInterval(interval);
          // Redireciona pro painel após 2.5s
          setTimeout(() => router.push('/painel'), 2500);
        }
      } catch {}
    }, 4000);

    return () => clearInterval(interval);
  }, [pix, contaAtivada, router]);

  function copiar() {
    if (!pix) return;
    navigator.clipboard.writeText(pix.codigo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--black)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Glow */}
      <div style={{
        position: 'absolute',
        top: '20%', left: '50%',
        transform: 'translateX(-50%)',
        width: 600, height: 600,
        background: 'radial-gradient(circle, var(--mint) 0%, transparent 60%)',
        opacity: 0.06,
        filter: 'blur(80px)',
        pointerEvents: 'none',
      }}/>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40, position: 'relative', zIndex: 2 }}>
        <LogoMark size={36} />
        <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em', color: 'white' }}>
          Das<span style={{ color: '#00FFB3' }}>Bank</span>
        </span>
      </div>

      <div style={{
        maxWidth: 480,
        width: '100%',
        background: 'var(--black-elevated)',
        border: '1px solid var(--black-border)',
        borderRadius: 20,
        padding: 32,
        position: 'relative',
        zIndex: 2,
      }}>
        {/* Conta ativada */}
        {contaAtivada ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 80, height: 80,
              background: 'var(--mint)',
              borderRadius: '50%',
              display: 'grid', placeItems: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 0 40px var(--mint-glow)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 12 }}>
              Pagamento confirmado! 🎉
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, lineHeight: 1.6, marginBottom: 16 }}>
              Sua conta está ativada com saldo de <strong style={{color:'var(--mint)'}}>R$ 45,00</strong>.
              Redirecionando pro seu painel...
            </p>
          </div>
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{
              width: 48, height: 48,
              border: '3px solid var(--black-border)',
              borderTopColor: 'var(--mint)',
              borderRadius: '50%',
              margin: '0 auto 20px',
              animation: 'spin 1s linear infinite',
            }}/>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Gerando seu PIX seguro...</p>
          </div>
        ) : erro ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <h1 style={{ fontSize: 20, marginBottom: 12, color: '#FCA5A5' }}>Ops! Algo deu errado</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 20 }}>{erro}</p>
            <button onClick={() => window.location.reload()} style={{
              padding: '10px 20px',
              background: 'var(--mint)',
              color: 'var(--black)',
              border: 'none',
              borderRadius: 10,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}>Tentar novamente</button>
          </div>
        ) : pix && (
          <>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 12px',
              background: 'var(--mint-soft)',
              border: '1px solid rgba(0, 255, 179, 0.25)',
              borderRadius: 100,
              fontSize: 12,
              color: 'var(--mint)',
              fontFamily: 'JetBrains Mono, monospace',
              marginBottom: 20,
            }}>
              <span style={{
                width: 6, height: 6, background: 'var(--mint)',
                borderRadius: '50%', boxShadow: '0 0 8px var(--mint)',
                animation: 'pulse 2s infinite',
              }}/>
              Aguardando pagamento
            </div>

            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
              Ative sua conta com <span style={{ color: 'var(--mint)' }}>R$ 45,00</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, marginBottom: 24, lineHeight: 1.55 }}>
              Esse valor é um <strong style={{color:'white'}}>depósito inicial</strong> e fica disponível como saldo na
              sua conta para você sacar ou movimentar em até 48h.
            </p>

            {/* QR Code */}
            <div style={{
              background: 'white',
              padding: 16,
              borderRadius: 14,
              marginBottom: 16,
              display: 'flex',
              justifyContent: 'center',
            }}>
              <img src={pix.qrcode} alt="QR Code PIX" style={{ width: '100%', maxWidth: 280, height: 'auto' }} />
            </div>

            {/* Copia e cola */}
            <div style={{ marginBottom: 16 }}>
              <div style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.5)',
                fontFamily: 'JetBrains Mono, monospace',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 6,
                fontWeight: 600,
              }}>PIX copia e cola</div>
              <div style={{
                background: 'var(--black-soft)',
                border: '1px solid var(--black-border)',
                borderRadius: 8,
                padding: 12,
                fontSize: 11,
                fontFamily: 'JetBrains Mono, monospace',
                color: 'rgba(255,255,255,0.75)',
                wordBreak: 'break-all',
                lineHeight: 1.4,
                maxHeight: 80,
                overflow: 'auto',
              }}>
                {pix.codigo}
              </div>
              <button
                onClick={copiar}
                style={{
                  width: '100%',
                  marginTop: 8,
                  padding: 12,
                  background: copiado ? 'var(--mint)' : 'transparent',
                  color: copiado ? 'var(--black)' : 'var(--mint)',
                  border: '1px solid var(--mint)',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all .2s',
                }}
              >
                {copiado ? '✓ Copiado!' : 'Copiar código PIX'}
              </button>
            </div>

            {/* Instruções */}
            <div style={{
              background: 'var(--mint-soft)',
              border: '1px solid rgba(0, 255, 179, 0.2)',
              borderRadius: 12,
              padding: 14,
              fontSize: 13,
              color: 'rgba(255,255,255,0.75)',
              lineHeight: 1.55,
            }}>
              <strong style={{ color: 'white', display: 'block', marginBottom: 4 }}>📱 Como pagar</strong>
              1. Abre seu banco · 2. Vai em PIX · 3. Cola o código ou escaneia o QR
              <br/>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 6, display: 'block' }}>
                A confirmação chega aqui em segundos. Não feche a página.
              </span>
            </div>

            <div style={{
              marginTop: 20,
              fontSize: 11,
              color: 'rgba(255,255,255,0.4)',
              fontFamily: 'JetBrains Mono, monospace',
              textAlign: 'center',
            }}>
              Status: {status} · Sale ID: {pix.saleId}
            </div>
          </>
        )}
      </div>

      <div style={{ marginTop: 24, fontSize: 12, color: 'rgba(255,255,255,0.4)', position: 'relative', zIndex: 2 }}>
        Pagamento processado por <strong style={{color:'rgba(255,255,255,0.7)'}}>ImperiumPay</strong> · 100% seguro
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}
