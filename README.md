# 🚀 VagaCerta — Portal de Empregos Home Office

Landing page + cadastro + painel admin para captação de candidatos.

## 📋 Stack

- **Next.js 14** (App Router, TypeScript)
- **Supabase** (PostgreSQL grátis)
- **Vercel** (hosting)

## 🗂 Estrutura

```
/              → Landing pública com formulário de cadastro
/admin         → Painel interno (senha protegida)
/api/cadastrar → POST: recebe novos cadastros
/api/admin/cadastros → GET/PATCH: lista e atualiza status (auth via header)
```

## ⚡ Deploy passo a passo

### 1️⃣ Criar conta no Supabase

1. Vá em https://supabase.com → Sign up (use sua conta Google)
2. Clique em **New Project**
3. Preencha:
   - **Name:** `vagacerta`
   - **Database Password:** gere uma forte e **salve** (você não vai precisar agora, mas guarde)
   - **Region:** `South America (São Paulo)` — mais rápido pro BR
4. Aguarde ~2 min até o projeto ficar pronto

### 2️⃣ Criar a tabela no Supabase

1. No painel do projeto, clique em **SQL Editor** (menu lateral)
2. Clique em **New query**
3. Abra o arquivo `supabase-setup.sql` deste projeto, **copie tudo e cole** no editor
4. Clique em **Run** (canto inferior direito) ou aperte `Cmd+Enter`
5. Você verá "Success. No rows returned" — pronto, tabela criada ✅

### 3️⃣ Pegar as chaves do Supabase

1. No menu lateral, vá em **Project Settings** (ícone de engrenagem) → **API**
2. Copie e guarde:
   - **Project URL** (algo como `https://xxxxx.supabase.co`)
   - **service_role key** (em "Project API keys" — clique no olhinho pra revelar)
   
> ⚠️ A `service_role` é **secreta**. Nunca commite no Git, nunca compartilhe.

### 4️⃣ Subir o código no GitHub

No terminal, dentro da pasta do projeto:

```bash
cd vagacerta

# Instala dependências localmente (opcional, mas recomendado pra testar)
npm install

# Inicializa o Git
git init
git add .
git commit -m "Initial commit"

# Cria o repo no GitHub e linka
git branch -M main
git remote add origin https://github.com/ogabrielslma-jpg/vagacerta.git
git push -u origin main
```

> Se o repo `vagacerta` ainda não existe: vá em https://github.com/new, nome = `vagacerta`, **deixe vazio** (sem README, sem .gitignore), clique em **Create**, depois rode os comandos `git push` acima.

### 5️⃣ Deploy no Vercel

1. Vá em https://vercel.com/new
2. Selecione o repositório `ogabrielslma-jpg/vagacerta` → **Import**
3. Em **Environment Variables**, adicione as 3 variáveis:

| Nome | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do Supabase (passo 3) |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key do Supabase (passo 3) |
| `ADMIN_PASSWORD` | `admin2026` (ou outra de sua escolha) |

4. Clique em **Deploy**
5. Em ~2 minutos seu site estará no ar em `https://vagacerta-xxx.vercel.app`

### 6️⃣ Testar

1. Acesse o domínio do Vercel
2. Faça um cadastro de teste no formulário da landing
3. Acesse `https://seudominio.vercel.app/admin`
4. Digite a senha (`admin2026` ou a que você configurou)
5. Você deve ver o cadastro de teste na tabela ✅

## 🧪 Rodar localmente (opcional)

```bash
# Copia .env.example pra .env.local e preenche com suas chaves
cp .env.example .env.local
# Edita .env.local com as chaves do Supabase

npm install
npm run dev
# Abre em http://localhost:3000
```

## 🔧 Trocar a senha do admin

No Vercel: **Project Settings → Environment Variables** → edita `ADMIN_PASSWORD` → **Redeploy**.

## 📊 Status dos cadastros

O painel admin organiza os candidatos em 4 status:

- **🟢 Novo** — cadastro recém-recebido, ainda não processado
- **🟠 Contatado** — você já entrou em contato
- **🔵 Agendado** — entrevista marcada (este é o que **converte em receita** pra vocês)
- **⚫ Descartado** — perfil não se encaixa

## 🎯 Próximos passos sugeridos

1. **Domínio próprio** — comprar `vagacerta.com.br` e apontar pro Vercel (Settings → Domains)
2. **Notificação por email/WhatsApp** quando entrar cadastro novo (Resend + webhook)
3. **Integração com a API do parceiro** — endpoint `/api/disparar` que pega cadastros com status "novo" e dispara
4. **Captura via Meta Ads / TikTok Ads** — adicionar Pixel da Meta na landing
5. **Sistema de tags** nos cadastros (ex: "fluente em inglês", "tem CNPJ")

## 🆘 Problemas comuns

**"Erro ao salvar cadastro" no formulário**
→ Verifica se as variáveis `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` estão corretas no Vercel e se você rodou o `supabase-setup.sql`

**"Senha incorreta" no /admin mesmo digitando certo**
→ Verifica se a variável `ADMIN_PASSWORD` está exatamente igual no Vercel (cuidado com espaços)

**Email duplicado**
→ A tabela tem constraint de unicidade no email. Se a pessoa tentar cadastrar 2x, retorna erro. (você pode remover essa restrição no SQL se quiser)
