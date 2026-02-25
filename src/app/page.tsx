import Link from "next/link";
import { Shield, ArrowRight, Eye, BarChart3, GitBranch, Users, ChevronRight, Zap, Lock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ─── Static data ──────────────────────────────────────────────────
const stats = [
  { label: "Complaints Traced", value: "1.2M+", note: "end-to-end visibility" },
  { label: "Dept SLAs Monitored", value: "340+", note: "across 18 cities" },
  { label: "Avg Resolution Speed", value: "3.2×", note: "faster than portals" },
  { label: "Citizen Trust Index", value: "87%", note: "positive resolution rate" },
];

const features = [
  {
    icon: GitBranch,
    color: "text-[var(--civic-amber)]",
    glowClass: "glow-amber",
    title: "Responsibility Trace Engine",
    description:
      "Every complaint generates an immutable event trail. See exactly where time was spent, who held it, and when SLAs were breached — in real time.",
    badge: "Core Innovation",
    badgeColor: "bg-[var(--civic-amber-muted)] text-[var(--civic-amber)]",
  },
  {
    icon: Eye,
    color: "text-[var(--trust-green)]",
    glowClass: "glow-green",
    title: "Public Transparency Dashboard",
    description:
      "Area heatmaps, pattern alerts, and department performance pages. Institutional behavior is no longer invisible.",
    badge: "Public Access",
    badgeColor: "bg-[var(--trust-green-muted)] text-[var(--trust-green)]",
  },
  {
    icon: Zap,
    color: "text-purple-400",
    glowClass: "",
    title: "AI Assistant — Manus",
    description:
      "Describe your problem in natural language. Manus extracts the details, shows you a summary, and fills the form. You stay in control.",
    badge: "Powered by Gemini",
    badgeColor: "bg-purple-500/10 text-purple-400",
  },
  {
    icon: BarChart3,
    color: "text-blue-400",
    glowClass: "",
    title: "Governance Health Indicator",
    description:
      "A real-time composite score — Stable, Under Strain, or Critical — built from SLA compliance, escalation rates, and citizen feedback.",
    badge: "City-Level Analytics",
    badgeColor: "bg-blue-500/10 text-blue-400",
  },
  {
    icon: Lock,
    color: "text-[var(--accountability-red)]",
    glowClass: "glow-red",
    title: "Privacy by Design",
    description:
      "Three complaint visibility levels. Public, Restricted, or Fully Private. Your identity is always protected regardless of mode.",
    badge: "Citizen-Safe",
    badgeColor: "bg-[var(--accountability-red-muted)] text-[var(--accountability-red)]",
  },
  {
    icon: Globe,
    color: "text-cyan-400",
    glowClass: "",
    title: "Controlled Delegation",
    description:
      "File complaints for parents, elderly relatives, or non-digital citizens. Real-world inclusion built into the platform.",
    badge: "Inclusive",
    badgeColor: "bg-cyan-500/10 text-cyan-400",
  },
];

const traceSteps = [
  { label: "Submitted", time: "0h", status: "done", color: "bg-[var(--trust-green)]" },
  { label: "Routed", time: "2h", status: "done", color: "bg-[var(--trust-green)]" },
  { label: "Assigned", time: "6h", status: "done", color: "bg-[var(--trust-green)]" },
  { label: "Acknowledged", time: "28h", status: "at-risk", color: "bg-[var(--warning-yellow)]" },
  { label: "Escalated", time: "72h", status: "breached", color: "bg-[var(--accountability-red)]" },
  { label: "Resolved", time: "—", status: "pending", color: "bg-white/20" },
];

// ─── Components ───────────────────────────────────────────────────
function TracePreview() {
  return (
    <div className="glass rounded-2xl p-6 space-y-3 w-full max-w-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-[var(--accountability-red)] pulse-red" />
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          Live Responsibility Trace
        </span>
      </div>
      <div className="text-sm font-medium text-foreground/80 mb-2 pb-2 border-b border-border">
        #JM-2024-004821 &nbsp;·&nbsp; Water Supply, Ward 12
      </div>
      {traceSteps.map((step, i) => (
        <div key={step.label} className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full shrink-0 ${step.color} ${step.status === "breached" ? "pulse-red" : ""}`} />
          <div className="flex-1 flex justify-between items-center">
            <span className={`text-sm ${step.status === "pending" ? "text-muted-foreground" : "text-foreground"}`}>
              {step.label}
            </span>
            <span className="text-xs tabular-nums text-muted-foreground">{step.time}</span>
          </div>
          {step.status === "breached" && (
            <span className="sla-breached text-[10px] px-1.5 py-0.5 rounded-full font-semibold">SLA ✕</span>
          )}
          {step.status === "at-risk" && (
            <span className="sla-at-risk text-[10px] px-1.5 py-0.5 rounded-full font-semibold">At Risk</span>
          )}
        </div>
      ))}
      <div className="mt-4 pt-3 border-t border-border">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>SLA Used</span>
          <span className="text-[var(--accountability-red)] font-semibold">142%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-[var(--accountability-red)] rounded-full transition-all" style={{ width: "100%" }} />
        </div>
      </div>
    </div>
  );
}

import { ThemeToggle } from "@/components/shared/ThemeToggle";

// ... stats / features / traceSteps ...

// ... TracePreview ...

// ─── Page ─────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div className="min-h-screen bg-mesh text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-[var(--glass-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--civic-amber)] flex items-center justify-center glow-amber">
              <Shield className="w-4 h-4 text-[var(--navy-deep)]" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">JanMitra</span>
            <Badge variant="outline" className="text-[10px] border-[var(--civic-amber)]/30 text-[var(--civic-amber)] ml-1">
              Beta
            </Badge>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <Link href="/transparency" className="hover:text-foreground transition-colors">Transparency</Link>
            <Link href="/departments" className="hover:text-foreground transition-colors">Departments</Link>
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Sign In
              </Button>
            </Link>
            <Link href="/submit">
              <Button size="sm" className="bg-[var(--civic-amber)] text-[var(--navy-deep)] hover:bg-[var(--civic-amber)]/90 font-semibold glow-amber">
                File a Complaint
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* background orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[var(--civic-amber)]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-[var(--trust-green)]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left col */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--trust-green)] pulse-green" />
                Accountability Infrastructure for Indian Governance
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold leading-[1.05] tracking-tight">
                <span className="text-foreground">Making</span>{" "}
                <span className="text-gradient-civic">institutional</span>
                <br />
                <span className="text-foreground">failure</span>{" "}
                <span className="text-foreground">visible.</span>
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                JanMitra doesn&apos;t just track complaints. It tracks the{" "}
                <span className="text-foreground font-medium">flow of responsibility</span>{" "}
                inside institutions — converting every delay into accountable, permanent evidence.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/submit">
                  <Button
                    size="lg"
                    className="bg-[var(--civic-amber)] text-[var(--navy-deep)] hover:bg-[var(--civic-amber)]/90 font-bold text-base px-8 glow-amber group"
                  >
                    File a Complaint
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/transparency">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-base px-8 border-white/10 hover:bg-white/5"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Transparency Dashboard
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 text-xs text-muted-foreground pt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--trust-green)]" />
                  No login to view public data
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--trust-green)]" />
                  Identity protected by default
                </div>
              </div>
            </div>

            {/* Right col — Trace Preview */}
            <div className="flex justify-center lg:justify-end">
              <TracePreview />
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-border bg-card/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center space-y-1">
                <div className="text-3xl font-display font-bold text-gradient-amber">{s.value}</div>
                <div className="text-sm font-medium text-foreground">{s.label}</div>
                <div className="text-xs text-muted-foreground">{s.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <Badge className="bg-[var(--civic-amber-muted)] text-[var(--civic-amber)] border-0 text-xs uppercase tracking-wider">
              Platform Capabilities
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-display font-bold tracking-tight">
              Built for accountability,<br />
              <span className="text-gradient-civic">not just compliance</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every feature serves a single goal: making institutional behavior measurable, comparable, and impossible to hide.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="glass rounded-2xl p-6 hover:bg-white/[0.06] transition-all duration-300 group cursor-default"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2.5 rounded-xl bg-white/5 ${f.color}`}>
                    <f.icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${f.badgeColor}`}>
                    {f.badge}
                  </span>
                </div>
                <h3 className="text-base font-display font-semibold mb-2 text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Learn more</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-card/20">
        <div className="max-w-4xl mx-auto text-center space-y-4 mb-16">
          <Badge className="bg-[var(--trust-green-muted)] text-[var(--trust-green)] border-0 text-xs uppercase tracking-wider">
            For Citizens
          </Badge>
          <h2 className="text-4xl font-display font-bold tracking-tight">
            Three steps to accountability
          </h2>
        </div>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Submit",
              desc: "Use the standard form or chat with Manus. Set your privacy level. Stay anonymous if you prefer.",
              icon: "📝",
            },
            {
              step: "02",
              title: "Trace",
              desc: "Watch every stage of your complaint's journey. See exactly where it is, who holds it, and if SLAs are being respected.",
              icon: "🔎",
            },
            {
              step: "03",
              title: "Hold Accountable",
              desc: "If it's closed unfairly, reopen it. Leave structured feedback. Your response builds the Citizen Trust Index.",
              icon: "⚖️",
            },
          ].map((item) => (
            <div key={item.step} className="glass rounded-2xl p-7 text-center space-y-4 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="text-xs font-mono text-[var(--civic-amber)] glass px-3 py-1 rounded-full border border-[var(--civic-amber)]/20">
                  {item.step}
                </span>
              </div>
              <div className="text-4xl pt-2">{item.icon}</div>
              <h3 className="text-xl font-display font-bold">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="glass rounded-3xl p-10 md:p-14 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--civic-amber)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative grid md:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                <h2 className="text-4xl font-display font-bold tracking-tight">
                  A platform for{" "}
                  <span className="text-gradient-civic">everyone</span> in governance
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Citizens track. Officers act. Department admins see patterns. System admins govern. Everyone plays their role in a transparent ecosystem.
                </p>
                <Link href="/signup">
                  <Button className="bg-[var(--civic-amber)] text-[var(--navy-deep)] font-bold hover:bg-[var(--civic-amber)]/90 glow-amber">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Users, label: "Citizens", desc: "Submit & Track", color: "text-[var(--civic-amber)]" },
                  { icon: Shield, label: "Officers", desc: "Acknowledge & Act", color: "text-[var(--trust-green)]" },
                  { icon: BarChart3, label: "Dept Admins", desc: "Analyse & Improve", color: "text-blue-400" },
                  { icon: Eye, label: "System Admins", desc: "Monitor & Govern", color: "text-purple-400" },
                ].map((r) => (
                  <div key={r.label} className="bg-white/5 rounded-xl p-4 space-y-1">
                    <r.icon className={`w-5 h-5 ${r.color} mb-2`} />
                    <div className="text-sm font-semibold">{r.label}</div>
                    <div className="text-xs text-muted-foreground">{r.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[var(--civic-amber)] flex items-center justify-center">
              <Shield className="w-3 h-3 text-[var(--navy-deep)]" />
            </div>
            <span className="text-sm font-semibold">JanMitra</span>
            <span className="text-xs text-muted-foreground ml-2">— Making institutional failure visible since 2025</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/transparency" className="hover:text-foreground transition-colors">Public Dashboard</Link>
            <span>© 2025 JanMitra</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
