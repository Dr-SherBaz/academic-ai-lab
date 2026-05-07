# Cloudflare Dashboard Setup Guide

Steps to complete in the Cloudflare Dashboard to activate D1, R2, and WhatsApp integration.

---

## 1. Build Command

In your Cloudflare Pages project (`academic-ai-lab`) settings:

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Build output directory | `.` (root — no subdirectory) |
| Node.js version | 18 or later |

## 2. D1 Database

```bash
# Authenticate (one-time)
npx wrangler login

# Create the database
npx wrangler d1 create aal-d1
```

After creation, copy the `database_id` output and paste it into `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "aal-d1"
database_id = "<id-from-output>"
```

**In Cloudflare Dashboard** → your Pages project → **Settings** → **Functions** → **D1 database bindings**:

| Binding name | Database |
|-------------|----------|
| `DB` | `aal-d1` |

### Run Migrations

```bash
npx wrangler d1 migrations apply aal-d1 --local   # test locally
npx wrangler d1 migrations apply aal-d1 --remote  # apply to production
```

## 3. R2 Bucket

```bash
npx wrangler r2 bucket create aal-private-storage
```

**In Cloudflare Dashboard** → your Pages project → **Settings** → **Functions** → **R2 bucket bindings**:

| Binding name | Bucket |
|-------------|--------|
| `R2` | `aal-private-storage` |

## 4. Environment Variables

**In Cloudflare Dashboard** → your Pages project → **Settings** → **Environment variables**:

| Variable | Value |
|----------|-------|
| `WHATSAPP_ACCESS_TOKEN` | Your WhatsApp Business API permanent access token |
| `WHATSAPP_PHONE_NUMBER_ID` | Phone number ID from WhatsApp Business Account |
| `WHATSAPP_VERIFY_TOKEN` | A random string you choose for webhook verification |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | Your WABA ID |

### WhatsApp Webhook Setup

1. Go to the [Facebook App Dashboard](https://developers.facebook.com/apps)
2. Select your app → **WhatsApp** → **Configuration**
3. Set the webhook callback URL to: `https://academicailab.com/api/whatsapp-webhook`
4. Set the verify token to match `WHATSAPP_VERIFY_TOKEN`
5. Subscribe to: `messages`, `message_deliveries`, `message_reads`

## 5. Admin Dashboard Access

The admin dashboard is at `/admin/dashboard.html`. It calls `/api/admin/*` endpoints which require D1.

For production, add basic access control:
- Option A: Cloudflare Access (zero-trust) — recommended
- Option B: Deploy behind a separate subdomain
- Option C: Add a simple password check in the admin middleware

## 6. Deploy Triggers

Push to `main` branch → Cloudflare Pages auto-deploys.
No manual steps needed after initial configuration.
