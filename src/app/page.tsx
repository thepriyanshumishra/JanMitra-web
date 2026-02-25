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

const mockActivities = [
  { id: 1, type: "RESOLVED", location: "Ward 14", category: "Electricity", time: "2 mins ago", user: "Inspector Kumar" },
  { id: 2, type: "ROUTED", location: "Sector 5", category: "Water Supply", time: "15 mins ago", user: "System" },
  { id: 3, type: "ESCALATED", location: "Ward 6", category: "Sanitation", time: "1 hour ago", user: "SLA Monitor" },
  { id: 4, type: "REOPENED", location: "Metro Colony", category: "Roads", time: "3 hours ago", user: "Citizen Review" },
];

const faqs = [
  {
    q: "Is my identity truly protected?",
    a: "Yes. By default, all complaints are 'Restricted'. Your personal details are never visible on the public dashboard."
  },
  {
    q: "What is the Citizen Trust Index?",
    a: "It's a measurement of department honesty. If an officer claims 'Resolved' but you reopen it because the work isn't done, the index falls."
  },
  {
    q: "How does Manus AI help?",
    a: "Manus uses Gemini to turn your voice or casual text into a formal complaint, so you don't need to know the technical categories."
  },
];

// ─── Components ───────────────────────────────────────────────────
function TracePreview() {
  return (
    <div className="glass rounded-2xl p-6 space-y-3 w-full max-w-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--civic-amber)]/5 blur-2xl pointer-events-none group-hover:bg-[var(--civic-amber)]/10 transition-all duration-700" />
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-[var(--accountability-red)] pulse-red" />
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          Live Responsibility Trace
        </span>
      </div>
      <div className="text-sm font-medium text-foreground/80 mb-2 pb-2 border-b border-white/5">
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
      <div className="mt-4 pt-3 border-t border-white/5">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>SLA Used</span>
          <span className="text-[var(--accountability-red)] font-semibold">142%</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-[var(--accountability-red)] rounded-full transition-all" style={{ width: "100%" }} />
        </div>
      </div>
    </div>
  );
}

function ActivityFeed() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recent Activity</h3>
        <div className="text-[10px] text-[var(--trust-green)] flex items-center gap-1 font-bold">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--trust-green)] animate-pulse" />
          LIVE
        </div>
      </div>
      <div className="space-y-2">
        {mockActivities.map((item) => (
          <div key={item.id} className="glass py-3 px-4 rounded-xl flex items-center justify-between hover:bg-white/5 transition-colors border border-white/5">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-1.5 rounded uppercase ${item.type === "RESOLVED" ? "bg-[var(--trust-green-muted)] text-[var(--trust-green)]" : "bg-white/5 text-muted-foreground"
                  }`}>
                  {item.type}
                </span>
                <span className="text-xs font-medium text-foreground">{item.category}</span>
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5">{item.location} · by {item.user}</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

import { AppNavbar } from "@/components/shared/AppNavbar";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-mesh text-foreground">
      <AppNavbar />

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

            {/* Right col — Trace Preview + Activity Feed */}
            <div className="flex flex-col gap-8 justify-center lg:justify-end py-10">
              <TracePreview />
              <ActivityFeed />
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
          <div className="glass rounded-3xl p-10 md:p-14 relative overflow-hidden bg-gradient-to-br from-white/3 to-transparent">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--civic-amber)]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="relative grid lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                <h2 className="text-4xl font-display font-bold tracking-tight">
                  A platform for{" "}
                  <span className="text-gradient-civic">everyone</span> in governance
                </h2>
                <p className="text-muted-foreground leading-relaxed text-base max-w-lg">
                  Citizens track. Officers act. Department admins see patterns. System admins govern. Everyone plays their role in a transparent, accountable ecosystem.
                </p>
                <Link href="/signup">
                  <Button className="bg-[var(--civic-amber)] text-[var(--navy-deep)] font-bold hover:bg-[var(--civic-amber)]/90 h-11 px-8 glow-amber transition-all active:scale-95">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Users, label: "Citizens", desc: "Submit & Track", color: "text-[var(--civic-amber)]", bg: "bg-[var(--civic-amber-muted)]" },
                  { icon: Shield, label: "Officers", desc: "Acknowledge & Act", color: "text-[var(--trust-green)]", bg: "bg-[var(--trust-green-muted)]" },
                  { icon: BarChart3, label: "Dept Admins", desc: "Analyse & Improve", color: "text-blue-400", bg: "bg-blue-500/10" },
                  { icon: Eye, label: "System Admins", desc: "Monitor & Govern", color: "text-purple-400", bg: "bg-purple-500/10" },
                ].map((r) => (
                  <div key={r.label} className="glass rounded-2xl p-5 space-y-2 hover:translate-y-[-4px] transition-transform cursor-default">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${r.bg}`}>
                      <r.icon className={`w-5 h-5 ${r.color}`} />
                    </div>
                    <div>
                      <div className="text-sm font-bold">{r.label}</div>
                      <div className="text-[11px] text-muted-foreground">{r.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ & Accountability Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge className="bg-purple-500/10 text-purple-400 border-0 text-xs uppercase tracking-wider">FAQ</Badge>
              <h2 className="text-3xl font-display font-bold">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-6">
              {faqs.map((faq, i) => (
                <div key={i} className="space-y-2">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <span className="text-[var(--civic-amber)] font-mono opacity-50">Q{i + 1}.</span>
                    {faq.q}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed pl-8">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-3xl p-8 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-3xl rounded-full" />
            <div className="space-y-4">
              <h3 className="text-xl font-display font-bold">Governance Health Scorecard</h3>
              <p className="text-sm text-muted-foreground">Real-time metrics from the accountability engine.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Avg Response</span>
                <div className="text-2xl font-bold font-display text-[var(--trust-green)]">4.8h</div>
                <div className="h-1 bg-white/5 rounded-full mt-2">
                  <div className="h-full bg-[var(--trust-green)] w-[90%] rounded-full" />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">SLA Honesty</span>
                <div className="text-2xl font-bold font-display text-[var(--civic-amber)]">94.2%</div>
                <div className="h-1 bg-white/5 rounded-full mt-2">
                  <div className="h-full bg-[var(--civic-amber)] w-[94%] rounded-full" />
                </div>
              </div>
            </div>

            <div className="p-4 bg-[var(--accountability-red-muted)] rounded-2xl flex items-start gap-4">
              <Shield className="w-5 h-5 text-[var(--accountability-red)] mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-[var(--accountability-red)]">Unresolved Pressure</h4>
                <p className="text-xs text-[var(--accountability-red)] opacity-80 mt-1">
                  Ward 12 is currently showing critical delay patterns in Road Maintenance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Engagement CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-display font-bold">Join 50,000+ citizens<br /><span className="text-gradient-civic">building institutional trust</span></h2>
          <div className="flex items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-black hover:bg-white/90 font-bold px-8 active:scale-95 transition-all">Create Free Account</Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="ghost" className="hover:bg-white/5 font-bold">Read the Manifesto</Button>
            </Link>
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
