"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { LocalStorage } from "@/lib/storage";
import {
    Loader2, AlertTriangle, Clock, CheckCircle2,
    Filter, ChevronRight, Inbox
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SLACountdown } from "@/components/grievance/SLACountdown";
import { useAuth } from "@/features/auth/AuthProvider";

interface QueueItem {
    id: string;
    category: string;
    title: string;
    status: string;
    slaStatus: string;
    slaDeadlineAt: string;
    privacyLevel: string;
    citizenId: string;
    createdAt: string;
    updatedAt: string;
}

const SLA_SORT = { breached: 0, at_risk: 1, on_track: 2 };
const SLA_BADGE = {
    breached: { label: "Breached", icon: <AlertTriangle className="w-3 h-3" />, cls: "bg-[var(--accountability-red-muted)] text-[var(--accountability-red)]" },
    at_risk: { label: "At Risk", icon: <Clock className="w-3 h-3" />, cls: "bg-yellow-500/10 text-yellow-400" },
    on_track: { label: "On Track", icon: <CheckCircle2 className="w-3 h-3" />, cls: "bg-[var(--trust-green-muted)] text-[var(--trust-green)]" },
};

const STATUS_TABS = [
    { key: "all", label: "All" },
    { key: "submitted", label: "Unacknowledged" },
    { key: "escalated", label: "Escalated" },
    { key: "in_progress", label: "In Progress" },
];

export default function OfficerQueuePage() {
    const { user } = useAuth();
    const [items, setItems] = useState<QueueItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("all");

    useEffect(() => {
        // Fetch from LocalStorage
        const data = LocalStorage.getAllGrievances().filter(g => g.status !== "closed") as unknown as QueueItem[];

        // Sort by SLA urgency
        data.sort((a, b) =>
            (SLA_SORT[a.slaStatus as keyof typeof SLA_SORT] ?? 3) -
            (SLA_SORT[b.slaStatus as keyof typeof SLA_SORT] ?? 3)
        );
        setItems(data);
        setLoading(false);
    }, []);

    const filtered = items.filter((g) => {
        if (tab === "all") return true;
        return g.status === tab;
    });

    const counts = {
        all: items.length,
        submitted: items.filter((g) => g.status === "submitted").length,
        escalated: items.filter((g) => g.status === "escalated").length,
        in_progress: items.filter((g) => g.status === "in_progress").length,
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-display font-bold">Complaints Queue</h1>
                <p className="text-muted-foreground text-sm mt-0.5">
                    Sorted by SLA urgency — breached complaints appear first
                </p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-white/10 pb-0">
                {STATUS_TABS.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 -mb-px ${tab === t.key
                            ? "border-[var(--civic-amber)] text-[var(--civic-amber)]"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {t.label}
                        <span className="text-[10px] font-bold bg-white/10 rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                            {counts[t.key as keyof typeof counts]}
                        </span>
                    </button>
                ))}
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="glass rounded-2xl py-16 text-center space-y-3">
                    <Inbox className="w-10 h-10 text-muted-foreground/40 mx-auto" />
                    <p className="text-sm text-muted-foreground">Queue is empty for this filter.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((g) => {
                        const sla = SLA_BADGE[g.slaStatus as keyof typeof SLA_BADGE] ?? SLA_BADGE.on_track;
                        return (
                            <Link
                                key={g.id}
                                href={`/officer/complaints/${g.id}`}
                                className="block glass rounded-xl p-5 hover:bg-white/[0.06] transition-all group"
                            >
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className="text-xs font-mono text-muted-foreground">{g.id}</span>
                                            <Badge variant="outline" className="text-[10px] border-white/10 text-muted-foreground">
                                                {g.category}
                                            </Badge>
                                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${sla.cls}`}>
                                                {sla.icon} {sla.label}
                                            </span>
                                            {g.privacyLevel === "private" && (
                                                <Badge variant="outline" className="text-[10px] border-white/10 text-muted-foreground">
                                                    Private
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm font-medium line-clamp-1 group-hover:text-[var(--civic-amber)] transition-colors">
                                            {g.privacyLevel === "private" ? "[Private Complaint]" : g.title}
                                        </p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-[var(--civic-amber)] group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                                </div>

                                <SLACountdown slaDeadlineAt={g.slaDeadlineAt} compact />

                                <p className="text-[10px] text-muted-foreground mt-3">
                                    Filed {new Date(g.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                    {" · "}Updated {new Date(g.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                </p>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
