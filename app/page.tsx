'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogoMark } from '@/components/Logo';

const ESTADOS_BR = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

const PROFISSOES = [
  'Empresário','Empreendedor','Autônomo','CLT','Servidor público','Aposentado','Estudante',
  'Profissional liberal','Microempreendedor (MEI)','Outro'
];

const FAIXAS_RENDA_PF = [
  'Até R$ 2.000','R$ 2.000 a R$ 5.000','R$ 5.000 a R$ 10.000','R$ 10.000 a R$ 20.000','Acima de R$ 20.000'
];

const FAIXAS_FATURAMENTO_PJ = [
  'Até R$ 10.000/mês','R$ 10.000 a R$ 50.000','R$ 50.000 a R$ 200.000','R$ 200.000 a R$ 1mi','Acima de R$ 1mi/mês'
];

function formatCPF(v: string) { return v.replace(/\D/g,'').slice(0,11).replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2'); }
function formatCNPJ(v: string) { return v.replace(/\D/g,'').slice(0,14).replace(/^(\d{2})(\d)/,'$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/,'$1.$2.$3').replace(/\.(\d{3})(\d)/,'.$1/$2').replace(/(\d{4})(\d)/,'$1-$2'); }
function formatPhone(v: string) { return v.replace(/\D/g,'').slice(0,11).replace(/(\d{2})(\d)/,'($1) $2').replace(/(\d{5})(\d)/,'$1-$2'); }
function formatCEP(v: string) { return v.replace(/\D/g,'').slice(0,8).replace(/(\d{5})(\d)/,'$1-$2'); }

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [tipoConta, setTipoConta] = useState<'PF'|'PJ'|''>('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [showSenha, setShowSenha] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // PF
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNasc, setDataNasc] = useState('');
  // PJ
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [responsavel, setResponsavel] = useState('');

  // Comum
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [profissao, setProfissao] = useState('');
  const [renda, setRenda] = useState('');

  // Docs (não vamos validar de verdade — apenas marcar como uploaded)
  const [docFrente, setDocFrente] = useState<File | null>(null);
  const [docVerso, setDocVerso] = useState<File | null>(null);
  const [docSelfie, setDocSelfie] = useState<File | null>(null);
  const [docComprovante, setDocComprovante] = useState<File | null>(null);

  const [senha, setSenha] = useState('');

  // Auto scroll
  useEffect(() => {
    if (formRef.current && step > 1) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [step]);

  // Busca CEP
  useEffect(() => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
        .then(r => r.json())
        .then(d => {
          if (!d.erro) {
            setLogradouro(d.logradouro || '');
            setBairro(d.bairro || '');
            setCidade(d.localidade || '');
            setEstado(d.uf || '');
          }
        }).catch(() => {});
    }
  }, [cep]);

  function validarStep() {
    setErro('');
    if (step === 1) {
      if (!tipoConta) return 'Escolha o tipo de conta';
    }
    if (step === 2) {
      if (tipoConta === 'PF') {
        if (!nome.trim()) return 'Informe seu nome';
        if (cpf.replace(/\D/g,'').length !== 11) return 'CPF inválido';
        if (!dataNasc) return 'Informe data de nascimento';
      } else {
        if (!razaoSocial.trim()) return 'Informe a razão social';
        if (cnpj.replace(/\D/g,'').length !== 14) return 'CNPJ inválido';
        if (!responsavel.trim()) return 'Informe o nome do responsável';
      }
      if (!email.includes('@')) return 'Email inválido';
      if (whatsapp.replace(/\D/g,'').length < 10) return 'WhatsApp inválido';
    }
    if (step === 3) {
      if (cep.replace(/\D/g,'').length !== 8) return 'CEP inválido';
      if (!logradouro.trim()) return 'Informe a rua';
      if (!numero.trim()) return 'Informe o número';
      if (!cidade.trim() || !estado) return 'Cidade/Estado obrigatórios';
      if (!profissao) return tipoConta === 'PF' ? 'Selecione a profissão' : 'Selecione a atividade';
      if (!renda) return tipoConta === 'PF' ? 'Selecione a faixa de renda' : 'Selecione o faturamento';
    }
    if (step === 4) {
      if (!docFrente) return 'Envie o documento (frente)';
      if (!docVerso) return 'Envie o documento (verso)';
      if (!docSelfie) return 'Envie a selfie';
      if (!docComprovante) return 'Envie o comprovante';
    }
    if (step === 5) {
      if (senha.length < 6) return 'Senha precisa ter no mínimo 6 caracteres';
    }
    return '';
  }

  function avancar() {
    const e = validarStep();
    if (e) { setErro(e); return; }
    setStep(step + 1);
  }
  function voltar() { setErro(''); setStep(step - 1); }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const erroVal = validarStep();
    if (erroVal) { setErro(erroVal); return; }
    setEnviando(true);

    try {
      const payload = {
        tipo_conta: tipoConta,
        nome: tipoConta === 'PF' ? nome : razaoSocial,
        razao_social: tipoConta === 'PJ' ? razaoSocial : null,
        responsavel: tipoConta === 'PJ' ? responsavel : null,
        documento: tipoConta === 'PF' ? cpf.replace(/\D/g,'') : cnpj.replace(/\D/g,''),
        data_nascimento: tipoConta === 'PF' ? dataNasc : null,
        email: email.toLowerCase().trim(),
        whatsapp: whatsapp.replace(/\D/g,''),
        cep: cep.replace(/\D/g,''),
        logradouro,
        numero,
        bairro,
        cidade,
        estado,
        profissao,
        renda,
        senha,
        docs_enviados: true,
      };

      const r = await fetch('/api/cadastrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Erro ao criar conta');

      router.push('/sucesso');
    } catch (err: any) {
      setErro(err.message || 'Erro ao processar');
      setEnviando(false);
    }
  }

  return (
    <>
      <nav>
        <div className="nav-inner">
          <a href="/" className="logo" style={{ color: 'white' }}>
            <LogoMark size={36} />
            <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em' }}>
              Das<span style={{ color: '#00D4A0' }}>Bank</span>
            </span>
          </a>
          <div className="nav-links">
            <a href="#como-funciona">Como funciona</a>
            <a href="#beneficios">Benefícios</a>
            <a href="/login">Entrar</a>
            <a href="#abrir-conta" className="btn-nav">Abrir conta</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              <div className="badge">
                <span className="dot"></span>
                Conta digital sem mensalidade · PF e PJ
              </div>
              <h1 className="hero-title">
                Seu banco,<br/>
                <span className="accent">do seu jeito.</span>
              </h1>
              <p className="hero-sub">
                Conta digital <strong>100% gratuita</strong> pra pessoa física e empresas.
                Cartão sem anuidade, PIX ilimitado, e o controle total do seu dinheiro
                no celular. Abra sua conta em <strong>5 minutos</strong>.
              </p>
              <div className="hero-cta-row">
                <a href="#abrir-conta" className="btn-primary">
                  Abrir minha conta grátis
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
                <a href="/login" className="btn-ghost">Já tenho conta</a>
              </div>
              <div className="hero-stats">
                <div>
                  <div className="stat-num">350<span className="plus">k+</span></div>
                  <div className="stat-label">Clientes</div>
                </div>
                <div>
                  <div className="stat-num">R$ 0</div>
                  <div className="stat-label">Mensalidade</div>
                </div>
                <div>
                  <div className="stat-num">4.9<span className="plus">★</span></div>
                  <div className="stat-label">App Stores</div>
                </div>
              </div>
            </div>

            {/* FORM CARD */}
            <div ref={formRef} id="abrir-conta">
              <form className="form-card" onSubmit={enviar}>
                <div className="form-title">
                  Abrir conta <span className="it">grátis</span>
                </div>
                <p className="form-sub">Leva só 5 minutos</p>

                <div className="progress">
                  <span className={step>=1?'active':''}></span>
                  <span className={step>=2?'active':''}></span>
                  <span className={step>=3?'active':''}></span>
                  <span className={step>=4?'active':''}></span>
                  <span className={step>=5?'active':''}></span>
                </div>

                {/* STEP 1 — Tipo de conta */}
                {step === 1 && (
                  <div className="form-step active">
                    <div className="step-label">Etapa 1 de 5</div>
                    <div style={{ marginBottom: 14, fontWeight: 600, fontSize: 15, color: 'var(--gray-900)' }}>
                      Que tipo de conta você quer abrir?
                    </div>
                    <div className="tipo-conta-grid">
                      <div
                        className={`tipo-conta-card ${tipoConta==='PF'?'active':''}`}
                        onClick={() => setTipoConta('PF')}
                      >
                        <div className="icon">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={tipoConta==='PF'?'#00B788':'#5C6B6B'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{margin:'0 auto', display:'block'}}>
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                          </svg>
                        </div>
                        <div className="titulo">Pessoa Física</div>
                        <div className="sub">Pra você no dia a dia</div>
                      </div>
                      <div
                        className={`tipo-conta-card ${tipoConta==='PJ'?'active':''}`}
                        onClick={() => setTipoConta('PJ')}
                      >
                        <div className="icon">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={tipoConta==='PJ'?'#00B788':'#5C6B6B'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{margin:'0 auto', display:'block'}}>
                            <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h.01M9 13h.01M9 17h.01M14 9h2M14 13h2M14 17h2"/>
                          </svg>
                        </div>
                        <div className="titulo">Pessoa Jurídica</div>
                        <div className="sub">Pra sua empresa</div>
                      </div>
                    </div>
                    {erro && <div className="form-error">{erro}</div>}
                    <div className="form-actions">
                      <button type="button" className="btn-form-next" onClick={avancar}>
                        Continuar
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2 — Dados */}
                {step === 2 && (
                  <div className="form-step active">
                    <div className="step-label">
                      Etapa 2 de 5 <span className="hint-inline">{tipoConta === 'PF' ? 'Seus dados' : 'Dados da empresa'}</span>
                    </div>
                    {tipoConta === 'PF' ? (
                      <>
                        <div className="field">
                          <label>Nome completo</label>
                          <input type="text" value={nome} onChange={e=>setNome(e.target.value)} placeholder="Como está no seu RG" />
                        </div>
                        <div className="field-row">
                          <div className="field">
                            <label>CPF</label>
                            <input type="text" value={cpf} onChange={e=>setCpf(formatCPF(e.target.value))} placeholder="000.000.000-00" />
                          </div>
                          <div className="field">
                            <label>Data de nascimento</label>
                            <input type="date" value={dataNasc} onChange={e=>setDataNasc(e.target.value)} />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="field">
                          <label>Razão social</label>
                          <input type="text" value={razaoSocial} onChange={e=>setRazaoSocial(e.target.value)} placeholder="Nome registrado da empresa" />
                        </div>
                        <div className="field">
                          <label>CNPJ</label>
                          <input type="text" value={cnpj} onChange={e=>setCnpj(formatCNPJ(e.target.value))} placeholder="00.000.000/0000-00" />
                        </div>
                        <div className="field">
                          <label>Nome do responsável</label>
                          <input type="text" value={responsavel} onChange={e=>setResponsavel(e.target.value)} placeholder="Quem vai operar a conta" />
                        </div>
                      </>
                    )}
                    <div className="field">
                      <label>Email</label>
                      <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com" />
                    </div>
                    <div className="field">
                      <label>WhatsApp</label>
                      <input type="text" value={whatsapp} onChange={e=>setWhatsapp(formatPhone(e.target.value))} placeholder="(11) 99999-9999" />
                    </div>
                    {erro && <div className="form-error">{erro}</div>}
                    <div className="form-actions">
                      <button type="button" className="btn-form-back" onClick={voltar}>← Voltar</button>
                      <button type="button" className="btn-form-next" onClick={avancar}>
                        Continuar
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3 — Endereço + Profissional */}
                {step === 3 && (
                  <div className="form-step active">
                    <div className="step-label">
                      Etapa 3 de 5 <span className="hint-inline">Endereço e atividade</span>
                    </div>
                    <div className="field">
                      <label>CEP</label>
                      <input type="text" value={cep} onChange={e=>setCep(formatCEP(e.target.value))} placeholder="00000-000" />
                    </div>
                    <div className="field">
                      <label>Rua / Logradouro</label>
                      <input type="text" value={logradouro} onChange={e=>setLogradouro(e.target.value)} />
                    </div>
                    <div className="field-row">
                      <div className="field">
                        <label>Número</label>
                        <input type="text" value={numero} onChange={e=>setNumero(e.target.value)} />
                      </div>
                      <div className="field">
                        <label>Bairro</label>
                        <input type="text" value={bairro} onChange={e=>setBairro(e.target.value)} />
                      </div>
                    </div>
                    <div className="field-row">
                      <div className="field">
                        <label>Cidade</label>
                        <input type="text" value={cidade} onChange={e=>setCidade(e.target.value)} />
                      </div>
                      <div className="field">
                        <label>UF</label>
                        <select value={estado} onChange={e=>setEstado(e.target.value)}>
                          <option value="">--</option>
                          {ESTADOS_BR.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="field">
                      <label>{tipoConta === 'PF' ? 'Profissão' : 'Atividade principal'}</label>
                      <select value={profissao} onChange={e=>setProfissao(e.target.value)}>
                        <option value="">Selecione...</option>
                        {PROFISSOES.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label>{tipoConta === 'PF' ? 'Renda mensal' : 'Faturamento mensal'}</label>
                      <select value={renda} onChange={e=>setRenda(e.target.value)}>
                        <option value="">Selecione...</option>
                        {(tipoConta === 'PF' ? FAIXAS_RENDA_PF : FAIXAS_FATURAMENTO_PJ).map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                    {erro && <div className="form-error">{erro}</div>}
                    <div className="form-actions">
                      <button type="button" className="btn-form-back" onClick={voltar}>← Voltar</button>
                      <button type="button" className="btn-form-next" onClick={avancar}>
                        Continuar
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4 — Documentos */}
                {step === 4 && (
                  <div className="form-step active">
                    <div className="step-label">
                      Etapa 4 de 5 <span className="hint-inline">Envie seus documentos</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 14 }}>
                      Aceitamos JPG, PNG ou PDF. {tipoConta === 'PJ' && 'Para PJ, envie os docs do responsável.'}
                    </p>

                    <UploadField label="Documento (frente)" sub="RG ou CNH" file={docFrente} onChange={setDocFrente} />
                    <UploadField label="Documento (verso)" sub="RG ou CNH" file={docVerso} onChange={setDocVerso} />
                    <UploadField label="Selfie segurando o documento" sub="Para validar identidade" file={docSelfie} onChange={setDocSelfie} />
                    <UploadField label={tipoConta === 'PF' ? 'Comprovante de residência' : 'Contrato social'} sub={tipoConta === 'PF' ? 'Conta de luz, água, etc' : 'Última versão atualizada'} file={docComprovante} onChange={setDocComprovante} />

                    {erro && <div className="form-error">{erro}</div>}
                    <div className="form-actions">
                      <button type="button" className="btn-form-back" onClick={voltar}>← Voltar</button>
                      <button type="button" className="btn-form-next" onClick={avancar}>
                        Continuar
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 5 — Senha */}
                {step === 5 && (
                  <div className="form-step active">
                    <div className="step-label">
                      Etapa 5 de 5 <span className="hint-inline">Crie sua senha</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 14 }}>
                      Essa senha será usada pra acessar sua conta DasBank.
                    </p>
                    <div className="field" style={{ position: 'relative' }}>
                      <label>Senha de acesso</label>
                      <input
                        type={showSenha ? 'text' : 'password'}
                        value={senha}
                        onChange={e=>setSenha(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        style={{ paddingRight: 40 }}
                      />
                      <button type="button" className="toggle-senha" onClick={()=>setShowSenha(!showSenha)} style={{ top: '70%' }}>
                        {showSenha ? '🙈' : '👁️'}
                      </button>
                    </div>
                    {erro && <div className="form-error">{erro}</div>}
                    <div className="form-actions">
                      <button type="button" className="btn-form-back" onClick={voltar}>← Voltar</button>
                      <button type="submit" className="btn-form-submit" disabled={enviando}>
                        {enviando ? 'Criando conta...' : 'Criar minha conta'}
                      </button>
                    </div>
                  </div>
                )}

                <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 16, textAlign: 'center', lineHeight: 1.4 }}>
                  Ao criar conta, você concorda com nossos Termos de Uso e Política de Privacidade.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="section" id="como-funciona">
        <div className="container">
          <div className="section-eyebrow">Simples assim</div>
          <h2 className="section-title">Sua conta pronta em <span className="it">3 passos.</span></h2>
          <p className="section-sub">Sem fila de banco, sem papel, sem complicação. Tudo pelo celular ou computador.</p>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00B788" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </div>
              <h3>Preencha seus dados</h3>
              <p>Informações pessoais ou da sua empresa, endereço e atividade. 5 minutos e pronto.</p>
            </div>
            <div className="step-card">
              <div className="step-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00B788" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
              <h3>Envie os documentos</h3>
              <p>Foto do RG ou CNH, uma selfie e comprovante de endereço. Tudo direto pelo celular.</p>
            </div>
            <div className="step-card">
              <div className="step-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00B788" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h3>Conta aprovada</h3>
              <p>Em até 24h sua conta está pronta. Cartão virtual liberado na hora e físico chega em casa em até 7 dias.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="section alt" id="beneficios">
        <div className="container">
          <div className="section-eyebrow">Por que DasBank</div>
          <h2 className="section-title">Tudo o que você precisa, <span className="it">sem cobrar nada.</span></h2>

          <div className="beneficios-grid">
            <div className="beneficio">
              <div className="beneficio-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00B788" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <div className="beneficio-titulo">PIX ilimitado</div>
              <div className="beneficio-desc">Faça quantos PIX quiser, sem pagar nada. 24h por dia.</div>
            </div>
            <div className="beneficio">
              <div className="beneficio-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00B788" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              </div>
              <div className="beneficio-titulo">Cartão sem anuidade</div>
              <div className="beneficio-desc">Virtual e físico. Use no crédito, débito ou alimentação.</div>
            </div>
            <div className="beneficio">
              <div className="beneficio-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00B788" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div className="beneficio-titulo">Rendimento na conta</div>
              <div className="beneficio-desc">Seu dinheiro rende 100% do CDI todo dia útil, automático.</div>
            </div>
            <div className="beneficio">
              <div className="beneficio-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00B788" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <div className="beneficio-titulo">Segurança total</div>
              <div className="beneficio-desc">Senha, biometria e notificações em tempo real de tudo.</div>
            </div>
            <div className="beneficio">
              <div className="beneficio-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00B788" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18v18H3zM9 9h6v6H9z"/></svg>
              </div>
              <div className="beneficio-titulo">Boletos grátis</div>
              <div className="beneficio-desc">Pague boletos sem taxas. Emita boletos pra receber (PJ).</div>
            </div>
            <div className="beneficio">
              <div className="beneficio-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00B788" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <div className="beneficio-titulo">Aprovação rápida</div>
              <div className="beneficio-desc">Sua conta sai em até 24h. Mais rápido que abrir uma conta tradicional.</div>
            </div>
            <div className="beneficio">
              <div className="beneficio-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00B788" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div className="beneficio-titulo">Suporte humano</div>
              <div className="beneficio-desc">Atendimento por WhatsApp. Sem URA, sem robô, gente de verdade.</div>
            </div>
            <div className="beneficio">
              <div className="beneficio-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00B788" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </div>
              <div className="beneficio-titulo">Conta PJ completa</div>
              <div className="beneficio-desc">Maquininha, cobrança, boleto, link de pagamento. Tudo num só lugar.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="section">
        <div className="container">
          <div className="section-eyebrow">Quem usa, recomenda</div>
          <h2 className="section-title">Mais de <span className="it">350 mil pessoas</span> já mudaram de banco.</h2>

          <div className="testimonials">
            <div className="testimonial">
              <div className="stars">★★★★★</div>
              <blockquote>Saí de banco grande pro DasBank e nunca mais voltei. Atendimento rápido pelo WhatsApp e zero taxa. Recomendo demais.</blockquote>
              <div className="person">
                <div className="avatar">M</div>
                <div>
                  <div className="name">Marina Costa</div>
                  <div className="role">Designer · São Paulo</div>
                </div>
              </div>
            </div>
            <div className="testimonial featured">
              <div className="stars">★★★★★</div>
              <blockquote>Abri a conta PJ da minha empresa em 2 dias. Zero burocracia. Tô economizando uns R$ 300/mês em taxas que pagava no banco anterior.</blockquote>
              <div className="person">
                <div className="avatar">R</div>
                <div>
                  <div className="name">Rafael Mendes</div>
                  <div className="role">Empresário · Belo Horizonte</div>
                </div>
              </div>
            </div>
            <div className="testimonial">
              <div className="stars">★★★★★</div>
              <blockquote>O cartão chegou super rápido. App muito fluido, PIX instantâneo e o rendimento automático da conta é ótimo. Mudei minha família toda pra cá.</blockquote>
              <div className="person">
                <div className="avatar">A</div>
                <div>
                  <div className="name">Ana Beatriz</div>
                  <div className="role">Médica · Curitiba</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="final-cta">
        <div className="container">
          <h2>Sua conta está a <span className="it">5 minutos</span> de distância.</h2>
          <p>Sem mensalidade, sem letras miúdas, sem fila. Comece agora.</p>
          <a href="#abrir-conta" className="btn-primary">
            Abrir minha conta grátis
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="foot-grid">
            <div>
              <div className="logo" style={{color:'white'}}>
                <LogoMark size={32} />
                <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.025em', color: 'white' }}>
                  Das<span style={{ color: '#00D4A0' }}>Bank</span>
                </span>
              </div>
              <p className="foot-about">
                Banco digital pra pessoas e empresas que querem mais agilidade,
                menos burocracia e zero taxa.
              </p>
            </div>
            <div className="foot-cols">
              <div className="foot-col">
                <h4>Produto</h4>
                <a href="#abrir-conta">Conta PF</a>
                <a href="#abrir-conta">Conta PJ</a>
                <a href="#beneficios">Cartão</a>
                <a href="#beneficios">Maquininha</a>
              </div>
              <div className="foot-col">
                <h4>Empresa</h4>
                <a href="#">Sobre nós</a>
                <a href="#">Carreiras</a>
                <a href="#">Imprensa</a>
                <a href="#">Blog</a>
              </div>
              <div className="foot-col">
                <h4>Suporte</h4>
                <a href="#">Central de ajuda</a>
                <a href="#">WhatsApp</a>
                <a href="#">Termos</a>
                <a href="#">Privacidade</a>
              </div>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 DasBank — Conta digital pra todo mundo</span>
            <span>CNPJ XX.XXX.XXX/0001-XX</span>
          </div>
        </div>
      </footer>
    </>
  );
}

function UploadField({ label, sub, file, onChange }: { label: string; sub: string; file: File | null; onChange: (f: File) => void }) {
  const id = `up-${label.replace(/\s/g,'-').toLowerCase()}`;
  return (
    <label htmlFor={id} className={`upload-area ${file ? 'uploaded' : ''}`}>
      <div className="upload-icon">
        {file ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0B3D3A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00B788" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        )}
      </div>
      <div className="upload-titulo">{file ? `✓ ${file.name.length > 30 ? file.name.slice(0,28) + '...' : file.name}` : label}</div>
      <div className="upload-sub">{file ? 'Clique pra trocar' : sub}</div>
      <input id={id} type="file" accept="image/*,application/pdf" onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) onChange(f);
      }}/>
    </label>
  );
}
