"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
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

const CATEGORY_COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#ef4444", "#06b6d4"];

const DEPT_DATA = [
    { name: "Water Supply", score: 92, trend: "+4%", icon: "💧" },
    { name: "Electricity", score: 88, trend: "+1%", icon: "⚡" },
    { name: "Sanitation", score: 76, trend: "-2%", icon: "🧹" },
    { name: "Roads & Traffic", score: 54, trend: "+8%", icon: "🛣️" },
    { name: "Public Parks", score: 42, trend: "-3%", icon: "🌳" },
];

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

    useEffect(() => {
        if (!db) { setLoading(false); return; }
        const q = query(collection(db, "grievances"), orderBy("createdAt", "desc"));
        return onSnapshot(q, (snap) => {
            setComplaints(snap.docs.map(d => ({ id: d.id, ...d.data() } as Grievance)));
            setLoading(false);
        });
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-mesh flex flex-col items-center justify-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[var(--civic-amber)] flex items-center justify-center glow-amber animate-pulse">
                <Activity className="w-7 h-7 text-[var(--navy-deep)]" />
            </div>
            <p className="text-sm text-muted-foreground">Loading city data…</p>
        </div>
    );

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

            {/* Hero section */}
            <section className="pt-32 pb-12 px-4 max-w-7xl mx-auto text-center space-y-5 relative">
                {/* Ambient glow */}
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

                {/* ── KPI Strip ── */}
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
                            label: "Avg Response",
                            value: "3.2 days",
                            sub: "30-day average",
                            icon: <Clock className="w-5 h-5" />,
                            color: "text-purple-400",
                            bg: "bg-purple-500/10",
                        },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="glass rounded-2xl p-5 flex flex-col gap-3 hover:bg-white/5 transition-colors group"
                        >
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

                {/* ── Governance Health Banner ── */}
                <div
                    className="glass rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 border"
                    style={{ borderColor: `${healthColor}30` }}
                >
                    <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${healthColor}15` }}
                    >
                        {breachRate > 30
                            ? <ShieldAlert className="w-7 h-7" style={{ color: healthColor }} />
                            : breachRate > 15
                                ? <AlertTriangle className="w-7 h-7" style={{ color: healthColor }} />
                                : <Zap className="w-7 h-7" style={{ color: healthColor }} />
                        }
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="font-display font-bold text-xl" style={{ color: healthColor }}>
                                Governance Status: {healthState}
                            </h2>
                            <span
                                className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                                style={{ backgroundColor: `${healthColor}20`, color: healthColor }}
                            >
                                {breachRate}% breach rate
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {breachRate > 30
                                ? `High volume of unresolved SLA breaches detected. ${breached} active violations indicate systemic strain.`
                                : breachRate > 15
                                    ? `Moderate SLA stress detected. ${atRisk} complaints are at risk of breaching their deadline.`
                                    : `All departments operating within acceptable SLA bounds. ${onTrack} complaints on track for timely resolution.`
                            }
                        </p>
                    </div>
                    {/* Mini SLA bar */}
                    <div className="w-full sm:w-48 shrink-0 space-y-1.5">
                        <div className="flex justify-between text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                            <span>On Track</span>
                            <span>{total > 0 ? Math.round((onTrack / total) * 100) : 0}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-1000"
                                style={{
                                    width: total > 0 ? `${Math.round((onTrack / total) * 100)}%` : "0%",
                                    backgroundColor: "var(--trust-green)"
                                }}
                            />
                        </div>
                        <div className="flex gap-3 text-[9px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--trust-green)]" />On Track
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accountability-red)]" />Breached
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />At Risk
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Map & Leaderboard ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Heatmap */}
                    <div className="lg:col-span-2 glass rounded-2xl p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="font-display font-bold text-lg flex items-center gap-2">
                                    <MapIcon className="w-5 h-5 text-[var(--civic-amber)]" />
                                    Civic Issue Hotspots
                                </h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Showing {complaints.filter(c => c.privacyLevel === "public").length} public incidents. Private reports are anonymized.
                                </p>
                            </div>
                            <div className="flex gap-3 text-[10px] text-muted-foreground">
                                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400" />On Track</span>
                                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" />At Risk</span>
                                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400" />Breached</span>
                            </div>
                        </div>
                        <div className="flex-1 min-h-[380px] rounded-xl overflow-hidden">
                            <ComplaintHeatmap complaints={complaints} />
                        </div>
                    </div>

                    {/* Dept Leaderboard */}
                    <div className="glass rounded-2xl p-6 flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                            <Trophy className="w-5 h-5 text-[var(--civic-amber)]" />
                            <h2 className="font-display font-bold text-lg">Dept. Leaderboard</h2>
                        </div>
                        <p className="text-xs text-muted-foreground mb-6">Ranked by SLA honesty score</p>

                        <div className="space-y-3 flex-1">
                            {DEPT_DATA.map((dept, i) => {
                                const rankColors = [
                                    "bg-yellow-400/15 text-yellow-400 border-yellow-400/20",
                                    "bg-slate-300/10 text-slate-300 border-slate-300/20",
                                    "bg-amber-700/15 text-amber-600 border-amber-600/20",
                                ];
                                const barColor = dept.score >= 80 ? "var(--trust-green)" : dept.score >= 60 ? "#f59e0b" : "var(--accountability-red)";
                                const trendPositive = dept.trend.startsWith("+");

                                return (
                                    <div key={dept.name} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-colors group">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold border shrink-0 ${rankColors[i] ?? "bg-white/5 text-muted-foreground border-white/10"}`}>
                                            {dept.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <p className="text-sm font-semibold truncate">{dept.name}</p>
                                                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                                    <span className="text-sm font-black font-mono">{dept.score}%</span>
                                                    <span className={`text-[9px] font-bold ${trendPositive ? "text-green-400" : "text-red-400"}`}>
                                                        {dept.trend}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-1000"
                                                    style={{ width: `${dept.score}%`, backgroundColor: barColor }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-muted-foreground">
                            <span>Updated daily · City-level SLA data</span>
                            <TrendingUp className="w-4 h-4 text-[var(--civic-amber)]" />
                        </div>
                    </div>
                </div>

                {/* ── Charts Row ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* SLA Trend */}
                    <div className="glass rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="font-display font-semibold text-base">City SLA Trend — 14 Days</h2>
                                <p className="text-xs text-muted-foreground mt-0.5">Daily complaint flow vs. SLA breaches</p>
                            </div>
                            <div className="flex gap-3 text-[10px] text-muted-foreground">
                                <span className="flex items-center gap-1.5"><span className="w-2 h-1 rounded-full bg-[var(--trust-green)] block" />On Track</span>
                                <span className="flex items-center gap-1.5"><span className="w-2 h-1 rounded-full bg-[var(--accountability-red)] block" />Breached</span>
                            </div>
                        </div>
                        {trendData.length > 0 ? (
                            <div className="h-[240px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--trust-green)" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="var(--trust-green)" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="gradRed" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--accountability-red)" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="var(--accountability-red)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "rgba(255,255,255,0.1)" }} />
                                        <Area type="monotone" dataKey="on_track" name="On Track" stroke="var(--trust-green)" strokeWidth={2} fill="url(#gradGreen)" dot={false} />
                                        <Area type="monotone" dataKey="breached" name="Breached" stroke="var(--accountability-red)" strokeWidth={2} fill="url(#gradRed)" dot={false} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">
                                No data yet — will populate as complaints come in.
                            </div>
                        )}
                    </div>

                    {/* Category Breakdown */}
                    <div className="glass rounded-2xl p-6">
                        <div className="mb-6">
                            <h2 className="font-display font-semibold text-base">Top Issue Categories</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">Volume of complaints by department area</p>
                        </div>
                        {categoryData.length > 0 ? (
                            <div className="h-[240px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }}
                                            width={110}
                                        />
                                        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                                        <Bar dataKey="count" name="Complaints" radius={[0, 6, 6, 0]}>
                                            {categoryData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">
                                No complaints filed yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Footer note ── */}
                <div className="text-center py-6 text-xs text-muted-foreground/50 space-y-1">
                    <p>All data is sourced directly from citizen-submitted complaints on the JanMitra platform.</p>
                    <p>Private complaints are fully anonymized. No personal data is ever shown.</p>
                </div>

            </main>
        </div>
    );
}
