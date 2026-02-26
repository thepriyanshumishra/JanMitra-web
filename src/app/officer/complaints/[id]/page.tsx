"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { LocalStorage } from "@/lib/storage";
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
import { ActionInterviewModal } from "@/components/grievance/ActionInterviewModal";
import { useAuth } from "@/features/auth/AuthProvider";

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



export default function OfficerComplaintPage() {
    const params = useParams<{ id: string }>();
    const { user } = useAuth();
    const [grievance, setGrievance] = useState<GrievanceDoc | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("in_progress");

    // AI Interview
    const [interviewOpen, setInterviewOpen] = useState(false);
    const [interviewAction, setInterviewAction] = useState<"RESOLVE" | "ESCALATE" | "DELAY" | null>(null);
    const [aiVerifiedAction, setAiVerifiedAction] = useState<"RESOLVE" | "ESCALATE" | "DELAY" | null>(null);
    const [aiRequiresEvidence, setAiRequiresEvidence] = useState(false);

    // Proof upload
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [proofUploading, setProofUploading] = useState(false);
    const [proofProgress, setProofProgress] = useState(0);
    const proofInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!params.id) return;

        // Fetch from LocalStorage
        const localData = LocalStorage.getGrievance(params.id);
        if (localData) {
            setGrievance(localData as unknown as GrievanceDoc);
        }
        setLoading(false);
    }, [params.id]);

    async function performAction(
        type: string,
        newStatus: string,
        newSlaStatus?: string,
        extra?: Record<string, string>
    ) {
        if (!grievance || !user) return;
        setActionLoading(true);
        try {
            const now = new Date().toISOString();

            // 1. Save event in LocalStorage
            LocalStorage.saveEvent({
                id: `EVT-${Date.now()}`,
                grievanceId: grievance.id,
                eventType: type as any,
                actorId: user.id,
                actorRole: user.role,
                payload: {
                    newStatus,
                    ...(message ? { message } : {}),
                    ...extra,
                },
                createdAt: now,
            });

            // 2. Update grievance in LocalStorage
            const update: any = {
                ...grievance,
                status: newStatus,
                updatedAt: now
            };
            if (newSlaStatus) update.slaStatus = newSlaStatus;
            if (newStatus === "closed") update.closedAt = now;

            LocalStorage.saveGrievance(update);
            setGrievance(update);

            toast.success(`Action recorded: ${type.replace(/_/g, " ")}`);
            setMessage("");

            // Fire-and-forget: still try the API if configured
            fetch(`/api/grievances/${grievance.id}/events`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, newStatus, message, ...extra }),
            }).catch(() => { });
        } catch (err) {
            console.error(err);
            toast.error("Action failed. Please try again.");
        } finally {
            setActionLoading(false);
        }
    }

    /** Fire-and-forget: look up citizen email then call /api/notify */
    async function sendNotify(eventType: string, citizenId: string, grievanceId: string, extra?: Record<string, string>) {
        try {
            const { getDoc, doc: fsDoc } = await import("firebase/firestore");
            if (!db) return;
            const citizenSnap = await getDoc(fsDoc(db, "users", citizenId));
            const citizenData = citizenSnap.data();
            if (!citizenData?.email) return;
            await fetch("/api/notify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    to: citizenData.email,
                    citizenName: citizenData.name ?? "Citizen",
                    grievanceId,
                    eventType: eventType as string,
                    extra,
                }),
            });
        } catch {
            // silently ignore — notifications are non-critical
        }
    }


    async function handleUploadProof() {
        if (!grievance || !user || !proofFile) return;
        setProofUploading(true);
        setProofProgress(0);
        try {
            // Mock upload for local storage
            const mockUrl = `/mock-proof/${grievance.id}/${proofFile.name}`;
            const now = new Date().toISOString();

            LocalStorage.saveEvent({
                id: `EVT-${Date.now()}`,
                grievanceId: grievance.id,
                eventType: "PROOF_UPLOADED",
                actorId: user.id,
                actorRole: user.role,
                payload: { proofUrl: mockUrl, fileName: proofFile.name },
                createdAt: now,
            });

            const update = {
                ...grievance,
                evidenceUrls: [...(grievance.evidenceUrls ?? []), mockUrl],
                updatedAt: now,
            };

            LocalStorage.saveGrievance(update as any);
            setGrievance(update as any);

            toast.success("Proof recorded locally.");
            setProofFile(null);
        } catch (err) {
            console.error(err);
            toast.error("Proof upload failed.");
        } finally {
            setProofUploading(false);
            setProofProgress(0);
        }
    }

    function handleStartInterview(action: "RESOLVE" | "ESCALATE" | "DELAY") {
        setInterviewAction(action);
        setInterviewOpen(true);
    }

    async function onInterviewComplete(finalReason: string, requiresEvidence: boolean) {
        if (!grievance || !user) return;

        // Populate the main textarea with the AI's synthesized reason
        setMessage(finalReason);
        setAiVerifiedAction(interviewAction);
        setAiRequiresEvidence(requiresEvidence);
        setInterviewOpen(false);

        toast.info("AI reasoning captured! You can now review and submit the action.", { duration: 4000 });
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
                                            onClick={() => performAction("OFFICER_ACKNOWLEDGED", "acknowledged")}
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
                                            onClick={() => performAction("UPDATE_PROVIDED", selectedStatus)}
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
                                        <Button
                                            onClick={() => {
                                                if (aiVerifiedAction === "DELAY" && message.length > 10) {
                                                    performAction("DELAY_EXPLANATION_SUBMITTED", grievance.status, undefined, { delayReason: "AI Verified Assesment", details: message });
                                                } else {
                                                    handleStartInterview("DELAY");
                                                }
                                            }}
                                            variant="outline"
                                            className={`w-full gap-2 text-sm transition-all ${aiVerifiedAction === "DELAY"
                                                ? "bg-yellow-500 text-black hover:bg-yellow-600 border-none scale-[1.02] shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                                                : "border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                                                }`}
                                        >
                                            <FileEdit className="w-3.5 h-3.5" />
                                            {aiVerifiedAction === "DELAY" ? "Submit Delay Details" : "Explain Delay"}
                                        </Button>
                                    </div>

                                    {/* ── Escalate ── */}
                                    <Button
                                        onClick={() => {
                                            if (aiVerifiedAction === "ESCALATE" && message.length > 10) {
                                                performAction("ESCALATED", "escalated", "breached", { message });
                                            } else {
                                                handleStartInterview("ESCALATE");
                                            }
                                        }}
                                        disabled={actionLoading}
                                        variant="outline"
                                        className={`w-full gap-2 text-sm transition-all ${aiVerifiedAction === "ESCALATE"
                                            ? "bg-red-500 text-white hover:bg-red-600 border-none scale-[1.02] shadow-[0_0_15px_rgba(239,68,68,0.3)] font-bold"
                                            : "border-[var(--accountability-red)]/30 text-[var(--accountability-red)] hover:bg-[var(--accountability-red-muted)]"
                                            }`}
                                    >
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        {aiVerifiedAction === "ESCALATE" ? "Confirm Escalation" : "Escalate"}
                                    </Button>

                                    {/* ── Mark Resolved ── */}
                                    <Button
                                        onClick={() => {
                                            if (aiVerifiedAction === "RESOLVE" && message.length > 10) {
                                                if (aiRequiresEvidence && (!grievance.evidenceUrls || grievance.evidenceUrls.length === 0)) {
                                                    toast.error("Evidence required! Please upload proof before resolving.");
                                                    return;
                                                }
                                                performAction("COMPLAINT_CLOSED", "closed", undefined, { message });
                                            } else {
                                                handleStartInterview("RESOLVE");
                                            }
                                        }}
                                        disabled={actionLoading}
                                        className={`w-full font-bold gap-2 transition-all ${aiVerifiedAction === "RESOLVE"
                                            ? "bg-green-600 text-white hover:bg-green-700 scale-[1.02] shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                                            : "bg-[var(--civic-amber)] text-[var(--navy-deep)] hover:bg-[var(--civic-amber)]/90"
                                            }`}
                                    >
                                        {actionLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <XCircle className="w-4 h-4" />
                                                {aiVerifiedAction === "RESOLVE" ? "Finalize Resolution" : "Mark Resolved"}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <ActionInterviewModal
                open={interviewOpen}
                onOpenChange={setInterviewOpen}
                actionType={interviewAction}
                grievance={grievance}
                onComplete={onInterviewComplete}
            />
        </div>
    );
}
