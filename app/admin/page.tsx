'use client';

import { useState, useEffect, FormEvent } from 'react';

type Experiencia = {
  empresa: string; cargo: string; inicio: string; fim: string; atual: boolean; resumo: string;
};

type Cadastro = {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  data_nascimento: string | null;
  idade: number | null;
  sexo: string | null;
  cep: string | null;
  cidade: string;
  estado: string | null;
  escolaridade: string | null;
  areas_interesse: string[] | null;
  area: string;
  experiencias: Experiencia[] | null;
  experiencia: string;
  disponibilidade: string;
  turno: string | null;
  salario: string;
  bio: string;
  linkedin: string | null;
  status: 'novo' | 'contatado' | 'agendado' | 'descartado';
  observacao: string | null;
  created_at: string;
};

type Stats = { total: number; novo: number; contatado: number; agendado: number; descartado: number };

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [cadastros, setCadastros] = useState<Cadastro[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, novo: 0, contatado: 0, agendado: 0, descartado: 0 });
  const [filter, setFilter] = useState<string>('todos');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Cadastro | null>(null);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const res = await fetch('/api/admin/cadastros', { headers: { 'x-admin-password': password } });
    if (res.ok) {
      sessionStorage.setItem('vc_admin_pwd', password);
      setAuthed(true);
      const data = await res.json();
      setCadastros(data.cadastros || []);
      setStats(data.stats);
    } else {
      setLoginError('Senha incorreta');
    }
  };

  useEffect(() => {
    const saved = sessionStorage.getItem('vc_admin_pwd');
    if (saved) {
      setPassword(saved);
      fetch('/api/admin/cadastros', { headers: { 'x-admin-password': saved } })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => {
          setAuthed(true);
          setCadastros(data.cadastros || []);
          setStats(data.stats);
        })
        .catch(() => sessionStorage.removeItem('vc_admin_pwd'));
    }
  }, []);

  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    const pwd = sessionStorage.getItem('vc_admin_pwd') || password;
    const params = new URLSearchParams();
    if (filter !== 'todos') params.set('status', filter);
    if (search) params.set('q', search);
    fetch(`/api/admin/cadastros?${params}`, { headers: { 'x-admin-password': pwd } })
      .then(r => r.json())
      .then(data => {
        setCadastros(data.cadastros || []);
        setStats(data.stats);
        setLoading(false);
      });
  }, [filter, search, authed]);

  const updateStatus = async (id: string, status: string) => {
    const pwd = sessionStorage.getItem('vc_admin_pwd') || password;
    await fetch('/api/admin/cadastros', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': pwd },
      body: JSON.stringify({ id, status }),
    });
    setCadastros(prev => prev.map(c => c.id === id ? { ...c, status: status as any } : c));
    if (selected && selected.id === id) setSelected({ ...selected, status: status as any });
    fetch('/api/admin/cadastros', { headers: { 'x-admin-password': pwd } })
      .then(r => r.json()).then(d => setStats(d.stats));
  };

  const logout = () => {
    sessionStorage.removeItem('vc_admin_pwd');
    setAuthed(false);
    setPassword('');
  };

  const formatDate = (s: string) => {
    const d = new Date(s);
    return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const formatPeriodo = (exp: Experiencia) => {
    const fmt = (m: string) => {
      if (!m) return '';
      const [y, mo] = m.split('-');
      return `${mo}/${y}`;
    };
    const i = fmt(exp.inicio);
    const f = exp.atual ? 'atual' : fmt(exp.fim);
    return `${i}${f ? ` — ${f}` : ''}`;
  };

  const whatsappLink = (n: string) => `https://wa.me/55${n.replace(/\D/g, '')}`;

  if (!authed) {
    return (
      <div className="admin-shell">
        <div className="admin-login">
          <div className="admin-login-card">
            <div className="logo" style={{ marginBottom: 20 }}>
              <div className="logo-mark">V</div>
              VagaCerta
            </div>
            <h1>Painel Admin</h1>
            <p>Acesso restrito ao time interno.</p>
            <form onSubmit={handleLogin}>
              <div className="field">
                <label>Senha</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoFocus />
              </div>
              {loginError && <div className="form-error">{loginError}</div>}
              <button type="submit" className="btn-form-submit" style={{ width: '100%', marginTop: 16 }}>Entrar</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <h1><div className="logo-mark">V</div>VagaCerta · Admin</h1>
        <button className="btn-logout" onClick={logout}>Sair</button>
      </header>

      <main className="admin-main">
        <div className="admin-stats">
          <div className={`stat-card ${filter === 'todos' ? 'active' : ''}`} onClick={() => setFilter('todos')}>
            <div className="stat-card-num">{stats.total}</div>
            <div className="stat-card-label">Total</div>
          </div>
          <div className={`stat-card ${filter === 'novo' ? 'active' : ''}`} onClick={() => setFilter('novo')}>
            <div className="stat-card-num" style={{ color: 'var(--lime)' }}>{stats.novo}</div>
            <div className="stat-card-label">Novos</div>
          </div>
          <div className={`stat-card ${filter === 'contatado' ? 'active' : ''}`} onClick={() => setFilter('contatado')}>
            <div className="stat-card-num" style={{ color: 'var(--orange)' }}>{stats.contatado}</div>
            <div className="stat-card-label">Contatados</div>
          </div>
          <div className={`stat-card ${filter === 'agendado' ? 'active' : ''}`} onClick={() => setFilter('agendado')}>
            <div className="stat-card-num" style={{ color: '#64C8FF' }}>{stats.agendado}</div>
            <div className="stat-card-label">Agendados 💰</div>
          </div>
          <div className={`stat-card ${filter === 'descartado' ? 'active' : ''}`} onClick={() => setFilter('descartado')}>
            <div className="stat-card-num" style={{ color: 'var(--ink-dim)' }}>{stats.descartado}</div>
            <div className="stat-card-label">Descartados</div>
          </div>
        </div>

        <div className="admin-filters">
          <input className="admin-search" placeholder="Buscar por nome, email ou WhatsApp..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="cadastros-table">
          <div className="table-row head">
            <div>Nome</div>
            <div>WhatsApp</div>
            <div>Áreas</div>
            <div>Cidade</div>
            <div>Status</div>
            <div>Data</div>
          </div>

          {loading ? (
            <div className="loading">Carregando...</div>
          ) : cadastros.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
              <div>Nenhum cadastro {filter !== 'todos' ? `com status "${filter}"` : 'ainda'}.</div>
            </div>
          ) : (
            cadastros.map(c => {
              const areas = c.areas_interesse && c.areas_interesse.length > 0 ? c.areas_interesse : (c.area ? [c.area] : []);
              return (
                <div key={c.id} className="table-row" onClick={() => setSelected(c)}>
                  <div><strong>{c.nome}</strong><div style={{ fontSize: 12, color: 'var(--ink-dim)' }}>{c.email}</div></div>
                  <div>{c.whatsapp}</div>
                  <div style={{ fontSize: 13 }}>{areas.slice(0, 2).join(', ')}{areas.length > 2 ? ` +${areas.length - 2}` : ''}</div>
                  <div>{c.cidade}{c.estado ? `, ${c.estado}` : ''}</div>
                  <div><span className={`status-pill status-${c.status}`}>{c.status}</span></div>
                  <div style={{ fontSize: 13, color: 'var(--ink-dim)' }}>{formatDate(c.created_at)}</div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h2>{selected.nome}</h2>
                <div style={{ fontSize: 13, color: 'var(--ink-dim)', marginTop: 4 }}>
                  Cadastrado em {formatDate(selected.created_at)}
                </div>
              </div>
              <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div>
                  <div className="label">E-mail</div>
                  <div className="value"><a href={`mailto:${selected.email}`}>{selected.email}</a></div>
                </div>
                <div>
                  <div className="label">WhatsApp</div>
                  <div className="value">{selected.whatsapp}</div>
                </div>
                <div>
                  <div className="label">Idade · Sexo</div>
                  <div className="value">{selected.idade || '—'} anos · {selected.sexo || '—'}</div>
                </div>
                <div>
                  <div className="label">Localização</div>
                  <div className="value">{selected.cidade}{selected.estado ? ` / ${selected.estado}` : ''} {selected.cep ? `· CEP ${selected.cep}` : ''}</div>
                </div>
                <div>
                  <div className="label">Escolaridade</div>
                  <div className="value">{selected.escolaridade || '—'}</div>
                </div>
                <div>
                  <div className="label">Disponibilidade · Turno</div>
                  <div className="value">{selected.disponibilidade}{selected.turno ? ` · ${selected.turno}` : ''}</div>
                </div>
                <div>
                  <div className="label">Pretensão salarial</div>
                  <div className="value">R$ {selected.salario}</div>
                </div>
                {selected.linkedin && (
                  <div>
                    <div className="label">LinkedIn</div>
                    <div className="value"><a href={selected.linkedin} target="_blank" rel="noopener">Ver perfil ↗</a></div>
                  </div>
                )}
              </div>

              <div className="detail-section-title">Áreas de interesse</div>
              <div className="detail-areas">
                {(selected.areas_interesse && selected.areas_interesse.length > 0
                  ? selected.areas_interesse
                  : (selected.area ? [selected.area] : [])
                ).map(a => <span key={a} className="detail-area-chip">{a}</span>)}
              </div>

              <div className="detail-section-title">Sobre</div>
              <div className="detail-bio">{selected.bio}</div>

              {selected.experiencias && selected.experiencias.length > 0 && (
                <>
                  <div className="detail-section-title">Experiências profissionais</div>
                  {selected.experiencias.map((exp, i) => (
                    <div key={i} className="detail-exp">
                      <div className="exp-cargo">{exp.cargo}</div>
                      <div className="exp-empresa">{exp.empresa}</div>
                      <div className="exp-periodo">{formatPeriodo(exp)}</div>
                      {exp.resumo && <div className="exp-resumo">{exp.resumo}</div>}
                    </div>
                  ))}
                </>
              )}

              <a href={whatsappLink(selected.whatsapp)} target="_blank" rel="noopener" className="btn-whatsapp">
                💬 Chamar no WhatsApp
              </a>

              <div style={{ marginTop: 24 }}>
                <div className="detail-section-title" style={{ marginTop: 0 }}>Status</div>
                <div className="status-buttons">
                  {(['novo', 'contatado', 'agendado', 'descartado'] as const).map(s => (
                    <button
                      key={s}
                      className={`status-btn ${s} ${selected.status === s ? 'active ' + s : ''}`}
                      onClick={() => updateStatus(selected.id, s)}
                    >
                      {s === 'agendado' ? '💰 ' : ''}{s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
