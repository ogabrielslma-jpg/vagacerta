'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EMPRESAS_BR, AREAS_INTERESSE, ESCOLARIDADE, TURNOS, DISPONIBILIDADE, SEXO } from '@/lib/constantes';
import { LogoMark } from '@/components/Logo';

type Experiencia = {
  empresa: string; cargo: string;
  ano_inicio: string; mes_inicio: string;
  ano_fim: string; mes_fim: string;
  atual: boolean; resumo: string;
};

const FAIXAS_SALARIAIS = [
  'Até R$ 1.400',
  'R$ 1.400 a R$ 3.000',
  'R$ 3.000 a R$ 5.000',
  'Acima de R$ 5.000',
  'A combinar',
];

const ANO_ATUAL = new Date().getFullYear();
const ANOS = Array.from({ length: 50 }, (_, i) => String(ANO_ATUAL - i));
const MESES = [
  { v: '01', l: 'Janeiro' }, { v: '02', l: 'Fevereiro' }, { v: '03', l: 'Março' },
  { v: '04', l: 'Abril' }, { v: '05', l: 'Maio' }, { v: '06', l: 'Junho' },
  { v: '07', l: 'Julho' }, { v: '08', l: 'Agosto' }, { v: '09', l: 'Setembro' },
  { v: '10', l: 'Outubro' }, { v: '11', l: 'Novembro' }, { v: '12', l: 'Dezembro' },
];

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cepLoading, setCepLoading] = useState(false);
  const formCardRef = useRef<HTMLDivElement>(null);
  const [semExperiencia, setSemExperiencia] = useState(false);
  const [showSenha, setShowSenha] = useState(false);

  const [form, setForm] = useState({
    nome: '', email: '', whatsapp: '',
    data_nascimento: '', sexo: '',
    cep: '', cidade: '', estado: '',
    escolaridade: '', areas_interesse: [] as string[],
    disponibilidade: '', turno: '', salario: '',
    experiencias: [] as Experiencia[],
    bio: '', linkedin: '',
    senha: '', senha_confirma: '',
  });

  const [expAtual, setExpAtual] = useState<Experiencia>({
    empresa: '', cargo: '', ano_inicio: '', mes_inicio: '', ano_fim: '', mes_fim: '', atual: false, resumo: ''
  });
  const [empresaSugestoes, setEmpresaSugestoes] = useState<string[]>([]);

  const update = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    if (step > 1 && formCardRef.current) {
      const headerOffset = 90;
      const elementPosition = formCardRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  }, [step]);

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
    } catch {} finally { setCepLoading(false); }
  };

  const handleEmpresaInput = (v: string) => {
    setExpAtual(p => ({ ...p, empresa: v }));
    if (v.length >= 2) {
      const lower = v.toLowerCase();
      setEmpresaSugestoes(EMPRESAS_BR.filter(e => e.toLowerCase().includes(lower)).slice(0, 6));
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
    if (!expAtual.empresa || !expAtual.cargo || !expAtual.ano_inicio) {
      setError('Preencha empresa, cargo e ano de início');
      return;
    }
    setForm(p => ({ ...p, experiencias: [...p.experiencias, expAtual] }));
    setExpAtual({ empresa: '', cargo: '', ano_inicio: '', mes_inicio: '', ano_fim: '', mes_fim: '', atual: false, resumo: '' });
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
    if (!form.senha || form.senha.length < 6) { setError('Crie uma senha de no mínimo 6 caracteres'); return; }
    if (form.senha !== form.senha_confirma) { setError('As senhas não coincidem'); return; }

    setSubmitting(true); setError(null);
    try {
      const expsFormatted = form.experiencias.map(e => ({
        empresa: e.empresa, cargo: e.cargo,
        inicio: e.ano_inicio && e.mes_inicio ? `${e.ano_inicio}-${e.mes_inicio}` : e.ano_inicio,
        fim: e.atual ? '' : (e.ano_fim && e.mes_fim ? `${e.ano_fim}-${e.mes_fim}` : e.ano_fim || ''),
        atual: e.atual, resumo: e.resumo,
      }));
      const payload = { ...form, experiencias: expsFormatted };

      const res = await fetch('/api/cadastrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro ao cadastrar');
        setSubmitting(false);
        return;
      }
      setSuccess(true);
      // Redireciona pro painel após 3s
      setTimeout(() => router.push('/painel'), 3000);
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
            <LogoMark size={34} />
            VagaCerta
          </div>
          <div className="nav-links">
            <a href="#como-funciona">Como funciona</a>
            <a href="#areas">Áreas</a>
            <a href="/login">Entrar</a>
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

          <div id="cadastro" className="form-card" ref={formCardRef}>
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
                <p>Te levando ao seu painel...<br/>Lá você acompanha as vagas que vamos te enviar.</p>
              </div>
            ) : (
              <form onSubmit={submit}>
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

                {step === 2 && (
                  <div className="form-step active">
                    <div className="step-label">Etapa 2 de 5 · Onde você mora</div>
                    <div className="field">
                      <label>CEP</label>
                      <input type="text" value={form.cep} onChange={e => {
                        const v = formatCEP(e.target.value);
                        update('cep', v);
                        if (v.replace(/\D/g, '').length === 8) buscarCEP(v);
                      }} placeholder="00000-000" />
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
                          <button type="button" key={a}
                            className={`chip-toggle ${form.areas_interesse.includes(a) ? 'active' : ''}`}
                            onClick={() => toggleArea(a)}>
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
                      <label>Pretensão salarial</label>
                      <div className="chips-grid">
                        {FAIXAS_SALARIAIS.map(f => (
                          <button type="button" key={f}
                            className={`chip-toggle ${form.salario === f ? 'active' : ''}`}
                            onClick={() => update('salario', f)}>
                            {f}
                          </button>
                        ))}
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

                {step === 4 && (
                  <div className="form-step active">
                    <div className="step-label">Etapa 4 de 5 · Experiências profissionais</div>

                    {/* Checkbox no topo */}
                    <div className="checkbox-card" onClick={() => setSemExperiencia(!semExperiencia)}>
                      <div className={`custom-checkbox ${semExperiencia ? 'checked' : ''}`}>
                        {semExperiencia && '✓'}
                      </div>
                      <div className="checkbox-text">
                        <strong>Não tenho experiência ou prefiro não preencher agora</strong>
                        <span>Você pode adicionar depois no seu painel</span>
                      </div>
                    </div>

                    {!semExperiencia && (
                      <>
                        {form.experiencias.length > 0 && (
                          <div className="exp-lista">
                            {form.experiencias.map((exp, i) => (
                              <div key={i} className="exp-item">
                                <div>
                                  <strong>{exp.cargo}</strong> · {exp.empresa}
                                  <div className="exp-periodo">
                                    {exp.mes_inicio && `${exp.mes_inicio}/`}{exp.ano_inicio}
                                    {exp.atual ? ' — atual' : (exp.ano_fim ? ` — ${exp.mes_fim ? `${exp.mes_fim}/` : ''}${exp.ano_fim}` : '')}
                                  </div>
                                  {exp.resumo && <div className="exp-resumo">{exp.resumo}</div>}
                                </div>
                                <button type="button" onClick={() => removerExperiencia(i)} className="btn-remove">×</button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="exp-add">
                          <div className="exp-add-title">
                            {form.experiencias.length > 0 ? '+ Adicionar mais uma' : 'Sua experiência mais recente'}
                          </div>
                          <div className="field" style={{ position: 'relative' }}>
                            <label>Empresa</label>
                            <input type="text" value={expAtual.empresa}
                              onChange={e => handleEmpresaInput(e.target.value)}
                              placeholder="Comece a digitar o nome..." autoComplete="off" />
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
                            <input type="text" value={expAtual.cargo} onChange={e => setExpAtual(p => ({ ...p, cargo: e.target.value }))} placeholder="Ex: Atendente, Vendedor, Designer" />
                          </div>
                          <div className="field">
                            <label>Início</label>
                            <div className="field-row">
                              <select value={expAtual.mes_inicio} onChange={e => setExpAtual(p => ({ ...p, mes_inicio: e.target.value }))}>
                                <option value="">Mês</option>
                                {MESES.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
                              </select>
                              <select value={expAtual.ano_inicio} onChange={e => setExpAtual(p => ({ ...p, ano_inicio: e.target.value }))}>
                                <option value="">Ano</option>
                                {ANOS.map(a => <option key={a} value={a}>{a}</option>)}
                              </select>
                            </div>
                          </div>
                          <div className="field" style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14 }}>
                            <input type="checkbox" checked={expAtual.atual}
                              onChange={e => setExpAtual(p => ({ ...p, atual: e.target.checked, ano_fim: e.target.checked ? '' : p.ano_fim, mes_fim: e.target.checked ? '' : p.mes_fim }))}
                              style={{ width: 'auto' }} id="exp-atual" />
                            <label htmlFor="exp-atual" style={{ margin: 0, textTransform: 'none', letterSpacing: 0, fontSize: 14, color: 'var(--ink)', fontWeight: 500, cursor: 'pointer' }}>
                              Estou trabalhando aqui atualmente
                            </label>
                          </div>
                          {!expAtual.atual && (
                            <div className="field">
                              <label>Fim</label>
                              <div className="field-row">
                                <select value={expAtual.mes_fim} onChange={e => setExpAtual(p => ({ ...p, mes_fim: e.target.value }))}>
                                  <option value="">Mês</option>
                                  {MESES.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
                                </select>
                                <select value={expAtual.ano_fim} onChange={e => setExpAtual(p => ({ ...p, ano_fim: e.target.value }))}>
                                  <option value="">Ano</option>
                                  {ANOS.map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                              </div>
                            </div>
                          )}
                          <div className="field">
                            <label>Resumo das atividades</label>
                            <textarea rows={2} value={expAtual.resumo} onChange={e => setExpAtual(p => ({ ...p, resumo: e.target.value }))} placeholder="O que você fazia nesse cargo?" />
                          </div>
                          <button type="button" className="btn-add-exp" onClick={adicionarExperiencia}>
                            + Adicionar mais experiência profissional
                          </button>
                        </div>
                      </>
                    )}

                    {error && <div className="form-error">{error}</div>}
                    <div className="form-actions">
                      <button type="button" className="btn-form-back" onClick={prev}>← Voltar</button>
                      <button type="button" className="btn-form-next" onClick={next}>
                        Continuar →
                      </button>
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div className="form-step active">
                    <div className="step-label">Etapa 5 de 5 · Quase lá</div>
                    <div className="field">
                      <label>Conte um pouco sobre você</label>
                      <textarea rows={3} value={form.bio} onChange={e => update('bio', e.target.value)} placeholder="Suas habilidades, idiomas, software que domina..." />
                    </div>
                    <div className="field">
                      <label>LinkedIn (opcional)</label>
                      <input type="url" value={form.linkedin} onChange={e => update('linkedin', e.target.value)} placeholder="https://linkedin.com/in/seuperfil" />
                    </div>

                    <div className="senha-card">
                      <div className="senha-card-title">🔐 Crie sua senha de acesso</div>
                      <div className="senha-card-sub">Você vai usar pra entrar no seu painel e ver as vagas que enviamos.</div>
                      <div className="field">
                        <label>Senha</label>
                        <div style={{ position: 'relative' }}>
                          <input type={showSenha ? 'text' : 'password'} value={form.senha} onChange={e => update('senha', e.target.value)} placeholder="Mínimo 6 caracteres" />
                          <button type="button" onClick={() => setShowSenha(!showSenha)} className="toggle-senha">
                            {showSenha ? '🙈' : '👁️'}
                          </button>
                        </div>
                      </div>
                      <div className="field">
                        <label>Confirmar senha</label>
                        <input type={showSenha ? 'text' : 'password'} value={form.senha_confirma} onChange={e => update('senha_confirma', e.target.value)} placeholder="Digite a senha novamente" />
                      </div>
                    </div>

                    {error && <div className="form-error">{error}</div>}
                    <div className="form-actions">
                      <button type="button" className="btn-form-back" onClick={prev}>← Voltar</button>
                      <button type="submit" className="btn-form-submit" disabled={submitting}>
                        {submitting ? 'Enviando...' : 'Cadastrar e entrar ✓'}
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
              <div className="step-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E94560" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </div>
              <h3>Cadastre seu perfil</h3>
              <p>Dados, áreas de interesse e experiências. 5 minutos e pronto. Tudo gratuito para o candidato.</p>
            </div>
            <div className="step-card">
              <div className="step-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E94560" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg>
              </div>
              <h3>A gente faz o match</h3>
              <p>Nosso time conecta seu perfil às vagas das empresas parceiras. Vagas aparecem no seu painel.</p>
            </div>
            <div className="step-card">
              <div className="step-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E94560" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="9 16 11 18 15 14"/></svg>
              </div>
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
              <div className="logo"><LogoMark size={32} />VagaCerta</div>
              <p className="foot-about">A maior agenciadora de empregos home office do Brasil.</p>
            </div>
            <div className="foot-cols">
              <div className="foot-col"><h4>Para candidatos</h4><a href="#cadastro">Cadastrar perfil</a><a href="/login">Entrar no painel</a><a href="#como-funciona">Como funciona</a></div>
              <div className="foot-col"><h4>Para empresas</h4><a href="#">Anunciar vaga</a><a href="#">Contato comercial</a></div>
              <div className="foot-col"><h4>Empresa</h4><a href="#">Sobre nós</a><a href="#">Termos</a></div>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 VagaCerta.</span>
            <span>Feito com 💚 no Brasil</span>
          </div>
        </div>
      </footer>
    </>
  );
}
