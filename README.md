# 🏦 DasBank — Guia de instalação

Esse projeto substitui o VagaCerta no mesmo repo/Vercel/Supabase.

## 📋 Passo a passo

### 1. Backup do VagaCerta (opcional)
Se quiser preservar o VagaCerta antes de sobrescrever:
```bash
cd ~/Documentos/vagacerta
git checkout -b backup-vagacerta
git push origin backup-vagacerta
git checkout main
```

### 2. Apagar arquivos antigos do VagaCerta
```bash
cd ~/Documentos/vagacerta
rm -rf app components lib
rm -f supabase-setup.sql supabase-migration-*.sql
```

### 3. Copiar arquivos novos do DasBank
Descompacte o `dasbank-v1.zip` e copie tudo pra dentro da pasta:
```bash
cp -R ~/Downloads/dasbank/* .
```

### 4. Criar a tabela no Supabase
- Abrir o projeto no Supabase
- SQL Editor → New query
- Colar o conteúdo de `supabase-setup.sql`
- Run

### 5. Subir pro Git
```bash
git add .
git commit -m "transição: vagacerta → dasbank (banco digital demo)"
git push
```

### 6. Renomear projeto no Vercel (opcional)
- vercel.com → seu projeto
- Settings → General → Project Name
- Mudar de `vagacerta` pra `dasbank`
- Domain: passa a ser `dasbank-XXXX.vercel.app`

As env vars do Vercel **continuam as mesmas** (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_PASSWORD, JWT_SECRET).

## 🎯 Como apresentar pro seu conhecido

### Roteiro sugerido (5 minutos):

**1. Abre a landing no celular ou notebook**
- Mostra hero, seções "como funciona", benefícios, depoimentos
- "Olha, o site explica tudo: PF e PJ, zero taxa, PIX ilimitado"

**2. Faz o cadastro ao vivo**
- Escolhe PF ou PJ
- Preenche dados (use os seus, ou dados fake — qualquer CPF)
- Sobe **qualquer foto** nos 4 campos de documento (qualquer JPG funciona — não validamos)
- Cria senha
- "Pronto, conta criada — agora cai numa tela de 'em análise'"

**3. Mostra o painel logado**
- "Olha como já tá com aviso de 'em análise'"
- Cartão virtual visível, saldo zerado, extrato vazio
- "Quando o banco aprovar, esses campos enchem"

**4. Abre outra aba — painel admin**
- `dasbank-XXXX.vercel.app/admin`
- Senha admin
- "Aqui é quem opera o banco. Olha — tem o cadastro que eu acabei de fazer"
- Clica no cadastro → modal abre com todos os dados + 4 fotos de docs
- Clica em **"✓ Aprovar conta"**

**5. Volta no painel do cliente e dá refresh**
- "Agora a conta tá aprovada — saldo de R$ 1.247,85, transações fakes apareceram, cartão liberado"
- Clica em PIX/Transferir/Investir → modal "em desenvolvimento"
- "A interface tá toda pronta. Faltam as integrações reais"

## ⚠️ Avisos importantes

1. **Deixa claro que é demo.** "É um protótipo navegável pra mostrar a UX. A parte regulatória (BC, BaaS) é fase posterior."

2. **Não é banco de verdade.** Avise que pra operar de verdade precisa de: licença BC, parceria com BaaS (Pagar.me, Bankly, Dock, Belvo, etc), AML/KYC real, etc.

3. **Custos reais pra virar produto:**
   - BaaS: a partir de R$ 5k/mês
   - DPO + Compliance: R$ 10-20k/mês
   - Time mínimo: 5-8 pessoas (devs, design, ops)
   - MVP real: 4-6 meses + R$ 200-500k

## 🎨 Customização rápida

Se ele topar e quiser uma versão personalizada:

### Trocar nome
- Buscar e substituir "DasBank" → "NovoBanco" em todos os arquivos
- Trocar `Das<span>Bank</span>` no `Logo.tsx` e na page.tsx

### Trocar cores
Edite `app/globals.css` linhas 3-12:
```css
--teal-deep: #0B3D3A;   /* fundo escuro */
--mint: #00D4A0;        /* cor de acento */
```

### Trocar logo
Edite `components/Logo.tsx` — substitua o SVG pelo logo do banco.

## 📂 Estrutura

```
dasbank/
├── app/
│   ├── page.tsx              landing + form
│   ├── login/page.tsx
│   ├── painel/page.tsx       dashboard logado
│   ├── admin/page.tsx        painel banco
│   ├── sucesso/page.tsx      pós-cadastro
│   └── api/                  rotas backend
├── components/Logo.tsx
├── lib/                      supabase + auth
└── supabase-setup.sql
```
