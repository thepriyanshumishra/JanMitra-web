"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, Send, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface ActionInterviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    actionType: "RESOLVE" | "ESCALATE" | "DELAY" | null;
    grievance: { id: string; category: string; description: string } | null;
    onComplete: (finalReason: string, requiresEvidence: boolean) => void;
}

interface ChatMessage {
    role: "assistant" | "user";
    content: string;
}

export function ActionInterviewModal({
    open,
    onOpenChange,
    actionType,
    grievance,
    onComplete,
}: ActionInterviewModalProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Reset and kick off first question when modal opens
    useEffect(() => {
        if (open && actionType && grievance) {
            setMessages([]);
            setSuggestions([]);
            setInputValue("");
            fetchNextStep([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, actionType, grievance?.id]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, suggestions, loading]);

    async function fetchNextStep(history: ChatMessage[]) {
        setLoading(true);
        try {
            const res = await fetch("/api/manus/action-interview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: actionType,
                    category: grievance?.category,
                    description: grievance?.description,
                    history,
                }),
            });

            if (!res.ok) throw new Error("API error");
            const data = await res.json();

            if (data.isComplete) {
                onComplete(data.finalReason ?? "", Boolean(data.requiresEvidence));
                onOpenChange(false);
            } else {
                setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: data.question },
                ]);
                setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
            }
        } catch (e) {
            console.error("[ActionInterview]", e);
            toast.error("Manus AI disconnected. Please try again.");
            onOpenChange(false);
        } finally {
            setLoading(false);
        }
    }

    async function handleSend(text: string) {
        const trimmed = text.trim();
        if (!trimmed) return;

        const userMsg: ChatMessage = { role: "user", content: trimmed };
        const newHistory = [...messages, userMsg];

        setMessages(newHistory);
        setInputValue("");
        setSuggestions([]);
        await fetchNextStep(newHistory);
    }

    if (!open || !actionType) return null;

    const actionMeta = {
        RESOLVE: {
            label: "Resolve Complaint",
            Icon: CheckCircle2,
            color: "text-[var(--trust-green)]",
        },
        ESCALATE: {
            label: "Escalate Complaint",
            Icon: AlertTriangle,
            color: "text-[var(--accountability-red)]",
        },
        DELAY: {
            label: "Log Delay Reason",
            Icon: Clock,
            color: "text-yellow-400",
        },
    }[actionType];

    const { label, Icon, color } = actionMeta;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[var(--card)] border-white/10 sm:max-w-[460px] p-0 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <DialogHeader className="px-5 pt-5 pb-4 border-b border-white/10 bg-white/[0.02] shrink-0">
                    <DialogTitle className={`flex items-center gap-2 text-base font-display font-bold ${color}`}>
                        <Icon className="w-5 h-5" />
                        {label}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                        Manus AI will guide you through a quick verification before this action is recorded.
                    </DialogDescription>
                </DialogHeader>

                {/* Chat area */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0"
                    style={{ maxHeight: "300px" }}
                >
                    {messages.map((m, i) => (
                        <div
                            key={i}
                            className={`flex items-end gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                        >
                            {m.role === "assistant" && (
                                <div className="w-7 h-7 rounded-xl bg-foreground/5 flex items-center justify-center shrink-0 mb-0.5 border border-foreground/10">
                                    <img src="/icons/icon-192x192.png" alt="Manus" className="w-4.5 h-4.5 object-contain" />
                                </div>
                            )}
                            <div
                                className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed max-w-[78%] ${m.role === "user"
                                    ? "bg-[var(--civic-amber)] text-[var(--navy-deep)] font-medium rounded-br-sm"
                                    : "bg-white/5 border border-white/10 text-foreground rounded-bl-sm"
                                    }`}
                            >
                                {m.content}
                            </div>
                        </div>
                    ))}

                    {/* Loading indicator */}
                    {loading && (
                        <div className="flex items-end gap-2.5">
                            <div className="w-7 h-7 rounded-xl bg-foreground/5 flex items-center justify-center shrink-0 animate-pulse mb-0.5 border border-foreground/10">
                                <img src="/icons/icon-192x192.png" alt="Manus" className="w-4 h-4 object-contain opacity-50" />
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                                <span
                                    className="w-1.5 h-1.5 rounded-full bg-[var(--civic-amber)] animate-bounce"
                                    style={{ animationDelay: "0ms" }}
                                />
                                <span
                                    className="w-1.5 h-1.5 rounded-full bg-[var(--civic-amber)] animate-bounce"
                                    style={{ animationDelay: "150ms" }}
                                />
                                <span
                                    className="w-1.5 h-1.5 rounded-full bg-[var(--civic-amber)] animate-bounce"
                                    style={{ animationDelay: "300ms" }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Suggestion chips */}
                {suggestions.length > 0 && !loading && (
                    <div className="px-5 pb-3 flex flex-wrap gap-2 shrink-0">
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => handleSend(s)}
                                className="px-3 py-1.5 rounded-full border border-[var(--civic-amber)]/30 bg-[var(--civic-amber)]/5 text-[var(--civic-amber)] text-xs font-medium hover:bg-[var(--civic-amber)]/15 transition-all active:scale-95"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <div className="px-4 pb-4 pt-2 border-t border-white/10 bg-white/[0.02] shrink-0">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSend(inputValue);
                        }}
                        className="flex gap-2"
                    >
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Type your response or pick a suggestion…"
                            disabled={loading}
                            autoFocus
                            className="bg-white/5 border-white/10 focus:border-[var(--civic-amber)]/50 text-sm h-10 flex-1"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={!inputValue.trim() || loading}
                            className="w-10 h-10 bg-[var(--civic-amber)] text-[var(--navy-deep)] hover:bg-[var(--civic-amber)]/90 shrink-0"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                        </Button>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
