'use client';

import { useState, useEffect, FormEvent } from 'react';
import { LogoMark } from '@/components/Logo';

const STATUS_LABELS: Record<string, string> = {
  em_analise: 'Em análise',
  aprovado: 'Aprovado',
  reprovado: 'Reprovado',
  pendente_docs: 'Pendente docs',
};

const formatDoc = (tipo: string, doc: string) => {
  if (!doc) return '';
  if (tipo === 'PF') return doc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  return doc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

export default function Admin() {
  const [autenticado, setAutenticado] = useState(false);
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [cadastros, setCadastros] = useState<any[]>([]);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [busca, setBusca] = useState('');
  const [modal, setModal] = useState<any>(null);

  async function autenticar(e: FormEvent) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      const r = await fetch('/api/admin/cadastros', { headers: { 'x-admin-password': senha } });
      if (r.status === 401) throw new Error('Senha incorreta');
      const j = await r.json();
      sessionStorage.setItem('db_admin_pw', senha);
      setAutenticado(true);
      setCadastros(j.cadastros || []);
    } catch (err: any) {
      setErro(err.message);
    }
    setCarregando(false);
  }

  async function carregar() {
    const pw = sessionStorage.getItem('db_admin_pw');
    if (!pw) return;
    const params = new URLSearchParams();
    if (filtroStatus !== 'todos') params.set('status', filtroStatus);
    if (busca) params.set('busca', busca);
    const r = await fetch(`/api/admin/cadastros?${params}`, { headers: { 'x-admin-password': pw } });
    const j = await r.json();
    setCadastros(j.cadastros || []);
  }

  useEffect(() => { if (autenticado) carregar(); }, [filtroStatus, busca, autenticado]);

  async function aprovar(id: string, status: string) {
    const pw = sessionStorage.getItem('db_admin_pw');
    await fetch('/api/admin/aprovar', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': pw! },
      body: JSON.stringify({ id, status }),
    });
    setModal(null);
    carregar();
  }

  function sair() {
    sessionStorage.removeItem('db_admin_pw');
    setAutenticado(false);
    setSenha('');
  }

  if (!autenticado) {
    return (
      <div className="admin-login">
        <div className="admin-login-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 20 }}>
            <LogoMark size={36} />
            <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em', color: '#0F1A1A' }}>
              Das<span style={{ color: '#00B788' }}>Bank</span>
            </span>
          </div>
          <h1>Painel administrativo</h1>
          <p>Acesso restrito a operadores do banco.</p>
          <form onSubmit={autenticar}>
            <div className="field">
              <label>Senha</label>
              <input type="password" value={senha} onChange={e=>setSenha(e.target.value)} required />
            </div>
            {erro && <div className="form-error" style={{marginBottom:10}}>{erro}</div>}
            <button
              type="submit"
              disabled={carregando}
              style={{
                width: '100%',
                padding: 13,
                background: '#00D4A0',
                color: '#0B3D3A',
                border: 'none',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const stats = {
    total: cadastros.length,
    em_analise: cadastros.filter(c=>c.status === 'em_analise').length,
    aprovado: cadastros.filter(c=>c.status === 'aprovado').length,
    reprovado: cadastros.filter(c=>c.status === 'reprovado').length,
  };

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <h1><LogoMark size={28} />DasBank · Admin</h1>
        <button className="btn-logout" onClick={sair}>Sair</button>
      </header>

      <main className="admin-main">
        <div className="admin-stats">
          <div className={`stat-card ${filtroStatus==='todos'?'active':''}`} onClick={()=>setFiltroStatus('todos')}>
            <div className="stat-card-num">{stats.total}</div>
            <div className="stat-card-label">Total</div>
          </div>
          <div className={`stat-card ${filtroStatus==='em_analise'?'active':''}`} onClick={()=>setFiltroStatus('em_analise')}>
            <div className="stat-card-num">{stats.em_analise}</div>
            <div className="stat-card-label">Em análise</div>
          </div>
          <div className={`stat-card ${filtroStatus==='aprovado'?'active':''}`} onClick={()=>setFiltroStatus('aprovado')}>
            <div className="stat-card-num">{stats.aprovado}</div>
            <div className="stat-card-label">Aprovados</div>
          </div>
          <div className={`stat-card ${filtroStatus==='reprovado'?'active':''}`} onClick={()=>setFiltroStatus('reprovado')}>
            <div className="stat-card-num">{stats.reprovado}</div>
            <div className="stat-card-label">Reprovados</div>
          </div>
        </div>

        <input
          type="text"
          className="admin-search"
          placeholder="🔍  Buscar por nome, email ou CPF/CNPJ..."
          value={busca}
          onChange={e=>setBusca(e.target.value)}
        />

        <div className="cadastros-table">
          <div className="table-row head">
            <span>Cliente</span>
            <span>Email</span>
            <span>WhatsApp</span>
            <span>Tipo</span>
            <span>Status</span>
            <span>Ações</span>
          </div>
          {cadastros.length === 0 ? (
            <div className="empty-state">
              {busca ? 'Nenhum resultado encontrado' : 'Nenhum cadastro ainda'}
            </div>
          ) : (
            cadastros.map(c => (
              <div key={c.id} className="table-row" onClick={()=>setModal(c)}>
                <span style={{ fontWeight: 600 }}>{c.nome}</span>
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>{c.email}</span>
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>{c.whatsapp}</span>
                <span><span className="tipo-pill">{c.tipo_conta}</span></span>
                <span><span className={`status-pill status-${c.status}`}>{STATUS_LABELS[c.status] || c.status}</span></span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Ver →</span>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Modal */}
      {modal && (
        <div className="modal-backdrop" onClick={()=>setModal(null)}>
          <div className="admin-modal" onClick={e=>e.stopPropagation()}>
            <div className="admin-modal-head">
              <div>
                <h2>{modal.nome}</h2>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <span className="tipo-pill" style={{ background: '#EEF2F2', color: '#0F1A1A' }}>{modal.tipo_conta}</span>
                  <span className={`status-pill status-${modal.status}`}>{STATUS_LABELS[modal.status]}</span>
                </div>
              </div>
              <button className="modal-close" onClick={()=>setModal(null)}>×</button>
            </div>
            <div className="admin-modal-body">
              <div className="detail-grid">
                <div>
                  <div className="label">Email</div>
                  <div className="value">{modal.email}</div>
                </div>
                <div>
                  <div className="label">WhatsApp</div>
                  <div className="value">{modal.whatsapp}</div>
                </div>
                <div>
                  <div className="label">{modal.tipo_conta === 'PF' ? 'CPF' : 'CNPJ'}</div>
                  <div className="value mono">{formatDoc(modal.tipo_conta, modal.documento)}</div>
                </div>
                {modal.tipo_conta === 'PF' ? (
                  <div>
                    <div className="label">Data nascimento</div>
                    <div className="value">{modal.data_nascimento ? new Date(modal.data_nascimento).toLocaleDateString('pt-BR') : '—'}</div>
                  </div>
                ) : (
                  <div>
                    <div className="label">Responsável</div>
                    <div className="value">{modal.responsavel || '—'}</div>
                  </div>
                )}
                <div>
                  <div className="label">{modal.tipo_conta === 'PF' ? 'Profissão' : 'Atividade'}</div>
                  <div className="value">{modal.profissao || '—'}</div>
                </div>
                <div>
                  <div className="label">{modal.tipo_conta === 'PF' ? 'Renda' : 'Faturamento'}</div>
                  <div className="value">{modal.renda || '—'}</div>
                </div>
              </div>

              <div className="detail-section-title">Endereço</div>
              <div className="detail-grid">
                <div style={{ gridColumn: '1 / -1' }}>
                  <div className="value">
                    {[modal.logradouro, modal.numero, modal.bairro].filter(Boolean).join(', ')}<br/>
                    {[modal.cidade, modal.estado].filter(Boolean).join(' / ')} · CEP {modal.cep}
                  </div>
                </div>
              </div>

              <div className="detail-section-title">Documentos enviados</div>
              <div className="docs-grid">
                {['Documento (frente)', 'Documento (verso)', 'Selfie com documento', modal.tipo_conta === 'PF' ? 'Comprovante de residência' : 'Contrato social'].map((nome) => (
                  <a key={nome} className="doc-thumb" href="#" onClick={e=>e.preventDefault()}>
                    <div className="doc-thumb-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                      </svg>
                    </div>
                    <div className="doc-thumb-info">
                      <div className="doc-thumb-titulo">{nome}</div>
                      <div className="doc-thumb-sub">Clique pra visualizar</div>
                    </div>
                  </a>
                ))}
              </div>

              <div className="detail-section-title">Conta bancária gerada</div>
              <div className="detail-grid">
                <div>
                  <div className="label">Agência</div>
                  <div className="value mono">{modal.agencia}</div>
                </div>
                <div>
                  <div className="label">Conta</div>
                  <div className="value mono">{modal.numero_conta}</div>
                </div>
                <div>
                  <div className="label">Saldo atual</div>
                  <div className="value">R$ {(modal.saldo || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
                <div>
                  <div className="label">Cadastro em</div>
                  <div className="value">{new Date(modal.created_at).toLocaleDateString('pt-BR')}</div>
                </div>
              </div>

              {modal.status === 'em_analise' && (
                <div className="action-buttons">
                  <button className="btn-aprovar" onClick={()=>aprovar(modal.id, 'aprovado')}>
                    ✓ Aprovar conta
                  </button>
                  <button className="btn-pedir-docs" onClick={()=>aprovar(modal.id, 'pendente_docs')}>
                    Pedir mais docs
                  </button>
                  <button className="btn-reprovar" onClick={()=>aprovar(modal.id, 'reprovado')}>
                    Reprovar
                  </button>
                </div>
              )}

              {modal.status !== 'em_analise' && (
                <div className="action-buttons">
                  <button className="btn-pedir-docs" onClick={()=>aprovar(modal.id, 'em_analise')}>
                    Voltar para análise
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
