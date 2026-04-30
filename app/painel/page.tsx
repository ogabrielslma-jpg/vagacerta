'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogoMark } from '@/components/Logo';

const TRANSACOES_FAKE = [
  { id: 1, tipo: 'in', titulo: 'Pagamento recebido', sub: 'De Acme Inc · Stripe · Hoje, 14:32', valor: 1250.00, moeda: 'USD', bandeira: '🇺🇸' },
  { id: 2, tipo: 'in', titulo: 'YouTube AdSense', sub: 'Google LLC · Ontem, 09:15', valor: 487.30, moeda: 'USD', bandeira: '🇺🇸' },
  { id: 3, tipo: 'in', titulo: 'Pagamento Upwork', sub: 'Cliente UK · 26/04, 18:45', valor: 320.00, moeda: 'GBP', bandeira: '🇬🇧' },
  { id: 4, tipo: 'out', titulo: 'Cartão internacional', sub: 'Amazon Prime · 25/04', valor: 14.99, moeda: 'USD', bandeira: '🇺🇸' },
  { id: 5, tipo: 'in', titulo: 'Cliente alemão', sub: 'Müller GmbH · SEPA · 24/04', valor: 850.00, moeda: 'EUR', bandeira: '🇪🇺' },
  { id: 6, tipo: 'out', titulo: 'Conversão para BRL', sub: 'USD → BRL · 23/04', valor: 500.00, moeda: 'USD', bandeira: '🇺🇸' },
];

const MOEDAS = [
  { codigo: 'BRL', nome: 'Real', bandeira: '🇧🇷', simbolo: 'R$' },
  { codigo: 'USD', nome: 'Dólar', bandeira: '🇺🇸', simbolo: '$' },
  { codigo: 'EUR', nome: 'Euro', bandeira: '🇪🇺', simbolo: '€' },
  { codigo: 'GBP', nome: 'Libra', bandeira: '🇬🇧', simbolo: '£' },
];

const SALDOS_POR_MOEDA = {
  BRL: 4823.45,
  USD: 2147.85,
  EUR: 850.00,
  GBP: 320.00,
};

const formatNum = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Painel() {
  const router = useRouter();
  const [cliente, setCliente] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [mostraSaldo, setMostraSaldo] = useState(true);
  const [moedaSelecionada, setMoedaSelecionada] = useState('BRL');
  const [modalAcao, setModalAcao] = useState<string | null>(null);
  const [modalAtivacao, setModalAtivacao] = useState(false);

  useEffect(() => {
    fetch('/api/painel/me')
      .then(r => {
        if (r.status === 401) { router.push('/login'); return null; }
        return r.json();
      })
      .then(d => {
        if (d?.cliente) {
          setCliente(d.cliente);
          // Abre modal de ativação automaticamente após 800ms se conta não ativada
          if (!d.cliente.conta_ativada) {
            setTimeout(() => setModalAtivacao(true), 800);
          }
        }
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
  const aprovado = cliente.conta_ativada === true;
  const moedaAtual = MOEDAS.find(m => m.codigo === moedaSelecionada)!;

  // BRL = saldo real (vem do PIX pago). Outras moedas = saldos demo se ativado.
  const saldoAtual = moedaSelecionada === 'BRL'
    ? Number(cliente.saldo || 0)
    : aprovado ? (SALDOS_POR_MOEDA as any)[moedaSelecionada] : 0;

  return (
    <div className="dash-shell">
      <header className="dash-header">
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <LogoMark size={32} />
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.025em', color: 'white' }}>
            Das<span style={{ color: '#00FFB3' }}>Bank</span>
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
        {/* Banner de ativação - depósito inicial pendente */}
        {!cliente.conta_ativada && (
          <div className="status-conta-card" style={{
            background: 'linear-gradient(135deg, rgba(0, 255, 179, 0.08) 0%, rgba(0, 255, 179, 0.02) 100%)',
            borderColor: 'rgba(0, 255, 179, 0.3)',
            cursor: 'pointer',
          }} onClick={() => router.push('/ativacao')}>
            <div className="status-conta-icon" style={{
              background: 'var(--mint)',
              color: 'var(--black)',
              boxShadow: '0 0 20px var(--mint-glow)',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div className="status-conta-info" style={{ flex: 1 }}>
              <div className="status-conta-titulo">Ative sua conta com R$ 45,00 →</div>
              <div className="status-conta-sub">Depósito inicial vira saldo na hora. Disponível em até 48h pra sacar.</div>
            </div>
            <div style={{ color: 'var(--mint)', fontSize: 22 }}>→</div>
          </div>
        )}

        {/* Conta ativada */}
        {cliente.conta_ativada && (
          <div className="status-conta-card">
            <div className="status-conta-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div className="status-conta-info">
              <div className="status-conta-titulo">Conta global ativa ✓</div>
              <div className="status-conta-sub">Saldo de R$ 45,00 disponível. Receba de +140 países e movimente sem taxas.</div>
            </div>
          </div>
        )}

        {/* Tabs de moeda */}
        <div className="moeda-tabs">
          {MOEDAS.map(m => (
            <div
              key={m.codigo}
              className={`moeda-tab ${moedaSelecionada === m.codigo ? 'active' : ''}`}
              onClick={() => setMoedaSelecionada(m.codigo)}
            >
              <span style={{ fontSize: 16 }}>{m.bandeira}</span>
              <span className="codigo">{m.codigo}</span>
              {aprovado && <span style={{ fontSize: 11, opacity: 0.7 }}>{m.simbolo} {formatNum((SALDOS_POR_MOEDA as any)[m.codigo])}</span>}
            </div>
          ))}
        </div>

        {/* Saldo */}
        <div className="saldo-card">
          <div className="saldo-label">
            Saldo em {moedaAtual.nome} ({moedaAtual.codigo})
            <button className="saldo-toggle" onClick={()=>setMostraSaldo(!mostraSaldo)}>
              {mostraSaldo ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              )}
            </button>
          </div>
          <div className="saldo-valor">
            <span className="moeda">{moedaAtual.simbolo}</span>
            {mostraSaldo ? formatNum(saldoAtual) : '••••••'}
          </div>
          {aprovado && (
            <div className="saldo-conta">
              {moedaSelecionada === 'BRL' ? (
                <>Agência <strong>{cliente.agencia}</strong> · Conta <strong>{cliente.numero_conta}</strong></>
              ) : moedaSelecionada === 'USD' ? (
                <>Routing <strong>084009519</strong> · Account <strong>9892****6451</strong> · Wells Fargo</>
              ) : moedaSelecionada === 'EUR' ? (
                <>IBAN <strong>BE63 9670 1234 5678</strong> · BIC <strong>TRWIBEB1XXX</strong></>
              ) : (
                <>Sort <strong>23-14-70</strong> · Account <strong>3140****87</strong> · Barclays</>
              )}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="quick-actions">
          <div className="quick-action" onClick={()=>setModalAcao('Receber pagamento')}>
            <div className="quick-action-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
            </div>
            <span>Receber</span>
          </div>
          <div className="quick-action" onClick={()=>setModalAcao('Converter moeda')}>
            <div className="quick-action-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
            </div>
            <span>Converter</span>
          </div>
          <div className="quick-action" onClick={()=>setModalAcao('Sacar para BRL')}>
            <div className="quick-action-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <span>Sacar BRL</span>
          </div>
          <div className="quick-action" onClick={()=>setModalAcao('Cartão internacional')}>
            <div className="quick-action-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            </div>
            <span>Cartão</span>
          </div>
        </div>

        {/* Cartão + Extrato */}
        <div className="dash-grid">
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
                    <div className="extrato-titulo">{t.titulo} <span className="extrato-bandeira">{t.bandeira}</span></div>
                    <div className="extrato-sub">{t.sub}</div>
                  </div>
                  <div>
                    <div className={`extrato-valor ${t.tipo}`}>
                      {t.tipo === 'in' ? '+ ' : '− '}{t.moeda === 'USD' ? '$' : t.moeda === 'EUR' ? '€' : t.moeda === 'GBP' ? '£' : 'R$'} {formatNum(t.valor)}
                    </div>
                    <div className="extrato-valor-sub">{t.moeda}</div>
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
                  Suas transações multi-moeda aparecerão aqui
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cards bonus */}
        <div className="dash-grid">
          <div className="extrato-card">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: 'white' }}>Câmbio comercial</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>USD → BRL</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'white', fontWeight: 600 }}>R$ 5,12</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>EUR → BRL</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'white', fontWeight: 600 }}>R$ 5,58</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>GBP → BRL</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'white', fontWeight: 600 }}>R$ 6,42</span>
              </div>
              <button onClick={()=>setModalAcao('Converter moeda')} style={{
                width: '100%', marginTop: 10,
                padding: '8px 18px', background: 'transparent', color: '#00FFB3',
                border: '1px solid #00FFB3', borderRadius: 8, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit'
              }}>
                Converter agora →
              </button>
            </div>
          </div>

          <div className="extrato-card">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: 'white' }}>Limite cartão internacional</h3>
            <div style={{ padding: '6px 0' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Disponível</span>
                <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>$ {aprovado ? '5,000.00' : '0.00'}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Total</span>
                <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>$ {aprovado ? '5,000.00' : '0.00'}</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: aprovado ? '100%' : '0%', background: '#00FFB3' }}></div>
              </div>
              <button onClick={()=>setModalAcao('Aumentar limite')} style={{
                width: '100%', marginTop: 14,
                padding: '8px 18px', background: 'transparent', color: '#00FFB3',
                border: '1px solid #00FFB3', borderRadius: 8, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit'
              }}>
                Pedir aumento de limite →
              </button>
            </div>
          </div>
        </div>
      </main>

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
              Em desenvolvimento. Em breve você poderá usar
              <strong style={{color:'white'}}> {modalAcao}</strong> direto pelo painel DasBank Global.
            </p>
            <button className="modal-close-btn" onClick={()=>setModalAcao(null)}>Entendi</button>
          </div>
        </div>
      )}

      {/* Modal de Ativação - aparece automaticamente */}
      {modalAtivacao && !cliente.conta_ativada && (
        <div className="modal-backdrop" onClick={()=>setModalAtivacao(false)}>
          <div className="modal modal-ativacao" onClick={e=>e.stopPropagation()}>
            <div className="modal-ativacao-badge">
              <span style={{
                width: 6, height: 6, background: 'var(--mint)',
                borderRadius: '50%', boxShadow: '0 0 8px var(--mint)',
                animation: 'pulse 2s infinite',
                display: 'inline-block', marginRight: 6,
              }}/>
              Ação necessária
            </div>

            <div className="modal-icon" style={{
              background: 'var(--mint)',
              color: 'var(--black)',
              boxShadow: '0 0 30px var(--mint-glow)',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>

            <h2>Ative sua conta global</h2>
            <p style={{ marginBottom: 16 }}>
              Bem-vindo ao DasBank, <strong style={{color:'white'}}>{nomePrimeiro}</strong>! 🎉
              <br/><br/>
              Pra finalizar a abertura da sua conta, é necessário um <strong style={{color:'var(--mint)'}}>depósito
              inicial de R$ 45,00</strong> via PIX. Esse valor fica como <strong style={{color:'white'}}>saldo
              na sua conta</strong> e estará disponível pra saque ou movimentação em até 48 horas.
            </p>

            <div style={{
              background: 'var(--mint-soft)',
              border: '1px solid rgba(0, 255, 179, 0.2)',
              borderRadius: 12,
              padding: 14,
              marginBottom: 18,
              fontSize: 13,
              color: 'rgba(255,255,255,0.75)',
              textAlign: 'left',
              lineHeight: 1.55,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span>Valor do depósito</span>
                <strong style={{color:'white'}}>R$ 45,00</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span>Forma de pagamento</span>
                <strong style={{color:'white'}}>PIX</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Disponível em</span>
                <strong style={{color:'var(--mint)'}}>até 48 horas</strong>
              </div>
            </div>

            <button
              onClick={() => router.push('/ativacao')}
              style={{
                width: '100%',
                padding: '14px',
                background: 'var(--mint)',
                color: 'var(--black)',
                border: 'none',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
                fontFamily: 'inherit',
                marginBottom: 8,
                boxShadow: '0 0 20px var(--mint-glow)',
              }}
            >
              Pagar R$ 45 e ativar conta →
            </button>

            <button
              onClick={() => setModalAtivacao(false)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'transparent',
                color: 'rgba(255,255,255,0.5)',
                border: '1px solid var(--black-border)',
                borderRadius: 10,
                fontWeight: 500,
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Fazer depois
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
