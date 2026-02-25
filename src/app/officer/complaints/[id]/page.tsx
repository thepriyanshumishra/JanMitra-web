"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    doc, onSnapshot, collection, addDoc, updateDoc,
    serverTimestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
    ArrowLeft, CheckCircle2, AlertTriangle, XCircle,
    RefreshCw, FileEdit, Loader2, ChevronDown, Upload,
    Paperclip, X, Image
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { SLACountdown } from "@/components/grievance/SLACountdown";
import { EventTimeline } from "@/components/grievance/EventTimeline";
import { useAuth } from "@/features/auth/AuthProvider";
import { uploadEvidenceFile } from "@/lib/uploadFile";

interface GrievanceDoc {
    id: string;
    category: string;
    title: string;
    description: string;
    location: { address: string };
    privacyLevel: string;
    status: string;
    slaStatus: string;
    slaDeadlineAt: string;
    citizenId: string;
    createdAt: string;
    evidenceUrls?: string[];
}

const STATUS_LABELS: Record<string, string> = {
    submitted: "Submitted", routed: "Routed", assigned: "Assigned",
    acknowledged: "Acknowledged", in_progress: "In Progress",
    escalated: "Escalated", closed: "Resolved", reopened: "Reopened",
};

const DELAY_REASONS = [
    "Technical / Equipment Issue",
    "Awaiting Materials / Resources",
    "Pending Approval / Clearance",
    "Weather / Force Majeure",
    "Inter-department Coordination",
    "High Priority Task Conflict",
    "Other",
];

export default function OfficerComplaintPage() {
    const params = useParams<{ id: string }>();
    const { user } = useAuth();
    const [grievance, setGrievance] = useState<GrievanceDoc | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("in_progress");

    // Delay explanation
    const [delayReason, setDelayReason] = useState(DELAY_REASONS[0]);
    const [delayDetails, setDelayDetails] = useState("");
    const [showDelayForm, setShowDelayForm] = useState(false);

    // Proof upload
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [proofUploading, setProofUploading] = useState(false);
    const [proofProgress, setProofProgress] = useState(0);
    const proofInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!db || !params.id) return;
        return onSnapshot(doc(db, "grievances", params.id), (snap) => {
            if (snap.exists()) setGrievance({ id: snap.id, ...snap.data() } as GrievanceDoc);
            setLoading(false);
        });
    }, [params.id]);

    async function performAction(
        type: string,
        newStatus: string,
        newSlaStatus?: string,
        extra?: Record<string, string>
    ) {
        if (!db || !grievance || !user) return;
        setActionLoading(true);
        try {
            const now = new Date().toISOString();
            await addDoc(collection(db, "grievances", grievance.id, "events"), {
                type,
                actorId: user.id,
                actorName: user.name ?? "Officer",
                timestamp: now,
                payload: {
                    newStatus,
                    ...(message ? { message } : {}),
                    ...extra,
                },
            });
            const update: Record<string, unknown> = { status: newStatus, updatedAt: now };
            if (newSlaStatus) update.slaStatus = newSlaStatus;
            if (newStatus === "closed") update.closedAt = now;
            await updateDoc(doc(db, "grievances", grievance.id), update);
            toast.success(`Action recorded: ${type.replace(/_/g, " ")}`);
            setMessage("");
        } catch (err) {
            console.error(err);
            toast.error("Action failed. Please try again.");
        } finally {
            setActionLoading(false);
        }
    }

    async function handleUploadProof() {
        if (!db || !grievance || !user || !proofFile) return;
        setProofUploading(true);
        setProofProgress(0);
        try {
            const url = await uploadEvidenceFile(
                grievance.id,
                proofFile,
                (p) => setProofProgress(p)
            );
            const now = new Date().toISOString();
            await addDoc(collection(db, "grievances", grievance.id, "events"), {
                type: "PROOF_UPLOADED",
                actorId: user.id,
                actorName: user.name ?? "Officer",
                timestamp: now,
                payload: { proofUrl: url, fileName: proofFile.name },
            });
            // Store proof URL on the grievance doc itself too
            await updateDoc(doc(db, "grievances", grievance.id), {
                proofUrls: [...(grievance.evidenceUrls ?? []), url],
                updatedAt: now,
            });
            toast.success("Proof uploaded and recorded on the event log.");
            setProofFile(null);
        } catch (err) {
            console.error(err);
            toast.error("Proof upload failed. Please try again.");
        } finally {
            setProofUploading(false);
            setProofProgress(0);
        }
    }

    async function handleDelayExplanation() {
        if (!grievance || !user) return;
        await performAction("DELAY_EXPLAINED", grievance.status, undefined, {
            delayReason,
            details: delayDetails,
        });
        setShowDelayForm(false);
        setDelayDetails("");
    }

    if (loading) return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--civic-amber)]" />
        </div>
    );

    if (!grievance) return (
        <div className="max-w-2xl mx-auto px-4 py-16 text-center text-muted-foreground">
            Complaint not found.
            <Link href="/queue"><Button variant="outline" className="mt-4 border-white/10 block mx-auto">Back to Queue</Button></Link>
        </div>
    );

    const isClosed = grievance.status === "closed";

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
            <Link href="/queue" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Queue
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Detail + Timeline */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header */}
                    <div className="glass rounded-2xl p-6 space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono text-muted-foreground">{grievance.id}</span>
                            <Badge variant="outline" className="text-[10px] border-white/10 text-muted-foreground">
                                {grievance.category}
                            </Badge>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--civic-amber-muted)] text-[var(--civic-amber)]">
                                {STATUS_LABELS[grievance.status] ?? grievance.status}
                            </span>
                        </div>
                        <h1 className="text-xl font-display font-bold">
                            {grievance.privacyLevel === "private" ? "[Private Complaint]" : grievance.title}
                        </h1>
                        {grievance.privacyLevel !== "private" && (
                            <p className="text-sm text-foreground/80 leading-relaxed">{grievance.description}</p>
                        )}
                        {grievance.location?.address && (
                            <p className="text-xs text-muted-foreground">📍 {grievance.location.address}</p>
                        )}
                        {!isClosed && (
                            <div className="pt-2">
                                <SLACountdown slaDeadlineAt={grievance.slaDeadlineAt} />
                            </div>
                        )}
                    </div>

                    {/* Citizen Evidence */}
                    {grievance.evidenceUrls && grievance.evidenceUrls.length > 0 && (
                        <div className="glass rounded-2xl p-6">
                            <h2 className="text-sm font-display font-semibold mb-4 flex items-center gap-2">
                                <Paperclip className="w-4 h-4 text-[var(--civic-amber)]" /> Citizen Evidence ({grievance.evidenceUrls.length})
                            </h2>
                            <div className="flex flex-wrap gap-3">
                                {grievance.evidenceUrls.map((url, i) => (
                                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                                        className="glass border border-white/10 rounded-xl p-3 flex items-center gap-2 hover:bg-white/5 transition-colors text-xs text-muted-foreground">
                                        <Image className="w-4 h-4 text-[var(--civic-amber)]" />
                                        File {i + 1}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Timeline */}
                    <div className="glass rounded-2xl p-6">
                        <h2 className="text-sm font-display font-semibold mb-5">Event Timeline</h2>
                        <EventTimeline grievanceId={grievance.id} />
                    </div>
                </div>

                {/* Right: Action Panel */}
                <div className="space-y-4">
                    <div className="glass rounded-2xl p-5 space-y-4 sticky top-20">
                        <h2 className="text-sm font-display font-semibold">Officer Actions</h2>

                        {isClosed ? (
                            <div className="text-center py-6 text-sm text-muted-foreground">
                                <CheckCircle2 className="w-8 h-8 text-[var(--trust-green)] mx-auto mb-2" />
                                Complaint resolved and closed.
                            </div>
                        ) : (
                            <>
                                {/* Optional note */}
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Public update note (optional)</Label>
                                    <Textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Add a note visible to the citizen…"
                                        rows={2}
                                        className="bg-white/5 border-white/10 focus:border-[var(--civic-amber)]/50 text-sm resize-none"
                                    />
                                </div>

                                <div className="space-y-2.5">
                                    {/* Acknowledge */}
                                    {["submitted", "routed", "assigned"].includes(grievance.status) && (
                                        <Button
                                            onClick={() => performAction("ACKNOWLEDGED", "acknowledged")}
                                            disabled={actionLoading}
                                            className="w-full bg-[var(--trust-green)] hover:bg-[var(--trust-green)]/90 text-white font-bold gap-2"
                                        >
                                            <CheckCircle2 className="w-4 h-4" /> Acknowledge
                                        </Button>
                                    )}

                                    {/* Update Status */}
                                    <div className="flex gap-2">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="sm" className="shrink-0 border-white/10 hover:bg-white/5 gap-1 text-xs">
                                                    {STATUS_LABELS[selectedStatus]} <ChevronDown className="w-3 h-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="bg-[var(--card)] border-white/10 w-48">
                                                {["acknowledged", "in_progress", "escalated"].map((s) => (
                                                    <DropdownMenuItem
                                                        key={s}
                                                        onClick={() => setSelectedStatus(s)}
                                                        className="text-sm hover:bg-white/5"
                                                    >
                                                        {STATUS_LABELS[s]}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <Button
                                            onClick={() => performAction("STATUS_UPDATED", selectedStatus)}
                                            disabled={actionLoading}
                                            variant="outline"
                                            className="flex-1 border-white/10 hover:bg-white/5 gap-2 text-sm"
                                        >
                                            <RefreshCw className="w-3.5 h-3.5" /> Update
                                        </Button>
                                    </div>

                                    {/* ── Upload Proof ── */}
                                    <div className="space-y-2 pt-1 border-t border-white/5">
                                        <Label className="text-xs text-muted-foreground">Upload Resolution Proof</Label>
                                        <input
                                            ref={proofInputRef}
                                            type="file"
                                            accept="image/*,application/pdf"
                                            className="hidden"
                                            onChange={e => setProofFile(e.target.files?.[0] ?? null)}
                                        />
                                        {proofFile ? (
                                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-2.5">
                                                <Paperclip className="w-4 h-4 text-[var(--civic-amber)] shrink-0" />
                                                <span className="text-xs flex-1 truncate">{proofFile.name}</span>
                                                <button onClick={() => setProofFile(null)} className="text-muted-foreground hover:text-foreground">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                onClick={() => proofInputRef.current?.click()}
                                                className="w-full border-white/10 hover:bg-white/5 gap-2 text-sm border-dashed"
                                            >
                                                <Upload className="w-3.5 h-3.5" /> Choose File
                                            </Button>
                                        )}
                                        {proofFile && (
                                            <Button
                                                onClick={handleUploadProof}
                                                disabled={proofUploading}
                                                className="w-full bg-blue-600 hover:bg-blue-600/90 text-white font-bold gap-2 text-sm"
                                            >
                                                {proofUploading
                                                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading {proofProgress}%</>
                                                    : <><Upload className="w-3.5 h-3.5" /> Submit Proof</>
                                                }
                                            </Button>
                                        )}
                                    </div>

                                    {/* ── Explain Delay ── */}
                                    <div className="pt-1 border-t border-white/5">
                                        {showDelayForm ? (
                                            <div className="space-y-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3">
                                                <Label className="text-xs text-yellow-400 font-semibold">Delay Explanation</Label>
                                                <select
                                                    value={delayReason}
                                                    onChange={e => setDelayReason(e.target.value)}
                                                    className="w-full text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-foreground"
                                                >
                                                    {DELAY_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                                                </select>
                                                <Textarea
                                                    value={delayDetails}
                                                    onChange={e => setDelayDetails(e.target.value)}
                                                    placeholder="Additional context (optional)…"
                                                    rows={2}
                                                    className="bg-white/5 border-white/10 text-sm resize-none"
                                                />
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline"
                                                        onClick={() => setShowDelayForm(false)}
                                                        className="flex-1 border-white/10 text-xs">Cancel</Button>
                                                    <Button size="sm"
                                                        onClick={handleDelayExplanation}
                                                        disabled={actionLoading}
                                                        className="flex-1 bg-yellow-500 text-black hover:bg-yellow-400 font-bold text-xs">Submit</Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <Button
                                                onClick={() => setShowDelayForm(true)}
                                                variant="outline"
                                                className="w-full border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 gap-2 text-sm"
                                            >
                                                <FileEdit className="w-3.5 h-3.5" /> Explain Delay
                                            </Button>
                                        )}
                                    </div>

                                    {/* ── Escalate ── */}
                                    <Button
                                        onClick={() => {
                                            if (!confirm("Escalate this complaint? This will be visible to the citizen and dept admin.")) return;
                                            performAction("ESCALATED", "escalated", "breached");
                                        }}
                                        disabled={actionLoading}
                                        variant="outline"
                                        className="w-full border-[var(--accountability-red)]/30 text-[var(--accountability-red)] hover:bg-[var(--accountability-red-muted)] gap-2 text-sm"
                                    >
                                        <AlertTriangle className="w-3.5 h-3.5" /> Escalate
                                    </Button>

                                    {/* ── Mark Resolved ── */}
                                    <Button
                                        onClick={() => {
                                            if (!confirm("Mark this complaint as resolved and closed?")) return;
                                            performAction("CLOSED", "closed");
                                        }}
                                        disabled={actionLoading}
                                        className="w-full bg-[var(--civic-amber)] text-[var(--navy-deep)] hover:bg-[var(--civic-amber)]/90 font-bold gap-2"
                                    >
                                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><XCircle className="w-4 h-4" /> Mark Resolved</>}
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
