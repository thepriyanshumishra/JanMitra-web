"use client";

import { AppNavbar } from "@/components/shared/AppNavbar";
import { Badge } from "@/components/ui/badge";
import {
    Building2, Droplets, Lightbulb, Pickaxe, Trees, Trash2,
    ArrowRight, CheckCircle2, Search, Activity, Users, Clock
} from "lucide-react";
import Link from "next/link";

const DEPARTMENTS = [
    {
        id: "Water Supply",
        icon: Droplets,
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        desc: "Pipelines, leakages, water quality, and supply schedule disruptions.",
        stats: { honesty: "92%", time: "2.4 Days", officers: 12, resolved: "4.2k" }
    },
    {
        id: "Electricity",
        icon: Lightbulb,
        color: "text-yellow-400",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/20",
        desc: "Streetlights, power outages, and grid accountability monitoring.",
        stats: { honesty: "88%", time: "1.1 Days", officers: 18, resolved: "8.1k" }
    },
    {
        id: "Roads & Traffic",
        icon: Pickaxe,
        color: "text-orange-400",
        bg: "bg-orange-500/10",
        border: "border-orange-500/20",
        desc: "Potholes, road relaying delays, and drainage infrastructure issues.",
        stats: { honesty: "54%", time: "14.2 Days", officers: 34, resolved: "1.2k" }
    },
    {
        id: "Sanitation",
        icon: Trash2,
        color: "text-[var(--trust-green)]",
        bg: "bg-green-500/10",
        border: "border-green-500/20",
        desc: "Garbage collection delays and public health maintenance issues.",
        stats: { honesty: "76%", time: "3.5 Days", officers: 28, resolved: "5.5k" }
    },
    {
        id: "Public Parks",
        icon: Trees,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        desc: "Public gardens, playgrounds, and civic green space maintenance.",
        stats: { honesty: "42%", time: "21.0 Days", officers: 8, resolved: "340" }
    },
    {
        id: "General Admin",
        icon: Building2,
        color: "text-purple-400",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20",
        desc: "General municipal services, permits, and administrative roadblocks.",
        stats: { honesty: "68%", time: "5.8 Days", officers: 45, resolved: "2.8k" }
    },
];

export default function DepartmentsPage() {
    return (
        <div className="min-h-screen bg-mesh text-foreground">
            <AppNavbar />

            {/* ── Hero ── */}
            <section className="pt-32 pb-16 px-4 max-w-7xl mx-auto text-center space-y-6 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

                <Badge className="bg-[var(--civic-amber)]/10 text-[var(--civic-amber)] border-[var(--civic-amber)]/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest">
                    Public Service Directory
                </Badge>

                <h1 className="text-5xl md:text-6xl font-display font-black tracking-tight">
                    Integrated <span className="text-gradient-civic">Departments</span>
                </h1>

                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    These designated civic departments are currently hardwired into the JanMitra Trace Engine. Every resolution they post is permanently subject to citizen verification.
                </p>

                <div className="pt-4 flex items-center justify-center gap-4 text-sm text-foreground/80 font-medium">
                    <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[var(--trust-green)]" /> Live SLA Tracking</span>
                    <span className="hidden sm:flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[var(--trust-green)]" /> Citizen Verified</span>
                    <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[var(--trust-green)]" /> Public Honesty Logs</span>
                </div>
            </section>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 space-y-16 animate-in fade-in duration-700">

                {/* ── Grid ── */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {DEPARTMENTS.map((dept) => (
                        <div key={dept.id} className={`glass rounded-3xl p-6 md:p-8 flex flex-col border ${dept.border} hover:bg-white-[0.03] transition-colors group relative overflow-hidden`}>
                            {/* Ambient background glow on hover */}
                            <div className={`absolute top-0 right-0 w-32 h-32 ${dept.bg} rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                            <div className="flex items-start justify-between mb-6 relative z-10">
                                <div className={`w-14 h-14 rounded-2xl ${dept.bg} flex items-center justify-center ${dept.color}`}>
                                    <dept.icon className="w-7 h-7" />
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black font-mono tracking-tighter" style={{ color: Number(dept.stats.honesty.replace('%', '')) > 70 ? 'var(--trust-green)' : Number(dept.stats.honesty.replace('%', '')) > 50 ? 'var(--civic-amber)' : 'var(--accountability-red)' }}>
                                        {dept.stats.honesty}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Honesty Score</div>
                                </div>
                            </div>

                            <div className="flex-1 relative z-10">
                                <h3 className="text-2xl font-display font-bold mb-3">{dept.id}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {dept.desc}
                                </p>
                            </div>

                            {/* Metrics Strip */}
                            <div className="mt-8 pt-5 border-t border-white/5 grid grid-cols-3 gap-2 relative z-10">
                                <div>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                                        <Clock className="w-3.5 h-3.5" /> Avg Time
                                    </div>
                                    <p className="font-mono text-sm font-semibold">{dept.stats.time}</p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                                        <Activity className="w-3.5 h-3.5" /> Resolved
                                    </div>
                                    <p className="font-mono text-sm font-semibold">{dept.stats.resolved}</p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                                        <Users className="w-3.5 h-3.5" /> Officers
                                    </div>
                                    <p className="font-mono text-sm font-semibold">{dept.stats.officers}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Integration Architecture Banner ── */}
                <section className="glass-strong border border-white/10 rounded-[40px] p-8 md:p-12 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--navy-deep)] to-transparent pointer-events-none z-0" />
                    <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-display font-bold">How Data Integration Works</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                JanMitra does not replace internal departmental software. Instead, it rides securely on top of them as an immutable <strong>Accountability Layer</strong>.
                            </p>
                            <ul className="space-y-3">
                                {[
                                    "Read-only sync prevents data tampering.",
                                    "Smart contracts enforce SLA boundaries mathematically.",
                                    "Citizen feedback loops directly block internal ticket closures."
                                ].map((bullet, i) => (
                                    <li key={i} className="flex gap-3 text-sm font-medium">
                                        <ArrowRight className="w-5 h-5 text-[var(--civic-amber)] shrink-0" /> {bullet}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="glass bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4 font-mono text-sm">
                            <div className="text-muted-foreground/50 border-b border-white/5 pb-2">SYSTEM.LOG_ATTACH</div>
                            <div className="text-[var(--trust-green)]">{"["}OK{"]"} Syncing API Bridge v2.4</div>
                            <div className="text-[var(--civic-amber)]">{"["}WARN{"]"} Dept(Roads) SLA approaching breach limit</div>
                            <div className="text-blue-400">{"["}INFO{"]"} Citizen verification pending on Complaint #8821</div>
                            <div className="text-purple-400">{"["}SEC{"]"} Escalation protocol engaged for 4 nodal officers</div>
                            <div className="text-muted-foreground pt-4 animate-pulse">_ Waiting for next event...</div>
                        </div>
                    </div>
                </section>

                {/* ── Request Onboarding Banner ── */}
                <div className="glass p-8 md:p-12 rounded-[40px] border border-[var(--civic-amber)]/20 bg-gradient-to-r from-[var(--civic-amber)]/10 to-transparent flex flex-col md:flex-row items-center gap-8 justify-between">
                    <div className="space-y-3 max-w-xl">
                        <h2 className="text-2xl font-display font-bold text-white">Missing a public service department?</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            We are systematically onboarding more municipal and state-level administrative layers to ensure total governance coverage. Let us know which department needs accountability next.
                        </p>
                    </div>
                    <button className="bg-[var(--civic-amber)] text-[var(--navy-deep)] px-8 py-3.5 rounded-full font-bold shadow-xl shadow-[var(--civic-amber)]/20 active:scale-95 transition-all shrink-0 hover:bg-[var(--civic-amber)]/90 flex items-center gap-2">
                        <Search className="w-4 h-4" /> Request Onboarding
                    </button>
                </div>

            </main>
        </div>
    );
}
