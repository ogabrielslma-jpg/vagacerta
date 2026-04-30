'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogoMark } from '@/components/Logo';

const ESTADOS_BR = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

const PROFISSOES = [
  'Freelancer / Profissional liberal','Criador de conteúdo','Empresário','Empreendedor digital',
  'CLT','Servidor público','Estudante','Microempreendedor (MEI)','Investidor','Outro'
];

const FAIXAS_RENDA_PF = [
  'Até R$ 2.000','R$ 2.000 a R$ 5.000','R$ 5.000 a R$ 10.000','R$ 10.000 a R$ 20.000','Acima de R$ 20.000'
];

const FAIXAS_FATURAMENTO_PJ = [
  'Até R$ 10.000/mês','R$ 10.000 a R$ 50.000','R$ 50.000 a R$ 200.000','R$ 200.000 a R$ 1mi','Acima de R$ 1mi/mês'
];

const PAISES = [
  { bandeira: '🇺🇸', nome: 'Estados Unidos', moeda: 'USD' },
  { bandeira: '🇪🇺', nome: 'União Europeia', moeda: 'EUR' },
  { bandeira: '🇬🇧', nome: 'Reino Unido', moeda: 'GBP' },
  { bandeira: '🇨🇦', nome: 'Canadá', moeda: 'CAD' },
  { bandeira: '🇦🇺', nome: 'Austrália', moeda: 'AUD' },
  { bandeira: '🇯🇵', nome: 'Japão', moeda: 'JPY' },
  { bandeira: '🇨🇭', nome: 'Suíça', moeda: 'CHF' },
  { bandeira: '🇩🇪', nome: 'Alemanha', moeda: 'EUR' },
  { bandeira: '🇫🇷', nome: 'França', moeda: 'EUR' },
  { bandeira: '🇪🇸', nome: 'Espanha', moeda: 'EUR' },
  { bandeira: '🇮🇹', nome: 'Itália', moeda: 'EUR' },
  { bandeira: '🇵🇹', nome: 'Portugal', moeda: 'EUR' },
  { bandeira: '🇸🇬', nome: 'Singapura', moeda: 'SGD' },
  { bandeira: '🇲🇽', nome: 'México', moeda: 'MXN' },
  { bandeira: '🇦🇷', nome: 'Argentina', moeda: 'ARS' },
  { bandeira: '🇨🇱', nome: 'Chile', moeda: 'CLP' },
];

const COTACOES_LIVE = [
  { codigo: 'USD/BRL', valor: '5,12', delta: '+0,3%', up: true },
  { codigo: 'EUR/BRL', valor: '5,58', delta: '+0,5%', up: true },
  { codigo: 'GBP/BRL', valor: '6,42', delta: '-0,1%', up: false },
  { codigo: 'CAD/BRL', valor: '3,76', delta: '+0,2%', up: true },
  { codigo: 'AUD/BRL', valor: '3,38', delta: '+0,4%', up: true },
  { codigo: 'JPY/BRL', valor: '0,034', delta: '+0,1%', up: true },
  { codigo: 'CHF/BRL', valor: '5,80', delta: '+0,2%', up: true },
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

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNasc, setDataNasc] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [responsavel, setResponsavel] = useState('');

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

  const [docFrente, setDocFrente] = useState<File | null>(null);
  const [docVerso, setDocVerso] = useState<File | null>(null);
  const [docSelfie, setDocSelfie] = useState<File | null>(null);
  const [docComprovante, setDocComprovante] = useState<File | null>(null);

  const [senha, setSenha] = useState('');

  useEffect(() => {
    if (formRef.current && step > 1) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [step]);

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
              Das<span style={{ color: '#00FFB3' }}>Bank</span>
            </span>
          </a>
          <div className="nav-links">
            <a href="#paises">Países</a>
            <a href="#como-funciona">Como funciona</a>
            <a href="#comparativo">Compare</a>
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
                +140 países · USD · EUR · GBP · CAD · AUD
              </div>

              <h1 className="hero-title">
                Receba do mundo.<br/>
                <span className="accent">Saque no Brasil.</span>
              </h1>

              <p className="hero-sub">
                Conta global pra <strong>pessoa física e empresas</strong> brasileiras receberem
                pagamentos de mais de <strong>140 países</strong> com taxas até <strong>10x menores</strong> que
                bancos tradicionais. Multi-moeda, cartão sem IOF e suporte humano.
              </p>

              <div className="hero-cta-row">
                <a href="#abrir-conta" className="btn-primary">
                  Abrir conta global grátis
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
                <a href="#comparativo" className="btn-ghost">Ver economia →</a>
              </div>

              <div className="flags-strip">
                <div className="flags-row">
                  <span className="flag-circle">🇺🇸</span>
                  <span className="flag-circle">🇪🇺</span>
                  <span className="flag-circle">🇬🇧</span>
                  <span className="flag-circle">🇨🇦</span>
                  <span className="flag-circle">🇦🇺</span>
                  <span className="flag-circle">🇯🇵</span>
                  <span className="flag-circle" style={{ background: 'var(--black)', color: 'var(--mint)', fontSize: 11, fontWeight: 700 }}>+134</span>
                </div>
                <span>Receba em moedas locais</span>
              </div>

              <div className="hero-stats">
                <div>
                  <div className="stat-num">140<span className="plus">+</span></div>
                  <div className="stat-label">Países</div>
                </div>
                <div>
                  <div className="stat-num">10x</div>
                  <div className="stat-label">Mais barato</div>
                </div>
                <div>
                  <div className="stat-num">350<span className="plus">k+</span></div>
                  <div className="stat-label">Clientes</div>
                </div>
              </div>
            </div>

            {/* FORM CARD */}
            <div ref={formRef} id="abrir-conta">
              <form className="form-card" onSubmit={enviar}>
                <div className="form-title">
                  Abra sua conta <span className="accent">global</span>
                </div>
                <p className="form-sub">Pronta em até 24h. Sem mensalidade.</p>

                <div className="progress">
                  <span className={step>=1?'active':''}></span>
                  <span className={step>=2?'active':''}></span>
                  <span className={step>=3?'active':''}></span>
                  <span className={step>=4?'active':''}></span>
                  <span className={step>=5?'active':''}></span>
                </div>

                {step === 1 && (
                  <div className="form-step active">
                    <div className="step-label">Etapa 1 de 5</div>
                    <div style={{ marginBottom: 14, fontWeight: 600, fontSize: 15, color: 'white' }}>
                      Pra quem é a conta?
                    </div>
                    <div className="tipo-conta-grid">
                      <div className={`tipo-conta-card ${tipoConta==='PF'?'active':''}`} onClick={() => setTipoConta('PF')}>
                        <div className="icon">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={tipoConta==='PF'?'#00FFB3':'rgba(255,255,255,0.6)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                          </svg>
                        </div>
                        <div className="titulo">Pessoa Física</div>
                        <div className="sub">Freelancer, criador, etc</div>
                      </div>
                      <div className={`tipo-conta-card ${tipoConta==='PJ'?'active':''}`} onClick={() => setTipoConta('PJ')}>
                        <div className="icon">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={tipoConta==='PJ'?'#00FFB3':'rgba(255,255,255,0.6)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h.01M9 13h.01M9 17h.01M14 9h2M14 13h2M14 17h2"/>
                          </svg>
                        </div>
                        <div className="titulo">Pessoa Jurídica</div>
                        <div className="sub">MEI, LTDA, exportador</div>
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
                            <label>Data nasc.</label>
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
                          <label>Responsável</label>
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

                {step === 4 && (
                  <div className="form-step active">
                    <div className="step-label">
                      Etapa 4 de 5 <span className="hint-inline">KYC — verificação de identidade</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 14 }}>
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

                {step === 5 && (
                  <div className="form-step active">
                    <div className="step-label">
                      Etapa 5 de 5 <span className="hint-inline">Crie sua senha</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 14 }}>
                      Essa senha protege sua conta DasBank.
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
                        {enviando ? 'Criando conta...' : 'Criar conta global'}
                      </button>
                    </div>
                  </div>
                )}

                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 16, textAlign: 'center', lineHeight: 1.4 }}>
                  Ao criar conta, você concorda com nossos Termos de Uso e Política de Privacidade.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Cotações ao vivo */}
      <div className="moedas-strip">
        <div className="moedas-track">
          {[...COTACOES_LIVE, ...COTACOES_LIVE, ...COTACOES_LIVE].map((c, i) => (
            <div key={i} className="moeda-item">
              <span className="codigo">{c.codigo}</span>
              <span className="valor">R$ {c.valor}</span>
              <span className={`delta ${c.up ? 'up' : 'down'}`}>{c.delta}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Como funciona */}
      <section className="section" id="como-funciona">
        <div className="container">
          <div className="section-eyebrow">Como funciona</div>
          <h2 className="section-title">Receber em <span className="accent">3 passos.</span></h2>
          <p className="section-sub">Sem burocracia, sem fila de banco, sem espera. Tudo no seu painel.</p>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00FFB3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg>
              </div>
              <h3>Compartilhe sua conta</h3>
              <p>Ao abrir conta, você recebe dados bancários nos EUA, Europa, UK, Canadá e mais. Compartilhe com quem vai te pagar.</p>
            </div>
            <div className="step-card">
              <div className="step-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00FFB3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <h3>Cliente paga em moeda local</h3>
              <p>Seu cliente nos EUA paga em USD, na Europa em EUR. Sem spread abusivo de banco — taxa transparente e baixa.</p>
            </div>
            <div className="step-card">
              <div className="step-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00FFB3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h3>Saque em reais ou mantenha em USD</h3>
              <p>Converta pra real na cotação comercial ou guarde em dólar/euro. Use o cartão internacional sem IOF onde quiser.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview - Mockup */}
      <section className="section dashboard-preview-section">
        <div className="container">
          <div className="section-eyebrow">Painel da sua conta</div>
          <h2 className="section-title">Tudo no <span className="accent">seu controle.</span></h2>
          <p className="section-sub">
            Saldo multi-moeda, dados bancários internacionais e extrato em tempo real. Bonito, simples, completo.
          </p>

          <div className="dash-preview-grid">
            {/* Mockup Desktop */}
            <div className="dash-mockup-desktop">
              <div className="mockup-browser-bar">
                <div className="browser-dots">
                  <span/><span/><span/>
                </div>
                <div className="browser-url">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  dasbankapp.com/painel
                </div>
              </div>
              <div className="mockup-dash-content">
                {/* Header */}
                <div className="mock-dash-header">
                  <div style={{display:'flex', alignItems:'center', gap:8}}>
                    <div className="mock-logo-mark">
                      <svg width="18" height="18" viewBox="0 0 60 60">
                        <rect x="2" y="2" width="56" height="56" rx="12" fill="#0A0A0A"/>
                        <circle cx="30" cy="30" r="14" fill="none" stroke="#00FFB3" strokeWidth="2.2"/>
                        <path d="M 24 22 L 24 38 L 32 38 Q 39 38 39 30 Q 39 22 32 22 Z" fill="#00FFB3"/>
                        <circle cx="42" cy="22" r="2" fill="#00FFB3"/>
                      </svg>
                    </div>
                    <span className="mock-brand">Das<span style={{color:'#00FFB3'}}>Bank</span></span>
                  </div>
                  <div className="mock-avatar">G</div>
                </div>

                {/* Tabs moedas */}
                <div className="mock-tabs">
                  <div className="mock-tab active">🇧🇷 BRL</div>
                  <div className="mock-tab">🇺🇸 USD</div>
                  <div className="mock-tab">🇪🇺 EUR</div>
                  <div className="mock-tab">🇬🇧 GBP</div>
                </div>

                {/* Saldo */}
                <div className="mock-saldo-card">
                  <div className="mock-saldo-label">Saldo disponível</div>
                  <div className="mock-saldo-valor">R$ 12.847<span style={{color:'rgba(255,255,255,0.4)'}}>,30</span></div>
                  <div className="mock-saldo-sub">≈ US$ 2.460 · €2.290</div>
                </div>

                {/* Quick Actions */}
                <div className="mock-actions">
                  <div className="mock-action">
                    <div className="mock-action-icon">↓</div>
                    <span>Receber</span>
                  </div>
                  <div className="mock-action">
                    <div className="mock-action-icon">⇄</div>
                    <span>Converter</span>
                  </div>
                  <div className="mock-action">
                    <div className="mock-action-icon">↑</div>
                    <span>Sacar</span>
                  </div>
                  <div className="mock-action">
                    <div className="mock-action-icon">💳</div>
                    <span>Cartão</span>
                  </div>
                </div>

                {/* Extrato */}
                <div className="mock-extrato-titulo">Últimas transações</div>
                <div className="mock-extrato">
                  <div className="mock-tx">
                    <div className="mock-tx-flag">🇺🇸</div>
                    <div style={{flex:1}}>
                      <div className="mock-tx-nome">Stripe Inc.</div>
                      <div className="mock-tx-sub">Recebimento USA · hoje</div>
                    </div>
                    <div className="mock-tx-valor up">+ R$ 4.247,80</div>
                  </div>
                  <div className="mock-tx">
                    <div className="mock-tx-flag">🇪🇺</div>
                    <div style={{flex:1}}>
                      <div className="mock-tx-nome">Wise Europe</div>
                      <div className="mock-tx-sub">Recebimento UE · ontem</div>
                    </div>
                    <div className="mock-tx-valor up">+ R$ 2.890,00</div>
                  </div>
                  <div className="mock-tx">
                    <div className="mock-tx-flag">🇧🇷</div>
                    <div style={{flex:1}}>
                      <div className="mock-tx-nome">PIX para João Silva</div>
                      <div className="mock-tx-sub">Transferência · 2 dias</div>
                    </div>
                    <div className="mock-tx-valor down">− R$ 850,00</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mockup Mobile */}
            <div className="dash-mockup-mobile">
              <div className="phone-frame">
                <div className="phone-notch"/>
                <div className="phone-screen">
                  {/* Status bar */}
                  <div className="phone-status-bar">
                    <span>9:41</span>
                    <span>📶 100%</span>
                  </div>

                  {/* Conteúdo */}
                  <div className="phone-content">
                    <div className="phone-greeting">
                      <div style={{fontSize:11, color:'rgba(255,255,255,0.5)'}}>Bom dia,</div>
                      <div style={{fontSize:18, fontWeight:700}}>Gabriel 👋</div>
                    </div>

                    <div className="phone-saldo">
                      <div style={{fontSize:10, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.08em'}}>Saldo total</div>
                      <div style={{fontSize:28, fontWeight:800, marginTop:4}}>R$ 12.847<span style={{color:'rgba(255,255,255,0.4)', fontSize:18}}>,30</span></div>
                      <div style={{fontSize:11, color:'#00FFB3', marginTop:2}}>+R$ 4.247 hoje</div>
                    </div>

                    <div className="phone-actions">
                      <div className="phone-action">
                        <div className="phone-action-icon">↓</div>
                        <span>Receber</span>
                      </div>
                      <div className="phone-action">
                        <div className="phone-action-icon">⇄</div>
                        <span>Trocar</span>
                      </div>
                      <div className="phone-action">
                        <div className="phone-action-icon">💳</div>
                        <span>Cartão</span>
                      </div>
                    </div>

                    <div className="phone-cards-titulo">Suas contas</div>
                    <div className="phone-card-acc">
                      <span style={{fontSize:18}}>🇺🇸</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:11, color:'rgba(255,255,255,0.5)'}}>Conta USD</div>
                        <div style={{fontSize:14, fontWeight:700}}>$ 2.460,15</div>
                      </div>
                      <span style={{color:'rgba(255,255,255,0.4)'}}>›</span>
                    </div>
                    <div className="phone-card-acc">
                      <span style={{fontSize:18}}>🇪🇺</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:11, color:'rgba(255,255,255,0.5)'}}>Conta EUR</div>
                        <div style={{fontSize:14, fontWeight:700}}>€ 2.290,40</div>
                      </div>
                      <span style={{color:'rgba(255,255,255,0.4)'}}>›</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Países */}
      <section className="section alt" id="paises">
        <div className="container">
          <div className="section-eyebrow">Cobertura global</div>
          <h2 className="section-title">Receba de <span className="accent">+140 países.</span></h2>
          <p className="section-sub">Dos principais mercados do mundo até os menos óbvios. Se seu cliente está lá, a gente recebe.</p>

          <div className="paises-grid">
            {PAISES.map(p => (
              <div key={p.nome} className="pais-card">
                <div className="bandeira">{p.bandeira}</div>
                <div className="info">
                  <div className="nome">{p.nome}</div>
                  <div className="moeda">{p.moeda}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="paises-cta">
            <h3>+ 124 outros países cobertos</h3>
            <p>Da Coreia do Sul ao Quênia, da Tailândia à Polônia. Cobertura quase total do globo.</p>
          </div>
        </div>
      </section>

      {/* Personas */}
      <section className="section">
        <div className="container">
          <div className="section-eyebrow">Pra quem é</div>
          <h2 className="section-title">Feito pra quem <span className="accent">trabalha global.</span></h2>
          <p className="section-sub">Seja você freelancer, criador, empresa exportadora ou agência — o DasBank tem solução.</p>

          <div className="personas-grid">
            <div className="persona-card">
              <div className="persona-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00FFB3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              </div>
              <h3>Freelancers e devs</h3>
              <p>Receba de empresas dos EUA, UK, Europa direto na sua conta. Plataformas como Upwork, Toptal, Stripe Atlas — todas suportadas.</p>
              <div className="persona-tags">
                <span className="persona-tag">Devs</span>
                <span className="persona-tag">Designers</span>
                <span className="persona-tag">Consultores</span>
              </div>
            </div>

            <div className="persona-card">
              <div className="persona-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00FFB3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
              </div>
              <h3>Criadores de conteúdo</h3>
              <p>YouTube AdSense, Twitch, Patreon, OnlyFans, Substack, Gumroad. Receba sua receita global sem perder 6% pra banco tradicional.</p>
              <div className="persona-tags">
                <span className="persona-tag">YouTubers</span>
                <span className="persona-tag">Streamers</span>
                <span className="persona-tag">Influencers</span>
              </div>
            </div>

            <div className="persona-card">
              <div className="persona-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00FFB3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              </div>
              <h3>E-commerce e exportadores</h3>
              <p>Vende no Amazon, eBay, Shopify ou marketplace internacional? Receba todas suas vendas em USD/EUR e converta quando der bom.</p>
              <div className="persona-tags">
                <span className="persona-tag">Dropshipping</span>
                <span className="persona-tag">Amazon FBA</span>
                <span className="persona-tag">Shopify</span>
              </div>
            </div>

            <div className="persona-card">
              <div className="persona-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00FFB3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7M9 7v1a3 3 0 0 0 6 0V7M15 7v1a3 3 0 0 0 6 0V7M4 21V10.5M20 21V10.5"/></svg>
              </div>
              <h3>Empresas e agências</h3>
              <p>Atende clientes lá fora? Receba via SWIFT, ACH ou SEPA com taxas transparentes. API pra automatizar conciliação e pagamentos.</p>
              <div className="persona-tags">
                <span className="persona-tag">Agências</span>
                <span className="persona-tag">SaaS</span>
                <span className="persona-tag">Consultoria</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparativo */}
      <section className="section alt" id="comparativo">
        <div className="container">
          <div className="section-eyebrow">Compare e veja</div>
          <h2 className="section-title">Quanto você <span className="accent">economiza</span> no DasBank.</h2>
          <p className="section-sub">Cenário real: você recebe US$ 5.000 dos EUA. Veja quanto sobra em cada banco.</p>

          <div className="comparativo">
            <div className="comp-row head">
              <span>Banco / Serviço</span>
              <span>Taxa câmbio</span>
              <span>Taxa fixa</span>
              <span>Você recebe</span>
            </div>

            <div className="comp-row dasbank-row">
              <span className="nome">DasBank<span className="badge-dasbank">Melhor</span></span>
              <span className="valor">0,5%</span>
              <span className="valor">R$ 0</span>
              <span className="valor">R$ 25.472</span>
            </div>

            <div className="comp-row">
              <span className="nome">Wise</span>
              <span className="valor">0,8%</span>
              <span className="valor">R$ 12</span>
              <span className="valor">R$ 25.345</span>
            </div>

            <div className="comp-row">
              <span className="nome">Banco tradicional 1</span>
              <span className="valor">3,5%</span>
              <span className="valor">R$ 80</span>
              <span className="valor">R$ 24.620</span>
            </div>

            <div className="comp-row">
              <span className="nome">Banco tradicional 2</span>
              <span className="valor">4,2%</span>
              <span className="valor">R$ 120</span>
              <span className="valor">R$ 24.404</span>
            </div>
          </div>

          <p style={{ marginTop: 24, fontSize: 13, color: 'rgba(255,255,255,0.45)', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace' }}>
            Cotação USD/BRL: R$ 5,12 · Simulação ilustrativa
          </p>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="section">
        <div className="container">
          <div className="section-eyebrow">Por que DasBank</div>
          <h2 className="section-title">Conta global <span className="accent">completa.</span></h2>

          <div className="beneficios-grid">
            <div className="beneficio">
              <div className="beneficio-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00FFB3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              </div>
              <div className="beneficio-titulo">Multi-moeda</div>
              <div className="beneficio-desc">USD, EUR, GBP, CAD, AUD e mais 30 moedas. Mantenha saldo separado em cada uma.</div>
            </div>
            <div className="beneficio">
              <div className="beneficio-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00FFB3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              </div>
              <div className="beneficio-titulo">Cartão sem IOF</div>
              <div className="beneficio-desc">Cartão internacional Visa/Mastercard. Compre fora sem IOF de 6,38%.</div>
            </div>
            <div className="beneficio">
              <div className="beneficio-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00FFB3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <div className="beneficio-titulo">Câmbio em tempo real</div>
              <div className="beneficio-desc">Cotação comercial, não turismo. Sem spread abusivo de banco.</div>
            </div>
            <div className="beneficio">
              <div className="beneficio-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00FFB3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <div className="beneficio-titulo">100% regulado</div>
              <div className="beneficio-desc">Conta no exterior via parceiros licenciados pelo BC e órgãos internacionais.</div>
            </div>
            <div className="beneficio">
              <div className="beneficio-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00FFB3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              </div>
              <div className="beneficio-titulo">API e integrações</div>
              <div className="beneficio-desc">Pra empresas: API completa de recebimento, conciliação e webhooks.</div>
            </div>
            <div className="beneficio">
              <div className="beneficio-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00FFB3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div className="beneficio-titulo">Suporte humano</div>
              <div className="beneficio-desc">Atendimento por WhatsApp em português. Sem bot, sem URA.</div>
            </div>
            <div className="beneficio">
              <div className="beneficio-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00FFB3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <div className="beneficio-titulo">Aprovação rápida</div>
              <div className="beneficio-desc">Conta liberada em até 24h. Recebimento começa no mesmo dia.</div>
            </div>
            <div className="beneficio">
              <div className="beneficio-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00FFB3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <div className="beneficio-titulo">Zero mensalidade</div>
              <div className="beneficio-desc">Conta gratuita pra sempre. Você só paga taxa de câmbio quando converte.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="section alt">
        <div className="container">
          <div className="section-eyebrow">Quem usa, recomenda</div>
          <h2 className="section-title">Mais de <span className="accent">350 mil</span> brasileiros recebem do mundo aqui.</h2>

          <div className="testimonials">
            <div className="testimonial">
              <div className="stars">★★★★★</div>
              <blockquote>"Sou dev fullstack e atendo cliente nos EUA. Antes perdia uns 8% em câmbio + IOF. Com o DasBank caiu pra 0.5%. Em 6 meses recuperei o que pagava em taxas."</blockquote>
              <div className="person">
                <div className="avatar">L</div>
                <div>
                  <div className="name">Lucas Oliveira</div>
                  <div className="role">Dev fullstack · São Paulo</div>
                </div>
              </div>
            </div>
            <div className="testimonial featured">
              <div className="stars">★★★★★</div>
              <blockquote>"Tenho um e-commerce no Shopify que vende pra Europa. Recebia em EUR e o banco engolia 4% em cada saque. Agora deixo o saldo em euro e converto na hora certa."</blockquote>
              <div className="person">
                <div className="avatar">C</div>
                <div>
                  <div className="name">Camila Ferraz</div>
                  <div className="role">CEO · E-commerce</div>
                </div>
              </div>
            </div>
            <div className="testimonial">
              <div className="stars">★★★★★</div>
              <blockquote>"Faço design pra agência canadense. Recebia em CAD via PayPal e perdia uns 6%. Mudei pro DasBank e o cartão internacional ainda me ajuda em viagem. Top demais."</blockquote>
              <div className="person">
                <div className="avatar">P</div>
                <div>
                  <div className="name">Pedro Henrique</div>
                  <div className="role">Designer · Florianópolis</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container">
          <div className="section-eyebrow">Perguntas frequentes</div>
          <h2 className="section-title">Tirando suas <span className="accent">dúvidas.</span></h2>

          <div className="faq-grid">
            <details className="faq-item">
              <summary>Como funciona a conta global?</summary>
              <p>Ao abrir conta no DasBank, você recebe dados bancários reais em vários países (USA, Europa, UK, etc). Quando alguém te paga em USD, o dinheiro cai na sua conta americana. Você pode manter em dólar ou converter pra real na hora — você escolhe.</p>
            </details>

            <details className="faq-item">
              <summary>Quais moedas eu posso receber?</summary>
              <p>Atualmente USD (dólar), EUR (euro), GBP (libra), CAD (dólar canadense), AUD (dólar australiano), JPY (iene), CHF (franco suíço), SGD (dólar singapuriano) e outras. Total de mais de 30 moedas e 140 países cobertos.</p>
            </details>

            <details className="faq-item">
              <summary>É seguro? Vocês são regulados?</summary>
              <p>Sim. Operamos via parceiros licenciados pelo Banco Central do Brasil (BCB) para câmbio e por reguladores internacionais (FinCEN nos EUA, FCA no UK, etc) para contas no exterior. Seu dinheiro fica em instituições financeiras seguras e seguradas.</p>
            </details>

            <details className="faq-item">
              <summary>Quanto custa?</summary>
              <p>Conta gratuita, sem mensalidade. Você só paga uma taxa de câmbio de 0,5% quando converte moeda estrangeira pra real (ou vice-versa). Sem taxa fixa, sem IOF no cartão internacional, sem custo escondido.</p>
            </details>

            <details className="faq-item">
              <summary>Quanto tempo demora pra conta ser aprovada?</summary>
              <p>Em média 24 horas úteis. Após enviar seus documentos (KYC), nosso time analisa e libera sua conta global. Você é avisado por email e WhatsApp.</p>
            </details>

            <details className="faq-item">
              <summary>Posso usar pra recebimento PJ?</summary>
              <p>Sim. Temos conta global pra empresas (LTDA, MEI, S/A) com todos os benefícios da PF mais API completa, conciliação automática, webhooks e suporte dedicado pra agências e exportadores.</p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="final-cta">
        <div className="container">
          <h2>O mundo paga.<br/><span className="accent">Você recebe.</span></h2>
          <p>Sua conta global em 5 minutos. Sem mensalidade, sem letras miúdas, sem fila.</p>
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
                  Das<span style={{ color: '#00FFB3' }}>Bank</span>
                </span>
              </div>
              <p className="foot-about">
                Conta global pra brasileiros que trabalham com o mundo.
                Receba de +140 países, sem perder dinheiro com câmbio.
              </p>
            </div>
            <div className="foot-cols">
              <div className="foot-col">
                <h4>Produto</h4>
                <a href="#abrir-conta">Conta PF</a>
                <a href="#abrir-conta">Conta PJ</a>
                <a href="#paises">Países cobertos</a>
                <a href="#comparativo">Compare</a>
              </div>
              <div className="foot-col">
                <h4>Empresa</h4>
                <a href="#">Sobre</a>
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
            <span>© 2026 DasBank · Banco digital global</span>
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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00FFB3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
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
