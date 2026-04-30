'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogoMark } from '@/components/Logo';

const TRANSACOES_FAKE = [
  { id: 1, tipo: 'in', titulo: 'PIX recebido', sub: 'De Marina Costa · Hoje, 14:32', valor: 850.00 },
  { id: 2, tipo: 'out', titulo: 'Cartão de crédito', sub: 'iFood · Ontem, 19:45', valor: 47.90 },
  { id: 3, tipo: 'in', titulo: 'Rendimento da conta', sub: 'CDI · Ontem, 00:01', valor: 2.34 },
  { id: 4, tipo: 'out', titulo: 'Pagamento de boleto', sub: 'Vivo · 26/04, 10:15', valor: 89.90 },
  { id: 5, tipo: 'out', titulo: 'PIX enviado', sub: 'Para Posto Shell · 25/04, 18:20', valor: 120.00 },
];

const formatBRL = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Painel() {
  const router = useRouter();
  const [cliente, setCliente] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [mostraSaldo, setMostraSaldo] = useState(true);
  const [modalAcao, setModalAcao] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/painel/me')
      .then(r => {
        if (r.status === 401) { router.push('/login'); return null; }
        return r.json();
      })
      .then(d => {
        if (d?.cliente) setCliente(d.cliente);
        setCarregando(false);
      })
      .catch(() => router.push('/login'));
  }, [router]);

  async function sair() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  if (carregando) {
    return (
      <div className="dash-shell">
        <div className="loading">Carregando...</div>
      </div>
    );
  }

  if (!cliente) return null;

  const isPF = cliente.tipo_conta === 'PF';
  const nomePrimeiro = (isPF ? cliente.nome : cliente.responsavel || cliente.nome).split(' ')[0];
  const inicial = nomePrimeiro[0]?.toUpperCase() || '?';
  const saldo = cliente.saldo || 0;
  const aprovado = cliente.status === 'aprovado';

  return (
    <div className="dash-shell">
      <header className="dash-header">
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <LogoMark size={32} />
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.025em', color: 'white' }}>
            Das<span style={{ color: '#00D4A0' }}>Bank</span>
          </span>
        </a>
        <div className="dash-header-actions">
          <button className="btn-icon" onClick={()=>setModalAcao('Notificações')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </button>
          <div className="user-pill" onClick={sair}>
            <div className="avatar">{inicial}</div>
            <span>{nomePrimeiro}</span>
          </div>
        </div>
      </header>

      <main className="dash-main">
        {/* Status da conta */}
        {!aprovado && (
          <div className="status-conta-card" style={{ background: 'rgba(245, 158, 11, 0.06)', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
            <div className="status-conta-icon" style={{ background: '#F59E0B', color: 'white' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="6" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div className="status-conta-info">
              <div className="status-conta-titulo">Conta em análise</div>
              <div className="status-conta-sub">Estamos verificando seus documentos. Em até 24h sua conta estará liberada.</div>
            </div>
          </div>
        )}

        {aprovado && (
          <div className="status-conta-card">
            <div className="status-conta-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div className="status-conta-info">
              <div className="status-conta-titulo">Conta verificada ✓</div>
              <div className="status-conta-sub">Tudo certo! Sua conta está totalmente liberada.</div>
            </div>
          </div>
        )}

        {/* Saldo */}
        <div className="saldo-card">
          <div className="saldo-label">
            Saldo disponível
            <button className="saldo-toggle" onClick={()=>setMostraSaldo(!mostraSaldo)}>
              {mostraSaldo ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              )}
            </button>
          </div>
          <div className="saldo-valor">
            <span className="moeda">R$</span>
            {mostraSaldo ? formatBRL(saldo) : '••••••'}
          </div>
          <div className="saldo-conta">
            Agência <strong>{cliente.agencia}</strong> · Conta <strong>{cliente.numero_conta}</strong>
          </div>
        </div>

        {/* Quick actions */}
        <div className="quick-actions">
          <div className="quick-action" onClick={()=>setModalAcao('PIX')}>
            <div className="quick-action-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            </div>
            <span>PIX</span>
          </div>
          <div className="quick-action" onClick={()=>setModalAcao('Transferir')}>
            <div className="quick-action-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
            </div>
            <span>Transferir</span>
          </div>
          <div className="quick-action" onClick={()=>setModalAcao('Pagar boleto')}>
            <div className="quick-action-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="3" x2="6" y2="21"/><line x1="10" y1="3" x2="10" y2="21"/><line x1="14" y1="3" x2="14" y2="21"/><line x1="18" y1="3" x2="18" y2="21"/></svg>
            </div>
            <span>Pagar</span>
          </div>
          <div className="quick-action" onClick={()=>setModalAcao('Investir')}>
            <div className="quick-action-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            </div>
            <span>Investir</span>
          </div>
        </div>

        {/* Cartão + Extrato */}
        <div className="dash-grid">
          {/* Cartão virtual */}
          <div className="cartao-virtual">
            <div className="cartao-top">
              <div className="cartao-chip"></div>
              <div className="cartao-bandeira">DasBank</div>
            </div>
            <div className="cartao-numero">
              {cliente.numero_cartao || '5234 •••• •••• ••••'}
            </div>
            <div className="cartao-bottom">
              <div>
                <div className="label">Titular</div>
                <div className="value">{(isPF ? cliente.nome : cliente.razao_social).toUpperCase().slice(0, 24)}</div>
              </div>
              <div>
                <div className="label">Validade</div>
                <div className="value">12/30</div>
              </div>
              <div>
                <div className="label">CVV</div>
                <div className="value">•••</div>
              </div>
            </div>
          </div>

          {/* Extrato */}
          <div className="extrato-card">
            <div className="extrato-head">
              <h3>Últimas transações</h3>
              <a href="#" onClick={(e)=>{e.preventDefault(); setModalAcao('Extrato completo');}}>Ver todas →</a>
            </div>

            {aprovado ? (
              TRANSACOES_FAKE.map(t => (
                <div key={t.id} className="extrato-item">
                  <div className={`extrato-icon ${t.tipo}`}>
                    {t.tipo === 'in' ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                    )}
                  </div>
                  <div className="extrato-info">
                    <div className="extrato-titulo">{t.titulo}</div>
                    <div className="extrato-sub">{t.sub}</div>
                  </div>
                  <div className={`extrato-valor ${t.tipo}`}>
                    {t.tipo === 'in' ? '+ ' : '− '}R$ {formatBRL(t.valor)}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px', opacity: 0.5 }}>
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 4 }}>
                  Aguardando aprovação
                </div>
                <div style={{ fontSize: 12 }}>
                  Suas transações aparecerão aqui assim que sua conta for ativada
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cards bonus */}
        <div className="dash-grid">
          <div className="extrato-card">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Investimentos</h3>
            <div style={{ padding: '20px 0', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 4, fontVariantNumeric: 'tabular-nums' }}>
                R$ 0,00
              </div>
              <div style={{ fontSize: 12, marginBottom: 14 }}>Você ainda não investe pelo DasBank</div>
              <button onClick={()=>setModalAcao('Investimentos')} style={{
                padding: '8px 18px', background: 'transparent', color: '#00D4A0',
                border: '1px solid #00D4A0', borderRadius: 8, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit'
              }}>
                Começar a investir →
              </button>
            </div>
          </div>

          <div className="extrato-card">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Limite de crédito</h3>
            <div style={{ padding: '6px 0' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Disponível</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>R$ {aprovado ? '2.500,00' : '0,00'}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Total</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>R$ {aprovado ? '2.500,00' : '0,00'}</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: aprovado ? '100%' : '0%', background: '#00D4A0' }}></div>
              </div>
              <button onClick={()=>setModalAcao('Aumentar limite')} style={{
                width: '100%', marginTop: 14,
                padding: '8px 18px', background: 'transparent', color: '#00D4A0',
                border: '1px solid #00D4A0', borderRadius: 8, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit'
              }}>
                Pedir aumento de limite →
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de "feature em desenvolvimento" */}
      {modalAcao && (
        <div className="modal-backdrop" onClick={()=>setModalAcao(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
            </div>
            <h2>{modalAcao}</h2>
            <p>
              Essa funcionalidade está em desenvolvimento. Em breve você poderá usar
              <strong style={{color:'white'}}> {modalAcao}</strong> direto pelo app DasBank.
            </p>
            <button className="modal-close-btn" onClick={()=>setModalAcao(null)}>Entendi</button>
          </div>
        </div>
      )}
    </div>
  );
}
