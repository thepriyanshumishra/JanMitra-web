"use client";

import { useEffect, useState, useCallback } from "react";
import { db } from "@/lib/firebase";
import { LocalStorage } from "@/lib/storage";
import { Loader2, TrendingUp, TrendingDown, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts";

interface Grievance {
    id: string;
    category: string;
    status: string;
    slaStatus: string;
    slaDeadlineAt: string;
    createdAt: string;
    updatedAt: string;
}

const SLA_COLORS = {
    on_track: "var(--trust-green)",
    at_risk: "#f59e0b",
    breached: "var(--accountability-red)",
};

const CATEGORY_COLORS = [
    "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6",
    "#ef4444", "#06b6d4", "#f97316", "#84cc16",
];

function StatCard({
    label, value, icon, sub, color
}: { label: string; value: string | number; icon: React.ReactNode; sub?: string; color: string }) {
    return (
        <div className="glass rounded-xl p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
            <div>
                <p className="text-2xl font-display font-bold">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
                {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

export default function DeptAdminAnalyticsPage() {
    const [grievances, setGrievances] = useState<Grievance[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastRefreshed, setLastRefreshed] = useState<string>("");

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const data = LocalStorage.getAllGrievances();
            setGrievances(data as unknown as Grievance[]);
            setLastRefreshed(new Date().toLocaleTimeString());
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--civic-amber)]" />
        </div>
    );

    // ── Derived metrics ──────────────────────────────────────────
    const total = grievances.length;
    const breached = grievances.filter((g) => g.slaStatus === "breached").length;
    const atRisk = grievances.filter((g) => g.slaStatus === "at_risk").length;
    const resolved = grievances.filter((g) => g.status === "closed").length;
    const breachRate = total > 0 ? Math.round((breached / total) * 100) : 0;

    // SLA bar data (last 4 weeks)
    const slaBarData = (() => {
        const weeks: Record<string, { name: string; on_track: number; at_risk: number; breached: number }> = {};
        grievances.forEach((g) => {
            const d = new Date(g.createdAt);
            const week = `W${Math.ceil(d.getDate() / 7)}, ${d.toLocaleString("default", { month: "short" })}`;
            if (!weeks[week]) weeks[week] = { name: week, on_track: 0, at_risk: 0, breached: 0 };
            weeks[week][g.slaStatus as keyof typeof SLA_COLORS] = (weeks[week][g.slaStatus as keyof typeof SLA_COLORS] ?? 0) + 1;
        });
        return Object.values(weeks).slice(-4);
    })();

    // Daily volume (last 14 days)
    const volumeData = (() => {
        const days: Record<string, number> = {};
        const today = new Date();
        for (let i = 13; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const key = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
            days[key] = 0;
        }
        grievances.forEach((g) => {
            const key = new Date(g.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
            if (key in days) days[key]++;
        });
        return Object.entries(days).map(([name, count]) => ({ name, count }));
    })();

    // Category breakdown
    const catData = (() => {
        const cats: Record<string, number> = {};
        grievances.forEach((g) => { cats[g.category] = (cats[g.category] ?? 0) + 1; });
        return Object.entries(cats)
            .sort((a, b) => b[1] - a[1])
            .map(([name, value]) => ({ name, value }));
    })();

    const tooltipStyle = {
        backgroundColor: "hsl(230 25% 12%)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "8px",
        color: "#fff",
        fontSize: "12px",
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold">Department Analytics</h1>
                    <p className="text-muted-foreground text-sm mt-0.5">
                        Complaint performance and SLA health snapshot
                        {lastRefreshed && <span className="ml-2 text-[10px] text-muted-foreground/50">· refreshed {lastRefreshed}</span>}
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl glass border border-white/10 text-muted-foreground hover:text-white transition-colors disabled:opacity-50"
                >
                    <TrendingUp className="w-3.5 h-3.5" />
                    Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard
                    label="Total Complaints"
                    value={total}
                    icon={<TrendingUp className="w-5 h-5 text-[var(--civic-amber)]" />}
                    color="bg-[var(--civic-amber-muted)]"
                />
                <StatCard
                    label="Resolved"
                    value={resolved}
                    sub={total > 0 ? `${Math.round((resolved / total) * 100)}% resolution rate` : ""}
                    icon={<CheckCircle2 className="w-5 h-5 text-[var(--trust-green)]" />}
                    color="bg-[var(--trust-green-muted)]"
                />
                <StatCard
                    label="At Risk"
                    value={atRisk}
                    icon={<Clock className="w-5 h-5 text-yellow-400" />}
                    color="bg-yellow-500/10"
                />
                <StatCard
                    label="SLA Breach Rate"
                    value={`${breachRate}%`}
                    sub={`${breached} breached`}
                    icon={<AlertTriangle className="w-5 h-5 text-[var(--accountability-red)]" />}
                    color="bg-[var(--accountability-red-muted)]"
                />
            </div>

            {/* Charts row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SLA Honesty Bar */}
                <div className="glass rounded-2xl p-6 space-y-4">
                    <h2 className="text-sm font-display font-semibold">SLA Honesty by Week</h2>
                    {slaBarData.length === 0 ? (
                        <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">No data yet</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={slaBarData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
                                <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Bar dataKey="on_track" name="On Track" fill={SLA_COLORS.on_track} radius={[3, 3, 0, 0]} />
                                <Bar dataKey="at_risk" name="At Risk" fill={SLA_COLORS.at_risk} radius={[3, 3, 0, 0]} />
                                <Bar dataKey="breached" name="Breached" fill={SLA_COLORS.breached} radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Category Pie */}
                <div className="glass rounded-2xl p-6 space-y-4">
                    <h2 className="text-sm font-display font-semibold">Complaints by Category</h2>
                    {catData.length === 0 ? (
                        <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">No data yet</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={catData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={72}
                                    innerRadius={40}
                                    dataKey="value"
                                    paddingAngle={3}
                                >
                                    {catData.map((_, i) => (
                                        <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={tooltipStyle} />
                                <Legend
                                    iconSize={8}
                                    wrapperStyle={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Volume Sparkline */}
            <div className="glass rounded-2xl p-6 space-y-4">
                <h2 className="text-sm font-display font-semibold">Daily Complaint Volume (last 14 days)</h2>
                <ResponsiveContainer width="100%" height={140}>
                    <LineChart data={volumeData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis
                            dataKey="name"
                            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
                            interval={2}
                        />
                        <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} allowDecimals={false} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Line
                            type="monotone"
                            dataKey="count"
                            name="Complaints"
                            stroke="var(--civic-amber)"
                            strokeWidth={2}
                            dot={{ fill: "var(--civic-amber)", r: 3 }}
                            activeDot={{ r: 5 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Top categories table */}
            <div className="glass rounded-2xl p-6 space-y-4">
                <h2 className="text-sm font-display font-semibold">Category Breakdown</h2>
                <div className="space-y-2">
                    {catData.slice(0, 6).map((cat, i) => (
                        <div key={cat.name} className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                            <span className="text-sm flex-1 truncate">{cat.name}</span>
                            <span className="text-sm font-mono font-medium text-muted-foreground">{cat.value}</span>
                            <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                                        width: `${Math.round((cat.value / (catData[0]?.value || 1)) * 100)}%`
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
