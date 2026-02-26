import Link from "next/link";
import {
    Shield, ArrowRight, Eye, BarChart3, GitBranch, Users,
    ChevronRight, Zap, Lock, Globe, AlertTriangle,
    TrendingUp, Layers, Target, Rocket, Heart, CheckCircle2,
    HelpCircle, MessageCircle, MapPin, Search, Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppNavbar } from "@/components/shared/AppNavbar";
import { Footer } from "@/components/shared/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "About JanMitra",
    description: "Learn about the mission, problem statement, and technical innovation behind JanMitra, the accountability infrastructure for Indian governance.",
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#020817] text-foreground selection:bg-[var(--civic-amber)] selection:text-[var(--navy-deep)]">
            <AppNavbar />

            {/* Hero Section - The Manifesto */}
            <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-white/5">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.08),transparent_50%)]" />
                <div className="max-w-7xl mx-auto relative">
                    <div className="max-w-3xl">
                        <Badge className="bg-[var(--civic-amber-muted)] text-[var(--civic-amber)] border-0 mb-6 py-1 px-4 text-xs font-bold tracking-widest uppercase">
                            The Manifesto
                        </Badge>
                        <h1 className="text-5xl sm:text-7xl font-display font-bold leading-[1.1] mb-8">
                            A New Social Contract for <span className="text-gradient-civic">Governance</span>.
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed mb-10">
                            JanMitra isn&apos;t just a portal; it&apos;s a protocol for accountability. We are building the infrastructure that transforms passive complaints into active, measurable institutional honesty.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Button size="lg" className="bg-[var(--civic-amber)] text-[var(--navy-deep)] font-bold px-8 glow-amber">
                                Our Vision
                            </Button>
                            <Button size="lg" variant="outline" className="border-white/10 hover:bg-white/5 px-8">
                                Watch Demo
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 1. Problem Statement */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-black/20">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-6">
                            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-4">
                                <AlertTriangle className="w-6 h-6 text-red-500" />
                            </div>
                            <h2 className="text-4xl font-display font-bold">The Problem Statement</h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Modern public grievance systems in India are essentially <span className="text-foreground font-semibold">"black holes."</span>
                                Once a complaint is submitted, it enters a void where citizens lose all visibility, and institutional inertia takes over.
                            </p>
                            <div className="space-y-4 pt-4">
                                {[
                                    "Complete loss of visibility after submission",
                                    "Lack of individual officer accountability",
                                    "Opacity in routing and escalation logic",
                                    "No permanent trace of institutional behavior"
                                ].map((item) => (
                                    <div key={item} className="flex items-center gap-3 text-sm text-foreground/80">
                                        <XCircle className="w-4 h-4 text-red-500/60" />
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="glass rounded-3xl p-8 border-red-500/10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <AlertTriangle className="w-32 h-32 text-red-500" />
                                </div>
                                <div className="relative space-y-6">
                                    <div className="text-3xl font-display font-bold text-red-500">"It's being processed."</div>
                                    <p className="text-muted-foreground italic leading-relaxed">
                                        This is the standard response given to millions of citizens. It hides delays, protects underperforming departments, and erodes trust in democracy itself.
                                    </p>
                                    <div className="pt-4 border-t border-white/5">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold text-muted-foreground uppercase">Current Success Rate</span>
                                            <span className="text-xs font-bold text-red-400">Low Trust</span>
                                        </div>
                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-red-500/40 w-[35%]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Why This Problem Matters */}
            <section className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                        <h2 className="text-4xl font-display font-bold">Why It Matters (Impact)</h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Inefficiency in grievance redressal isn&apos;t just an administrative lag—it&apos;s a barrier to national progress and social justice.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: TrendingUp,
                                title: "Economic Cost",
                                desc: "Billions in productivity are lost annually as citizens chase officials for basic infrastructure like water, electricity, or roads."
                            },
                            {
                                icon: Shield,
                                title: "Social Trust",
                                desc: "When systems fail, citizens feel abandoned. This leads to a disconnect between the state and its people, fostering cynicism."
                            },
                            {
                                icon: Heart,
                                title: "Human Dignity",
                                desc: "Basic services are a right, not a favor. Modern governance must treat every citizen with the respect of a prompt, transparent response."
                            }
                        ].map((card, i) => (
                            <div key={i} className="glass rounded-2xl p-8 hover:translate-y-[-4px] transition-all border-white/5 group">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 mb-6 group-hover:scale-110 transition-transform">
                                    <card.icon className="w-6 h-6 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-display font-bold mb-4">{card.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. Existing Solutions & Gaps */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-card/20 border-y border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="max-w-3xl mb-16">
                        <h2 className="text-4xl font-display font-bold mb-6">The Gap Analysis</h2>
                        <p className="text-lg text-muted-foreground">
                            Existing portals like CP-GRAMS or state Helplines exist, but they suffer from three critical architectural flaws:
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            {
                                gap: "No Traceability",
                                explanation: "You see 'Assigned to Dept X', but never see 'Inspector Y has held this for 4 days'."
                            },
                            {
                                gap: "Static Feedback",
                                explanation: "Closing a complaint is a one-way street. Citizen feedback rarely triggers systemic repercussions."
                            },
                            {
                                gap: "Manual Routing",
                                explanation: "Grievances often sit at routing hubs for days, waiting for a human to classify them incorrectly."
                            }
                        ].map((item, i) => (
                            <div key={i} className="relative pl-8 border-l border-white/10 py-2">
                                <div className="absolute top-0 left-[-1px] w-[1px] h-full bg-gradient-to-b from-red-500 via-transparent to-transparent" />
                                <h4 className="text-lg font-bold mb-2 text-foreground/90">{item.gap}</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">{item.explanation}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. Our Solution (Overview) */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--civic-amber)]/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="max-w-7xl mx-auto relative text-center">
                    <Badge className="bg-[var(--trust-green-muted)] text-[var(--trust-green)] border-0 mb-6 px-4">The Solution</Badge>
                    <h2 className="text-5xl font-display font-bold mb-8">JanMitra: The Responsibility Engine</h2>
                    <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-16">
                        We convert governance from a <span className="text-foreground font-semibold">"Best Effort"</span> service into a <span className="text-foreground font-semibold">"SLA-Locked Protocol."</span> By tracing the flow of responsibility at every micro-step, we make every institutional delay a measurable data point.
                    </p>

                    <div className="grid lg:grid-cols-2 gap-8 items-stretch">
                        <div className="glass rounded-3xl p-10 text-left space-y-6 flex flex-col justify-center border-white/10 group">
                            <div className="inline-flex py-1 px-3 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-bold uppercase tracking-widest border border-purple-500/20">Citizen-Centric</div>
                            <h3 className="text-3xl font-display font-bold">Empowerment through visibility</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Citizens get an immutable "Live Trace" of their complaint. They see which officer is holding it, how long they've had it, and exactly when the SLA was breached.
                            </p>
                            <ul className="space-y-3 pt-4">
                                {["Real-time Live Trace", "AI-Powered Report Filling", "Privacy-Preserving Reporting"].map(l => (
                                    <li key={l} className="flex items-center gap-2 text-sm">
                                        <CheckCircle2 className="w-4 h-4 text-[var(--trust-green)]" />
                                        {l}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="glass rounded-3xl p-10 text-left space-y-6 flex flex-col justify-center border-white/10 group bg-white/[0.01]">
                            <div className="inline-flex py-1 px-3 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest border border-blue-500/20">Institutional</div>
                            <h3 className="text-3xl font-display font-bold">Governance via data</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Institutions get advanced heatmaps and pattern detection. Admins can see which departments are failing and why, backed by hard, indisputable evidence.
                            </p>
                            <ul className="space-y-3 pt-4">
                                {["Automated Routing Engine", "SLA Performance Scoring", "Inter-Dept Collaboration"].map(l => (
                                    <li key={l} className="flex items-center gap-2 text-sm">
                                        <CheckCircle2 className="w-4 h-4 text-blue-400" />
                                        {l}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Key Features */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-16">
                        <h2 className="text-4xl font-display font-bold mb-4">Core Innovation Pillars</h2>
                        <p className="text-muted-foreground">The technology stack that drives JanMitra.</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: GitBranch,
                                title: "Responsibility Trace",
                                desc: "An immutable event trail that maps every hand-off within the government hierarchy."
                            },
                            {
                                icon: (props: any) => <img src="/icons/icon-192x192.png" alt="Manus AI" className={props.className} />,
                                title: "Manus — Conversational AI",
                                desc: "Powered by Gemini, Manus turns casual voice or text into a structured, categorized grievance."
                            },
                            {
                                icon: BarChart3,
                                title: "Public Dashboards",
                                desc: "Live city heatmaps showing areas with critical service failures to push for public accountability."
                            },
                            {
                                icon: Lock,
                                title: "Granular Privacy",
                                desc: "File complaints anonymously while maintaining full tracking functionality and status updates."
                            },
                            {
                                icon: Target,
                                title: "Auto-Routing Hub",
                                desc: "Intelligent classification of issues to ensure they reach the right desk in minutes, not days."
                            },
                            {
                                icon: Globe,
                                title: "Proxy Reporting",
                                desc: "Support for marginalized citizens by allowing trusted delegates to file on their behalf."
                            },
                            {
                                icon: Database,
                                title: "Evidence Vault",
                                desc: "Secure storage for photos, videos, and documents linked permanently to the event trail."
                            },
                            {
                                icon: TrendingUp,
                                title: "Trust Index",
                                desc: "A dynamic score for every department based on citizen feedback and SLA accuracy."
                            }
                        ].map((f, i) => (
                            <div key={i} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group">
                                <f.icon className="w-6 h-6 text-[var(--civic-amber)] mb-4 group-hover:scale-110 transition-transform" />
                                <h4 className="text-base font-bold mb-2">{f.title}</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. How It Works - Interactive Journey */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#030a1c] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--civic-amber)]/20 to-transparent" />
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-4xl font-display font-bold">Technical Workflow</h2>
                        <p className="text-muted-foreground">From a voice note to a resolved grievance.</p>
                    </div>

                    <div className="relative">
                        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/5 -translate-y-1/2 hidden lg:block" />
                        <div className="grid lg:grid-cols-4 gap-8 relative">
                            {[
                                {
                                    step: "01",
                                    title: "Ingestion",
                                    desc: "Manus AI processes voice/text or manual entry, extracting location and category."
                                },
                                {
                                    step: "02",
                                    title: "Validation",
                                    desc: "Events are logged into the immutable database with a unique JM-ID and SLA timer."
                                },
                                {
                                    step: "03",
                                    title: "Live Routing",
                                    desc: "The engine maps the grievance to the specific department head based on area-ward rules."
                                },
                                {
                                    step: "04",
                                    title: "Trace Loop",
                                    desc: "Every officer action (Viewed, Action Taken, Closed) is visible to the citizen in real-time."
                                }
                            ].map((item, i) => (
                                <div key={i} className="glass p-8 rounded-3xl relative lg:bg-transparent lg:border-0 border-white/5">
                                    <div className="w-10 h-10 rounded-full bg-[var(--civic-amber)] text-[var(--navy-deep)] flex items-center justify-center font-bold text-sm mb-6 lg:mx-auto relative z-10 glow-amber">
                                        {item.step}
                                    </div>
                                    <h4 className="text-lg font-bold mb-3 lg:text-center">{item.title}</h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed lg:text-center">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. Use Cases / User Journey */}
            <section className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-display font-bold mb-16 text-center">User Journeys</h2>
                    <div className="grid lg:grid-cols-2 gap-12">
                        <div className="glass rounded-3xl p-10 border-white/10 space-y-8">
                            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center overflow-hidden border border-blue-500/30">
                                    <Users className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold">The Citizen Journey</h4>
                                    <p className="text-xs text-muted-foreground">Ramesh, Resident of Sector 14</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                {[
                                    "Discovers a broken sewage pipe in his street.",
                                    "Opens JanMitra and sends a 20-second voice note to Manus.",
                                    "Manus detects category 'Sanitation' and pins the GPS location.",
                                    "Ramesh gets a notification: 'Grievance assigned to Inspector Verma. SLA: 48 hours'.",
                                    "He tracks the trace: 'Acknowledged' (2h), 'Team Dispatched' (18h).",
                                    "Work is done. Ramesh marks as 'Resolved' — Inspector Verma's score increases."
                                ].map((step, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="text-xs font-mono text-muted-foreground mt-1 tabular-nums">0{i + 1}</div>
                                        <p className="text-sm text-foreground/80 leading-relaxed">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass rounded-3xl p-10 border-white/10 space-y-8">
                            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center overflow-hidden border border-purple-500/30">
                                    <Shield className="w-6 h-6 text-purple-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold">The Gov Officer Journey</h4>
                                    <p className="text-xs text-muted-foreground">Officer Sharma, Dept of Water Works</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                {[
                                    "Opens his dashboard and sees '3 High Urgency' complaints.",
                                    "Reviews the evidence (photos) provided via JanMitra.",
                                    "Coordinates with the field team directly through the platform.",
                                    "Updates status: 'In Progress'. Citizen receives an instant notification.",
                                    "Closes the ticket with a photo of the repaired pipe.",
                                    "Views monthly analytics to identify high-failure zones in his ward."
                                ].map((step, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="text-xs font-mono text-muted-foreground mt-1 tabular-nums">0{i + 1}</div>
                                        <p className="text-sm text-foreground/80 leading-relaxed">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 8. Innovation & Unique Points */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[var(--civic-amber-muted)]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-6 text-[var(--navy-deep)]">
                            <Badge className="bg-[var(--navy-deep)] text-white border-0">What sets us apart?</Badge>
                            <h2 className="text-4xl md:text-5xl font-display font-bold">Innovation Beyond Forms</h2>
                            <p className="text-lg opacity-80 leading-relaxed">
                                Most platforms are just digital versions of paper files. JanMitra is an active monitoring system built on three technological differentiators.
                            </p>
                        </div>
                        <div className="space-y-4">
                            {[
                                { t: "Predictive Escalation", d: "If an officer hasn't opened a file in 70% of the SLA time, the system auto-alerts the superior." },
                                { t: "Multimodal Voice Extraction", d: "Manus AI understands vernacular nuances, making the platform accessible to non-technical users." },
                                { t: "Honesty Scoring Logic", d: "If a complaint is closed as 'Resolved' but reopened by the citizen, the department loses credibility points." }
                            ].map((item, i) => (
                                <div key={i} className="bg-[var(--navy-deep)] p-6 rounded-2xl border border-white/5 group hover:bg-[#030a1c] transition-colors">
                                    <h4 className="text-lg font-bold text-[var(--civic-amber)] mb-2">{item.t}</h4>
                                    <p className="text-sm text-white/70 leading-relaxed">{item.d}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 9. Market / Target Users */}
            <section className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-display font-bold mb-4 text-gradient-civic">Market and Impact Reach</h2>
                        <p className="text-muted-foreground">JanMitra is built to scale across the Indian demographic spectrum.</p>
                    </div>
                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { label: "Urban Citizens", stat: "35%", desc: "Direct smartphone users reporting local issues." },
                            { label: "Marginalized", stat: "50%", desc: "Using Proxy Reporting & Voice Assistance." },
                            { label: "Gov Officials", stat: "10k+", desc: "Standardizing workflows for field teams." },
                            { label: "Policy Makers", stat: "Real-time", desc: "Data-driven decision making via dashboards." }
                        ].map((card, i) => (
                            <div key={i} className="glass p-8 rounded-3xl text-center space-y-4 border-white/5">
                                <div className="text-3xl font-display font-bold text-white">{card.stat}</div>
                                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{card.label}</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 10. Business Model (if relevant) - Social Governance Model */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 border-y border-white/5 bg-white/[0.01]">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <h2 className="text-4xl font-display font-bold">The Governance Model</h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        JanMitra operates on a <span className="text-foreground">"SaaS-for-Good"</span> model. We partner with Municipal Corporations (ULBs) and State Governments on a tiered subscription basis, focusing on outcomes rather than just user seats.
                    </p>
                    <div className="grid md:grid-cols-3 gap-6 pt-8">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                            <div className="text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-tighter">Phase A</div>
                            <h4 className="font-bold">Pilot & Open Source</h4>
                            <p className="text-xs text-muted-foreground mt-2">Free for small wards to prove the accountability loop.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-[var(--civic-amber)] text-[var(--navy-deep)]">
                            <div className="text-[10px] font-bold opacity-70 mb-1 uppercase tracking-tighter">Phase B</div>
                            <h4 className="font-bold">Enterprise Partnership</h4>
                            <p className="text-xs opacity-80 mt-2">Scaling to full city dashboards with dedicated support.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                            <div className="text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-tighter">Phase C</div>
                            <h4 className="font-bold">National Utility</h4>
                            <p className="text-xs text-muted-foreground mt-2">Integrating with central government infra via APIs.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 11. Scalability & Future Scope */}
            <section className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="relative order-2 lg:order-1">
                            <Rocket className="absolute -top-12 -left-12 w-32 h-32 text-[var(--civic-amber)] opacity-5" />
                            <div className="space-y-4">
                                {[
                                    { t: "Blockchain Integration", d: "Immutable transaction logs to prevent database tampering by high-level officials." },
                                    { t: "IoT Sensor Feeds", d: "Auto-triggering grievances when sewage levels rise or streetlights fail via smart city sensors." },
                                    { t: "Predictive Budgeting", d: "Using failure heatmaps to suggest where the next city budget should be focused." }
                                ].map((f, i) => (
                                    <div key={i} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[var(--civic-amber)]/20 transition-all">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-2 h-2 rounded-full bg-[var(--civic-amber)] shadow-[0_0_10px_var(--civic-amber)]" />
                                            <h4 className="font-bold text-sm uppercase tracking-wider">{f.t}</h4>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed pl-5">{f.d}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-6 order-1 lg:order-2">
                            <h2 className="text-4xl font-display font-bold">Future Horizon</h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                We aren&apos;t just stopping at tracking grievances. Our roadmap includes integrating deep-tech layers that make governance self-correcting.
                            </p>
                            <div className="flex items-center gap-2 text-[var(--trust-green)] text-sm font-bold pt-4">
                                <Target className="w-5 h-5" />
                                Goal: 0.0s Accountability Lag by 2030.
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 12. Challenges & Risks */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0a0502] border-y border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="max-w-3xl mb-12">
                        <h2 className="text-3xl font-display font-bold text-[var(--accountability-red)]">Challenges and Mitigation</h2>
                        <p className="text-muted-foreground mt-2 italic text-sm">Every bold vision faces resistance. Here is how we address the friction.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { c: "Resistance to Transparency", m: "Implementing a reward-based system for high-performing officers to incentivize adoption." },
                            { c: "Data Veracity", m: "Utilizing GPS-tagging and time-stamped evidence uploads to prevent fake or duplicate reporting." },
                            { c: "Digital Divide", m: "Heavy focus on Voice-first interfaces and Proxy delegation for non-digital populations." },
                            { c: "Last-Mile Internet", m: "Progressive Web App (PWA) capabilities for offline-first submission and sync." }
                        ].map((item, i) => (
                            <div key={i} className="space-y-4">
                                <div className="text-[10px] font-bold text-red-500/50 uppercase tracking-widest">Challenge {i + 1}</div>
                                <h4 className="text-sm font-bold text-foreground/90">{item.c}</h4>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-muted-foreground leading-relaxed italic">
                                    <span className="text-[var(--trust-green)] font-bold non-italic mr-1">Mitigation:</span> {item.m}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 13. Roadmap */}
            <section className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-display font-bold text-center mb-16">The Road to 2026</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="glass p-8 rounded-3xl space-y-4 border-white/10 bg-[var(--civic-amber-muted)]">
                            <div className="text-xs font-bold text-[var(--civic-amber)]">Q2 2025 - CURRENT</div>
                            <h4 className="text-xl font-bold">Accountability Core</h4>
                            <ul className="space-y-2">
                                {["Manus AI Launch", "Live Trace Engine", "Cross-Dept Routing", "evidenceZone Integration"].map(l => (
                                    <li key={l} className="text-xs flex items-center gap-2 group">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-[var(--trust-green)]" />
                                        <span className="group-hover:text-foreground transition-colors">{l}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="glass p-8 rounded-3xl space-y-4 border-white/10">
                            <div className="text-xs font-bold text-white/40">Q4 2025</div>
                            <h4 className="text-xl font-bold">Scaling Democracy</h4>
                            <ul className="space-y-2">
                                {["Public Trust Index V2", "API for Civic Apps", "Smart City Integration", "Predictive Patterns"].map(l => (
                                    <li key={l} className="text-xs flex items-center gap-2 opacity-60">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                        <span>{l}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="glass p-8 rounded-3xl space-y-4 border-white/10">
                            <div className="text-xs font-bold text-white/40">2026+</div>
                            <h4 className="text-xl font-bold">Self-Governing Systems</h4>
                            <ul className="space-y-2">
                                {["Blockchain Audit Logs", "IoT Auto-Grievance", "Direct Budget Feedback", "Global OS Exports"].map(l => (
                                    <li key={l} className="text-xs flex items-center gap-2 opacity-60">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                        <span>{l}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* 14. Team Introduction */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-card/20 border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
                        <div className="space-y-4">
                            <h2 className="text-4xl font-display font-bold">The Architects</h2>
                            <p className="text-muted-foreground">The team behind JanMitra: Engineers, Designers, and Policy Thinkers.</p>
                        </div>
                        <Button variant="outline" className="border-white/10 hover:bg-white/5">The Whole Story</Button>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-12">
                        {[
                            { n: "The Visionaries", r: "Policy & Strategy", d: "Connecting institutional gaps with technological solutions." },
                            { n: "The Builders", r: "Full-Stack Engineers", d: "Crafting the immutable trace engine and the Manus Conversational AI." },
                            { n: "The Guardians", r: "Security & QA", d: "Ensuring data integrity, citizen privacy, and platform resilience." }
                        ].map((m, i) => (
                            <div key={i} className="space-y-4 group">
                                <div className="aspect-[4/5] bg-white/5 rounded-3xl border border-white/10 overflow-hidden relative grayscale group-hover:grayscale-0 transition-all duration-500">
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#020817] to-transparent" />
                                    <div className="absolute bottom-6 left-6">
                                        <h4 className="text-xl font-bold">{m.n}</h4>
                                        <p className="text-xs text-[var(--civic-amber)] font-bold tracking-widest uppercase">{m.r}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed leading-relaxed">{m.d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 15. Thank You / Final CTA */}
            <section className="py-32 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="max-w-4xl mx-auto relative space-y-10">
                    <h2 className="text-5xl sm:text-7xl font-display font-bold">Making institutional failure <span className="text-gradient-civic italic">visible.</span></h2>
                    <p className="text-xl text-muted-foreground">Join us in the journey of building a more accountable, transparent, and honest democracy.</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/signup">
                            <Button size="lg" className="bg-[var(--civic-amber)] text-[var(--navy-deep)] font-bold px-12 h-14 text-lg glow-amber hover:scale-105 transition-transform">Get Started Now</Button>
                        </Link>
                        <Link href="/contact">
                            <Button size="lg" variant="ghost" className="h-14 px-8 text-lg hover:bg-white/5 underline underline-offset-8">Have Questions? Talk to us.</Button>
                        </Link>
                    </div>
                    <div className="pt-20 flex flex-wrap justify-center gap-x-12 gap-y-6 opacity-30">
                        <div className="text-xs font-bold uppercase tracking-[0.3em]">Integrity</div>
                        <div className="text-xs font-bold uppercase tracking-[0.3em]">Honesty</div>
                        <div className="text-xs font-bold uppercase tracking-[0.3em]">Accountability</div>
                        <div className="text-xs font-bold uppercase tracking-[0.3em]">Justice</div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

function XCircle(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6" />
            <path d="m9 9 6 6" />
        </svg>
    );
}
