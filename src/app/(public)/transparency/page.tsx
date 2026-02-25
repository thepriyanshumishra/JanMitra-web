"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Activity, Map as MapIcon, ShieldAlert, Tally3 } from "lucide-react";
import { AppNavbar } from "@/components/shared/AppNavbar";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from "recharts";

// Dynamically import Leaflet map to avoid SSR 'window is not defined' error
const ComplaintHeatmap = dynamic(
    () => import("@/components/transparency/ComplaintHeatmap"),
    { ssr: false, loading: () => <div className="h-[400px] glass rounded-2xl flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div> }
);

interface Grievance {
    id: string;
    category: string;
    status: string;
    slaStatus: string;
    privacyLevel: string;
    createdAt: string;
}

const CATEGORY_COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#ef4444", "#06b6d4"];

export default function TransparencyDashboard() {
    const [complaints, setComplaints] = useState<Grievance[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!db) return;
        const q = query(collection(db, "grievances"), orderBy("createdAt", "desc"));
        return onSnapshot(q, (snap) => {
            setComplaints(snap.docs.map(d => ({ id: d.id, ...d.data() } as Grievance)));
            setLoading(false);
        });
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--civic-amber)]" />
        </div>
    );

    // ── Metrics ──
    const total = complaints.length;
    const breached = complaints.filter(c => c.slaStatus === "breached").length;
    const breachRate = total > 0 ? (breached / total) : 0;

    let healthState = "Stable";
    let healthColor = "text-[var(--trust-green)] glow-green";
    let healthIcon = <Activity className="w-6 h-6" />;

    if (breachRate > 0.3) {
        healthState = "Critical Strain";
        healthColor = "text-[var(--accountability-red)] glow-red";
        healthIcon = <ShieldAlert className="w-6 h-6" />;
    } else if (breachRate > 0.15) {
        healthState = "Under Strain";
        healthColor = "text-yellow-400 glow-amber";
        healthIcon = <Tally3 className="w-6 h-6" />;
    }

    // ── Charts Data ──
    const trendData = (() => {
        const days: Record<string, { name: string, on_track: number, breached: number }> = {};
        [...complaints].reverse().forEach(c => {
            const date = new Date(c.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
            if (!days[date]) days[date] = { name: date, on_track: 0, breached: 0 };
            if (c.slaStatus === "breached") days[date].breached++;
            else days[date].on_track++;
        });
        return Object.values(days).slice(-14); // last 14 days
    })();

    const categoryData = (() => {
        const cats: Record<string, number> = {};
        complaints.forEach(c => { cats[c.category] = (cats[c.category] || 0) + 1; });
        return Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, count]) => ({ name, count }));
    })();

    const tooltipStyle = {
        backgroundColor: "hsl(230 25% 12%)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "8px",
        color: "#fff",
        fontSize: "12px",
    };

    return (
        <div className="min-h-screen bg-background">
            <AppNavbar />

            <main className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 pb-16 space-y-8 animate-in fade-in duration-500">

                {/* Header */}
                <div className="text-center max-w-2xl mx-auto space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium">
                        <Activity className="w-4 h-4 text-[var(--civic-amber)]" />
                        Live City Diagnostics
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-tight">
                        Public <span className="text-gradient-amber">Transparency</span> Layer
                    </h1>
                    <p className="text-muted-foreground">
                        Holding government accountable through open data. Every citizen complaint and department SLA is visible here.
                    </p>
                </div>

                {/* Top Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                    {/* Governance Health */}
                    <div className="glass-strong rounded-2xl p-6 relative overflow-hidden group">
                        <div className="absolute -inset-1 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <h2 className="text-sm font-display font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Governance Health</h2>
                        <div className={`flex items-center gap-4 ${healthColor}`}>
                            <div className="p-4 rounded-2xl bg-current/10 bg-blend-overlay">
                                {healthIcon}
                            </div>
                            <div>
                                <p className="text-3xl font-display font-bold">{healthState}</p>
                                <p className="text-sm opacity-80 mt-1">Based on {Math.round(breachRate * 100)}% active breach rate</p>
                            </div>
                        </div>
                    </div>

                    {/* Alerts Marquee */}
                    <div className="glass rounded-2xl p-6 md:col-span-2 flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[var(--civic-amber)]" />
                        <h2 className="text-sm font-display font-semibold mb-3 flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-[var(--civic-amber)]" />
                            AI Watchdog Alerts
                        </h2>
                        <div className="space-y-3">
                            {breached > 5 ? (
                                <div className="text-sm bg-[var(--accountability-red-muted)] text-[var(--accountability-red)] px-4 py-2.5 rounded-lg border border-[var(--accountability-red)]/20 animate-pulse">
                                    <strong>Pattern Detected:</strong> High volume of unresolved SLA breaches ({breached} violations). Standard escalation protocols engaged automatically.
                                </div>
                            ) : null}
                            <div className="text-sm bg-white/5 px-4 py-2.5 rounded-lg border border-white/10 text-muted-foreground">
                                <strong>System Note:</strong> All departments are currently responding to {total} open civic issues across the municipality.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map & Leaderboard Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Public Heatmap */}
                    <div className="lg:col-span-2 glass rounded-2xl p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-display font-bold flex items-center gap-2">
                                    <MapIcon className="w-5 h-5 text-[var(--civic-amber)]" /> Civic Issue Hotspots
                                </h2>
                                <p className="text-xs text-muted-foreground mt-1">Showing public incidents. Private reports are anonymized.</p>
                            </div>
                        </div>
                        <div className="flex-1 min-h-[400px]">
                            <ComplaintHeatmap complaints={complaints} />
                        </div>
                    </div>

                    {/* Dept Leaderboard (Mocked since we aren't joining collections in MVP) */}
                    <div className="glass rounded-2xl p-6 flex flex-col">
                        <h2 className="text-lg font-display font-bold mb-1">Department Leaderboard</h2>
                        <p className="text-xs text-muted-foreground mb-6">Ranked by SLA resolution speed</p>

                        <div className="space-y-4 flex-1">
                            {[
                                { name: "Water Supply", score: 92, rank: 1 },
                                { name: "Electricity", score: 88, rank: 2 },
                                { name: "Sanitation", score: 76, rank: 3 },
                                { name: "Roads & Traffic", score: 54, rank: 4 },
                                { name: "Public Parks", score: 42, rank: 5 },
                            ].map((dept) => (
                                <div key={dept.name} className="flex items-center gap-4 bg-white/[0.02] p-3 rounded-xl border border-white/5 hover:bg-white/5 transition-colors">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${dept.rank === 1 ? 'bg-yellow-500/20 text-yellow-500' :
                                            dept.rank === 2 ? 'bg-gray-300/20 text-gray-300' :
                                                dept.rank === 3 ? 'bg-amber-700/20 text-amber-600' : 'bg-white/5'
                                        }`}>
                                        #{dept.rank}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{dept.name}</p>
                                        <div className="w-full h-1.5 bg-white/10 rounded-full mt-1.5 overflow-hidden">
                                            <div className="h-full bg-[var(--trust-green)]" style={{ width: `${dept.score}%` }} />
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold font-mono">{dept.score}%</p>
                                        <p className="text-[9px] text-muted-foreground uppercase">Honesty</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* SLA Trend Line */}
                    <div className="glass rounded-2xl p-6">
                        <h2 className="text-sm font-display font-semibold mb-6">City SLA Adherence (14 Days)</h2>
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                    <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
                                    <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Line type="monotone" dataKey="on_track" name="On Track" stroke="var(--trust-green)" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="breached" name="Breached" stroke="var(--accountability-red)" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Issue Categories */}
                    <div className="glass rounded-2xl p-6">
                        <h2 className="text-sm font-display font-semibold mb-6">Top Issue Categories</h2>
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 0, left: 16, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.06)" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 11 }} width={100} />
                                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
                                    <Bar dataKey="count" name="Incidents" radius={[0, 4, 4, 0]}>
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
