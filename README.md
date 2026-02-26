<div align="center">

# ⚖️ JanMitra 2.0

**Making institutional failure impossible to stay invisible.**

A civic-tech grievance resolution platform with end-to-end transparent SLA tracking, AI-assisted complaint filing, and a public accountability layer for municipal governance.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%7C%20Auth%20%7C%20Storage-orange?logo=firebase)](https://firebase.google.com)
[![PWA](https://img.shields.io/badge/PWA-Installable-green?logo=pwa)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/license-AGPL--3.0-blue?logo=gnu)](LICENSE)

</div>

---

## 🌟 What is JanMitra?

JanMitra (जनमित्र — "Friend of the People") is an **event-sourced, accountability-first** civic grievance platform. Every action on a complaint — routing, assignment, escalation, delays, closure — is an immutable event logged to a public audit trail.

Citizens file. Departments act. The system remembers. **Everything.**

---

## ✨ Feature Highlights

### For Citizens
- 🤖 **Manus AI Assistant** — Chat naturally about your problem, and Manus (powered by Groq `llama-3.3-70b-versatile`) extracts it into a structured complaint in one click
- 📋 **4-Step Submission Wizard** — Category, details, location, evidence upload
- 🔒 **Privacy Levels** — Public / Restricted / Fully Private
- 👨‍👩‍👧 **Controlled Delegation** — File on behalf of parents or elderly family members
- 📊 **Live Timeline** — See every action taken on your complaint in real time
- ⏱️ **SLA Countdown** — Watch the 7-day deadline tick, color-coded On Track → At Risk → Breached
- 🎬 **Failure Replay Mode** — Step through the lifecycle and see exactly where the SLA was breached
- 🔄 **Controlled Reopen** — Dispute a false closure (max 2 times, within 7 days)
- ⭐ **Resolution Feedback** — Rate the resolution quality to build the Citizen Trust Index
- 👍 **Public Support Signal** — Upvote public issues you're facing too

### For Officers
- 📥 **SLA-Sorted Queue** — Breached complaints always at the top
- ⚡ **Action Panel** — Acknowledge, Update Status, Explain Delay, Escalate, Mark Resolved
- 🔗 **Immutable Event Log** — Every action is timestamped and attributed

### For Administrators
- 📈 **Dept Admin Analytics** — Recharts-powered SLA Honesty, Volume Trends, Category Breakdown
- 🏛️ **System Admin CRUD** — Manage departments, SLA defaults, and officer assignments

### For Everyone (Public)
- 🗺️ **Live Civic Heatmap** — Interactive Leaflet map of public complaints, color-coded by SLA status
- 🏆 **Department Leaderboard** — Public ranking of departments by resolution speed and SLA honesty
- 🩺 **Governance Health Indicator** — Real-time Stable / Under Strain / Critical city-wide diagnostic
- 🔔 **AI Watchdog Alerts** — Pattern detection for systemic administrative failures

---

## 🏗️ Architecture

```
JanMitra 2.0
├── src/app/
│   ├── (auth)/          # Login, Signup, Forgot Password
│   ├── (citizen)/       # Dashboard, Complaint List, Submit, Detail View
│   ├── officer/         # Queue, Action Panel
│   ├── admin/
│   │   ├── dept/        # Department Admin Analytics
│   │   └── system/      # System Admin Department Management
│   ├── (public)/        # Transparency Dashboard (no auth)
│   └── api/             # Grievance API, Manus AI, Auth Session
├── src/components/
│   ├── grievance/       # EventTimeline, SLACountdown, FailureReplay
│   ├── transparency/    # ComplaintHeatmap (Leaflet)
│   └── shared/          # AppNavbar
└── src/features/
    ├── auth/            # AuthProvider, authHelpers
    └── manus/           # ManusDrawer (AI Assistant)
```

**Data Model**: Event-sourced. Every status change writes an immutable document to `grievances/{id}/events` — the source of truth for the timeline and SLA tracking.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + ShadCN UI |
| Database | Firebase Firestore (real-time) |
| Auth | Firebase Auth (Email, Google, Passwordless) |
| Storage | Firebase Storage (evidence uploads) |
| AI | Groq API (`llama-3.3-70b-versatile`) |
| Charts | Recharts |
| Maps | React-Leaflet |
| PWA | @ducanh2912/next-pwa |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v22+
- A Firebase project with Firestore, Authentication, and Storage enabled
- A Groq API key (for Manus AI)

### 1. Clone the repo
```bash
git clone https://github.com/your-org/janmitra-2.0.git
cd janmitra-2.0
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env.local
```

Fill in your Firebase and Groq credentials in `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

GROQ_API_KEY=
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for production
```bash
npm run build && npm run start
```

The PWA service worker (`sw.js`) is only enabled in production mode.

---

## 🎭 Demo Roles

A **Demo Role Switcher** is built into the Navbar user dropdown. Without touching the database, you can instantly switch between all four role views:

| Role | Default Home | Access |
|------|-------------|--------|
| 🧑 Citizen | `/dashboard` | Complaint filing, tracking, feedback |
| 👮 Officer | `/officer` | Complaint queue and action panel |
| 📊 Dept Admin | `/admin/dept/analytics` | Analytics dashboard |
| ⚙️ System Admin | `/admin/system/departments` | Department management |

---

## 🗺️ Roadmap

- [x] Phase 0 — Design System & Project Bootstrap
- [x] Phase 1 — Auth & User Identity
- [x] Phase 2 — Smart Complaint Submission (Manus AI)
- [x] Phase 3 — Responsibility Trace Engine
- [x] Phase 4 — Officer & Admin Dashboards
- [x] Phase 5 — Public Transparency Layer
- [x] Phase 6 — Engagement & Accountability Features
- [x] Phase 7 — PWA & Polish
- [ ] Phase 8 — Flutter Mobile App (Citizen & Officer)

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

### ⚖️ Why AGPL-3.0?
JanMitra is built on the principle of **accountability**. We believe that software meant to improve governance should itself be governed by rules that prevent "enclosed" or proprietary forks that hide their source code.

- **Copyleft**: If you modify this software and run it on a server for others to use, you **must** make your modified source code available to those users.
- **Attribution**: You must keep all original copyright notices and credits to the authors.
- **Freedom**: This ensures that JanMitra and all its future versions remain free and open for the public good.

For more details, see the [LICENSE](LICENSE) file.

---

<div align="center">

Built with ❤️ for civic accountability.

</div>
