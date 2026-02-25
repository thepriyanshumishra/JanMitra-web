"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles, ChevronRight, Plus, Mic, User, Globe, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

interface ExtractedData {
    category: string;
    title: string;
    description: string;
    location: string;
}

interface Message {
    role: "user" | "manus";
    text: string;
}

interface ManusChatViewProps {
    onFill: (data: ExtractedData) => void;
}

const SUPPORTED_LANGUAGES = [
    { label: "Auto (Smart Detect)", code: "auto" },
    { label: "English (In)", code: "en-IN" },
    { label: "Hindi (हिन्दी)", code: "hi-IN" },
    { label: "Bengali (বাংলা)", code: "bn-IN" },
    { label: "Tamil (தமிழ்)", code: "ta-IN" },
    { label: "Telugu (తెలుగు)", code: "te-IN" },
    { label: "Marathi (मराठी)", code: "mr-IN" },
    { label: "Gujarati (ગુજરાતી)", code: "gu-IN" },
    { label: "Kannada (ಕನ್ನಡ)", code: "kn-IN" },
    { label: "Malayalam (മലയാളം)", code: "ml-IN" },
    { label: "Punjabi (ਪੰਜਾਬੀ)", code: "pa-IN" },
    { label: "Urdu (اردو)", code: "ur-IN" },
];

export function ManusChatView({ onFill }: ManusChatViewProps) {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [extracted, setExtracted] = useState<ExtractedData | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [selectedLang, setSelectedLang] = useState(SUPPORTED_LANGUAGES[0]);
    const bottomRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);

    // Initial persistence and state
    useEffect(() => {
        const saved = localStorage.getItem("manus-lang");
        if (saved) {
            const found = SUPPORTED_LANGUAGES.find(l => l.code === saved);
            if (found) setSelectedLang(found);
        }
    }, []);

    useEffect(() => {
        if (selectedLang.code !== "auto") {
            localStorage.setItem("manus-lang", selectedLang.code);
        } else {
            localStorage.removeItem("manus-lang");
        }
    }, [selectedLang]);

    // Auto-resize textarea
    useEffect(() => {
        const textarea = document.getElementById("manus-textarea") as HTMLTextAreaElement;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
        }
    }, [input]);

    // Initial state check
    const isInitial = messages.length === 0;

    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = false;
                recognitionRef.current.interimResults = false;

                recognitionRef.current.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    setInput((prev) => prev + (prev ? " " : "") + transcript);
                    setIsListening(false);
                };

                recognitionRef.current.onerror = (event: any) => {
                    console.error("Speech recognition error:", event.error);
                    setIsListening(false);
                    if (event.error !== "no-speech") {
                        toast.error(`Voice input error: ${event.error}`);
                    }
                };

                recognitionRef.current.onend = () => {
                    setIsListening(false);
                };
            }
        }
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            toast.error("Speech recognition not supported in this browser.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            // Smart auto detection logic
            let targetLang = selectedLang.code;
            if (targetLang === "auto") {
                const browserLang = navigator.language || "en-IN";
                // If it's a generic English or Indian English, use en-IN as it handles code-mixing better
                if (browserLang.startsWith("en") || browserLang.includes("IN")) {
                    targetLang = "en-IN";
                } else {
                    targetLang = browserLang;
                }
                console.log("Auto-detecting language as:", targetLang);
            }

            recognitionRef.current.lang = targetLang;
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (err) {
                console.error("Failed to start recognition:", err);
            }
        }
    };

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
                    text: `I've extracted the core details from your description. Please review the summary below. If it accurately represents your issue, click "Proceed to Review" to populate the form.`,
                },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    role: "manus",
                    text: "I apologize, but I had some difficulty parsing those details. Could you please describe the issue in a few more words?",
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
        toast.success("Form fields updated by Manus");
    }

    return (
        <div className="flex flex-col w-full max-w-4xl mx-auto min-h-[450px]">
            {/* ── Chat Canvas ────────────────────────────────────────── */}
            <div className={`flex-1 overflow-y-auto px-1 scrollbar-hide flex flex-col ${isInitial ? "justify-center" : "justify-start"}`}>
                {isInitial ? (
                    /* Initial ChatGPT State */
                    <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500 py-10">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6">
                            <Sparkles className="w-6 h-6 text-purple-400" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-display font-bold text-center tracking-tight">
                            What's on your mind today?
                        </h1>
                        <p className="text-muted-foreground mt-3 text-sm text-center max-w-sm">
                            I can help you file a complaint in seconds. Just describe the problem in plain language.
                        </p>
                    </div>
                ) : (
                    /* Active Conversation View */
                    <div className="max-w-2xl mx-auto w-full space-y-8 py-6">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                {msg.role === "manus" && (
                                    <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20">
                                        <Sparkles className="w-4 h-4 text-purple-400" />
                                    </div>
                                )}
                                <div
                                    className={`relative max-w-[85%] px-5 py-3.5 rounded-2xl leading-relaxed text-sm ${msg.role === "user"
                                        ? "bg-white/10 text-foreground border border-white/5 shadow-sm"
                                        : "text-foreground/90 font-medium bg-white/5"
                                        }`}
                                >
                                    {msg.text}
                                </div>
                                {msg.role === "user" && (
                                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                                        <User className="w-4 h-4 text-blue-400" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {loading && (
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20">
                                    <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground italic text-xs uppercase tracking-widest opacity-70">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Manus is thinking...
                                </div>
                            </div>
                        )}

                        {/* Extracted Card (ChatGPT-like inline card) */}
                        {extracted && (
                            <div className="ml-0 sm:ml-12 sm:mr-12 rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-xl backdrop-blur-md">
                                <div className="flex items-center justify-between">
                                    <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px] font-bold uppercase tracking-wider">
                                        Summary
                                    </Badge>
                                    <Sparkles className="w-4 h-4 text-purple-400/50" />
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider opacity-60">Category</span>
                                        <p className="text-sm font-semibold text-foreground">{extracted.category}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider opacity-60">Title</span>
                                        <p className="text-sm font-semibold text-foreground">{extracted.title}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider opacity-60">Description</span>
                                        <p className="text-sm text-foreground/80 leading-relaxed font-display">{extracted.description}</p>
                                    </div>
                                    {extracted.location && (
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider opacity-60">Location</span>
                                            <p className="text-sm font-semibold text-foreground">{extracted.location}</p>
                                        </div>
                                    )}
                                </div>

                                <Button
                                    onClick={handleFill}
                                    className="w-full mt-2 bg-white text-black hover:bg-white/90 font-bold text-xs h-10 gap-2 transition-all active:scale-95 shadow-lg group/btn"
                                >
                                    Proceed to Review <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        )}
                        <div ref={bottomRef} className="h-4" />
                    </div>
                )}
            </div>

            {/* ── Input Bar (Floating ChatGPT Style) ─────────────────── */}
            <div className="w-full pt-4 pb-2 px-1">
                <div className="max-w-2xl mx-auto relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-500"></div>
                    <div className="relative flex items-end gap-2 bg-[#1A1A1A] border border-white/10 rounded-2xl p-2.5 pl-4 pr-3 shadow-2xl focus-within:border-white/20 transition-all">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:bg-white/5 hover:text-foreground shrink-0 rounded-xl"
                        >
                            <Plus className="w-5 h-5" />
                        </Button>

                        <Textarea
                            id="manus-textarea"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Ask Manus anything..."
                            rows={1}
                            className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base py-2 px-1 resize-none min-h-[44px] max-h-40 placeholder:text-muted-foreground/30 transition-all scrollbar-hide leading-relaxed"
                            style={{ height: "auto" }}
                        />

                        <div className="flex items-center gap-1 h-10 self-end">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all rounded-lg"
                                    >
                                        <Globe className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-[#1A1A1A] border-white/10 text-xs max-h-[300px] overflow-y-auto">
                                    {SUPPORTED_LANGUAGES.map((lang) => (
                                        <DropdownMenuItem
                                            key={lang.code}
                                            onClick={() => setSelectedLang(lang)}
                                            className={`focus:bg-white/10 ${selectedLang.code === lang.code ? "bg-white/5 text-purple-400" : "text-muted-foreground"}`}
                                        >
                                            {lang.label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {!input.trim() ? (
                                <Button
                                    onClick={toggleListening}
                                    variant="ghost"
                                    size="icon"
                                    className={`h-8 w-8 transition-all rounded-lg relative ${isListening ? "text-purple-400 hover:text-purple-300" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
                                >
                                    {isListening && (
                                        <span className="absolute inset-0 rounded-lg bg-purple-500/20 animate-ping" />
                                    )}
                                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSend}
                                    disabled={loading}
                                    size="icon"
                                    className={`h-8 w-8 transition-all rounded-lg shadow-lg ${loading
                                        ? "bg-white/5 text-muted-foreground"
                                        : "bg-white text-black hover:bg-white/90"
                                        }`}
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground/30 mt-3 text-center">
                        Manus can make mistakes. Consider checking important information.
                    </p>
                </div>
            </div>
        </div>
    );
}
