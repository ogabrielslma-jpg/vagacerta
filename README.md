# 🌍 DasBank — Conta Global (v2)

Banco digital pra brasileiros (PF e PJ) receberem do mundo. Foco em conta multi-moeda + recebimento internacional.

## 📋 O que mudou da v1 pra v2

- 🎨 **Nova identidade:** Preto + verde-menta neon (vibe fintech tech)
- 🌍 **Novo posicionamento:** Conta global pra recebimento de +140 países
- 💱 **Painel multi-moeda:** Tabs USD/EUR/GBP/BRL com saldos separados
- 🏦 **Dados bancários internacionais:** Routing US, IBAN europeu, Sort code UK
- 📊 **Comparativo de economia:** DasBank vs Wise vs banco tradicional
- 👥 **4 personas:** Freelancer, Criador, E-commerce, Empresa
- ⚡ **Cotações live:** Strip animada com USD/BRL, EUR/BRL etc no topo
- 🌎 **Grid de países:** 16 países visíveis + bandeiras circulares no hero

## 🚀 Como atualizar

Se você já tem o DasBank v1 no ar, é só sobrescrever os arquivos:

### 1. Apagar arquivos antigos
```bash
cd ~/Downloads/vagacerta
rm -rf app components
```

### 2. Copiar arquivos novos
```bash
cp -R ~/Downloads/dasbank/* .
```

### 3. Subir pro Git
```bash
git add .
git commit -m "v2: dasbank global - preto + menta + multi-moeda"
git push
```

Vercel faz redeploy automático em 1-3 min.

⚠️ **Não precisa rodar SQL novamente** — a tabela `clientes` continua a mesma.

## 🎬 Roteiro de apresentação atualizado

### 1. Landing global (1 min)
- Mostra hero "Receba do mundo. Saque no Brasil."
- Cotações live rolando embaixo
- Bandeiras de 6 países + "+134"
- Stats: 140+ países, 10x mais barato, 350k clientes

### 2. Cadastro ao vivo (1 min)
- PF ou PJ
- Preenche dados (qualquer CPF/CNPJ)
- Sobe 4 fotos quaisquer nos docs
- Cria senha

### 3. Painel multi-moeda (2 min) — **DESTAQUE**
- Tabs BRL / USD / EUR / GBP no topo (cada uma com saldo próprio)
- Clica em USD: saldo $2.147,85 + dados bancários americanos (Wells Fargo)
- Clica em EUR: saldo €850 + IBAN belga
- Extrato mostra recebimentos com bandeiras: Acme Inc (USA), YouTube AdSense, cliente UK, cliente alemão
- Cartão internacional virtual

### 4. Admin aprovando (1 min)
- `/admin` → senha admin
- Modal completo com docs
- Clica Aprovar → conta vira "verificada"
- Volta no painel: agora todos os saldos aparecem populados

## 🎨 Identidade visual v2

```
--black: #0A0A0A          (fundo principal)
--black-soft: #121212     (fundo secundário)
--black-elevated: #1A1A1A (cards)
--mint: #00FFB3           (cor de acento)
--mint-bright: #1AFFB8    (hover)
--mint-glow: rgba(0, 255, 179, 0.4)  (glow effect)
```

**Tipografia:** Inter (regular) + JetBrains Mono (cotações, dados técnicos)

## 📂 Estrutura

```
dasbank/
├── app/
│   ├── page.tsx              landing global + form
│   ├── login/page.tsx        login dark
│   ├── painel/page.tsx       dashboard multi-moeda
│   ├── admin/page.tsx        painel banco
│   ├── sucesso/page.tsx      pós-cadastro
│   ├── globals.css           tema preto + menta
│   └── api/                  rotas backend (sem mudanças)
├── components/Logo.tsx       logo "Das" + ponto verde
├── lib/                      supabase + auth (sem mudanças)
└── supabase-setup.sql        SQL (sem mudanças, já rodado)
```

## ⚠️ Lembrete ético pra apresentação

Quando apresentar pro cliente:
- ✅ "É um protótipo navegável da UX/UI"
- ✅ "A camada bancária real precisa de licença BC + parceria BaaS internacional (tipo Bankly + Currencycloud)"
- ✅ "MVP real: 6-9 meses + R$ 300-800k de investimento"
- ❌ Não diga que está pronto pra operar
- ❌ Não copie marca de Wise, Nomad, Husky etc
