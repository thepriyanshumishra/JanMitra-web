"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { LocalStorage } from "@/lib/storage";
import {
    FileText,
    Plus,
    Clock,
    CheckCircle2,
    AlertTriangle,
    ArrowRight,
    Loader2,
    TrendingUp,
    PenLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useRequireAuth } from "@/hooks/useAuth";
import type { SLAStatus } from "@/types";

// ─── Types ────────────────────────────────────────────────────────
interface Complaint {
    id: string;
    title: string;
    category: string;
    status: string;
    slaStatus: SLAStatus;
    slaDeadlineAt: string;
    department?: string;
    createdAt: string;
    updatedAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────
function getSlaPercent(slaDeadlineAt: string): number {
    const deadline = new Date(slaDeadlineAt).getTime();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const created = deadline - sevenDays;
    const elapsed = now - created;
    return Math.min(Math.round((elapsed / sevenDays) * 100), 100);
}

function timeAgo(iso: string): string {
    const ms = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(ms / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

// ─── SLA badge config ─────────────────────────────────────────────
const SLA_BADGE: Record<SLAStatus, { label: string; className: string; icon: React.ReactNode }> = {
    on_track: { label: "On Track", className: "sla-on-track", icon: <CheckCircle2 className="w-3 h-3" /> },
    at_risk: { label: "At Risk", className: "sla-at-risk", icon: <Clock className="w-3 h-3" /> },
    breached: { label: "SLA Breached", className: "sla-breached", icon: <AlertTriangle className="w-3 h-3" /> },
};

const STATUS_LABEL: Record<string, string> = {
    submitted: "Submitted", routed: "Routed", assigned: "Assigned",
    acknowledged: "Acknowledged", in_progress: "In Progress",
    escalated: "Escalated", closed: "Resolved", reopened: "Reopened",
};

// ─── Card ─────────────────────────────────────────────────────────
function ComplaintCard({ complaint }: { complaint: Complaint }) {
    const sla = SLA_BADGE[complaint.slaStatus] ?? SLA_BADGE.on_track;
    const slaPercent = getSlaPercent(complaint.slaDeadlineAt);
    const isBreached = complaint.slaStatus === "breached";

    return (
        <Link
            href={`/complaints/${complaint.id}`}
            className="block glass rounded-xl p-5 hover:bg-white/[0.06] transition-all duration-200 group"
        >
            <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono text-muted-foreground">{complaint.id}</span>
                        <Badge variant="outline" className="text-[10px] border-white/10 text-muted-foreground">
                            {complaint.category}
                        </Badge>
                    </div>
                    <p className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-[var(--civic-amber)] transition-colors">
                        {complaint.title}
                    </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-[var(--civic-amber)] group-hover:translate-x-1 transition-all" />
            </div>

            <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${sla.className}`}>
                    {sla.icon} {sla.label}
                </span>
                <Badge variant="secondary" className="text-[10px] bg-white/5 text-muted-foreground border-0">
                    {STATUS_LABEL[complaint.status] ?? complaint.status}
                </Badge>
                {complaint.department && (
                    <span className="text-xs text-muted-foreground ml-auto">{complaint.department}</span>
                )}
            </div>

            {complaint.status !== "closed" && (
                <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>SLA Usage</span>
                        <span className={isBreached ? "text-[var(--accountability-red)]" : ""}>{slaPercent}%</span>
                    </div>
                    <Progress
                        value={Math.min(slaPercent, 100)}
                        className="h-1.5 bg-white/10"
                        style={{
                            "--progress-indicator-color":
                                complaint.slaStatus === "on_track"
                                    ? "var(--trust-green)"
                                    : complaint.slaStatus === "at_risk"
                                        ? "var(--warning-yellow)"
                                        : "var(--accountability-red)",
                        } as React.CSSProperties}
                    />
                </div>
            )}

            <div className="mt-2 text-[10px] text-muted-foreground">
                Last update: {timeAgo(complaint.updatedAt)}
            </div>
        </Link>
    );
}

// ─── Page ─────────────────────────────────────────────────────────
export default function CitizenDashboard() {
    const { user, loading: authLoading } = useRequireAuth();
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;

        // Fetch from LocalStorage
        const localComplaints = LocalStorage.getGrievancesByCitizen(user.id);
        setComplaints(localComplaints as unknown as Complaint[]);

        // Also check server for updates if DB is available (background sync)
        // For hackathon, LocalStorage is the primary source of truth
        setDataLoading(false);
    }, [user?.id]);

    if (authLoading || !user) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--civic-amber)]" />
            </div>
        );
    }

    const activeCount = complaints.filter(c => c.status !== "closed").length;
    const breachedCount = complaints.filter(c => c.slaStatus === "breached").length;
    const resolvedCount = complaints.filter(c => c.status === "closed").length;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold">
                        Welcome back, {user.name?.split(" ")[0]} 👋
                    </h1>
                    <p className="text-muted-foreground text-sm mt-0.5">
                        {"Here's the status of your complaints"}
                    </p>
                </div>
                <Link href="/submit">
                    <Button className="bg-[var(--civic-amber)] text-[var(--navy-deep)] hover:bg-[var(--civic-amber)]/90 font-bold glow-amber gap-2">
                        <Plus className="w-4 h-4" />
                        New Complaint
                    </Button>
                </Link>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    {
                        label: "Active",
                        value: dataLoading ? "—" : activeCount,
                        icon: <FileText className="w-4 h-4" />,
                        color: "text-[var(--civic-amber)]",
                        bg: "bg-[var(--civic-amber-muted)]",
                    },
                    {
                        label: "SLA Breached",
                        value: dataLoading ? "—" : breachedCount,
                        icon: <AlertTriangle className="w-4 h-4" />,
                        color: "text-[var(--accountability-red)]",
                        bg: "bg-[var(--accountability-red-muted)]",
                    },
                    {
                        label: "Resolved",
                        value: dataLoading ? "—" : resolvedCount,
                        icon: <TrendingUp className="w-4 h-4" />,
                        color: "text-[var(--trust-green)]",
                        bg: "bg-[var(--trust-green-muted)]",
                    },
                ].map((stat) => (
                    <div key={stat.label} className="glass rounded-xl p-4 flex items-center gap-3">
                        <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color} shrink-0`}>
                            {stat.icon}
                        </div>
                        <div>
                            <div className={`text-2xl font-display font-bold ${stat.color}`}>{stat.value}</div>
                            <div className="text-xs text-muted-foreground">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Complaints list */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-display font-semibold">Your Complaints</h2>
                    <Link href="/complaints" className="text-xs text-[var(--civic-amber)] hover:underline flex items-center gap-1">
                        View all <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>

                {dataLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-5 h-5 animate-spin text-[var(--civic-amber)]" />
                    </div>
                ) : complaints.length === 0 ? (
                    <div className="glass rounded-xl p-10 text-center space-y-4">
                        <PenLine className="w-10 h-10 mx-auto text-[var(--civic-amber)] opacity-40" />
                        <div>
                            <p className="text-sm font-semibold">No complaints filed yet</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                File your first complaint to get started — it takes less than 2 minutes.
                            </p>
                        </div>
                        <Link href="/submit">
                            <Button className="bg-[var(--civic-amber)] text-[var(--navy-deep)] font-bold gap-2 mt-2">
                                <Plus className="w-4 h-4" /> File a Complaint
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {complaints.slice(0, 10).map((c) => (
                            <ComplaintCard key={c.id} complaint={c} />
                        ))}
                        {complaints.length > 10 && (
                            <Link href="/complaints" className="block text-center text-xs text-[var(--civic-amber)] hover:underline pt-1">
                                View all {complaints.length} complaints →
                            </Link>
                        )}
                    </div>
                )}
            </div>

            {/* Transparency nudge */}
            <div className="glass rounded-xl p-5 flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold">See how your area is performing</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Check department SLA scores and area heatmaps on the public dashboard
                    </p>
                </div>
                <Link href="/transparency" className="shrink-0">
                    <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5 gap-2">
                        <TrendingUp className="w-3.5 h-3.5" /> Transparency
                    </Button>
                </Link>
            </div>
        </div>
    );
}
