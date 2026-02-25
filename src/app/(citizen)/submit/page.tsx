"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    Droplets, Trash2, Navigation, Zap, Bus, HeartPulse,
    BookOpen, TreePine, Wind, Home, Shield, HelpCircle,
    MapPin, Upload, X, CheckCircle2, Loader2, ChevronLeft,
    ChevronRight, Eye, EyeOff, Lock, Users, Sparkles, PenLine,
    Map as MapIcon, UploadCloud, Video, FileText, ImageIcon, Search, Crosshair
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadMultipleFiles } from "@/lib/uploadFile";
import { useAuth } from "@/features/auth/AuthProvider";
import { useRequireAuth } from "@/hooks/useAuth";
import { ManusChatView } from "@/features/manus/ManusChatView";
import { LocationModal } from "@/features/manus/LocationModal";

// ─── Category data ────────────────────────────────────────────────
const CATEGORIES = [
    { id: "Water Supply", icon: Droplets, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
    { id: "Sanitation & Garbage", icon: Trash2, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30" },
    { id: "Roads & Footpaths", icon: Navigation, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
    { id: "Electricity", icon: Zap, color: "text-[var(--civic-amber)]", bg: "bg-[var(--civic-amber-muted)]", border: "border-[var(--civic-amber)]/30" },
    { id: "Public Transport", icon: Bus, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30" },
    { id: "Health & Hospital", icon: HeartPulse, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
    { id: "Education", icon: BookOpen, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
    { id: "Parks & Recreation", icon: TreePine, color: "text-[var(--trust-green)]", bg: "bg-[var(--trust-green-muted)]", border: "border-[var(--trust-green)]/30" },
    { id: "Pollution", icon: Wind, color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/30" },
    { id: "Land & Property", icon: Home, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/30" },
    { id: "Police & Safety", icon: Shield, color: "text-[var(--accountability-red)]", bg: "bg-[var(--accountability-red-muted)]", border: "border-[var(--accountability-red)]/30" },
    { id: "Other", icon: HelpCircle, color: "text-muted-foreground", bg: "bg-white/5", border: "border-white/10" },
];

const PRIVACY_OPTIONS = [
    {
        id: "public" as const,
        label: "Public",
        description: "Visible on the transparency dashboard. Helps others with similar issues.",
        icon: Eye,
        color: "text-[var(--trust-green)]",
    },
    {
        id: "restricted" as const,
        label: "Restricted",
        description: "Details hidden from public. Only your ID shown. Status updates are visible.",
        icon: EyeOff,
        color: "text-[var(--warning-yellow)]",
    },
    {
        id: "private" as const,
        label: "Private",
        description: "Fully confidential. Only you and assigned officers can see this complaint.",
        icon: Lock,
        color: "text-[var(--accountability-red)]",
    },
];

// ─── Form state type ──────────────────────────────────────────────
interface FormData {
    category: string;
    title: string;
    description: string;
    location: string;
    privacyLevel: "public" | "restricted" | "private";
    isDelegated: boolean;
    delegateName: string;
    delegateRelation: string;
    files: File[];
}

const INITIAL_FORM: FormData = {
    category: "",
    title: "",
    description: "",
    location: "",
    privacyLevel: "public",
    isDelegated: false,
    delegateName: "",
    delegateRelation: "",
    files: [],
};

// Step labels change depending on mode
const STEPS_MANUAL = ["How to Fill", "Category", "Details", "Location", "Evidence"];
const STEPS_AI = ["How to Fill", "Manus Chat", "Review", "Location", "Evidence"];

// ─── Component ────────────────────────────────────────────────────
export default function SubmitComplaintPage() {
    const { user } = useAuth();
    const { loading: authLoading } = useRequireAuth();
    const router = useRouter();

    const [step, setStep] = useState(0);
    const [fillMode, setFillMode] = useState<"" | "manual" | "manus">("");
    const [form, setForm] = useState<FormData>(INITIAL_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    // Maps state for manual flow
    const [locationModalOpen, setLocationModalOpen] = useState(false);
    const [capturedLatLon, setCapturedLatLon] = useState<{ lat: string; lon: string } | null>(null);

    // File handling
    const addFiles = useCallback((newFiles: FileList | File[]) => {
        const arr = Array.from(newFiles);
        const valid = arr.filter((f) => {
            if (f.size > 10 * 1024 * 1024) { toast.error(`${f.name} exceeds 10 MB limit`); return false; }
            return true;
        });
        setForm((prev) => {
            const combined = [...prev.files, ...valid];
            if (combined.length > 5) { toast.error("Maximum 5 files allowed"); return { ...prev, files: combined.slice(0, 5) }; }
            return { ...prev, files: combined };
        });
    }, []);

    if (authLoading || !user) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--civic-amber)]" />
            </div>
        );
    }

    const steps = fillMode === "manus" ? STEPS_AI : STEPS_MANUAL;
    const pct = Math.round(((step + 1) / steps.length) * 100);

    // Manus auto-fill handler
    function handleManuseFill(data: { category: string; title: string; description: string; location: string }) {
        setForm((f) => ({
            ...f,
            category: data.category || f.category,
            title: data.title || f.title,
            description: data.description || f.description,
            location: data.location || f.location,
        }));
        // After Manus fills, jump to Step 2 (Review)
        setStep(2);
    }


    function removeFile(index: number) {
        setForm((f) => ({ ...f, files: f.files.filter((_, i) => i !== index) }));
    }

    // Validation per step
    function canProceed(): boolean {
        if (step === 0) return fillMode !== "";
        if (step === 1) {
            if (fillMode === "manus") return false; // Manus chat step has its own "Proceed" button
            return !!form.category;
        }
        if (step === 2) return form.title.trim().length >= 5 && form.description.trim().length >= 20;
        if (step === 3) return form.location.trim().length >= 3;
        return true; // evidence is optional
    }

    // Final submission
    async function handleSubmit() {
        if (!db || !user) return;
        setSubmitting(true);
        try {
            const grievanceId = `JM-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
            const slaDeadlineAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
            const now = new Date().toISOString();

            let evidenceUrls: string[] = [];
            if (form.files.length > 0) {
                toast.loading("Uploading evidence files...");
                evidenceUrls = await uploadMultipleFiles(grievanceId, form.files);
                toast.dismiss();
            }

            const grievanceData = {
                id: grievanceId,
                citizenId: user.id,
                category: form.category,
                title: form.title.trim(),
                description: form.description.trim(),
                location: { address: form.location.trim() },
                privacyLevel: form.privacyLevel,
                isDelegated: form.isDelegated,
                ...(form.isDelegated ? { delegatedFor: { name: form.delegateName, relationship: form.delegateRelation } } : {}),
                evidenceUrls,
                status: "submitted",
                slaStatus: "on_track",
                slaDeadlineAt,
                supportCount: 0,
                reopenCount: 0,
                createdAt: now,
                updatedAt: now,
            };

            await setDoc(doc(db, "grievances", grievanceId), grievanceData);
            await addDoc(collection(db, "grievances", grievanceId, "events"), {
                type: "GRIEVANCE_SUBMITTED",
                actorId: user.id,
                timestamp: now,
                payload: { category: form.category, title: form.title },
            });

            toast.success(`Complaint ${grievanceId} submitted!`);
            router.push("/dashboard");
        } catch (err) {
            console.error(err);
            toast.error("Failed to submit. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-display font-bold">File a Complaint</h1>
                <p className="text-muted-foreground text-sm mt-0.5">
                    Your complaint will be assigned to the responsible department within 24 hours.
                </p>
            </div>

            {/* Stepper */}
            <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    {steps.map((s, i) => (
                        <div
                            key={s}
                            className={`flex items-center gap-1.5 ${i <= step ? "text-foreground" : ""}`}
                        >
                            <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${i < step
                                    ? "bg-[var(--trust-green)] text-white"
                                    : i === step
                                        ? "bg-[var(--civic-amber)] text-[var(--navy-deep)]"
                                        : "bg-foreground/10 text-muted-foreground"
                                    } `}
                            >
                                {i < step ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
                            </div>
                            <span className="hidden sm:inline">{s}</span>
                        </div>
                    ))}
                </div>
                <Progress value={pct} className="h-1.5 bg-foreground/10" />
            </div>

            {/* ── Step 0: How to Fill ──────────────────────────────── */}
            {step === 0 && (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-lg font-display font-semibold">How would you like to fill this?</h2>
                        <p className="text-sm text-muted-foreground mt-1">Choose how you want to describe your complaint.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Manual card */}
                        <button
                            onClick={() => setFillMode("manual")}
                            className={`group flex flex-col items-center gap-4 rounded-2xl border-2 p-8 text-center transition-all duration-200 ${fillMode === "manual"
                                ? "border-[var(--civic-amber)] bg-[var(--civic-amber-muted)] scale-[1.02]"
                                : "border-foreground/10 bg-foreground/3 hover:border-foreground/25 hover:bg-foreground/5"
                                }`}
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${fillMode === "manual"
                                ? "bg-[var(--civic-amber)] text-[var(--navy-deep)]"
                                : "bg-foreground/10 text-muted-foreground group-hover:text-foreground"
                                }`}>
                                <PenLine className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="font-bold text-base">Fill Manually</p>
                                <p className="text-xs text-muted-foreground mt-1">Step-by-step form. You type everything yourself.</p>
                            </div>
                            {fillMode === "manual" && <CheckCircle2 className="w-5 h-5 text-[var(--civic-amber)]" />}
                        </button>

                        {/* Manus AI card */}
                        <button
                            onClick={() => {
                                setFillMode("manus");
                                setStep(1); // Go straight to chat
                            }}
                            className={`group flex flex-col items-center gap-4 rounded-2xl border-2 p-8 text-center transition-all duration-200 ${fillMode === "manus"
                                ? "border-purple-500 bg-purple-500/10 scale-[1.02]"
                                : "border-foreground/10 bg-foreground/3 hover:border-purple-500/40 hover:bg-purple-500/5"
                                }`}
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${fillMode === "manus"
                                ? "bg-purple-500 text-white"
                                : "bg-foreground/10 text-muted-foreground group-hover:text-purple-400"
                                }`}>
                                <Sparkles className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="font-bold text-base">Use Manus AI</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Just describe in plain words — AI fills the form for you.
                                </p>
                            </div>
                            {fillMode === "manus" && <CheckCircle2 className="w-5 h-5 text-purple-400" />}
                        </button>
                    </div>

                    {fillMode === "manus" && (
                        <div className="glass rounded-xl p-4 flex items-start gap-3 border border-purple-500/20">
                            <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                            <p className="text-sm text-muted-foreground">
                                You&apos;ve selected <span className="text-purple-400 font-semibold">Manus AI</span>.
                                Click <strong>Next</strong> to start the conversation.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* ── Step 1: Input (Category or Manus Chat) ───────────── */}
            {step === 1 && (
                fillMode === "manus" ? (
                    <div className="pt-2 min-h-[500px] flex flex-col">
                        <ManusChatView onFill={handleManuseFill} />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <h2 className="text-lg font-display font-semibold">What is this about?</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {CATEGORIES.map((cat) => {
                                const Icon = cat.icon;
                                const selected = form.category === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setForm((f) => ({ ...f, category: cat.id }))}
                                        className={`flex flex-col items-center gap-2.5 rounded-xl border-2 p-4 text-center transition-all duration-200 ${selected
                                            ? `${cat.border} ${cat.bg} scale-[1.02]`
                                            : "border-foreground/10 bg-foreground/3 hover:bg-foreground/5 hover:border-foreground/20"
                                            }`}
                                    >
                                        <div className={`p-2.5 rounded-lg ${selected ? cat.bg : "bg-foreground/5"}`}>
                                            <Icon className={`w-5 h-5 ${cat.color}`} />
                                        </div>
                                        <span className={`text-xs font-medium leading-tight ${selected ? "text-foreground" : "text-muted-foreground"}`}>
                                            {cat.id}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )
            )}

            {/* ── Step 2: Details ─────────────────────────────────── */}
            {step === 2 && (
                <div className="space-y-5">
                    <h2 className="text-lg font-display font-semibold">Describe the issue</h2>

                    <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">
                            Title <span className="text-[var(--accountability-red)]">*</span>
                        </Label>
                        <Input
                            value={form.title}
                            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                            placeholder="e.g. Broken streetlight near MG Road for 3 weeks"
                            maxLength={80}
                            className="bg-foreground/5 border-foreground/10 focus:border-[var(--civic-amber)]/50"
                        />
                        <p className="text-xs text-muted-foreground text-right">{form.title.length}/80</p>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">
                            Description <span className="text-[var(--accountability-red)]">*</span>
                        </Label>
                        <Textarea
                            value={form.description}
                            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                            placeholder="Provide as much detail as possible — how long, impact, any attempts to resolve…"
                            rows={5}
                            className="bg-foreground/5 border-foreground/10 focus:border-[var(--civic-amber)]/50 resize-none"
                        />
                        <p className="text-xs text-muted-foreground">{form.description.length} chars · Minimum 20</p>
                    </div>

                    {/* Privacy */}
                    <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Privacy level</Label>
                        <div className="space-y-2.5">
                            {PRIVACY_OPTIONS.map((opt) => {
                                const Icon = opt.icon;
                                const selected = form.privacyLevel === opt.id;
                                return (
                                    <button
                                        key={opt.id}
                                        onClick={() => setForm((f) => ({ ...f, privacyLevel: opt.id }))}
                                        className={`w-full flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${selected ? "border-foreground/20 bg-foreground/10" : "border-foreground/10 bg-foreground/5 hover:bg-foreground/8"
                                            }`}
                                    >
                                        <div className={`mt-0.5 shrink-0 ${opt.color}`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold">{opt.label}</span>
                                                {selected && (
                                                    <Badge className="text-[9px] bg-[var(--civic-amber-muted)] text-[var(--civic-amber)] border-0 font-bold h-4">
                                                        Selected
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Delegation */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setForm((f) => ({ ...f, isDelegated: !f.isDelegated }))}
                                className={`w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center transition-all ${form.isDelegated
                                    ? "bg-[var(--civic-amber)] border-[var(--civic-amber)]"
                                    : "border-foreground/20 hover:border-foreground/40"
                                    }`}
                            >
                                {form.isDelegated && <CheckCircle2 className="w-3 h-3 text-[var(--navy-deep)]" />}
                            </button>
                            <div>
                                <p className="text-sm font-medium flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5" /> I am filing this on behalf of someone else
                                </p>
                                <p className="text-xs text-muted-foreground">Parents, elderly neighbors, or community members</p>
                            </div>
                        </div>

                        {form.isDelegated && (
                            <div className="grid grid-cols-2 gap-3 mt-2 pl-8">
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Their name</Label>
                                    <Input
                                        value={form.delegateName}
                                        onChange={(e) => setForm((f) => ({ ...f, delegateName: e.target.value }))}
                                        placeholder="Full name"
                                        className="bg-foreground/5 border-foreground/10 focus:border-[var(--civic-amber)]/50 h-9 text-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Relationship</Label>
                                    <Input
                                        value={form.delegateRelation}
                                        onChange={(e) => setForm((f) => ({ ...f, delegateRelation: e.target.value }))}
                                        placeholder="e.g. Parent"
                                        className="bg-foreground/5 border-foreground/10 focus:border-[var(--civic-amber)]/50 h-9 text-sm"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Step 3: Location ────────────────────────────────── */}
            {step === 3 && (
                <div className="space-y-5">
                    <h2 className="text-lg font-display font-semibold">Where is this happening?</h2>

                    <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">
                            Address / Area <span className="text-[var(--accountability-red)]">*</span>
                        </Label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    value={form.location}
                                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                                    placeholder="e.g. Near SBI Bank, Sector 14, Ward 6, New Delhi"
                                    className="pl-10 bg-foreground/5 border-foreground/10 focus:border-[var(--civic-amber)]/50"
                                />
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => setLocationModalOpen(true)}
                                className="shrink-0 border-blue-500/30 text-blue-500 hover:bg-blue-500/10 gap-2"
                            >
                                <MapIcon className="w-4 h-4" />
                                <span className="hidden sm:inline">Open Map</span>
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Be as specific as possible — landmark, street name, ward number, or pin code.
                        </p>
                    </div>

                    {/* Inline Map Preview */}
                    {capturedLatLon ? (
                        <div className="relative rounded-xl overflow-hidden border border-foreground/10 bg-muted h-[120px] isolate">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={`https://static-maps.yandex.ru/1.x/?ll=${capturedLatLon.lon},${capturedLatLon.lat}&size=400,120&z=15&l=map&pt=${capturedLatLon.lon},${capturedLatLon.lat},pm2rdm`}
                                alt="Map preview"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 ring-1 ring-inset ring-black/10 pointer-events-none rounded-xl" />
                        </div>
                    ) : (
                        <div className="glass rounded-xl p-4 flex items-center gap-3 text-sm text-muted-foreground border border-dashed border-foreground/10">
                            <MapPin className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                            <p>No map location pinned yet. Use the <strong className="text-foreground">Open Map</strong> button to pin your exact location via GPS.</p>
                        </div>
                    )}
                </div>
            )}

            {/* ── Step 4: Evidence ────────────────────────────────── */}
            {step === 4 && (
                <div className="space-y-5">
                    <div>
                        <h2 className="text-lg font-display font-semibold">Add Evidence (Optional)</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Photos or documents strengthen your complaint. Max 5 files, 10 MB each.
                        </p>
                    </div>

                    {/* Drop zone */}
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setDragOver(false);
                            addFiles(e.dataTransfer.files);
                        }}
                        onClick={() => document.getElementById("file-input")?.click()}
                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragOver
                            ? "border-[var(--civic-amber)] bg-[var(--civic-amber-muted)]"
                            : "border-foreground/15 hover:border-foreground/30 hover:bg-foreground/3"
                            }`}
                    >
                        <Upload className={`w-8 h-8 mx-auto mb-3 ${dragOver ? "text-[var(--civic-amber)]" : "text-muted-foreground"}`} />
                        <p className="text-sm font-medium">Drag &amp; drop files here</p>
                        <p className="text-xs text-muted-foreground mt-1">or click to browse · JPG, PNG, PDF, MP4</p>
                        <input
                            id="file-input"
                            type="file"
                            multiple
                            accept="image/*,application/pdf,video/mp4"
                            className="hidden"
                            onChange={(e) => e.target.files && addFiles(e.target.files)}
                        />
                    </div>

                    {/* File list */}
                    {form.files.length > 0 && (
                        <div className="space-y-2">
                            {form.files.map((file, i) => (
                                <div key={i} className="flex items-center gap-3 glass rounded-lg px-4 py-2.5">
                                    <div className="w-8 h-8 rounded bg-foreground/10 flex items-center justify-center shrink-0">
                                        {file.type.startsWith("image/") ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt=""
                                                className="w-8 h-8 rounded object-cover"
                                            />
                                        ) : (
                                            <Upload className="w-4 h-4 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate">{file.name}</p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                                        className="text-muted-foreground hover:text-[var(--accountability-red)] transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Summary card before final submit */}
                    <div className="glass rounded-xl p-5 space-y-3 border border-foreground/10">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Summary</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div>
                                <p className="text-xs text-muted-foreground">Category</p>
                                <p className="font-medium">{form.category}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Privacy</p>
                                <p className="font-medium capitalize">{form.privacyLevel}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs text-muted-foreground">Title</p>
                                <p className="font-medium">{form.title}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs text-muted-foreground">Location</p>
                                <p className="font-medium">{form.location}</p>
                            </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground border-t border-foreground/10 pt-3">
                            ⏱ SLA: 7 days · You will be notified at each status update.
                        </p>
                    </div>
                </div>
            )}

            {/* ── Navigation ───────────────────────────────────────── */}
            <div className="flex items-center justify-between pt-2">
                <Button
                    variant="outline"
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    disabled={step === 0}
                    className="border-foreground/10 hover:bg-foreground/5 gap-2"
                >
                    <ChevronLeft className="w-4 h-4" /> Back
                </Button>

                {(step < steps.length - 1 && !(step === 1 && fillMode === "manus")) ? (
                    <Button
                        onClick={() => setStep((s) => s + 1)}
                        disabled={!canProceed()}
                        className="bg-[var(--civic-amber)] text-[var(--navy-deep)] hover:bg-[var(--civic-amber)]/90 font-bold gap-2"
                    >
                        Next <ChevronRight className="w-4 h-4" />
                    </Button>
                ) : (
                    step === steps.length - 1 && (
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="bg-[var(--civic-amber)] text-[var(--navy-deep)] hover:bg-[var(--civic-amber)]/90 font-bold gap-2 glow-amber"
                        >
                            {submitting ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                            ) : (
                                <><CheckCircle2 className="w-4 h-4" /> Submit Complaint</>
                            )}
                        </Button>
                    )
                )}
            </div>
            {/* ── Additional Modals ───────────────────────────────── */}
            <LocationModal
                open={locationModalOpen}
                onOpenChange={setLocationModalOpen}
                onSelectLocation={(loc: string, coords?: { lat: string; lon: string }) => {
                    setForm((f) => ({ ...f, location: loc }));
                    if (coords) setCapturedLatLon(coords);
                }}
            />
        </div>
    );
}
