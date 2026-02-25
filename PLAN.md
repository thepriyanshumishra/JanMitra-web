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
| Testing | ❌ | Zero tests written |

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

### E2. Web Push Notifications
- Register a Service Worker in `public/sw.js` for push messages
- Use Firebase Cloud Messaging (FCM) to send notifications
- Add a "Notification preferences" card on the profile page
- Store FCM token in `users/{uid}.fcmToken`

---

## Phase F — Testing

### F1. Unit Tests
- **Tool:** Vitest + Testing Library
- Test `authHelpers.ts` functions (mock Firebase)
- Test `SLACountdown` component renders correct status
- Test `EventTimeline` renders SUBMITTED → CLOSED chain correctly

### F2. API Route Tests
- Test `POST /api/grievances` — valid and missing field cases
- Test `GET /api/grievances/[id]/events`
- Test `POST /api/manus/extract` error handling

### F3. E2E Tests
- **Tool:** Playwright
- Scenario 1: Signup → submit complaint → view on dashboard
- Scenario 2: Switch to officer → acknowledge and close a complaint
- Scenario 3: Public user → visit transparency page → see heatmap

---

## Phase G — Performance & Polish

### ✅ G1. Next.js Optimizations
- Enable ISR on the transparency page: `revalidate = 300` (5 minutes)

### G2. Firestore Read Optimization
- Replace `onSnapshot` on large collections with paginated `getDocs` where real-time is not needed
- Use Firestore `count()` aggregation for stats instead of full document reads

### ✅ G3. Error Boundaries
- **Status:** ✅ Complete
- `src/app/error.tsx` (Per-route boundary)
- `src/app/global-error.tsx` (Root boundary)

### G4. Accessibility
- Add `aria-label` to all icon-only buttons
- Ensure focus ring is visible on all interactive elements
- Test with keyboard-only navigation

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

### H3. Custom Domain
- Add `janmitra.in` in Vercel → Domains
- Add to Firebase Auth Authorized Domains
- Update `metadataBase` in `layout.tsx`

### ✅ H4. Firebase Storage Rules
- **Status:** ✅ Rules written/committed
- **File:** `storage.rules`
- **Note:** Missing manual project setup in Firebase Console to deploy (Get Started click needed)
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /evidence/{grievanceId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.resource.size < 10 * 1024 * 1024;
    }
  }
}
```

### H5. Monitoring
- Enable Vercel Analytics (already imported in codebase)
- Enable Firebase Performance Monitoring
- Set up Sentry for error tracking: `SENTRY_DSN` env var + `sentry.client.config.ts`

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
