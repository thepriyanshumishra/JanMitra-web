"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Loader2, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ExtractedData {
    category: string;
    title: string;
    description: string;
    location: string;
}

interface ManusDrawerProps {
    onFill: (data: ExtractedData) => void;
    openRef?: React.MutableRefObject<(() => void) | null>;
}

import React from "react";

interface Message {
    role: "user" | "manus";
    text: string;
}

export function ManusDrawer({ onFill, openRef }: ManusDrawerProps) {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");

    // Expose open function to parent via ref
    useEffect(() => {
        if (openRef) openRef.current = () => setOpen(true);
    }, [openRef]);

    const [messages, setMessages] = useState<Message[]>([
        {
            role: "manus",
            text: "Hi! I'm Manus 👋 Describe your issue in plain language — I'll convert it into a structured complaint for you.",
        },
    ]);
    const [loading, setLoading] = useState(false);
    const [extracted, setExtracted] = useState<ExtractedData | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    async function handleSend() {
        if (!input.trim() || loading) return;
        const userMessage = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
        setLoading(true);
        setExtracted(null);

        try {
            const res = await fetch("/api/manus/extract", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage }),
            });

            if (!res.ok) throw new Error("Failed to extract");
            const data: ExtractedData = await res.json();

            setExtracted(data);
            setMessages((prev) => [
                ...prev,
                {
                    role: "manus",
                    text: `I extracted the following from your description. Does this look right? If yes, click "Fill Form" to auto-populate.`,
                },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    role: "manus",
                    text: "Sorry, I had trouble extracting that. Could you describe your issue in a bit more detail?",
                },
            ]);
        } finally {
            setLoading(false);
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }
    }

    function handleFill() {
        if (!extracted) return;
        onFill(extracted);
        setOpen(false);
        toast.success("Form filled by Manus!");
    }

    return (
        <>
            {/* FAB trigger */}
            <Button
                onClick={() => setOpen(true)}
                className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-[var(--civic-amber)] text-[var(--navy-deep)] hover:bg-[var(--civic-amber)]/90 shadow-2xl glow-amber p-0"
                aria-label="Open Manus AI assistant"
            >
                <Bot className="w-6 h-6" />
            </Button>

            {/* Drawer overlay */}
            {open && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setOpen(false)}
                    />
                    <div className="relative w-full max-w-sm h-full glass border-l border-white/10 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-[var(--civic-amber)] flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-[var(--navy-deep)]" />
                                </div>
                                <div>
                                    <p className="text-sm font-display font-bold">Manus</p>
                                    <p className="text-[10px] text-muted-foreground">AI Complaint Assistant</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setOpen(false)}
                                className="text-muted-foreground hover:text-foreground h-8 w-8"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === "user"
                                            ? "bg-[var(--civic-amber)] text-[var(--navy-deep)] font-medium rounded-tr-sm"
                                            : "bg-white/8 text-foreground rounded-tl-sm"
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}

                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-white/8 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">Extracting…</span>
                                    </div>
                                </div>
                            )}

                            {/* Extracted flashcard */}
                            {extracted && (
                                <div className="rounded-xl border border-[var(--civic-amber)]/30 bg-[var(--civic-amber)]/5 p-4 space-y-2.5 animate-in fade-in duration-300">
                                    <Badge className="bg-[var(--civic-amber-muted)] text-[var(--civic-amber)] text-[10px] font-bold border-0">
                                        Extracted
                                    </Badge>
                                    <div className="space-y-1.5 text-sm">
                                        <div>
                                            <span className="text-muted-foreground text-xs">Category</span>
                                            <p className="font-semibold">{extracted.category}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground text-xs">Title</span>
                                            <p className="font-semibold">{extracted.title}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground text-xs">Description</span>
                                            <p className="text-foreground/80 leading-relaxed">{extracted.description}</p>
                                        </div>
                                        {extracted.location && (
                                            <div>
                                                <span className="text-muted-foreground text-xs">Location</span>
                                                <p>{extracted.location}</p>
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        onClick={handleFill}
                                        className="w-full mt-2 bg-[var(--civic-amber)] text-[var(--navy-deep)] hover:bg-[var(--civic-amber)]/90 font-bold text-sm h-9 gap-2"
                                    >
                                        Fill Form <ChevronRight className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-white/10">
                            <div className="flex gap-2">
                                <Textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    placeholder="Describe your issue…"
                                    className="min-h-[64px] max-h-32 bg-white/5 border-white/10 focus:border-[var(--civic-amber)]/50 text-sm resize-none"
                                />
                                <Button
                                    onClick={handleSend}
                                    disabled={!input.trim() || loading}
                                    size="icon"
                                    className="bg-[var(--civic-amber)] text-[var(--navy-deep)] hover:bg-[var(--civic-amber)]/90 self-end h-10 w-10 shrink-0"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-2 text-center">
                                Manus uses Gemini AI · Your data stays private
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
