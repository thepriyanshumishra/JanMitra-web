"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { LocalStorage } from "@/lib/storage";
import {
    FileText, Building2, UserCheck, CheckCircle2, RefreshCw,
    AlertTriangle, FileEdit, XCircle, RotateCcw, Loader2,
} from "lucide-react";

export interface GrievanceEvent {
    id: string;
    type: string;
    actorId: string;
    actorName?: string;
    timestamp: string;
    payload?: Record<string, string>;
}

interface EventTimelineProps {
    grievanceId: string;
    visibleCount?: number; // for Failure Replay limiting
}

const EVENT_CONFIG: Record<string, {
    label: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
}> = {
    GRIEVANCE_SUBMITTED: {
        label: "Complaint Filed",
        icon: <FileText className="w-3.5 h-3.5" />,
        color: "text-[var(--civic-amber)]",
        bg: "bg-[var(--civic-amber-muted)] border-[var(--civic-amber)]/30",
    },
    ROUTED_TO_DEPARTMENT: {
        label: "Routed to Department",
        icon: <Building2 className="w-3.5 h-3.5" />,
        color: "text-blue-400",
        bg: "bg-blue-500/10 border-blue-500/20",
    },
    OFFICER_ASSIGNED: {
        label: "Officer Assigned",
        icon: <UserCheck className="w-3.5 h-3.5" />,
        color: "text-purple-400",
        bg: "bg-purple-500/10 border-purple-500/20",
    },
    OFFICER_ACKNOWLEDGED: {
        label: "Acknowledged by Officer",
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        color: "text-[var(--trust-green)]",
        bg: "bg-[var(--trust-green-muted)] border-[var(--trust-green)]/20",
    },
    UPDATE_PROVIDED: {
        label: "Status Updated",
        icon: <RefreshCw className="w-3.5 h-3.5" />,
        color: "text-sky-400",
        bg: "bg-sky-500/10 border-sky-500/20",
    },
    ESCALATED: {
        label: "Escalated",
        icon: <AlertTriangle className="w-3.5 h-3.5" />,
        color: "text-[var(--accountability-red)]",
        bg: "bg-[var(--accountability-red-muted)] border-[var(--accountability-red)]/30",
    },
    DELAY_EXPLANATION_SUBMITTED: {
        label: "Delay Reason Provided",
        icon: <FileEdit className="w-3.5 h-3.5" />,
        color: "text-[var(--warning-yellow)]",
        bg: "bg-yellow-500/10 border-yellow-500/20",
    },
    COMPLAINT_CLOSED: {
        label: "Resolved & Closed",
        icon: <XCircle className="w-3.5 h-3.5" />,
        color: "text-[var(--trust-green)]",
        bg: "bg-[var(--trust-green-muted)] border-[var(--trust-green)]/30",
    },
    REOPENED: {
        label: "Reopened by Citizen",
        icon: <RotateCcw className="w-3.5 h-3.5" />,
        color: "text-orange-400",
        bg: "bg-orange-500/10 border-orange-500/20",
    },
};

function formatTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

export function EventTimeline({ grievanceId, visibleCount }: EventTimelineProps) {
    const [events, setEvents] = useState<GrievanceEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch from LocalStorage
        const localEvents = LocalStorage.getEvents(grievanceId);
        setEvents(localEvents.map(e => ({
            ...e,
            type: e.eventType,
            timestamp: e.createdAt
        })) as any);
        setLoading(false);
    }, [grievanceId]);

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const visible = visibleCount !== undefined ? events.slice(0, visibleCount) : events;

    return (
        <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-5 top-0 bottom-0 w-px bg-white/10" />

            <div className="space-y-1">
                {visible.map((event, i) => {
                    const cfg = EVENT_CONFIG[event.type] ?? {
                        label: event.type.replace(/_/g, " "),
                        icon: <FileText className="w-3.5 h-3.5" />,
                        color: "text-muted-foreground",
                        bg: "bg-white/5 border-white/10",
                    };

                    const isLast = i === visible.length - 1;

                    return (
                        <div key={event.id} className="flex gap-4 relative pb-6">
                            {/* Dot */}
                            <div
                                className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center ${cfg.bg} ${cfg.color}`}
                            >
                                {cfg.icon}
                            </div>

                            {/* Content */}
                            <div className={`pt-1.5 flex-1 min-w-0 ${isLast ? "" : ""}`}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</p>
                                        {event.payload?.message && (
                                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                                {event.payload.message}
                                            </p>
                                        )}
                                        {event.payload?.reason && (
                                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed italic">
                                                &ldquo;{event.payload.reason}&rdquo;
                                            </p>
                                        )}
                                    </div>
                                    <time className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                                        {formatTime(event.timestamp)}
                                    </time>
                                </div>
                                {event.actorName && (
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        by {event.actorName}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Empty state */}
                {visible.length === 0 && (
                    <div className="ml-14 py-4 text-sm text-muted-foreground">
                        No events yet. Check back soon.
                    </div>
                )}
            </div>
        </div>
    );
}

// Export events hook for Failure Replay
export function useGrievanceEvents(grievanceId: string) {
    const [events, setEvents] = useState<GrievanceEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const localEvents = LocalStorage.getEvents(grievanceId);
        setEvents(localEvents.map(e => ({
            ...e,
            type: e.eventType,
            timestamp: e.createdAt
        })) as any);
        setLoading(false);
    }, [grievanceId]);

    return { events, loading };
}
