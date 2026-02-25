"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
    Plus, Filter, ChevronRight, Loader2, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SLACountdown } from "@/components/grievance/SLACountdown";
import { useAuth } from "@/features/auth/AuthProvider";
import { useRequireAuth } from "@/hooks/useAuth";

interface Grievance {
    id: string;
    category: string;
    title: string;
    status: string;
    slaStatus: string;
    slaDeadlineAt: string;
    createdAt: string;
    updatedAt: string;
    supportCount: number;
}

const STATUS_LABEL: Record<string, string> = {
    submitted: "Submitted",
    routed: "Routed",
    assigned: "Assigned",
    acknowledged: "Acknowledged",
    in_progress: "In Progress",
    escalated: "Escalated",
    closed: "Resolved",
    reopened: "Reopened",
};

const STATUS_COLOR: Record<string, string> = {
    submitted: "bg-[var(--civic-amber-muted)] text-[var(--civic-amber)]",
    routed: "bg-blue-500/10 text-blue-400",
    assigned: "bg-purple-500/10 text-purple-400",
    acknowledged: "bg-[var(--trust-green-muted)] text-[var(--trust-green)]",
    in_progress: "bg-sky-500/10 text-sky-400",
    escalated: "bg-[var(--accountability-red-muted)] text-[var(--accountability-red)]",
    closed: "bg-[var(--trust-green-muted)] text-[var(--trust-green)]",
    reopened: "bg-orange-500/10 text-orange-400",
};

const ALL_STATUSES = ["submitted", "routed", "assigned", "acknowledged", "in_progress", "escalated", "closed", "reopened"];

export default function ComplaintsListPage() {
    const { user } = useAuth();
    const { loading: authLoading } = useRequireAuth();
    const [grievances, setGrievances] = useState<Grievance[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const [slaFilter, setSlaFilter] = useState<string[]>([]);

    useEffect(() => {
        if (!db || !user) return;
        const q = query(
            collection(db, "grievances"),
            where("citizenId", "==", user.id),
            orderBy("createdAt", "desc")
        );
        const unsub = onSnapshot(q, (snap) => {
            setGrievances(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Grievance)));
            setLoading(false);
        });
        return () => unsub();
    }, [user]);

    const filtered = grievances.filter((g) => {
        const matchSearch =
            !search ||
            g.title.toLowerCase().includes(search.toLowerCase()) ||
            g.id.toLowerCase().includes(search.toLowerCase()) ||
            g.category.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter.length === 0 || statusFilter.includes(g.status);
        const matchSla = slaFilter.length === 0 || slaFilter.includes(g.slaStatus);
        return matchSearch && matchStatus && matchSla;
    });

    const activeFilters = statusFilter.length + slaFilter.length;

    if (authLoading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--civic-amber)]" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold">My Complaints</h1>
                    <p className="text-muted-foreground text-sm mt-0.5">
                        {filtered.length} of {grievances.length} complaints
                    </p>
                </div>
                <Link href="/submit">
                    <Button className="bg-[var(--civic-amber)] text-[var(--navy-deep)] hover:bg-[var(--civic-amber)]/90 font-bold glow-amber gap-2">
                        <Plus className="w-4 h-4" /> New
                    </Button>
                </Link>
            </div>

            {/* Search + Filter */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by title, ID, or category…"
                        className="pl-10 bg-white/5 border-white/10 focus:border-[var(--civic-amber)]/50"
                    />
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="border-white/10 hover:bg-white/5 gap-2 shrink-0">
                            <Filter className="w-4 h-4" />
                            Filter
                            {activeFilters > 0 && (
                                <Badge className="ml-1 bg-[var(--civic-amber)] text-[var(--navy-deep)] text-[10px] font-bold h-4 px-1.5 border-0">
                                    {activeFilters}
                                </Badge>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 bg-[var(--card)] border-white/10">
                        <DropdownMenuLabel className="text-xs">Status</DropdownMenuLabel>
                        {ALL_STATUSES.map((s) => (
                            <DropdownMenuCheckboxItem
                                key={s}
                                checked={statusFilter.includes(s)}
                                onCheckedChange={(v) =>
                                    setStatusFilter((prev) =>
                                        v ? [...prev, s] : prev.filter((x) => x !== s)
                                    )
                                }
                                className="text-sm hover:bg-white/5"
                            >
                                {STATUS_LABEL[s]}
                            </DropdownMenuCheckboxItem>
                        ))}
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuLabel className="text-xs">SLA Status</DropdownMenuLabel>
                        {["on_track", "at_risk", "breached"].map((s) => (
                            <DropdownMenuCheckboxItem
                                key={s}
                                checked={slaFilter.includes(s)}
                                onCheckedChange={(v) =>
                                    setSlaFilter((prev) =>
                                        v ? [...prev, s] : prev.filter((x) => x !== s)
                                    )
                                }
                                className="text-sm hover:bg-white/5 capitalize"
                            >
                                {s.replace("_", " ")}
                            </DropdownMenuCheckboxItem>
                        ))}
                        {activeFilters > 0 && (
                            <>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <button
                                    onClick={() => { setStatusFilter([]); setSlaFilter([]); }}
                                    className="w-full text-xs text-[var(--accountability-red)] hover:text-[var(--accountability-red)]/80 px-2 py-1.5 text-left transition-colors"
                                >
                                    Clear all filters
                                </button>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="glass rounded-2xl py-16 text-center space-y-3">
                    <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto" />
                    <p className="text-sm text-muted-foreground">
                        {grievances.length === 0 ? "No complaints yet." : "No complaints match your filters."}
                    </p>
                    {grievances.length === 0 && (
                        <Link href="/submit">
                            <Button size="sm" className="mt-2 bg-[var(--civic-amber)] text-[var(--navy-deep)] hover:bg-[var(--civic-amber)]/90 font-bold">
                                File your first complaint
                            </Button>
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((g) => (
                        <Link
                            key={g.id}
                            href={`/complaints/${g.id}`}
                            className="block glass rounded-xl p-5 hover:bg-white/[0.06] transition-all group"
                        >
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className="text-xs font-mono text-muted-foreground">{g.id}</span>
                                        <Badge variant="outline" className="text-[10px] border-white/10 text-muted-foreground">
                                            {g.category}
                                        </Badge>
                                        <span
                                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[g.status] ?? "bg-white/10 text-foreground"
                                                }`}
                                        >
                                            {STATUS_LABEL[g.status] ?? g.status}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium line-clamp-1 group-hover:text-[var(--civic-amber)] transition-colors">
                                        {g.title}
                                    </p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-[var(--civic-amber)] group-hover:translate-x-0.5 transition-all mt-1" />
                            </div>

                            {/* SLA compact */}
                            {g.status !== "closed" && (
                                <div className="mb-3">
                                    <SLACountdown slaDeadlineAt={g.slaDeadlineAt} compact />
                                </div>
                            )}

                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                <span>
                                    Filed {new Date(g.createdAt).toLocaleDateString("en-IN", {
                                        day: "numeric", month: "short", year: "numeric",
                                    })}
                                </span>
                                <span>Updated {new Date(g.updatedAt).toLocaleDateString("en-IN", {
                                    day: "numeric", month: "short",
                                })}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
