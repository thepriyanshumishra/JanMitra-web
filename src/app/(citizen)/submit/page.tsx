"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Droplets, Trash2, Navigation, Zap, Bus, HeartPulse,
    BookOpen, TreePine, Wind, Home, Shield, HelpCircle,
    MapPin, Upload, X, CheckCircle2, Loader2, ChevronLeft,
    ChevronRight, Eye, EyeOff, Lock, Users
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
import { ManusDrawer } from "@/features/manus/ManusDrawer";

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

const STEPS = ["Category", "Details", "Location", "Evidence"];

// ─── Component ────────────────────────────────────────────────────
export default function SubmitComplaintPage() {
    const { user } = useAuth();
    const { loading: authLoading } = useRequireAuth();
    const router = useRouter();

    const [step, setStep] = useState(0);
    const [form, setForm] = useState<FormData>(INITIAL_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    if (authLoading || !user) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--civic-amber)]" />
            </div>
        );
    }

    const pct = Math.round(((step + 1) / STEPS.length) * 100);

    // Manus auto-fill handler
    function handleManuseFill(data: { category: string; title: string; description: string; location: string }) {
        setForm((f) => ({
            ...f,
            category: data.category || f.category,
            title: data.title || f.title,
            description: data.description || f.description,
            location: data.location || f.location,
        }));
        // Jump to wherever category or details need attention
        if (!form.category && data.category) setStep(0);
        else setStep(1);
    }

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

    function removeFile(index: number) {
        setForm((f) => ({ ...f, files: f.files.filter((_, i) => i !== index) }));
    }

    // Validation per step
    function canProceed(): boolean {
        if (step === 0) return !!form.category;
        if (step === 1) return form.title.trim().length >= 5 && form.description.trim().length >= 20;
        if (step === 2) return form.location.trim().length >= 3;
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

            // Upload files if any
            let evidenceUrls: string[] = [];
            if (form.files.length > 0) {
                toast.loading("Uploading evidence files...");
                evidenceUrls = await uploadMultipleFiles(grievanceId, form.files);
                toast.dismiss();
            }

            // Write grievance to Firestore
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

            // Write GRIEVANCE_SUBMITTED event
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
                    {STEPS.map((s, i) => (
                        <div
                            key={s}
                            className={`flex items-center gap-1.5 ${i <= step ? "text-foreground" : ""}`}
                        >
                            <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${i < step
                                        ? "bg-[var(--trust-green)] text-white"
                                        : i === step
                                            ? "bg-[var(--civic-amber)] text-[var(--navy-deep)]"
                                            : "bg-white/10 text-muted-foreground"
                                    }`}
                            >
                                {i < step ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
                            </div>
                            <span className="hidden sm:inline">{s}</span>
                        </div>
                    ))}
                </div>
                <Progress value={pct} className="h-1.5 bg-white/10" />
            </div>

            {/* ── Step 0: Category ────────────────────────────────────── */}
            {step === 0 && (
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
                                            : "border-white/10 bg-white/3 hover:bg-white/6 hover:border-white/20"
                                        }`}
                                >
                                    <div className={`p-2.5 rounded-lg ${selected ? cat.bg : "bg-white/5"}`}>
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
            )}

            {/* ── Step 1: Details ─────────────────────────────────────── */}
            {step === 1 && (
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
                            className="bg-white/5 border-white/10 focus:border-[var(--civic-amber)]/50"
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
                            className="bg-white/5 border-white/10 focus:border-[var(--civic-amber)]/50 resize-none"
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
                                        className={`w-full flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${selected ? "border-white/20 bg-white/8" : "border-white/8 bg-white/3 hover:bg-white/5"
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
                                        : "border-white/20 hover:border-white/40"
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
                                        className="bg-white/5 border-white/10 focus:border-[var(--civic-amber)]/50 h-9 text-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Relationship</Label>
                                    <Input
                                        value={form.delegateRelation}
                                        onChange={(e) => setForm((f) => ({ ...f, delegateRelation: e.target.value }))}
                                        placeholder="e.g. Parent"
                                        className="bg-white/5 border-white/10 focus:border-[var(--civic-amber)]/50 h-9 text-sm"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Step 2: Location ─────────────────────────────────────── */}
            {step === 2 && (
                <div className="space-y-5">
                    <h2 className="text-lg font-display font-semibold">Where is this happening?</h2>

                    <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">
                            Address / Area <span className="text-[var(--accountability-red)]">*</span>
                        </Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                value={form.location}
                                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                                placeholder="e.g. Near SBI Bank, Sector 14, Ward 6, New Delhi"
                                className="pl-10 bg-white/5 border-white/10 focus:border-[var(--civic-amber)]/50"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Be as specific as possible — landmark, street name, ward number, or pin code.
                        </p>
                    </div>

                    <div className="glass rounded-xl p-4 flex items-center gap-3 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 text-[var(--civic-amber)] shrink-0" />
                        <p>Interactive map pin coming soon. For now, text-based location is sufficient for routing.</p>
                    </div>
                </div>
            )}

            {/* ── Step 3: Evidence ─────────────────────────────────────── */}
            {step === 3 && (
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
                                : "border-white/15 hover:border-white/30 hover:bg-white/3"
                            }`}
                    >
                        <Upload className={`w-8 h-8 mx-auto mb-3 ${dragOver ? "text-[var(--civic-amber)]" : "text-muted-foreground"}`} />
                        <p className="text-sm font-medium">Drag & drop files here</p>
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
                                    <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center shrink-0">
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
                    <div className="glass rounded-xl p-5 space-y-3 border border-white/8">
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
                        <p className="text-[10px] text-muted-foreground border-t border-white/10 pt-3">
                            ⏱ SLA: 7 days · You will be notified at each status update.
                        </p>
                    </div>
                </div>
            )}

            {/* ── Navigation ───────────────────────────────────────────── */}
            <div className="flex items-center justify-between pt-2">
                <Button
                    variant="outline"
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    disabled={step === 0}
                    className="border-white/10 hover:bg-white/5 gap-2"
                >
                    <ChevronLeft className="w-4 h-4" /> Back
                </Button>

                {step < STEPS.length - 1 ? (
                    <Button
                        onClick={() => setStep((s) => s + 1)}
                        disabled={!canProceed()}
                        className="bg-[var(--civic-amber)] text-[var(--navy-deep)] hover:bg-[var(--civic-amber)]/90 font-bold gap-2"
                    >
                        Next <ChevronRight className="w-4 h-4" />
                    </Button>
                ) : (
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
                )}
            </div>

            {/* Manus FAB */}
            <ManusDrawer onFill={handleManuseFill} />
        </div>
    );
}
