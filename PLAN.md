# JanMitra 2.0 — Complete Completion Plan

> **Purpose:** This document tracks everything remaining to ship a production-ready platform.
> Legend: ✅ Done | 🔶 Partial / MVP stub | ❌ Not started

---

## Current State Summary

| Layer | Status | Notes |
|---|---|---|
| UI / Design System | ✅ | Globals, tokens, glassmorphism, dark/light |
| Auth (Email, Phone OTP) | ✅ | Firebase Auth + session cookie |
| Auth (Google OAuth) | 🔶 | Works; COOP warning in dev (cosmetic) |
| Complaint Submit (Manus AI) | ✅ | Groq extraction + form |
| Citizen Dashboard | ✅ | Live Firestore query, SLA countdowns |
| Officer Queue | ✅ | Real-time Firestore, SLA sort |
| Dept Admin Dashboard | ✅ | Analytics, escalations |
| System Admin | 🔶 | Dept CRUD UI only; no write ops wired |
| Public Transparency | ✅ | Live API stats, heatmap, leaderboard |
| Responsibility Trace (Events) | ✅ | Timeline + FailureReplay component |
| PWA | ✅ | Icons fixed, manifest, offline shell |
| Firebase Admin SDK backend | ✅ | `firebase-admin.ts` + `auth-middleware.ts` |
| Real database writes (API) | ✅ | All routes use Admin SDK batch writes |
| Email notifications | ✅ | Resend integrated, 7 event types triggered |
| Push notifications | ❌ | Not started (needs VAPID key) |
| File/Evidence storage | ✅ | integrated in submit & resolution flow |
| Testing | ✅ | Vitest 64 tests, Playwright E2E specs |
| Push notifications | ✅ | FCM SW + hook + profile toggle (needs VAPID key) |
| Security (Firestore) | ✅ | Own/Admin rules for all collections |
| Design Refinement | ✅ | Premium floating navbar redesign |
| Deployment Docs | ✅ | docs/DEPLOYMENT.md |

---

## ✅ Phase A — Auth & Security Hardening (COMPLETE)

### ✅ A1. Firebase Admin SDK Setup
- `firebase-admin` installed
- `src/lib/firebase-admin.ts` created with graceful fallback
- `FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY` added to `.env.local` and Vercel

### ✅ A2. Secure Session Validation
- `src/lib/auth-middleware.ts` — `validateSession()` + `requireRole()` helpers
- `POST /api/auth/session` now issues real Firebase session cookies; `DELETE` revokes tokens
- All protected routes use `validateSession()`

### ✅ A3. Role Enforcement via Custom Claims
- `src/app/api/admin/set-role/route.ts` — system_admin-only endpoint
- Demo role switcher gated to `NODE_ENV === 'development'` only
- `grievances/route.ts` uses `validateSession()` instead of raw cookie check

### ✅ A4. Google OAuth — Production Domains
- `jan-mitra-web.vercel.app` added to Firebase Auth Authorized Domains
- Vercel URL added to Google Cloud Console OAuth Authorized redirect URIs

---

## ✅ Phase B — Backend API (COMPLETE)

### ✅ B1. Core Grievance API
- Real Firestore batch writes (grievance + GRIEVANCE_SUBMITTED event + dept stats)
- Auto-routing by category → departmentId
- GET with paginated Firestore query, role-based access control

### ✅ B2. Grievance Events API
- `src/app/api/grievances/[id]/events/route.ts`
- GET: ordered event list with access control
- POST: append-only using `.create()`, role-based event type restrictions

### ✅ B3. Grievance Status Update API
- `src/app/api/grievances/[id]/route.ts`
- PATCH: atomic status update + event append, SLA recalculation on escalation
- GET: single grievance fetch with access control

### ✅ B4. Department API
- `src/app/api/departments/route.ts` — public GET, system_admin POST
- `src/app/api/departments/[id]/route.ts` — system_admin PATCH + DELETE

### ✅ B5. Public Transparency API
- `src/app/api/public/stats/route.ts`
- ISR with 5-minute cache
- Uses Firestore `count()` aggregation + ward heatmap grouping

### ✅ B6. Support Signal API
- `src/app/api/grievances/[id]/support/route.ts`
- Composite key prevents duplicates; atomically increments counter
- POST (add) + DELETE (undo)

### ✅ B7. Manus AI Route
- Auth guard added — only authenticated users can call Groq API

### ✅ B8. SLA Scheduler (Cron)
- `src/app/api/cron/sla-check/route.ts` — batch SLA breach detection
- `vercel.json` — runs every hour (`0 * * * *`)
- Protected by `CRON_SECRET` header

---

## Phase C — Firestore Database

### C1. Data Structure (Collections)
```
users/{uid}
  - id, firebaseUid, role, name, email, phone, departmentId, createdAt

departments/{deptId}
  - id, name, slug, description, slaHoursDefault, governanceHealth, createdAt

grievances/{grievanceId}
  - All fields from the Grievance type
  - officerId (indexed), citizenId (indexed), departmentId (indexed), status (indexed)

grievanceEvents/{eventId}
  - grievanceId, eventType, actorId, actorRole, payload, createdAt

supportSignals/{signalId}
  - grievanceId, citizenId, createdAt

delayExplanations/{explanationId}
  - grievanceId, officerId, reason, details, estimatedResolutionDate, submittedAt

citizenFeedback/{feedbackId}
  - grievanceId, citizenId, wasResolved, solutionMatched, proofSufficient, submittedAt

departmentStats/{deptId}
  - Computed aggregates (totalComplaints, resolvedOnTime, etc.)
  - Updated by server-side cron or Cloud Function
```

### C2. Firestore Security Rules
- **File:** `firestore.rules`
- `users`: read own doc, write only via Admin SDK (not client)
- `grievances`: citizen can read own; officer/dept_admin can read all in their dept; public can read `privacyLevel === "public"` fields only
- `grievanceEvents`: append-only; no updates, no deletes
- `supportSignals`: one per `(grievanceId, citizenId)` pair
- `departments`: public read; system_admin write only

### ✅ C3. Firestore Indexes (firestore.indexes.json)
- **Status:** ✅ Deployed
- Compound indexes for `citizenId`, `departmentId`, `status`, `slaStatus`, and `privacyLevel`

### ✅ C4. Seed Data Script
- **File:** `scripts/seed-firestore.ts`
- Populate: 5 departments, 3 demo users (citizen/officer/dept_admin), 10 grievances, events, stats

---

## Phase D — Frontend Integrations

### ✅ D1. Evidence Upload Flow
- Integrate `uploadFile` into the submit form (`/submit/page.tsx`)
- Show image previews with delete option before submission
- Store Firebase Storage URLs in `grievance.evidenceUrls[]`
- Integration in resolution proof (Officer)

### ✅ D2. Officer Complaint Detail Improvements
**File:** `src/app/officer/complaints/[id]/page.tsx`
- Add "Provide Update" modal → writes `UPDATE_PROVIDED` event
- Add "Upload Proof" button → uploads file + writes `PROOF_UPLOADED` event
- Add "Submit Delay Explanation" form → dropdown of `DelayReason` + detail text
- Add "Escalate" button with confirmation + written to event log
- Triggers email notifications via `/api/notify`

### ✅ D3. Citizen Complaint Detail
**File:** `src/app/(citizen)/complaints/[id]/page.tsx`
- Renders event timeline
- If closed: show `CitizenFeedback` form (Resolved? Rating? Comments?)
- "Reopen" button if `reopenCount < 2` within 7 days

### ✅ D4. Citizen Dashboard
**File:** `src/app/(citizen)/dashboard/page.tsx`
- Real-time `onSnapshot` query for user's complaints
- Stats cards wired (Active, Breached, Resolved)
- SLA countdown progress bars

### ✅ D5. Profile Page
**File:** `src/app/(citizen)/profile/page.tsx`
- Wire "Save" button for display names
- "Delete Account" flow with confirmation
- Show complaint stats (opened, closed, avg resolution time)

### D6. System Admin — Department CRUD
**File:** `src/app/admin/system/departments/page.tsx`
- Wire "Add Department" modal to `POST /api/departments`
- Wire "Edit" and "Delete" to `PATCH` and `DELETE` endpoints

### ✅ D7. Transparency Dashboard
**File:** `src/app/(public)/transparency/page.tsx`
- Upgrade leaderboard to real Firestore aggregated data from `departmentStats`
- Wired KPI cards to live data

### ✅ D8. Landing Page Stats
**File:** `src/app/page.tsx`
- Counters wired to live data from `GET /api/public/stats`
- Converted to async Server Component with 5-min revalidation

---

## Phase E — Notifications

### ✅ E1. Email Notifications (Resend)
- **Status:** ✅ Complete
- `/api/notify` endpoint created with rich HTML templates
- Triggers on: Submission, Routing, Status Update, Escalation, Resolution, Delay Explanation, Proof Upload
- Graceful fallback if API key missing

### ✅ E2. Web Push Notifications
- **Status:** ✅ Complete (client side) — requires `NEXT_PUBLIC_FIREBASE_VAPID_KEY` to send
- `public/firebase-messaging-sw.js` — FCM background push handler with `notificationclick` router
- `src/hooks/usePushNotifications.ts` — registers SW, requests permission, acquires FCM token, saves to `users/{uid}.fcmToken`
- Push Notifications toggle card added to `/profile` page

---

## Phase F — Testing

### ✅ F1. Unit Tests
- **Status:** ✅ Complete
- **Tool:** Vitest + Testing Library + happy-dom
- Tests for `authHelpers.ts`, `SLACountdown`, and `notify` endpoint validation
- All 28 tests passing

### ✅ F2. API Route Tests
- **Status:** ✅ Complete
- Tests for `POST /api/grievances` — validation, category routing (22 categories), ID format, role auth
- Tests for `GET+POST /api/grievances/[id]/events` — role-based event type restrictions (9 assertions)
- Tests for `POST /api/manus/extract` — input validation + output shape validation (all 12 categories)
- **Total:** 64 tests across 6 test files, all passing

### ✅ F3. E2E Tests
- **Status:** ✅ Complete
- **Tool:** Playwright (Chromium)
- `e2e/transparency.spec.ts` — 8 smoke tests (headline, KPI strip, map, CTA, no-500)
- `e2e/citizen-flow.spec.ts` — 7 tests (login page, route protection for /dashboard and /submit)
- `e2e/officer-flow.spec.ts` — 9 tests (all protected routes redirect, public pages serve 200)

---

## Phase G — Performance & Polish

### ✅ G1. Next.js Optimizations
- Enable ISR on the transparency page: `revalidate = 300` (5 minutes)

### ✅ G2. Firestore Read Optimization
- **Status:** ✅ Complete
- `admin/dept/analytics/page.tsx` — switched from `onSnapshot` to `getDocs` + manual **Refresh** button
- Citizen complaints page keeps `onSnapshot` (scoped to user's own docs, no large reads)
- Transparency page keeps `onSnapshot` (public live feed, appropriate)

### ✅ G3. Error Boundaries
- **Status:** ✅ Complete
- `src/app/error.tsx` (Per-route boundary)
- `src/app/global-error.tsx` (Root boundary)

### ✅ G4. Accessibility
- **Status:** ✅ Complete
- Added `aria-label` to all icon-only buttons (Bell, Share, Star ratings)
- Improved semantic HTML across main landing and dashboard pages
- Tab-navigation focus indicators refined

---

## Phase H — Production Deployment

### H1. Environment Variables (Vercel)
Set all of the following in Vercel Project Settings → Environment Variables:
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY   # JSON.stringify of service account
GROQ_API_KEY
RESEND_API_KEY                       # when email is implemented
UPSTASH_REDIS_REST_URL               # when rate limiting is implemented
UPSTASH_REDIS_REST_TOKEN
```

### H2. Vercel Cron
Add to `vercel.json`:
```json
{
  "crons": [
    { "path": "/api/cron/sla-check", "schedule": "0 * * * *" }
  ]
}
```

### ✅ H1. Environment Variables Audit
- **Status:** ✅ Complete
- Full checklist documented in `docs/DEPLOYMENT.md`
- Added `NEXT_PUBLIC_FIREBASE_VAPID_KEY` to `.env.local.example`

### ✅ H3. Custom Domain Setup Guide
- **Status:** ✅ Complete
- Step-by-step instructions in `docs/DEPLOYMENT.md` (Vercel DNS + Firebase Auth domain + metadataBase)

### ✅ H5. Monitoring (Sentry)
- **Status:** ✅ Documented
- Full setup instructions in `docs/DEPLOYMENT.md` (install, wizard, DSN, source maps)

---

## Priority Order for Next Sprint

| # | Task | Impact | Effort |
|---|---|---|---|
| 1 | ~~Auth & Security (A1–A4)~~ | ✅ Done | - |
| 2 | ~~Backend API (B1–B8)~~ | ✅ Done | - |
| 3 | ~~Citizen Dashboard (D4)~~ | ✅ Done | - |
| 4 | ~~Email Notifications (E1)~~ | ✅ Done | - |
| 5 | ~~Officer detail actions (D2)~~ | ✅ Done | - |
| 6 | ~~Transparency / Landing (D7, D8)~~ | ✅ Done | - |
| 7 | ~~Profile Stats / Delete (D5)~~ | ✅ Done | - |
| 8 | ~~Seed Script / Indexes (C3, C4)~~ | ✅ Done | - |
| 9 | Push notifications (E2) | 🟡 Medium | Medium |
| 10 | Testing (Phase F) | � Medium | High |
