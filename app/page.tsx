'use client';

import { useState, FormEvent } from 'react';
import { EMPRESAS_BR, AREAS_INTERESSE, ESCOLARIDADE, TURNOS, DISPONIBILIDADE, SEXO } from '@/lib/constantes';

type Experiencia = {
  empresa: string;
  cargo: string;
  inicio: string;
  fim: string;
  atual: boolean;
  resumo: string;
};

export default function Home() {
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cepLoading, setCepLoading] = useState(false);

  const [form, setForm] = useState({
    nome: '',
    email: '',
    whatsapp: '',
    data_nascimento: '',
    sexo: '',
    cep: '',
    cidade: '',
    estado: '',
    escolaridade: '',
    areas_interesse: [] as string[],
    disponibilidade: '',
    turno: '',
    salario: '',
    experiencias: [] as Experiencia[],
    bio: '',
    linkedin: '',
  });

  // Experiência sendo digitada agora
  const [expAtual, setExpAtual] = useState<Experiencia>({
    empresa: '', cargo: '', inicio: '', fim: '', atual: false, resumo: ''
  });
  const [empresaSugestoes, setEmpresaSugestoes] = useState<string[]>([]);

  const update = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  // Idade calculada em tempo real
  const idadeCalculada = (() => {
    if (!form.data_nascimento) return null;
    const nasc = new Date(form.data_nascimento);
    if (isNaN(nasc.getTime())) return null;
    const hoje = new Date();
    let i = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) i--;
    return i;
  })();

  const formatWhats = (v: string) => {
    let n = v.replace(/\D/g, '').slice(0, 11);
    if (n.length > 6) return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`;
    if (n.length > 2) return `(${n.slice(0,2)}) ${n.slice(2)}`;
    return n;
  };

  const formatCEP = (v: string) => {
    let n = v.replace(/\D/g, '').slice(0, 8);
    if (n.length > 5) return `${n.slice(0,5)}-${n.slice(5)}`;
    return n;
  };

  // Busca CEP via ViaCEP
  const buscarCEP = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        update('cidade', data.localidade || '');
        update('estado', data.uf || '');
      }
    } catch (e) {
      // silencia, deixa pessoa preencher manual
    } finally {
      setCepLoading(false);
    }
  };

  const handleEmpresaInput = (v: string) => {
    setExpAtual(p => ({ ...p, empresa: v }));
    if (v.length >= 2) {
      const lower = v.toLowerCase();
      setEmpresaSugestoes(
        EMPRESAS_BR.filter(e => e.toLowerCase().includes(lower)).slice(0, 6)
      );
    } else {
      setEmpresaSugestoes([]);
    }
  };

  const toggleArea = (area: string) => {
    setForm(p => ({
      ...p,
      areas_interesse: p.areas_interesse.includes(area)
        ? p.areas_interesse.filter(a => a !== area)
        : [...p.areas_interesse, area]
    }));
  };

  const adicionarExperiencia = () => {
    if (!expAtual.empresa || !expAtual.cargo || !expAtual.inicio) {
      setError('Preencha empresa, cargo e início para adicionar a experiência');
      return;
    }
    setForm(p => ({ ...p, experiencias: [...p.experiencias, expAtual] }));
    setExpAtual({ empresa: '', cargo: '', inicio: '', fim: '', atual: false, resumo: '' });
    setEmpresaSugestoes([]);
    setError(null);
  };

  const removerExperiencia = (i: number) => {
    setForm(p => ({ ...p, experiencias: p.experiencias.filter((_, idx) => idx !== i) }));
  };

  const validateStep = (n: number): boolean => {
    setError(null);
    if (n === 1) {
      if (!form.nome || !form.email || !form.whatsapp || !form.data_nascimento || !form.sexo) {
        setError('Preencha todos os campos antes de continuar');
        return false;
      }
      if (idadeCalculada !== null && (idadeCalculada < 16 || idadeCalculada > 80)) {
        setError('Idade deve estar entre 16 e 80 anos');
        return false;
      }
    }
    if (n === 2) {
      if (!form.cep || !form.cidade || !form.estado) {
        setError('Preencha o CEP e confirme cidade/estado');
        return false;
      }
    }
    if (n === 3) {
      if (!form.escolaridade || form.areas_interesse.length === 0 || !form.disponibilidade || !form.turno || !form.salario) {
        setError('Preencha todos os campos antes de continuar');
        return false;
      }
    }
    return true;
  };

  const next = () => { if (validateStep(step) && step < totalSteps) setStep(step + 1); };
  const prev = () => step > 1 && setStep(step - 1);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.bio) { setError('Conte um pouco sobre você'); return; }
    setSubmitting(true); setError(null);
    try {
      const res = await fetch('/api/cadastrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro ao cadastrar');
        setSubmitting(false);
        return;
      }
      setSuccess(true);
    } catch {
      setError('Erro de conexão. Tente novamente.');
      setSubmitting(false);
    }
  };

  return (
    <>
      <nav>
        <div className="nav-inner">
          <div className="logo">
            <div className="logo-mark">V</div>
            VagaCerta
          </div>
          <div className="nav-links">
            <a href="#como-funciona">Como funciona</a>
            <a href="#areas">Áreas</a>
            <a href="#depoimentos">Histórias</a>
            <a href="#cadastro" className="btn-nav">Cadastre-se grátis</a>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="badge"><span className="dot"></span> Entrevistas marcadas em até 7 dias</div>
            <h1 className="hero-title">
              <span className="serif">12 mil pessoas</span> já trocaram o escritório <span className="accent">pelo sofá</span>.
            </h1>
            <p className="hero-sub">
              Cadastre seu perfil e receba vagas home office <strong>sob medida</strong> no seu WhatsApp e e-mail. <strong>Entrevista online em menos de 7 dias.</strong>
            </p>
            <div className="hero-cta-row">
              <a href="#cadastro" className="btn-primary">
                Quero receber vagas
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </a>
              <a href="#como-funciona" className="btn-ghost">Como funciona →</a>
            </div>
            <div className="hero-stats">
              <div><div className="stat-num">12k<span className="plus">+</span></div><div className="stat-label">Profissionais</div></div>
              <div><div className="stat-num">340<span className="plus">+</span></div><div className="stat-label">Empresas parceiras</div></div>
              <div><div className="stat-num">4.9<span className="plus">★</span></div><div className="stat-label">Avaliação</div></div>
            </div>
          </div>

          {/* FORMULÁRIO MULTI-STEP */}
          <div id="cadastro" className="form-card">
            <div className="form-title">Crie seu <span className="it">perfil</span></div>
            <div className="form-sub">{totalSteps} etapas rápidas. Não cobramos nada do candidato.</div>

            {!success && (
              <div className="progress">
                {[1,2,3,4,5].map(n => <span key={n} className={step >= n ? 'active' : ''}></span>)}
              </div>
            )}

            {success ? (
              <div className="form-success">
                <div className="check">✓</div>
                <h3>Perfil cadastrado!</h3>
                <p>Em breve você receberá vagas no seu WhatsApp e e-mail.<br/>Entrevistas em até 7 dias.</p>
              </div>
            ) : (
              <form onSubmit={submit}>
                {/* ETAPA 1 — DADOS PESSOAIS */}
                {step === 1 && (
                  <div className="form-step active">
                    <div className="step-label">Etapa 1 de 5 · Dados pessoais</div>
                    <div className="field">
                      <label>Nome completo</label>
                      <input type="text" value={form.nome} onChange={e => update('nome', e.target.value)} placeholder="Como devemos te chamar?" />
                    </div>
                    <div className="field-row">
                      <div className="field">
                        <label>Data de nascimento</label>
                        <input type="date" value={form.data_nascimento} onChange={e => update('data_nascimento', e.target.value)} max={new Date().toISOString().split('T')[0]} />
                        {idadeCalculada !== null && <div className="hint">{idadeCalculada} anos</div>}
                      </div>
                      <div className="field">
                        <label>Sexo</label>
                        <select value={form.sexo} onChange={e => update('sexo', e.target.value)}>
                          <option value="">Selecione...</option>
                          {SEXO.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="field">
                      <label>E-mail</label>
                      <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="seu@email.com" />
                    </div>
                    <div className="field">
                      <label>WhatsApp</label>
                      <input type="tel" value={form.whatsapp} onChange={e => update('whatsapp', formatWhats(e.target.value))} placeholder="(11) 99999-0000" />
                    </div>
                    {error && <div className="form-error">{error}</div>}
                    <div className="form-actions">
                      <button type="button" className="btn-form-next" onClick={next}>
                        Continuar
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* ETAPA 2 — ENDEREÇO */}
                {step === 2 && (
                  <div className="form-step active">
                    <div className="step-label">Etapa 2 de 5 · Onde você mora</div>
                    <div className="field">
                      <label>CEP</label>
                      <input
                        type="text"
                        value={form.cep}
                        onChange={e => {
                          const v = formatCEP(e.target.value);
                          update('cep', v);
                          if (v.replace(/\D/g, '').length === 8) buscarCEP(v);
                        }}
                        placeholder="00000-000"
                      />
                      {cepLoading && <div className="hint">Buscando endereço...</div>}
                    </div>
                    <div className="field-row">
                      <div className="field">
                        <label>Cidade</label>
                        <input type="text" value={form.cidade} onChange={e => update('cidade', e.target.value)} placeholder="São Paulo" />
                      </div>
                      <div className="field">
                        <label>Estado (UF)</label>
                        <input type="text" value={form.estado} onChange={e => update('estado', e.target.value.toUpperCase().slice(0,2))} placeholder="SP" maxLength={2} />
                      </div>
                    </div>
                    {error && <div className="form-error">{error}</div>}
                    <div className="form-actions">
                      <button type="button" className="btn-form-back" onClick={prev}>← Voltar</button>
                      <button type="button" className="btn-form-next" onClick={next}>
                        Continuar
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* ETAPA 3 — FORMAÇÃO E PREFERÊNCIAS */}
                {step === 3 && (
                  <div className="form-step active">
                    <div className="step-label">Etapa 3 de 5 · Formação e preferências</div>
                    <div className="field">
                      <label>Escolaridade</label>
                      <select value={form.escolaridade} onChange={e => update('escolaridade', e.target.value)}>
                        <option value="">Selecione...</option>
                        {ESCOLARIDADE.map(e => <option key={e}>{e}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label>Áreas de interesse <span className="hint-inline">(selecione quantas quiser)</span></label>
                      <div className="chips-grid">
                        {AREAS_INTERESSE.map(a => (
                          <button
                            type="button"
                            key={a}
                            className={`chip-toggle ${form.areas_interesse.includes(a) ? 'active' : ''}`}
                            onClick={() => toggleArea(a)}
                          >
                            {a}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="field-row">
                      <div className="field">
                        <label>Disponibilidade</label>
                        <select value={form.disponibilidade} onChange={e => update('disponibilidade', e.target.value)}>
                          <option value="">Selecione...</option>
                          {DISPONIBILIDADE.map(d => <option key={d}>{d}</option>)}
                        </select>
                      </div>
                      <div className="field">
                        <label>Turno preferido</label>
                        <select value={form.turno} onChange={e => update('turno', e.target.value)}>
                          <option value="">Selecione...</option>
                          {TURNOS.map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="field">
                      <label>Pretensão salarial (R$)</label>
                      <input type="text" value={form.salario} onChange={e => update('salario', e.target.value)} placeholder="Ex: 2.500" />
                    </div>
                    {error && <div className="form-error">{error}</div>}
                    <div className="form-actions">
                      <button type="button" className="btn-form-back" onClick={prev}>← Voltar</button>
                      <button type="button" className="btn-form-next" onClick={next}>
                        Continuar
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* ETAPA 4 — EXPERIÊNCIAS */}
                {step === 4 && (
                  <div className="form-step active">
                    <div className="step-label">Etapa 4 de 5 · Experiências profissionais <span className="hint-inline">(opcional)</span></div>

                    {/* Lista de experiências já adicionadas */}
                    {form.experiencias.length > 0 && (
                      <div className="exp-lista">
                        {form.experiencias.map((exp, i) => (
                          <div key={i} className="exp-item">
                            <div>
                              <strong>{exp.cargo}</strong> · {exp.empresa}
                              <div className="exp-periodo">{exp.inicio} {exp.fim ? `- ${exp.fim}` : (exp.atual ? '- atual' : '')}</div>
                              {exp.resumo && <div className="exp-resumo">{exp.resumo}</div>}
                            </div>
                            <button type="button" onClick={() => removerExperiencia(i)} className="btn-remove">×</button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Form de adicionar experiência */}
                    <div className="exp-add">
                      <div className="field" style={{ position: 'relative' }}>
                        <label>Empresa</label>
                        <input
                          type="text"
                          value={expAtual.empresa}
                          onChange={e => handleEmpresaInput(e.target.value)}
                          placeholder="Comece a digitar o nome..."
                          autoComplete="off"
                        />
                        {empresaSugestoes.length > 0 && (
                          <div className="autocomplete-list">
                            {empresaSugestoes.map(s => (
                              <div key={s} className="autocomplete-item" onClick={() => {
                                setExpAtual(p => ({ ...p, empresa: s }));
                                setEmpresaSugestoes([]);
                              }}>{s}</div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="field">
                        <label>Cargo</label>
                        <input type="text" value={expAtual.cargo} onChange={e => setExpAtual(p => ({ ...p, cargo: e.target.value }))} placeholder="Ex: Atendente" />
                      </div>
                      <div className="field-row">
                        <div className="field">
                          <label>Início (mês/ano)</label>
                          <input type="month" value={expAtual.inicio} onChange={e => setExpAtual(p => ({ ...p, inicio: e.target.value }))} />
                        </div>
                        <div className="field">
                          <label>Fim (mês/ano)</label>
                          <input
                            type="month"
                            value={expAtual.fim}
                            onChange={e => setExpAtual(p => ({ ...p, fim: e.target.value, atual: false }))}
                            disabled={expAtual.atual}
                          />
                        </div>
                      </div>
                      <div className="field" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={expAtual.atual}
                          onChange={e => setExpAtual(p => ({ ...p, atual: e.target.checked, fim: e.target.checked ? '' : p.fim }))}
                          style={{ width: 'auto' }}
                          id="exp-atual"
                        />
                        <label htmlFor="exp-atual" style={{ margin: 0, textTransform: 'none', letterSpacing: 0, fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>
                          Trabalho atual
                        </label>
                      </div>
                      <div className="field">
                        <label>Resumo das atividades</label>
                        <textarea rows={2} value={expAtual.resumo} onChange={e => setExpAtual(p => ({ ...p, resumo: e.target.value }))} placeholder="O que você fazia nesse cargo?" />
                      </div>
                      <button type="button" className="btn-add-exp" onClick={adicionarExperiencia}>
                        + Adicionar essa experiência
                      </button>
                    </div>

                    {error && <div className="form-error">{error}</div>}
                    <div className="form-actions">
                      <button type="button" className="btn-form-back" onClick={prev}>← Voltar</button>
                      <button type="button" className="btn-form-next" onClick={next}>
                        {form.experiencias.length === 0 ? 'Pular essa etapa →' : 'Continuar'}
                      </button>
                    </div>
                  </div>
                )}

                {/* ETAPA 5 — FINAL */}
                {step === 5 && (
                  <div className="form-step active">
                    <div className="step-label">Etapa 5 de 5 · Finalizando</div>
                    <div className="field">
                      <label>Conte um pouco sobre você</label>
                      <textarea rows={4} value={form.bio} onChange={e => update('bio', e.target.value)} placeholder="Suas habilidades, idiomas, software que domina..." />
                    </div>
                    <div className="field">
                      <label>LinkedIn (opcional)</label>
                      <input type="url" value={form.linkedin} onChange={e => update('linkedin', e.target.value)} placeholder="https://linkedin.com/in/seuperfil" />
                    </div>
                    {error && <div className="form-error">{error}</div>}
                    <div className="form-actions">
                      <button type="button" className="btn-form-back" onClick={prev}>← Voltar</button>
                      <button type="submit" className="btn-form-submit" disabled={submitting}>
                        {submitting ? 'Enviando...' : 'Cadastrar perfil ✓'}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </section>

      <div className="marquee">
        <div className="marquee-track">
          <span>HOME OFFICE <span className="star">★</span> CLT <span className="star">★</span> PJ <span className="star">★</span> FREELA <span className="star">★</span> MEIO PERÍODO <span className="star">★</span> INTEGRAL <span className="star">★</span> EM TODO O BRASIL <span className="star">★</span></span>
          <span>HOME OFFICE <span className="star">★</span> CLT <span className="star">★</span> PJ <span className="star">★</span> FREELA <span className="star">★</span> MEIO PERÍODO <span className="star">★</span> INTEGRAL <span className="star">★</span> EM TODO O BRASIL <span className="star">★</span></span>
        </div>
      </div>

      <section className="section" id="como-funciona">
        <div className="container">
          <div className="section-eyebrow">// COMO FUNCIONA</div>
          <h2 className="section-title">Da inscrição à entrevista <span className="it">em menos de 7 dias</span>.</h2>
          <p className="section-sub">A gente fez o trabalho duro de criar uma rede com centenas de empresas que contratam home office. Você só precisa se cadastrar.</p>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-icon">📝</div>
              <h3>Cadastre seu perfil</h3>
              <p>Dados, áreas de interesse e experiências. 5 minutos e pronto. Tudo gratuito para o candidato.</p>
            </div>
            <div className="step-card">
              <div className="step-icon">📡</div>
              <h3>A gente faz o match</h3>
              <p>Nosso time conecta seu perfil às vagas das empresas parceiras. Você recebe oportunidades via WhatsApp e e-mail.</p>
            </div>
            <div className="step-card">
              <div className="step-icon">🎯</div>
              <h3>Entrevista marcada</h3>
              <p>Quando uma vaga combina, agendamos sua entrevista online em até 7 dias. Sem burocracia.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section areas-section" id="areas">
        <div className="container">
          <div className="section-eyebrow">// ÁREAS COM MAIS VAGAS</div>
          <h2 className="section-title">Vagas pra <span className="it">todo</span> tipo de profissional.</h2>
          <p className="section-sub">Atualizamos nossa base de vagas todo dia. Veja as áreas mais aquecidas neste mês.</p>
          <div className="areas-grid">
            <div className="area-chip">Atendimento <span className="count">847</span></div>
            <div className="area-chip">Vendas / SDR <span className="count">512</span></div>
            <div className="area-chip">Marketing <span className="count">389</span></div>
            <div className="area-chip">TI / Dev <span className="count">724</span></div>
            <div className="area-chip">Design <span className="count">203</span></div>
            <div className="area-chip">Administrativo <span className="count">456</span></div>
            <div className="area-chip">Financeiro <span className="count">298</span></div>
            <div className="area-chip">RH <span className="count">187</span></div>
            <div className="area-chip">Tradução <span className="count">142</span></div>
            <div className="area-chip">Educação <span className="count">331</span></div>
            <div className="area-chip">Suporte Técnico <span className="count">418</span></div>
            <div className="area-chip">Redação <span className="count">176</span></div>
          </div>
        </div>
      </section>

      <section className="section" id="depoimentos">
        <div className="container">
          <div className="section-eyebrow">// HISTÓRIAS REAIS</div>
          <h2 className="section-title">Quem já está <span className="it">trabalhando de casa</span>.</h2>
          <p className="section-sub">Mais de 12 mil brasileiros mudaram a rotina com a gente. Esses são alguns deles.</p>
          <div className="testimonials">
            <div className="testimonial">
              <div className="stars">★★★★★</div>
              <blockquote>Em 5 dias depois do cadastro já tinha entrevista marcada. Hoje trabalho como SDR pra uma empresa de SaaS — <span className="it">e nunca mais voltei pro escritório</span>.</blockquote>
              <div className="person"><div className="avatar">J</div><div><div className="name">Juliana M.</div><div className="role">SDR · Recife, PE</div></div></div>
            </div>
            <div className="testimonial featured">
              <div className="stars">★★★★★</div>
              <blockquote>Tava desempregada há 8 meses. Cadastrei na VagaCerta de manhã e à tarde já tinha 3 vagas no zap. <span className="it">Salvou minha vida.</span></blockquote>
              <div className="person"><div className="avatar">C</div><div><div className="name">Camila R.</div><div className="role">Atendimento · Salvador, BA</div></div></div>
            </div>
            <div className="testimonial">
              <div className="stars">★★★★★</div>
              <blockquote>O que mais gostei foi não pagar nada. Outras plataformas cobravam até pra ver o salário. Aqui é tudo direto e <span className="it">100% gratuito</span> pro candidato.</blockquote>
              <div className="person"><div className="avatar">R</div><div><div className="name">Rafael T.</div><div className="role">Dev Front-end · Curitiba, PR</div></div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="container">
          <h2>Sua próxima vaga<br/>pode chegar <span className="it">hoje</span>.</h2>
          <p>Não custa nada se cadastrar. Custa caro continuar perdendo oportunidades.</p>
          <a href="#cadastro" className="btn-primary">
            Quero meu perfil ativo
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
          </a>
        </div>
      </section>

      <footer>
        <div className="container">
          <div className="foot-grid">
            <div>
              <div className="logo"><div className="logo-mark">V</div>VagaCerta</div>
              <p className="foot-about">A maior agenciadora de empregos home office do Brasil. Conectamos talentos a empresas que contratam à distância.</p>
            </div>
            <div className="foot-cols">
              <div className="foot-col"><h4>Para candidatos</h4><a href="#cadastro">Cadastrar perfil</a><a href="#como-funciona">Como funciona</a><a href="#areas">Áreas com vagas</a></div>
              <div className="foot-col"><h4>Para empresas</h4><a href="#">Anunciar vaga</a><a href="#">Planos</a><a href="#">Contato comercial</a></div>
              <div className="foot-col"><h4>Empresa</h4><a href="#">Sobre nós</a><a href="#">Termos de uso</a><a href="#">Privacidade</a></div>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 VagaCerta. Todos os direitos reservados.</span>
            <span>Feito com 💚 no Brasil</span>
          </div>
        </div>
      </footer>
    </>
  );
}
