# Deploy Caudexia na Vercel (`caudexia.vercel.app`)

## 1. Banco Postgres

1. No [dashboard Vercel](https://vercel.com) → projeto **caudexia** → **Storage** → **Create Database** → **Postgres** (ou conecte [Neon](https://neon.tech)).
2. Copie `POSTGRES_URL` / `DATABASE_URL` para as variáveis do projeto.

O build roda `prisma migrate deploy` automaticamente.

## 2. Variáveis de ambiente (Settings → Environment Variables)

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `DATABASE_URL` | Sim | URL Postgres |
| `AUTH_SECRET` | Sim | `openssl rand -base64 32` |
| `AUTH_URL` | Sim | `https://caudexia.vercel.app` |
| `AUTH_GOOGLE_ID` | Sim* | OAuth Google |
| `AUTH_GOOGLE_SECRET` | Sim* | OAuth Google |
| `AUTH_APPLE_ID` | Não | Sign in with Apple |
| `AUTH_APPLE_SECRET` | Não | JWT gerado no Apple Developer |
| `BLOB_READ_WRITE_TOKEN` | Recomendado | Vercel Blob para fotos |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Recomendado | Web Push (`npx web-push generate-vapid-keys`) |
| `VAPID_PRIVATE_KEY` | Recomendado | Par da chave pública |
| `VAPID_SUBJECT` | Recomendado | `mailto:seu@email.com` |
| `CRON_SECRET` | Recomendado | Mesmo valor no Cron da Vercel (header `Authorization: Bearer …`) |

\* Pelo menos um provedor (Google ou Apple).

Após o deploy, abra o app no celular → **Ativar notificações** na home. No iPhone, use **Adicionar à Tela de Início** para push em segundo plano.

## 3. Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com/) → Credentials → OAuth client (Web).
2. **Authorized redirect URI:**  
   `https://caudexia.vercel.app/api/auth/callback/google`
3. Cole Client ID e Secret nas envs da Vercel.

## 4. Apple (opcional)

Requer conta Apple Developer. Crie Services ID, configure domínio `caudexia.vercel.app` e redirect  
`https://caudexia.vercel.app/api/auth/callback/apple`.  
Gere o client secret (JWT) e preencha `AUTH_APPLE_ID` / `AUTH_APPLE_SECRET`.

## 5. Blob (fotos)

Storage → Blob → crie store → copie `BLOB_READ_WRITE_TOKEN` para o projeto.

## 6. Domínio

Settings → Domains → confirme `caudexia.vercel.app` (ou adicione).

## 7. Deploy via GitHub

Importe `oliveiraigordev/caudex_app` na Vercel; cada push na `main` faz deploy.

## CLI (local)

```bash
npx vercel login
npx vercel link
npx vercel env pull .env.local
npx vercel --prod
```
