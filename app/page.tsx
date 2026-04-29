'use client';

import { useState, FormEvent } from 'react';

export default function Home() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '', email: '', whatsapp: '', cidade: '', idade: '',
    area: '', experiencia: '', disponibilidade: '', salario: '',
    bio: '', linkedin: '',
  });

  const update = (k: string, v: string) => setFormData(p => ({ ...p, [k]: v }));

  const validateStep = (n: number): boolean => {
    if (n === 1) {
      if (!formData.nome || !formData.email || !formData.whatsapp || !formData.cidade || !formData.idade) {
        setError('Preencha todos os campos antes de continuar');
        return false;
      }
    }
    if (n === 2) {
      if (!formData.area || !formData.experiencia || !formData.disponibilidade || !formData.salario) {
        setError('Preencha todos os campos antes de continuar');
        return false;
      }
    }
    setError(null);
    return true;
  };

  const next = () => { if (validateStep(step) && step < 3) setStep(step + 1); };
  const prev = () => step > 1 && setStep(step - 1);

  const formatWhats = (v: string) => {
    let n = v.replace(/\D/g, '').slice(0, 11);
    if (n.length > 6) return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`;
    if (n.length > 2) return `(${n.slice(0,2)}) ${n.slice(2)}`;
    return n;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.bio) { setError('Conte um pouco sobre você'); return; }
    setSubmitting(true); setError(null);
    try {
      const res = await fetch('/api/cadastrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro ao cadastrar');
        setSubmitting(false);
        return;
      }
      setSuccess(true);
    } catch (err) {
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
            <div className="badge"><span className="dot"></span> Mais de 12.000 brasileiros já trabalham de casa</div>
            <h1 className="hero-title">
              Trabalhe <span className="accent">de casa</span>.<br/>
              Receba vagas <span className="serif">de verdade</span><br/>
              no seu WhatsApp.
            </h1>
            <p className="hero-sub">
              Somos a maior agenciadora de empregos home office do Brasil. Você cadastra seu perfil uma vez — a gente envia as vagas que combinam com você direto no zap. Simples assim.
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
              <div><div className="stat-num">98%</div><div className="stat-label">Recomendam</div></div>
            </div>
          </div>

          <div id="cadastro" className="form-card">
            <div className="form-title">Crie seu <span className="it">perfil</span></div>
            <div className="form-sub">3 etapas rápidas. Não cobramos nada do candidato.</div>

            {!success && (
              <div className="progress">
                <span className={step >= 1 ? 'active' : ''}></span>
                <span className={step >= 2 ? 'active' : ''}></span>
                <span className={step >= 3 ? 'active' : ''}></span>
              </div>
            )}

            {success ? (
              <div className="form-success">
                <div className="check">✓</div>
                <h3>Perfil cadastrado!</h3>
                <p>Em breve você receberá vagas no seu WhatsApp.<br/>Fique de olho — a primeira pode chegar hoje.</p>
              </div>
            ) : (
              <form onSubmit={submit}>
                {step === 1 && (
                  <div className="form-step active">
                    <div className="field">
                      <label>Nome completo</label>
                      <input type="text" value={formData.nome} onChange={e => update('nome', e.target.value)} placeholder="Como devemos te chamar?" />
                    </div>
                    <div className="field-row">
                      <div className="field">
                        <label>E-mail</label>
                        <input type="email" value={formData.email} onChange={e => update('email', e.target.value)} placeholder="seu@email.com" />
                      </div>
                      <div className="field">
                        <label>WhatsApp</label>
                        <input type="tel" value={formData.whatsapp} onChange={e => update('whatsapp', formatWhats(e.target.value))} placeholder="(11) 99999-0000" />
                      </div>
                    </div>
                    <div className="field-row">
                      <div className="field">
                        <label>Cidade / Estado</label>
                        <input type="text" value={formData.cidade} onChange={e => update('cidade', e.target.value)} placeholder="São Paulo, SP" />
                      </div>
                      <div className="field">
                        <label>Idade</label>
                        <input type="number" value={formData.idade} onChange={e => update('idade', e.target.value)} placeholder="28" min="16" max="80" />
                      </div>
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
                    <div className="field">
                      <label>Área de interesse</label>
                      <select value={formData.area} onChange={e => update('area', e.target.value)}>
                        <option value="">Selecione...</option>
                        <option>Atendimento ao cliente</option>
                        <option>Vendas / SDR</option>
                        <option>Marketing Digital</option>
                        <option>Programação / TI</option>
                        <option>Design / Criação</option>
                        <option>Administrativo</option>
                        <option>Financeiro</option>
                        <option>RH / Recrutamento</option>
                        <option>Tradução / Transcrição</option>
                        <option>Educação / Tutoria</option>
                        <option>Outros</option>
                      </select>
                    </div>
                    <div className="field-row">
                      <div className="field">
                        <label>Experiência</label>
                        <select value={formData.experiencia} onChange={e => update('experiencia', e.target.value)}>
                          <option value="">Selecione...</option>
                          <option>Sem experiência</option>
                          <option>Menos de 1 ano</option>
                          <option>1 a 3 anos</option>
                          <option>3 a 5 anos</option>
                          <option>Mais de 5 anos</option>
                        </select>
                      </div>
                      <div className="field">
                        <label>Disponibilidade</label>
                        <select value={formData.disponibilidade} onChange={e => update('disponibilidade', e.target.value)}>
                          <option value="">Selecione...</option>
                          <option>Imediata</option>
                          <option>Em até 15 dias</option>
                          <option>Em até 30 dias</option>
                          <option>Apenas part-time</option>
                        </select>
                      </div>
                    </div>
                    <div className="field">
                      <label>Pretensão salarial (R$)</label>
                      <input type="text" value={formData.salario} onChange={e => update('salario', e.target.value)} placeholder="Ex: 2.500" />
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
                    <div className="field">
                      <label>Conte um pouco sobre você</label>
                      <textarea rows={4} value={formData.bio} onChange={e => update('bio', e.target.value)} placeholder="Suas habilidades, idiomas, software que domina..." />
                    </div>
                    <div className="field">
                      <label>LinkedIn (opcional)</label>
                      <input type="url" value={formData.linkedin} onChange={e => update('linkedin', e.target.value)} placeholder="https://linkedin.com/in/seuperfil" />
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
          <h2 className="section-title">Da inscrição à entrevista <span className="it">em dias</span>, não meses.</h2>
          <p className="section-sub">A gente fez o trabalho duro de criar uma rede com centenas de empresas que contratam home office. Você só precisa se cadastrar.</p>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-icon">📝</div>
              <h3>Cadastre seu perfil</h3>
              <p>Nome, área de interesse, experiência. 3 minutos e pronto. Tudo gratuito para o candidato.</p>
            </div>
            <div className="step-card">
              <div className="step-icon">📡</div>
              <h3>A gente faz o match</h3>
              <p>Nosso time conecta seu perfil às vagas das empresas parceiras. Você recebe oportunidades via WhatsApp.</p>
            </div>
            <div className="step-card">
              <div className="step-icon">🎯</div>
              <h3>Entrevista marcada</h3>
              <p>Quando uma vaga combina, agendamos sua entrevista direto com a empresa. Sem burocracia.</p>
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
