"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles, ChevronRight, Plus, Mic, User, MicOff, Check, X } from "lucide-react";
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
import { LocationModal } from "./LocationModal";
import { EvidenceZone } from "./EvidenceZone";

// Browser SpeechRecognition types (not in default TypeScript DOM lib for all versions)
interface ISpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    onresult: ((event: { results: { [i: number]: { [i: number]: { transcript: string } } } }) => void) | null;
    onerror: ((event: { error: string }) => void) | null;
    onend: (() => void) | null;
}

declare global {
    interface Window {
        SpeechRecognition?: new () => ISpeechRecognition;
        webkitSpeechRecognition?: new () => ISpeechRecognition;
    }
}

interface ExtractedData {
    category: string;
    title: string;
    description: string;
    location: string;
    evidence?: File[];
}

interface Message {
    role: "user" | "manus";
    text: string;
}

interface ManusChatViewProps {
    onFill: (data: ExtractedData) => void;
}

type FieldFocus = "issue" | "location" | "evidence" | "general" | null;

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

function calculateCompleteness(messages: Message[], extracted: ExtractedData | null): { score: number, missing: string[] } {
    if (extracted) return { score: 100, missing: [] };
    if (messages.length === 0) return { score: 0, missing: ["Issue Details", "Location", "Evidence"] };

    // Simple heuristic: If Manus asks for location, we assume issue is mostly gathered 
    // If it asks for evidence, we assume location is gathered (or skipped).
    let score = 20; // Base score for starting
    let missing = ["Issue Details", "Location", "Evidence"];

    const textStr = messages.map(m => m.text.toLowerCase()).join(" ");

    // If user sent at least 2 messages, issue details are likely somewhat gathered
    if (messages.filter(m => m.role === "user").length >= 2) {
        score += 30;
        missing = missing.filter(m => m !== "Issue Details");
    }

    if (textStr.includes("location is:") || textStr.includes("skip") || textStr.includes("don't know")) {
        score += 25;
        missing = missing.filter(m => m !== "Location");
    }

    if (textStr.includes("attached") || textStr.includes("no evidence") || textStr.includes("no, i don't")) {
        score += 25;
        missing = missing.filter(m => m !== "Evidence");
    }

    return { score: Math.min(score, 95), missing };
}

export function ManusChatView({ onFill }: ManusChatViewProps) {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [extracted, setExtracted] = useState<ExtractedData | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [transcriptBuf, setTranscriptBuf] = useState("");
    const [interimBuf, setInterimBuf] = useState("");
    const [fieldFocus, setFieldFocus] = useState<FieldFocus>(null);
    const [selectedLang, setSelectedLang] = useState(SUPPORTED_LANGUAGES[0]);

    // Feature tracking states
    const [locationModalOpen, setLocationModalOpen] = useState(false);
    const [capturedLocation, setCapturedLocation] = useState<string>("");
    const [uploadedEvidence, setUploadedEvidence] = useState<File[]>([]);

    const bottomRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<ISpeechRecognition | null>(null);

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
                recognitionRef.current.continuous = true;
                recognitionRef.current.interimResults = true;

                recognitionRef.current.onresult = (event: any) => {
                    let finalTranscript = "";
                    let currentInterim = "";
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript;
                        } else {
                            currentInterim += event.results[i][0].transcript;
                        }
                    }
                    if (finalTranscript) {
                        setTranscriptBuf((prev) => prev + (prev ? " " : "") + finalTranscript);
                    }
                    setInterimBuf(currentInterim);
                };

                recognitionRef.current.onerror = (event: { error: string }) => {
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

    const handleAcceptRecording = () => {
        if (recognitionRef.current) recognitionRef.current.stop();
        setIsListening(false);
        const finalText = (transcriptBuf + (transcriptBuf && interimBuf ? " " : "") + interimBuf).trim();
        if (finalText) {
            setInput((prev) => prev + (prev ? " " : "") + finalText);
        }
        setTranscriptBuf("");
        setInterimBuf("");
    };

    const handleCancelRecording = () => {
        if (recognitionRef.current) recognitionRef.current.stop();
        setIsListening(false);
        setTranscriptBuf("");
        setInterimBuf("");
    };

    const toggleListening = () => {
        if (!recognitionRef.current) {
            toast.error("Speech recognition not supported in this browser.");
            return;
        }

        try {
            if (isListening) {
                recognitionRef.current.stop();
                setIsListening(false);
                // The onend handler will also be called, but we set it here for immediate UI feedback
            } else {
                setTranscriptBuf("");
                setInterimBuf("");

                // Smart auto detection logic
                let targetLang = selectedLang.code;
                if (targetLang === "auto") {
                    const browserLang = navigator.language || "en-IN";
                    if (browserLang.startsWith("en") || browserLang.includes("IN")) {
                        targetLang = "en-IN";
                    } else {
                        targetLang = browserLang;
                    }
                    console.log("Auto-detecting language as:", targetLang);
                }

                recognitionRef.current.lang = targetLang;
                recognitionRef.current.start();
                setIsListening(true);
            }
        } catch (err: any) {
            console.error("Speech recognition error:", err);
            // Handle "already started" or other state errors gracefully
            if (err.name === 'InvalidStateError') {
                setIsListening(true); // Sync state if browser thinks it's already on
            } else {
                setIsListening(false);
                toast.error("Voice input could not start.");
            }
        }
    };

    async function handleSend(forcedUserMessage?: string) {
        const textToSend = forcedUserMessage || input.trim();
        if (!textToSend || loading) return;

        setInput("");

        // Add user message to history
        const updatedMessages: Message[] = [...messages, { role: "user", text: textToSend }];
        setMessages(updatedMessages);

        setLoading(true);
        setFieldFocus(null); // Clear focus while waiting

        try {
            const res = await fetch("/api/manus/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: updatedMessages }),
            });

            if (!res.ok) throw new Error("Chat request failed");
            const data = await res.json();

            if (data.type === "question") {
                setMessages((prev) => [
                    ...prev,
                    { role: "manus", text: data.text || "Could you provide more details?" }
                ]);
                const newFocus = data.fieldFocus || "general";
                setFieldFocus(newFocus);

                // Auto-open Location Modal if Manus specifically asked for location
                if (newFocus === "location" && !capturedLocation) {
                    setTimeout(() => setLocationModalOpen(true), 1000); // Small delay for UX
                }
            } else if (data.type === "extracted") {
                const finalData: ExtractedData = {
                    category: data.category || "Other",
                    title: data.title || textToSend.slice(0, 50),
                    description: data.description || textToSend,
                    location: data.location || capturedLocation || "",
                    evidence: uploadedEvidence.length > 0 ? uploadedEvidence : undefined
                };
                setExtracted(finalData);
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "manus",
                        text: `Great, I think I have everything I need. Review the summary of your complaint below, and click "Proceed to Review" when you're ready.`,
                    },
                ]);
            }
        } catch (err) {
            console.error("Chat error:", err);
            setMessages((prev) => [
                ...prev,
                {
                    role: "manus",
                    text: "I apologize, but I had some trouble connecting. Let's try that again. Could you repeat?",
                },
            ]);
            setFieldFocus("general");
        } finally {
            setLoading(false);
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }
    }

    function handleFill() {
        if (!extracted) return;
        // Merge in any manually captured location if the AI failed to extract one but we have one
        const finalDataToFill = {
            ...extracted,
            location: extracted.location || capturedLocation,
            evidence: uploadedEvidence
        };
        onFill(finalDataToFill);
        toast.success("Form fields updated by Manus");
    }

    return (
        <div className="flex flex-col w-full max-w-4xl mx-auto min-h-[450px]">
            {/* ── Progress Bar ───────────────────────────────────────── */}
            {!isInitial && !extracted && (
                <div className="w-full px-4 pt-2 pb-1 bg-background/95 backdrop-blur z-10 sticky top-0 border-b border-foreground/5 animate-in slide-in-from-top-2">
                    <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Complaint Completeness</span>
                                <span className="text-[10px] font-bold text-primary">{calculateCompleteness(messages, extracted).score}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-1000 ease-out"
                                    style={{ width: `${calculateCompleteness(messages, extracted).score}%` }}
                                />
                            </div>
                        </div>
                        <div className="flex gap-1 hidden sm:flex">
                            {calculateCompleteness(messages, extracted).missing.map((item, idx) => (
                                <Badge key={idx} variant="outline" className="text-[9px] px-1.5 py-0 border-dashed text-muted-foreground/50 border-foreground/10">
                                    Needs: {item}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Chat Canvas ────────────────────────────────────────── */}
            <div className={`flex-1 overflow-y-auto px-1 scrollbar-hide flex flex-col ${isInitial ? "justify-center" : "justify-start"}`}>
                {isInitial ? (
                    /* Initial ChatGPT State */
                    <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500 py-10">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6">
                            <Sparkles className="w-6 h-6 text-purple-400" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-display font-bold text-center tracking-tight">
                            What&apos;s on your mind today?
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
                                <div className="flex flex-col gap-2 max-w-[85%]">
                                    <div
                                        className={`relative px-5 py-3.5 rounded-2xl leading-relaxed text-sm ${msg.role === "user"
                                            ? "bg-primary/10 text-foreground border border-primary/20 shadow-sm"
                                            : "text-foreground/90 font-medium bg-foreground/5"
                                            }`}
                                    >
                                        {msg.text}
                                    </div>

                                    {/* Inline logic for Evidence request */}
                                    {msg.role === "manus" && i === messages.length - 1 && fieldFocus === "evidence" && !extracted && (
                                        <div className="pl-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <EvidenceZone
                                                onUpload={(files) => {
                                                    setUploadedEvidence(files);
                                                    if (files.length > 0) {
                                                        // Automatically tell Manus we attached files
                                                        handleSend(`I have attached ${files.length} evidence file(s).`);
                                                    }
                                                }}
                                            />
                                        </div>
                                    )}
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

                        {/* Quick Reply Chips */}
                        {!loading && !extracted && messages.length > 0 && messages[messages.length - 1].role === "manus" && (
                            <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300 ml-12">
                                {fieldFocus === "location" && (
                                    <>
                                        <Button variant="outline" size="sm" onClick={() => setLocationModalOpen(true)} className="h-8 text-xs rounded-full border-blue-500/30 text-blue-500 hover:bg-blue-500/10">
                                            Open Map
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => handleSend("I don't know the exact location.")} className="h-8 text-xs rounded-full border-foreground/10 hover:bg-foreground/5 hover:text-foreground">
                                            I don&apos;t know
                                        </Button>
                                    </>
                                )}
                                {fieldFocus === "evidence" && (
                                    <Button variant="outline" size="sm" onClick={() => handleSend("I don't have any evidence.")} className="h-8 text-xs rounded-full border-foreground/10 hover:bg-foreground/5 hover:text-foreground">
                                        I don&apos;t have any
                                    </Button>
                                )}
                                <Button variant="ghost" size="sm" onClick={() => handleSend("Skip this part.")} className="h-8 text-xs rounded-full text-muted-foreground hover:bg-destructive/5 hover:text-destructive">
                                    Skip this
                                </Button>
                            </div>
                        )}

                        {/* Extracted Card (ChatGPT-like inline card) */}
                        {extracted && (
                            <div className="ml-0 sm:ml-12 sm:mr-12 rounded-2xl border border-foreground/10 bg-secondary/30 p-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-xl backdrop-blur-md">
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
                                    className="w-full mt-2 bg-primary text-primary-foreground hover:opacity-90 font-bold text-xs h-10 gap-2 transition-all active:scale-95 shadow-lg group/btn"
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
                    <div className="relative flex items-end gap-2 bg-popover/95 backdrop-blur-xl border border-foreground/10 rounded-2xl p-2.5 pl-4 pr-3 shadow-2xl focus-within:border-foreground/20 transition-all overflow-hidden">
                        {isListening ? (
                            <div className="flex items-center justify-between w-full h-[44px] px-2 animate-in slide-in-from-bottom-2 fade-in duration-300">
                                <Button
                                    onClick={handleCancelRecording}
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 text-muted-foreground hover:bg-destructive/10 hover:text-destructive shrink-0 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </Button>

                                <div className="flex-1 flex flex-col items-center justify-center gap-1 mx-4">
                                    <div className="flex items-center gap-1">
                                        <div className="w-1 h-3 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: "0ms" }}></div>
                                        <div className="w-1.5 h-6 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: "150ms" }}></div>
                                        <div className="w-1 h-4 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: "300ms" }}></div>
                                        <div className="w-1 h-5 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: "450ms" }}></div>
                                        <div className="w-1.5 h-3 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: "600ms" }}></div>
                                    </div>
                                    {(transcriptBuf || interimBuf) ? (
                                        <p className="text-[10px] text-muted-foreground truncate max-w-[200px] text-center w-full" title={transcriptBuf + " " + interimBuf}>
                                            {transcriptBuf}
                                            {transcriptBuf && interimBuf && " "}
                                            <span className="opacity-70">{interimBuf}</span>
                                        </p>
                                    ) : (
                                        <p className="text-[10px] text-muted-foreground animate-pulse">Listening...</p>
                                    )}
                                </div>

                                <Button
                                    onClick={handleAcceptRecording}
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 bg-primary/20 text-primary hover:bg-primary/30 hover:text-primary shrink-0 rounded-full transition-colors"
                                >
                                    <Check className="w-5 h-5" />
                                </Button>
                            </div>
                        ) : (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 text-muted-foreground hover:bg-foreground/5 hover:text-foreground shrink-0 rounded-xl"
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
                                    {!input.trim() ? (
                                        <Button
                                            onClick={toggleListening}
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 transition-all rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 relative overflow-hidden group"
                                        >
                                            <Mic className="w-4 h-4 transition-transform group-active:scale-95" />
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => handleSend()}
                                            disabled={loading}
                                            size="icon"
                                            className={`h-8 w-8 transition-all rounded-lg shadow-lg ${loading
                                                ? "bg-foreground/5 text-muted-foreground"
                                                : "bg-primary text-primary-foreground hover:opacity-90"
                                                }`}
                                        >
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                    <p className="text-[10px] text-muted-foreground/30 mt-3 text-center">
                        Manus can make mistakes. Consider checking important information.
                    </p>
                </div>
            </div>

            <LocationModal
                open={locationModalOpen}
                onOpenChange={setLocationModalOpen}
                onSelectLocation={(loc) => {
                    setCapturedLocation(loc);
                    // Automatically send the location to Manus so it knows we did it
                    handleSend(`The location is: ${loc}`);
                }}
            />
        </div>
    );
}
