# JanMitra — Production Deployment Guide

## H1 — Environment Variables Checklist

Set all of the following in **Vercel → Project Settings → Environment Variables** (all environments: Production, Preview, Development).

### Firebase Client (Public — safe to expose)
| Variable | Where to find |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Console → Project Settings → General → Your Apps |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Same location (`project-id.firebaseapp.com`) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Same location |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Same location (`project-id.appspot.com`) |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Same location |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Same location |

### Firebase Admin SDK (Secret)
| Variable | How to generate |
|---|---|
| `FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY` | Firebase Console → Project Settings → Service Accounts → Generate new private key → `JSON.stringify()` the file contents |

### External Services
| Variable | Where |
|---|---|
| `GROQ_API_KEY` | console.groq.com → API Keys |
| `RESEND_API_KEY` | resend.com → API Keys |
| `CRON_SECRET` | Generate any random 32-char string (`openssl rand -base64 32`) |

### Push Notifications (E2)
| Variable | Where |
|---|---|
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | Firebase Console → Project Settings → Cloud Messaging → Web Push certificates → Generate key pair |

---

## H3 — Custom Domain Setup (janmitra.in)

### Step 1: Add domain to Vercel
1. Vercel → Project → Settings → Domains
2. Add `janmitra.in` and `www.janmitra.in`
3. Copy the provided DNS records (A/CNAME)

### Step 2: Configure DNS at your registrar
Add the DNS records provided by Vercel to your domain registrar's DNS settings.
```
A      janmitra.in     → 76.76.21.21
CNAME  www.janmitra.in → cname.vercel-dns.com
```

### Step 3: Update Firebase Auth Authorized Domains
1. Firebase Console → Authentication → Settings → Authorized Domains
2. Add `janmitra.in` and `www.janmitra.in`

### Step 4: Update `layout.tsx` metadataBase
```tsx
// src/app/layout.tsx
metadataBase: new URL("https://janmitra.in"),
```

---

## H5 — Sentry Error Tracking

### Step 1: Create Sentry project
1. Go to [sentry.io](https://sentry.io) → New Project → Next.js
2. Copy your DSN from the project settings

### Step 2: Install
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

The wizard auto-generates:
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- Updates `next.config.ts`

### Step 3: Add environment variable
```bash
# .env.local and Vercel
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
SENTRY_AUTH_TOKEN=your-auth-token  # For source map uploads
```

### Step 4: Test it
```bash
npx sentry-cli releases new janmitra-v1.0.0
```

---

## Vercel Cron (already configured)
The SLA check cron runs hourly. Confirm in `vercel.json`:
```json
{
  "crons": [
    { "path": "/api/cron/sla-check", "schedule": "0 * * * *" }
  ]
}
```

---

## Checklist Before Go-Live

- [ ] All env vars set in Vercel
- [ ] VAPID key generated and added for push notifications
- [ ] `janmitra.in` domain configured in Vercel + Firebase Auth
- [ ] Sentry project created and DSN added
- [ ] Firebase Firestore rules deployed: `firebase deploy --only firestore:rules`
- [ ] Firebase Storage rules deployed: `firebase deploy --only storage`
- [ ] Firestore indexes deployed: `firebase deploy --only firestore:indexes`
- [ ] Seed data applied in production: `npx tsx scripts/seed-firestore.ts`
- [ ] Run `npm run build` once to check for compilation errors
