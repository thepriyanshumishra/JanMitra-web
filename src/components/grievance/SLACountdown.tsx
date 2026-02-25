"use client";

import { useMemo } from "react";
import { Clock, CheckCircle2, AlertTriangle } from "lucide-react";

interface SLACountdownProps {
    slaDeadlineAt: string;
    compact?: boolean;
}

function getTimeRemaining(deadline: string) {
    const now = Date.now();
    const end = new Date(deadline).getTime();
    const diffMs = end - now;
    const totalMs = 7 * 24 * 60 * 60 * 1000; // 7 day SLA window
    const elapsed = totalMs - diffMs;
    const pct = Math.min(Math.round((elapsed / totalMs) * 100), 100);

    if (diffMs <= 0) {
        const overMs = Math.abs(diffMs);
        const overDays = Math.floor(overMs / (24 * 60 * 60 * 1000));
        const overHrs = Math.floor((overMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        return {
            status: "breached" as const,
            label: `Breached ${overDays > 0 ? `${overDays}d ` : ""}${overHrs}h ago`,
            pct: 100,
        };
    }

    const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    const hrs = Math.floor((diffMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const label = days > 0 ? `${days}d ${hrs}h left` : `${hrs}h left`;

    const status = diffMs < 24 * 60 * 60 * 1000
        ? "at_risk" as const
        : "on_track" as const;

    return { status, label, pct };
}

const CONFIG = {
    on_track: {
        bar: "bg-[var(--trust-green)]",
        text: "text-[var(--trust-green)]",
        bg: "bg-[var(--trust-green-muted)]",
        label: "On Track",
        Icon: CheckCircle2,
    },
    at_risk: {
        bar: "bg-[var(--warning-yellow)]",
        text: "text-[var(--warning-yellow)]",
        bg: "bg-yellow-500/10",
        label: "At Risk",
        Icon: Clock,
    },
    breached: {
        bar: "bg-[var(--accountability-red)]",
        text: "text-[var(--accountability-red)]",
        bg: "bg-[var(--accountability-red-muted)]",
        label: "SLA Breached",
        Icon: AlertTriangle,
    },
};

export function SLACountdown({ slaDeadlineAt, compact = false }: SLACountdownProps) {
    const { status, label, pct } = useMemo(
        () => getTimeRemaining(slaDeadlineAt),
        [slaDeadlineAt]
    );

    const cfg = CONFIG[status];
    const Icon = cfg.Icon;

    if (compact) {
        return (
            <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}
            >
                <Icon className="w-3 h-3" />
                {cfg.label}
            </span>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className={`flex items-center gap-1.5 font-semibold ${cfg.text}`}>
                    <Icon className="w-4 h-4" />
                    {cfg.label}
                </span>
                <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${cfg.bar}`}
                    style={{ width: `${pct}%` }}
                />
                {/* SLA deadline line */}
                <div className="absolute inset-y-0 right-0 w-px bg-white/20" />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Filed</span>
                <span>7-day SLA</span>
            </div>
        </div>
    );
}
