"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { collection, onSnapshot, query, orderBy, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
    Loader2, Activity, Map as MapIcon, ShieldAlert,
    TrendingUp, AlertTriangle, CheckCircle2, BarChart2,
    Zap, Trophy, Clock
} from "lucide-react";
import { AppNavbar } from "@/components/shared/AppNavbar";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";

// Dynamically import Leaflet map to avoid SSR error
const ComplaintHeatmap = dynamic(
    () => import("@/components/transparency/ComplaintHeatmap"),
    {
        ssr: false,
        loading: () => (
            <div className="h-full min-h-[400px] glass rounded-2xl flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--civic-amber)]" />
            </div>
        ),
    }
);

interface Grievance {
    id: string;
    title: string;
    category: string;
    status: string;
    slaStatus: string;
    privacyLevel: string;
    createdAt: string;
}

interface DeptStat {
    id: string;
    name: string;
    slaScore?: number;       // 0-100
    totalComplaints?: number;
    resolvedOnTime?: number;
}

interface PublicStats {
    totalComplaints: number;
    resolvedOnTime: number;
    slaHonestyRate: number;
    departments: DeptStat[];
}

const DEPT_ICONS: Record<string, string> = {
    water: "💧", electricity: "⚡", sanitation: "🧹",
    roads: "🛣️", parks: "🌳", health: "🏥",
    education: "📚", transport: "🚌", default: "🏛️",
};

function getDeptIcon(name: string): string {
    const lower = name.toLowerCase();
    for (const [key, icon] of Object.entries(DEPT_ICONS)) {
        if (lower.includes(key)) return icon;
    }
    return DEPT_ICONS.default;
}

const CATEGORY_COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#ef4444", "#06b6d4"];

const tooltipStyle = {
    backgroundColor: "hsl(230 25% 10%)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    color: "#fff",
    fontSize: "12px",
    padding: "10px 14px",
};

export default function TransparencyDashboard() {
    const [complaints, setComplaints] = useState<Grievance[]>([]);
    const [loading, setLoading] = useState(true);
    const [publicStats, setPublicStats] = useState<PublicStats | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!db) return;
        const q = query(
            collection(db, "grievances"),
            where("privacyLevel", "==", "public"),
            orderBy("createdAt", "desc")
        );
        const unsub = onSnapshot(q, (snap) => {
            setComplaints(snap.docs.map(d => ({ id: d.id, ...d.data() } as Grievance)));
            setLoading(false);
        }, (err) => {
            console.error("Firestore onSnapshot error:", err);
            setLoading(false);
        });
        return unsub;
    }, []);

    useEffect(() => {
        fetch("/api/public/stats")
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data) setPublicStats(data); })
            .catch(() => null);
    }, []);

    // ── Pre-mount or Loading State ──
    // We return a consistent 'Loading' shells during SSR to avoid Hydration Mismatch
    if (!mounted || loading) {
        return (
            <div className="min-h-screen bg-mesh text-foreground">
                <AppNavbar />
                <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--civic-amber)] flex items-center justify-center glow-amber animate-pulse">
                        <Activity className="w-7 h-7 text-[var(--navy-deep)]" />
                    </div>
                    <p className="text-sm text-muted-foreground">Loading city intelligence data...</p>
                </div>
            </div>
        );
    }

    // ── Derived Metrics ──
    const total = complaints.length;
    const resolved = complaints.filter(c => c.status === "resolved" || c.status === "closed").length;
    const breached = complaints.filter(c => c.slaStatus === "breached").length;
    const atRisk = complaints.filter(c => c.slaStatus === "at_risk").length;
    const onTrack = total - breached - atRisk;
    const breachRate = total > 0 ? Math.round((breached / total) * 100) : 0;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    const healthState = breachRate > 30 ? "Critical" : breachRate > 15 ? "Under Strain" : "Healthy";
    const healthColor = breachRate > 30 ? "var(--accountability-red)" : breachRate > 15 ? "#f59e0b" : "var(--trust-green)";

    // ── Chart Data ──
    const trendData = (() => {
        const days: Record<string, { name: string; on_track: number; breached: number }> = {};
        [...complaints].reverse().forEach(c => {
            const date = new Date(c.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
            if (!days[date]) days[date] = { name: date, on_track: 0, breached: 0 };
            if (c.slaStatus === "breached") days[date].breached++;
            else days[date].on_track++;
        });
        return Object.values(days).slice(-14);
    })();

    const categoryData = (() => {
        const cats: Record<string, number> = {};
        complaints.forEach(c => { cats[c.category] = (cats[c.category] || 0) + 1; });
        return Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, count]) => ({ name, count }));
    })();

    return (
        <div className="min-h-screen bg-mesh text-foreground">
            <AppNavbar />

            <section className="pt-32 pb-12 px-4 max-w-7xl mx-auto text-center space-y-5 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[var(--civic-amber)]/8 rounded-full blur-[120px] pointer-events-none" />

                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-[var(--civic-amber)]/20 text-xs font-semibold text-[var(--civic-amber)] uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-[var(--civic-amber)] animate-pulse" />
                    Live City Intelligence
                </div>

                <h1 className="text-5xl sm:text-6xl font-display font-black tracking-tight relative">
                    Public{" "}
                    <span className="text-gradient-amber">Transparency</span>
                    <br />
                    <span className="text-3xl sm:text-4xl font-light text-muted-foreground">
                        Governance Accountability Layer
                    </span>
                </h1>
                <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
                    Every citizen complaint, every SLA breach, and every department response is visible here in real time. No cover-ups. No delays.
                </p>
            </section>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 space-y-6 animate-in fade-in duration-700">

                {/* KPI Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        {
                            label: "Total Complaints",
                            value: total.toLocaleString(),
                            sub: "All time",
                            icon: <BarChart2 className="w-5 h-5" />,
                            color: "text-blue-400",
                            bg: "bg-blue-500/10",
                        },
                        {
                            label: "Resolution Rate",
                            value: `${resolutionRate}%`,
                            sub: `${resolved} resolved`,
                            icon: <CheckCircle2 className="w-5 h-5" />,
                            color: "text-[var(--trust-green)]",
                            bg: "bg-green-500/10",
                        },
                        {
                            label: "SLA Breaches",
                            value: breached.toLocaleString(),
                            sub: `${breachRate}% breach rate`,
                            icon: <AlertTriangle className="w-5 h-5" />,
                            color: "text-[var(--accountability-red)]",
                            bg: "bg-red-500/10",
                        },
                        {
                            label: "SLA Honesty Rate",
                            value: `${publicStats?.slaHonestyRate ?? resolutionRate}%`,
                            sub: publicStats ? `${publicStats.resolvedOnTime} resolved on time` : `${resolved} resolved`,
                            icon: <Clock className="w-5 h-5" />,
                            color: "text-purple-400",
                            bg: "bg-purple-500/10",
                        },
                    ].map((stat) => (
                        <div key={stat.label} className="glass rounded-2xl p-5 flex flex-col gap-3 hover:bg-white/5 transition-colors group">
                            <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-2xl font-display font-black tracking-tight">{stat.value}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                                <p className="text-[10px] text-muted-foreground/60 mt-0.5">{stat.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Governance Health Banner */}
                <div className="glass rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 border" style={{ borderColor: `${healthColor}30` }}>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${healthColor}15` }}>
                        {breachRate > 30 ? <ShieldAlert className="w-7 h-7" style={{ color: healthColor }} /> : breachRate > 15 ? <AlertTriangle className="w-7 h-7" style={{ color: healthColor }} /> : <Zap className="w-7 h-7" style={{ color: healthColor }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="font-display font-bold text-xl" style={{ color: healthColor }}>Governance Status: {healthState}</h2>
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: `${healthColor}20`, color: healthColor }}>{breachRate}% breach rate</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {breachRate > 30 ? `High volume of unresolved SLA breaches detected. ${breached} active violations indicate systemic strain.` : breachRate > 15 ? `Moderate SLA stress detected. ${atRisk} complaints are at risk of breaching their deadline.` : `All departments operating within acceptable SLA bounds. ${onTrack} complaints on track for timely resolution.`}
                        </p>
                    </div>
                    <div className="w-full sm:w-48 shrink-0 space-y-1.5">
                        <div className="flex justify-between text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                            <span>On Track</span>
                            <span>{total > 0 ? Math.round((onTrack / total) * 100) : 0}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-1000" style={{ width: total > 0 ? `${Math.round((onTrack / total) * 100)}%` : "0%", backgroundColor: "var(--trust-green)" }} />
                        </div>
                        <div className="flex gap-3 text-[9px] text-muted-foreground">
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[var(--trust-green)]" />On Track</span>
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[var(--accountability-red)]" />Breached</span>
                        </div>
                    </div>
                </div>

                {/* Map & Leaderboard */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 glass rounded-2xl p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="font-display font-bold text-lg flex items-center gap-2">
                                    <MapIcon className="w-5 h-5 text-[var(--civic-amber)]" />
                                    Civic Issue Hotspots
                                </h2>
                                <p className="text-xs text-muted-foreground mt-0.5">Showing public incidents. Private reports are fully anonymized.</p>
                            </div>
                        </div>
                        <div className="flex-1 min-h-[380px] rounded-xl overflow-hidden bg-white/5 relative">
                            <ComplaintHeatmap complaints={complaints} />
                        </div>
                    </div>

                    <div className="glass rounded-2xl p-6 flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                            <Trophy className="w-5 h-5 text-[var(--civic-amber)]" />
                            <h2 className="font-display font-bold text-lg">Dept. Leaderboard</h2>
                        </div>
                        <p className="text-xs text-muted-foreground mb-6">Ranked by SLA honesty score</p>
                        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                            {(publicStats?.departments ?? []).length === 0 ? (
                                <div className="py-8 text-center text-sm text-muted-foreground italic">No ranking data yet.</div>
                            ) : (publicStats?.departments ?? []).map((dept, i) => {
                                const score = dept.slaScore ?? (dept.totalComplaints && dept.totalComplaints > 0 ? Math.round(((dept.resolvedOnTime ?? 0) / dept.totalComplaints) * 100) : 0);
                                const rankColors = [
                                    "bg-yellow-400/15 text-yellow-400 border-yellow-400/20",
                                    "bg-slate-300/10 text-slate-300 border-slate-300/20",
                                    "bg-amber-700/15 text-amber-600 border-amber-600/20",
                                ];
                                const barColor = score >= 80 ? "var(--trust-green)" : score >= 60 ? "#f59e0b" : "var(--accountability-red)";
                                return (
                                    <div key={dept.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-colors group">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold border shrink-0 ${rankColors[i] ?? "bg-white/5 text-muted-foreground border-white/10"}`}>{getDeptIcon(dept.name)}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <p className="text-sm font-semibold truncate">{dept.name}</p>
                                                <span className="text-sm font-black font-mono ml-2">{score}%</span>
                                            </div>
                                            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${score}%`, backgroundColor: barColor }} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-muted-foreground">
                            <span>SLA performance baseline</span>
                            <TrendingUp className="w-4 h-4 text-[var(--civic-amber)]" />
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="glass rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="font-display font-semibold text-base">City SLA Trend</h2>
                                <p className="text-xs text-muted-foreground mt-0.5">Last 14 days of complaint traffic</p>
                            </div>
                        </div>
                        <div className="h-[240px] w-full">
                            {trendData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%" debounce={50}>
                                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="gOnTrack" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--trust-green)" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="var(--trust-green)" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="gBreached" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--accountability-red)" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="var(--accountability-red)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "rgba(255,255,255,0.1)" }} />
                                        <Area type="monotone" dataKey="on_track" name="On Track" stroke="var(--trust-green)" strokeWidth={2} fill="url(#gOnTrack)" dot={false} />
                                        <Area type="monotone" dataKey="breached" name="Breached" stroke="var(--accountability-red)" strokeWidth={2} fill="url(#gBreached)" dot={false} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-xs text-muted-foreground italic">Insufficient trend data.</div>
                            )}
                        </div>
                    </div>

                    <div className="glass rounded-2xl p-6">
                        <div className="mb-6">
                            <h2 className="font-display font-semibold text-base">Category Hot-Zones</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">Complaint volume by type</p>
                        </div>
                        <div className="h-[240px] w-full">
                            {categoryData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%" debounce={50}>
                                    <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }} width={100} />
                                        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                                        <Bar dataKey="count" name="Complaints" radius={[0, 4, 4, 0]}>
                                            {categoryData.map((_, index) => <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-xs text-muted-foreground italic">No category data discovered.</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="text-center py-6 text-xs text-muted-foreground/50 space-y-1">
                    <p>All data is sourced directly from citizen-submitted complaints on the JanMitra platform.</p>
                    <p>Private complaints are fully anonymized. No personal data is ever shown locally or globally.</p>
                </div>

            </main>
        </div>
    );
}
