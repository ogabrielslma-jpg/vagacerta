'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Vaga = {
  id: string;
  status: string;
  horario_entrevista: string | null;
  enviada_em: string;
  vaga: {
    id: string;
    titulo: string;
    empresa: string;
    descricao: string;
    requisitos: string | null;
    beneficios: string | null;
    modalidade: string;
    carga_horaria: string | null;
    salario_label: string | null;
    area: string | null;
    ativa: boolean;
  };
};

type Mensagem = {
  id: string;
  titulo: string;
  corpo: string;
  tipo: string;
  lida: boolean;
  created_at: string;
};

type DataResponse = {
  perfil: any;
  vagas: Vaga[];
  mensagens: Mensagem[];
  stats: { total_vagas: number; novas: number; agendadas: number; mensagens_nao_lidas: number };
};

export default function PainelPage() {
  const router = useRouter();
  const [data, setData] = useState<DataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'vagas' | 'mensagens' | 'perfil'>('vagas');
  const [vagaSelecionada, setVagaSelecionada] = useState<Vaga | null>(null);

  useEffect(() => {
    fetch('/api/painel/me')
      .then(r => {
        if (r.status === 401) {
          router.push('/login');
          return null;
        }
        return r.json();
      })
      .then(d => {
        if (d) setData(d);
        setLoading(false);
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const formatDate = (s: string) => new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

  if (loading) {
    return <div className="admin-shell"><div className="loading" style={{ paddingTop: 200 }}>Carregando seu painel...</div></div>;
  }

  if (!data) return null;

  const { perfil, vagas, mensagens, stats } = data;
  const primeiroNome = perfil.nome.split(' ')[0];

  return (
    <div className="painel-shell">
      <header className="admin-header">
        <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1><div className="logo-mark">V</div>VagaCerta</h1>
        </a>
        <button className="btn-logout" onClick={logout}>Sair</button>
      </header>

      <main className="painel-main">
        <div className="painel-welcome">
          <div>
            <div className="painel-eyebrow">SEU PAINEL</div>
            <h2 className="painel-title">Olá, {primeiroNome} 👋</h2>
            <p className="painel-sub">
              {stats.total_vagas === 0
                ? 'Ainda não enviamos vagas pra você. Estamos analisando seu perfil.'
                : `Você tem ${stats.novas} ${stats.novas === 1 ? 'nova vaga' : 'novas vagas'} pra revisar.`}
            </p>
          </div>
        </div>

        <div className="painel-stats">
          <div className="painel-stat">
            <div className="painel-stat-num">{stats.total_vagas}</div>
            <div className="painel-stat-label">Vagas recebidas</div>
          </div>
          <div className="painel-stat">
            <div className="painel-stat-num" style={{ color: 'var(--lime)' }}>{stats.novas}</div>
            <div className="painel-stat-label">Novas</div>
          </div>
          <div className="painel-stat">
            <div className="painel-stat-num" style={{ color: '#64C8FF' }}>{stats.agendadas}</div>
            <div className="painel-stat-label">Entrevistas agendadas</div>
          </div>
          <div className="painel-stat">
            <div className="painel-stat-num" style={{ color: 'var(--orange)' }}>{stats.mensagens_nao_lidas}</div>
            <div className="painel-stat-label">Mensagens não lidas</div>
          </div>
        </div>

        <div className="painel-tabs">
          <button className={`painel-tab ${tab === 'vagas' ? 'active' : ''}`} onClick={() => setTab('vagas')}>
            💼 Vagas {stats.novas > 0 && <span className="tab-badge">{stats.novas}</span>}
          </button>
          <button className={`painel-tab ${tab === 'mensagens' ? 'active' : ''}`} onClick={() => setTab('mensagens')}>
            💬 Mensagens {stats.mensagens_nao_lidas > 0 && <span className="tab-badge">{stats.mensagens_nao_lidas}</span>}
          </button>
          <button className={`painel-tab ${tab === 'perfil' ? 'active' : ''}`} onClick={() => setTab('perfil')}>
            👤 Meu perfil
          </button>
        </div>

        {tab === 'vagas' && (
          <div className="painel-content">
            {vagas.length === 0 ? (
              <div className="empty-painel">
                <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                <h3>Nenhuma vaga ainda</h3>
                <p>Estamos analisando seu perfil e em breve você vai receber vagas selecionadas pra você. Volte aqui em algumas horas.</p>
              </div>
            ) : (
              <div className="vagas-grid">
                {vagas.map(v => (
                  <div key={v.id} className={`vaga-card status-${v.status}`} onClick={() => setVagaSelecionada(v)}>
                    <div className="vaga-card-head">
                      <span className={`status-pill status-${v.status}`}>
                        {v.status === 'enviada' ? '🆕 Nova' :
                         v.status === 'visualizada' ? '👁 Visualizada' :
                         v.status === 'interessado' ? '⭐ Interessado' :
                         v.status === 'agendado' ? '📅 Agendada' : '❌ Recusada'}
                      </span>
                      <span className="vaga-data">{formatDate(v.enviada_em)}</span>
                    </div>
                    <h3>{v.vaga.titulo}</h3>
                    <div className="vaga-empresa">{v.vaga.empresa}</div>
                    <div className="vaga-tags">
                      <span className="vaga-tag">{v.vaga.modalidade}</span>
                      {v.vaga.carga_horaria && <span className="vaga-tag">{v.vaga.carga_horaria}</span>}
                      {v.vaga.salario_label && <span className="vaga-tag">{v.vaga.salario_label}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'mensagens' && (
          <div className="painel-content">
            {mensagens.length === 0 ? (
              <div className="empty-painel">
                <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
                <h3>Nenhuma mensagem</h3>
                <p>Quando enviarmos atualizações, elas aparecerão aqui.</p>
              </div>
            ) : (
              <div className="mensagens-lista">
                {mensagens.map(m => (
                  <div key={m.id} className={`mensagem-card ${!m.lida ? 'unread' : ''}`}>
                    <div className="mensagem-head">
                      <h4>{m.titulo}</h4>
                      <span className="mensagem-data">{formatDate(m.created_at)}</span>
                    </div>
                    <p>{m.corpo}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'perfil' && (
          <div className="painel-content">
            <div className="perfil-card">
              <div className="perfil-row"><span>Nome</span><strong>{perfil.nome}</strong></div>
              <div className="perfil-row"><span>E-mail</span><strong>{perfil.email}</strong></div>
              <div className="perfil-row"><span>WhatsApp</span><strong>{perfil.whatsapp}</strong></div>
              <div className="perfil-row"><span>Localização</span><strong>{perfil.cidade}{perfil.estado ? `, ${perfil.estado}` : ''}</strong></div>
              <div className="perfil-row"><span>Áreas de interesse</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end' }}>
                  {(perfil.areas_interesse || []).map((a: string) => <span key={a} className="detail-area-chip">{a}</span>)}
                </div>
              </div>
              <div className="perfil-row"><span>Cadastrado em</span><strong>{formatDate(perfil.created_at)}</strong></div>
            </div>
            <p style={{ color: 'var(--ink-dim)', fontSize: 14, marginTop: 16, textAlign: 'center' }}>
              Em breve você poderá editar seu perfil aqui mesmo.
            </p>
          </div>
        )}
      </main>

      {/* Modal de vaga */}
      {vagaSelecionada && (
        <div className="modal-backdrop" onClick={() => setVagaSelecionada(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h2>{vagaSelecionada.vaga.titulo}</h2>
                <div style={{ fontSize: 14, color: 'var(--lime)', marginTop: 4, fontWeight: 600 }}>{vagaSelecionada.vaga.empresa}</div>
              </div>
              <button className="modal-close" onClick={() => setVagaSelecionada(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="vaga-tags" style={{ marginBottom: 24 }}>
                <span className="vaga-tag">{vagaSelecionada.vaga.modalidade}</span>
                {vagaSelecionada.vaga.carga_horaria && <span className="vaga-tag">{vagaSelecionada.vaga.carga_horaria}</span>}
                {vagaSelecionada.vaga.salario_label && <span className="vaga-tag" style={{ background: 'rgba(198,255,61,0.2)', color: 'var(--lime)' }}>{vagaSelecionada.vaga.salario_label}</span>}
              </div>

              <div className="detail-section-title" style={{ marginTop: 0 }}>Sobre a vaga</div>
              <div className="detail-bio">{vagaSelecionada.vaga.descricao}</div>

              {vagaSelecionada.vaga.requisitos && (
                <>
                  <div className="detail-section-title">Requisitos</div>
                  <div className="detail-bio">{vagaSelecionada.vaga.requisitos}</div>
                </>
              )}

              {vagaSelecionada.vaga.beneficios && (
                <>
                  <div className="detail-section-title">Benefícios</div>
                  <div className="detail-bio">{vagaSelecionada.vaga.beneficios}</div>
                </>
              )}

              <button className="btn-primary" style={{ width: '100%', marginTop: 24, justifyContent: 'center' }}>
                📅 Agendar entrevista
              </button>
              <p style={{ color: 'var(--ink-dim)', fontSize: 13, textAlign: 'center', marginTop: 8 }}>
                (Sistema de agendamento em construção)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
