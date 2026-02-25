"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { doc, onSnapshot, updateDoc, arrayUnion, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
    ArrowLeft, ThumbsUp, RotateCcw, Loader2,
    MapPin, Calendar, Lock, Eye, EyeOff, Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { SLACountdown } from "@/components/grievance/SLACountdown";
import { EventTimeline } from "@/components/grievance/EventTimeline";
import { FailureReplay } from "@/components/grievance/FailureReplay";
import { useAuth } from "@/features/auth/AuthProvider";
import { useRequireAuth } from "@/hooks/useAuth";

interface GrievanceDoc {
    id: string;
    citizenId: string;
    category: string;
    title: string;
    description: string;
    location: { address: string };
    privacyLevel: string;
    status: string;
    slaStatus: string;
    slaDeadlineAt: string;
    evidenceUrls?: string[];
    supportCount: number;
    isDelegated?: boolean;
    delegatedFor?: { name: string; relationship: string };
    createdAt: string;
    updatedAt: string;
    closedAt?: string;
    reopenCount?: number;
    feedback?: { rating: number; comment?: string; timestamp: string };
}

const STATUS_LABEL: Record<string, string> = {
    submitted: "Submitted",
    routed: "Routed",
    assigned: "Assigned",
    acknowledged: "Acknowledged",
    in_progress: "In Progress",
    escalated: "Escalated",
    closed: "Resolved",
    reopened: "Reopened",
};

const STATUS_COLOR: Record<string, string> = {
    submitted: "bg-[var(--civic-amber-muted)] text-[var(--civic-amber)]",
    routed: "bg-blue-500/10 text-blue-400",
    assigned: "bg-purple-500/10 text-purple-400",
    acknowledged: "bg-[var(--trust-green-muted)] text-[var(--trust-green)]",
    in_progress: "bg-sky-500/10 text-sky-400",
    escalated: "bg-[var(--accountability-red-muted)] text-[var(--accountability-red)]",
    closed: "bg-[var(--trust-green-muted)] text-[var(--trust-green)]",
    reopened: "bg-orange-500/10 text-orange-400",
};

const PRIVACY_ICON: Record<string, React.ReactNode> = {
    public: <Eye className="w-3 h-3" />,
    restricted: <EyeOff className="w-3 h-3" />,
    private: <Lock className="w-3 h-3" />,
};

export default function ComplaintDetailPage() {
    const params = useParams<{ id: string }>();
    const { user } = useAuth();
    const { loading: authLoading } = useRequireAuth();
    const [grievance, setGrievance] = useState<GrievanceDoc | null>(null);
    const [loading, setLoading] = useState(true);
    const [supporting, setSupporting] = useState(false);

    useEffect(() => {
        if (!db || !params.id) return;
        const unsub = onSnapshot(doc(db, "grievances", params.id), (snap) => {
            if (snap.exists()) {
                setGrievance({ id: snap.id, ...snap.data() } as GrievanceDoc);
            }
            setLoading(false);
        });
        return () => unsub();
    }, [params.id]);

    async function handleSupport() {
        if (!db || !user || !grievance) return;
        setSupporting(true);
        try {
            await updateDoc(doc(db, "grievances", grievance.id), {
                supportCount: increment(1),
                supporterIds: arrayUnion(user.id),
            });
            toast.success("Support signal sent!");
        } catch {
            toast.error("Could not send support signal.");
        } finally {
            setSupporting(false);
        }
    }

    const [reopening, setReopening] = useState(false);
    const [reopenReason, setReopenReason] = useState("");
    const [isReopenOpen, setIsReopenOpen] = useState(false);

    async function handleReopen() {
        if (!db || !user || !grievance || !reopenReason.trim()) return;
        setReopening(true);
        try {
            const now = new Date().toISOString();

            // 1. Write REOPENED event
            const { addDoc, collection } = await import("firebase/firestore");
            await addDoc(collection(db, "grievances", grievance.id, "events"), {
                type: "REOPENED",
                actorId: user.id,
                actorName: user.name ?? "Citizen",
                timestamp: now,
                payload: { reason: reopenReason },
            });

            // 2. Update grievance
            await updateDoc(doc(db, "grievances", grievance.id), {
                status: "reopened",
                slaStatus: "at_risk", // Reset SLA to at risk to force quick action
                reopenCount: increment(1),
                updatedAt: now,
            });

            toast.success("Complaint reopened successfully.");
            setIsReopenOpen(false);
            setReopenReason("");
        } catch (err) {
            console.error(err);
            toast.error("Failed to reopen.");
        } finally {
            setReopening(false);
        }
    }

    const [rating, setRating] = useState(0);
    const [feedbackComment, setFeedbackComment] = useState("");
    const [submittingFeedback, setSubmittingFeedback] = useState(false);

    async function handleFeedback() {
        if (!db || !grievance || rating === 0) return;
        setSubmittingFeedback(true);
        try {
            await updateDoc(doc(db, "grievances", grievance.id), {
                feedback: {
                    rating,
                    comment: feedbackComment,
                    timestamp: new Date().toISOString()
                }
            });
            toast.success("Feedback submitted. Thank you!");
        } catch {
            toast.error("Failed to submit feedback.");
        } finally {
            setSubmittingFeedback(false);
        }
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--civic-amber)]" />
            </div>
        );
    }

    if (!grievance) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                <p className="text-muted-foreground">Complaint not found.</p>
                <Link href="/dashboard">
                    <Button variant="outline" className="mt-4 border-white/10">Back to Dashboard</Button>
                </Link>
            </div>
        );
    }

    const isCitizen = user?.id === grievance.citizenId;
    const canReopen =
        isCitizen &&
        grievance.status === "closed" &&
        grievance.closedAt &&
        Date.now() - new Date(grievance.closedAt).getTime() < 7 * 24 * 60 * 60 * 1000 &&
        (grievance.reopenCount ?? 0) < 2;

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
            {/* Back */}
            <Link
                href="/complaints"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> All Complaints
            </Link>

            {/* Header card */}
            <div className="glass rounded-2xl p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono text-muted-foreground">{grievance.id}</span>
                            <Badge variant="outline" className="text-[10px] text-muted-foreground border-white/10">
                                {grievance.category}
                            </Badge>
                            <span
                                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[grievance.status] ?? "bg-white/10 text-foreground"
                                    }`}
                            >
                                {STATUS_LABEL[grievance.status] ?? grievance.status}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                                {PRIVACY_ICON[grievance.privacyLevel]}
                                <span className="capitalize">{grievance.privacyLevel}</span>
                            </span>
                        </div>
                        <h1 className="text-xl font-display font-bold">{grievance.title}</h1>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                toast.success("Link copied!");
                            }}
                        >
                            <Share2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{grievance.location?.address || "—"}
                    </span>
                    <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Filed {new Date(grievance.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                </div>

                {/* SLA */}
                {grievance.status !== "closed" && (
                    <div className="pt-2">
                        <SLACountdown slaDeadlineAt={grievance.slaDeadlineAt} />
                    </div>
                )}

                {/* Description */}
                <Separator className="bg-white/10" />
                <p className="text-sm text-foreground/80 leading-relaxed">{grievance.description}</p>

                {/* Delegation notice */}
                {grievance.isDelegated && grievance.delegatedFor && (
                    <div className="text-xs text-muted-foreground glass rounded-lg px-4 py-2.5 flex items-center gap-2">
                        <span>Filed on behalf of</span>
                        <span className="font-medium text-foreground">{grievance.delegatedFor.name}</span>
                        <span>({grievance.delegatedFor.relationship})</span>
                    </div>
                )}

                {/* Evidence thumbnails */}
                {grievance.evidenceUrls && grievance.evidenceUrls.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                        {grievance.evidenceUrls.map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noreferrer">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={url}
                                    alt={`Evidence ${i + 1}`}
                                    className="w-20 h-20 object-cover rounded-lg border border-white/10 hover:border-[var(--civic-amber)]/50 transition-colors"
                                />
                            </a>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-2">
                    {grievance.privacyLevel === "public" && !isCitizen && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSupport}
                            disabled={supporting}
                            className="border-white/10 hover:bg-white/5 gap-2 text-xs"
                        >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            I face this too ({grievance.supportCount})
                        </Button>
                    )}
                    {canReopen && (
                        <Dialog open={isReopenOpen} onOpenChange={setIsReopenOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-[var(--accountability-red)]/30 text-[var(--accountability-red)] hover:bg-[var(--accountability-red-muted)] gap-2 text-xs"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" /> Reopen Complaint
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="glass bg-[var(--card)] border-white/10 sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Reopen Complaint</DialogTitle>
                                    <DialogDescription className="text-muted-foreground pt-1">
                                        If the issue was not actually resolved, you can reopen it. You have {(2 - (grievance.reopenCount ?? 0))} reopen(s) remaining.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <Textarea
                                        placeholder="Reason for reopening (required)"
                                        value={reopenReason}
                                        onChange={(e) => setReopenReason(e.target.value)}
                                        className="bg-white/5 border-white/10 resize-none h-24 text-sm"
                                    />
                                    <Button
                                        onClick={handleReopen}
                                        disabled={!reopenReason.trim() || reopening}
                                        className="w-full bg-[var(--accountability-red)] text-white hover:bg-[var(--accountability-red)]/90"
                                    >
                                        {reopening ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Reopen Request"}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                {/* Citizen Feedback Form (Only for closed complaints) */}
                {grievance.status === "closed" && isCitizen && (
                    <div className="mt-6 p-5 rounded-xl border border-[var(--civic-amber)]/20 bg-[var(--civic-amber)]/5 flex flex-col items-center text-center space-y-4">
                        {grievance.feedback ? (
                            <>
                                <h3 className="text-sm font-semibold text-[var(--trust-green)]">Feedback Submitted</h3>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} className={`w-5 h-5 ${s <= grievance.feedback!.rating ? "fill-[var(--civic-amber)] text-[var(--civic-amber)]" : "text-white/20"}`} />
                                    ))}
                                </div>
                                {grievance.feedback.comment && (
                                    <p className="text-sm text-foreground/80 italic">"{grievance.feedback.comment}"</p>
                                )}
                            </>
                        ) : (
                            <>
                                <div>
                                    <h3 className="text-sm font-semibold">Rate the Resolution</h3>
                                    <p className="text-xs text-muted-foreground mt-1">Help us improve the Citizen Trust Index.</p>
                                </div>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <button key={s} onClick={() => setRating(s)} className="focus:outline-none transition-transform hover:scale-110">
                                            <Star className={`w-7 h-7 ${rating >= s ? "fill-[var(--civic-amber)] text-[var(--civic-amber)]" : "text-white/20 hover:text-white/40"}`} />
                                        </button>
                                    ))}
                                </div>
                                {rating > 0 && (
                                    <div className="w-full max-w-sm space-y-3 animate-in fade-in slide-in-from-top-2">
                                        <Textarea
                                            placeholder="Optional comments about your experience..."
                                            value={feedbackComment}
                                            onChange={(e) => setFeedbackComment(e.target.value)}
                                            className="bg-background/50 border-white/10 text-sm h-20 resize-none"
                                        />
                                        <Button
                                            onClick={handleFeedback}
                                            disabled={submittingFeedback}
                                            className="w-full bg-[var(--civic-amber)] text-[var(--navy-deep)] font-bold"
                                        >
                                            {submittingFeedback ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Feedback"}
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Tabs: Timeline / Failure Replay */}
            <Tabs defaultValue="timeline">
                <TabsList className="bg-white/5 border border-white/10">
                    <TabsTrigger value="timeline" className="data-[state=active]:bg-white/10 text-sm">
                        Live Timeline
                    </TabsTrigger>
                    <TabsTrigger value="replay" className="data-[state=active]:bg-white/10 text-sm">
                        🎬 Failure Replay
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="timeline" className="mt-6">
                    <EventTimeline grievanceId={grievance.id} />
                </TabsContent>

                <TabsContent value="replay" className="mt-6">
                    <FailureReplay
                        grievanceId={grievance.id}
                        slaDeadlineAt={grievance.slaDeadlineAt}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
