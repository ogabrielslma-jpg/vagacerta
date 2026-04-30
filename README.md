# 🏦 DasBank v3 — Integração ImperiumPay

Conta global com fluxo completo: cadastro → KYC → ativação via PIX (R$ 45) → painel multi-moeda.

## 🆕 O que mudou da v2 pra v3

- ✅ **Integração real com ImperiumPay** (gateway PIX)
- 💰 **Fluxo de ativação:** cobra R$ 45 via PIX após cadastro
- 📲 **Página /ativacao** com QR Code, copia-cola e polling de status
- 🔔 **Webhook** em `/api/webhook/imperium` recebe confirmação de pagamento
- 🔐 **Validação HMAC** opcional do postback (configurável via env)
- 💵 **Saldo BRL real** vem do PIX pago (R$ 45 entram automaticamente)

## 📋 Setup (passo-a-passo)

### 1. Aplicar a migration no Supabase

Roda o `supabase-migration-v3.sql` no SQL Editor:

```sql
alter table clientes
  add column if not exists conta_ativada boolean default false,
  add column if not exists pix_ativacao_id text,
  ...
```

(arquivo `supabase-migration-v3.sql` na raiz do projeto)

### 2. Configurar env vars no Vercel

Vai em **Vercel → seu projeto → Settings → Environment Variables** e adiciona:

| Nome | Valor |
|---|---|
| `IMPERIUM_PUBLIC_KEY` | `pk_e9a15acbdb4d57a00dc0d35198c2bdfc` |
| `IMPERIUM_PRIVATE_KEY` | `sk_b76ad05f0c060b7682507575f5947ed8d349850e0b5a72c959f768613eee9468` |
| `IMPERIUM_POSTBACK_SECRET` | (opcional) chave HMAC fornecida pelo Imperium |

⚠️ **As chaves de teste expiram em algumas horas.** Pra produção, gera novas no dashboard do Imperium.

### 3. Configurar webhook no painel ImperiumPay

No dashboard do Imperium, configura o **Webhook Permanente** apontando pra:

```
https://vagacerta-rust.vercel.app/api/webhook/imperium
```

E configura o **postback secret** (se aplicável) na mesma env var acima.

### 4. Subir o código

```bash
cd ~/Downloads/vagacerta
rm -rf app components lib
cp -R ~/Downloads/dasbank-v3/* .
git add .
git commit -m "v3: integração ImperiumPay — PIX ativação R$ 45"
git push
```

Vercel faz redeploy em 1-2 min.

## 🎬 Fluxo completo do cliente

```
Landing → Form 5 etapas → /sucesso (3s) → /ativacao
                                              ↓
                                     QR Code + copia-cola
                                              ↓
                                      Cliente paga PIX
                                              ↓
                          Webhook ImperiumPay → /api/webhook/imperium
                                              ↓
                                    Atualiza saldo +R$ 45
                                              ↓
                                Front detecta via polling → /painel
                                              ↓
                                    "Conta global ativa ✓"
                                  Saldo BRL: R$ 45,00
```

## 🧪 Testando localmente vs produção

**Em produção (recomendado):**
- Webhook chega direto no Vercel
- Saldo atualiza automático em ~1 segundo

**Em desenvolvimento local:**
- Webhook não chega no localhost (Imperium não consegue acessar `localhost:3000`)
- **Fallback:** o polling `/api/pix/status` consulta o gateway diretamente a cada 4s e atualiza o saldo se status=PAGO. Funciona sem webhook.

## 🔐 Sobre as chaves de teste

As chaves que você passou:
- `pk_e9a15acbdb4d57a00dc0d35198c2bdfc` (pública)
- `sk_b76ad05f0c060b7682507575f5947ed8d349850e0b5a72c959f768613eee9468` (privada)

São **chaves de teste com expiração curta** (algumas horas). Pra demo de venda funcionar com PIX real, gera novas no painel do Imperium pouco antes da apresentação.

## 📂 Arquivos novos da v3

```
app/
├── ativacao/page.tsx           ← QR Code + polling
├── api/
│   ├── pix/
│   │   ├── gerar/route.ts      ← POST cria PIX no Imperium
│   │   └── status/route.ts     ← GET consulta status (polling)
│   └── webhook/
│       └── imperium/route.ts   ← POST recebe confirmação
lib/
└── imperium.ts                  ← Cliente da API + HMAC
supabase-migration-v3.sql        ← Adiciona campos pix_*
```

## ⚠️ Notas éticas pra apresentação

Quando apresentar pro cliente, deixa claro:

1. **"Depósito inicial" é a fraseologia legal correta** — não diga "taxa de ativação" porque isso é prática barrada pelo BC.
2. **R$ 45 vira saldo do cliente desde o segundo 1** — o dinheiro é dele, não do banco. Disponível pra sacar em até 48h.
3. **Pra produção real:** precisa de licença de IP/SCD do BC ou parceria BaaS. Imperium é gateway PIX, não conta corrente — pra abrir conta de verdade, precisa de outra licença.

## 🐛 Troubleshooting

**"PIX não aparece após cadastro"**
- Confere env vars do Vercel
- Olha os logs em Vercel → Logs → Runtime

**"Webhook não chega"**
- Confirma URL no painel Imperium: `https://SEU-DOMINIO.vercel.app/api/webhook/imperium`
- Faz GET pra `/api/webhook/imperium` no browser pra ver se a rota existe

**"Saldo não atualiza após PIX pago"**
- Polling deveria pegar em até 4s mesmo sem webhook
- Confere logs em Vercel pra ver se `/api/pix/status` está dando erro
