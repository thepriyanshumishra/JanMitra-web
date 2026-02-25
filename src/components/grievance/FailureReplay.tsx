"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EventTimeline, useGrievanceEvents } from "./EventTimeline";

interface FailureReplayProps {
    grievanceId: string;
    slaDeadlineAt: string;
}

export function FailureReplay({ grievanceId, slaDeadlineAt }: FailureReplayProps) {
    const { events, loading } = useGrievanceEvents(grievanceId);
    const [visible, setVisible] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [started, setStarted] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Find where SLA breach falls among events
    const slaDeadline = new Date(slaDeadlineAt).getTime();
    const slaBreachIndex = events.findIndex(
        (e) => new Date(e.timestamp).getTime() > slaDeadline
    );
    const slaWasBreached =
        slaBreachIndex !== -1 ||
        (events.length > 0 && Date.now() > slaDeadline);

    function startReplay() {
        setVisible(0);
        setStarted(true);
        setPlaying(true);
    }

    function reset() {
        setVisible(0);
        setStarted(false);
        setPlaying(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
    }

    useEffect(() => {
        if (!playing) return;

        intervalRef.current = setInterval(() => {
            setVisible((prev) => {
                // Insert SLA breach marker before events that cross the deadline
                const next = prev + 1;
                if (next >= events.length) {
                    setPlaying(false);
                    clearInterval(intervalRef.current!);
                }
                return next;
            });
        }, 700);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [playing, events.length]);

    if (loading) return null;
    if (events.length === 0) return null;

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-display font-semibold">Failure Replay</h3>
                    <p className="text-xs text-muted-foreground">
                        Watch the accountability chain unfold step-by-step
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {started && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={reset}
                            className="text-muted-foreground hover:text-foreground h-8 gap-1"
                        >
                            <RotateCcw className="w-3.5 h-3.5" /> Reset
                        </Button>
                    )}
                    <Button
                        size="sm"
                        onClick={playing ? () => setPlaying(false) : started ? () => setPlaying(true) : startReplay}
                        className="h-8 bg-[var(--civic-amber)] text-[var(--navy-deep)] hover:bg-[var(--civic-amber)]/90 font-bold gap-1.5"
                    >
                        {playing ? (
                            <><Pause className="w-3.5 h-3.5" /> Pause</>
                        ) : started ? (
                            <><Play className="w-3.5 h-3.5" /> Resume</>
                        ) : (
                            <><Play className="w-3.5 h-3.5" /> Play Replay</>
                        )}
                    </Button>
                </div>
            </div>

            {/* Progress */}
            {started && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[var(--civic-amber)] transition-all duration-500 rounded-full"
                            style={{ width: `${Math.round((visible / events.length) * 100)}%` }}
                        />
                    </div>
                    <span>{visible}/{events.length} events</span>
                </div>
            )}

            {/* SLA breach banner (shown when replay passes the breach point) */}
            {started && slaWasBreached && slaBreachIndex !== -1 && visible > slaBreachIndex && (
                <div className="flex items-center gap-3 rounded-xl border border-[var(--accountability-red)]/40 bg-[var(--accountability-red-muted)] px-4 py-3 animate-in fade-in duration-500">
                    <AlertTriangle className="w-5 h-5 text-[var(--accountability-red)] shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-[var(--accountability-red)]">
                            ⏱ SLA Deadline Breached Here
                        </p>
                        <p className="text-xs text-muted-foreground">
                            The 7-day response window expired before this point
                        </p>
                    </div>
                    <Badge
                        className="ml-auto shrink-0 bg-[var(--accountability-red)]/20 text-[var(--accountability-red)] border-[var(--accountability-red)]/30 text-[10px]"
                    >
                        Institutional Failure
                    </Badge>
                </div>
            )}

            {/* Timeline capped at visible count */}
            {started ? (
                <EventTimeline grievanceId={grievanceId} visibleCount={visible} />
            ) : (
                <div className="glass rounded-xl px-5 py-8 text-center text-sm text-muted-foreground">
                    Press <span className="text-foreground font-medium">Play Replay</span> to watch
                    the full accountability chain unfold from submission to resolution.
                </div>
            )}
        </div>
    );
}
