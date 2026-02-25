"use client";

import { AppNavbar } from "@/components/shared/AppNavbar";
import {
    Shield, Target, Users, Zap, Eye, Database,
    ArrowRight, FileText, Bot, Clock, CheckCircle2, XCircle
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-mesh text-foreground">
            <AppNavbar />

            {/* ── Hero Section ── */}
            <section className="pt-32 pb-16 px-4 max-w-7xl mx-auto text-center space-y-6 relative">
                {/* Ambient glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[var(--civic-amber)]/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-[var(--civic-amber)]/20 text-xs font-semibold text-[var(--civic-amber)] uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-[var(--civic-amber)] animate-pulse" />
                    Our Mission
                </div>

                <h1 className="text-5xl sm:text-7xl font-display font-black tracking-tight">
                    The <span className="text-gradient-civic">JanMitra</span> Manifesto
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    Making institutional failure impossible to stay invisible. We are transforming Indian governance through radical transparency, AI-driven routing, and immutable accountability.
                </p>
            </section>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 space-y-24 animate-in fade-in duration-700">

                {/* ── The Shift: Problem vs Solution ── */}
                <section className="grid md:grid-cols-2 gap-8">
                    {/* The Old Way */}
                    <div className="glass rounded-[32px] p-8 sm:p-10 border border-red-500/10 space-y-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <XCircle className="w-48 h-48 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-display font-bold text-red-400">The Traditional System</h2>
                        <ul className="space-y-4">
                            {[
                                "Complaints are pieces of paper that easily get lost or ignored.",
                                "Citizens have no visibility into who is handling their issue.",
                                "SLA (Service Level Agreements) exist only on paper.",
                                "Language and literacy barriers prevent millions from reporting issues.",
                                "Officers can close tickets unilaterally without citizen approval."
                            ].map((text, i) => (
                                <li key={i} className="flex gap-3 text-muted-foreground">
                                    <XCircle className="w-5 h-5 text-red-500/50 shrink-0 mt-0.5" />
                                    <span>{text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* The JanMitra Way */}
                    <div className="glass-strong rounded-[32px] p-8 sm:p-10 border border-[var(--civic-amber)]/20 space-y-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <CheckCircle2 className="w-48 h-48 text-[var(--civic-amber)]" />
                        </div>
                        <h2 className="text-2xl font-display font-bold text-gradient-amber">The JanMitra Way</h2>
                        <ul className="space-y-4">
                            {[
                                "Complaints are immutable records stored securely in the cloud.",
                                "Complete transparency showing exactly whose desk the issue is on.",
                                "Strict SLA countdowns mathematically enforce resolution timelines.",
                                "Manus AI enables reporting in native languages just by speaking.",
                                "Tickets remain open until the citizen verifies the resolution is real."
                            ].map((text, i) => (
                                <li key={i} className="flex gap-3 text-foreground">
                                    <CheckCircle2 className="w-5 h-5 text-[var(--trust-green)] shrink-0 mt-0.5" />
                                    <span>{text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* ── 6 Core Pillars ── */}
                <section className="space-y-12 text-center">
                    <div className="space-y-4 max-w-2xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl font-display font-bold">Six Pillars of Accountability</h2>
                        <p className="text-muted-foreground">The foundational principles that make JanMitra an unstoppable force for good governance.</p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                        {[
                            {
                                icon: Shield,
                                title: "Citizen Verification",
                                desc: "Departments cannot arbitrarily close complaints. Only the citizen who filed the issue holds the power to verify resolution and officially close it."
                            },
                            {
                                icon: Zap,
                                title: "SLA Enforcement",
                                desc: "Every complaint category is bound by a strict Service Level Agreement timer. If the deadline breaches, the failure is permanently logged."
                            },
                            {
                                icon: Users,
                                title: "Radical Inclusion",
                                desc: "No app required. Illiterate citizens can simply dictate their problems in their native dialect via Manus AI without filling complex forms."
                            },
                            {
                                icon: Target,
                                title: "Precision AI Routing",
                                desc: "Complaints are instantly categorized and routed to the exact nodal officer responsible, eliminating bureaucratic ping-pong."
                            },
                            {
                                icon: Eye,
                                title: "Complete Transparency",
                                desc: "The Public Transparency Dashboard exposes live data on city health, department performance, and SLA breach rates for all to see."
                            },
                            {
                                icon: Database,
                                title: "Immutable Events",
                                desc: "We use Event Sourcing architecture. Data cannot be quietly altered or deleted. Every state change is a permanent, verifiable event."
                            },
                        ].map((item, i) => (
                            <div key={i} className="glass p-8 rounded-3xl space-y-4 hover:bg-white-[0.03] hover:border-white/10 transition-all group">
                                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-[var(--civic-amber)] group-hover:scale-110 transition-transform">
                                    <item.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-display font-bold">{item.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── How It Works flow ── */}
                <section className="glass rounded-[40px] p-8 sm:p-16 border border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--civic-amber)]/5 to-transparent pointer-events-none" />

                    <div className="space-y-12 relative z-10">
                        <div className="text-center space-y-4 max-w-2xl mx-auto">
                            <h2 className="text-3xl sm:text-4xl font-display font-bold">How JanMitra Works</h2>
                            <p className="text-muted-foreground">A frictionless pipeline from public grievance to verified resolution.</p>
                        </div>

                        <div className="grid md:grid-cols-4 gap-8 relative">
                            {/* Connecting line for desktop */}
                            <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-[2px] bg-white/10" />

                            {[
                                { icon: FileText, title: "1. The Voice", desc: "Citizen speaks or types the issue to Manus AI in their preferred language." },
                                { icon: Bot, title: "2. The Brain", desc: "AI parses the location, urgency, and exact department required." },
                                { icon: Clock, title: "3. The Timer", desc: "Pushed to the officer. The SLA countdown immediately begins ticking." },
                                { icon: Shield, title: "4. The Verification", desc: "Issue fixed. Citizen verifies the work, bringing the loop to a secure close." },
                            ].map((step, i) => (
                                <div key={i} className="relative z-10 flex flex-col items-center text-center space-y-4">
                                    <div className="w-16 h-16 rounded-2xl bg-[var(--navy-deep)] border-2 border-[var(--civic-amber)] flex items-center justify-center text-[var(--civic-amber)] shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                                        <step.icon className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="font-display font-bold text-lg">{step.title}</h3>
                                        <p className="text-sm text-muted-foreground mt-2">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Call to action ── */}
                <section className="glass-strong rounded-[40px] p-10 md:p-20 text-center space-y-8 bg-gradient-to-t from-[var(--navy-deep)] to-transparent border border-[var(--civic-amber)]/20">
                    <div className="w-20 h-20 mx-auto bg-[var(--civic-amber)]/10 rounded-full flex items-center justify-center">
                        <Shield className="w-10 h-10 text-[var(--civic-amber)]" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-display font-black">Ready to demand better?</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Governance is not a spectator sport. If you see an issue in your neighborhood, log it on JanMitra and let the system enforce accountability.
                    </p>
                    <div className="pt-4">
                        <Link href="/submit">
                            <Button size="lg" className="bg-[var(--civic-amber)] text-[var(--navy-deep)] hover:bg-[var(--civic-amber)]/90 font-bold h-14 px-8 text-lg rounded-full">
                                File a Complaint Now <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                    </div>
                </section>

            </main>
        </div>
    );
}
