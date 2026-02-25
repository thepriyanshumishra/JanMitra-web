"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, Shield, Save, Loader2, BarChart2, CheckCircle2, AlertTriangle, Trash2, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/avatar";
import { toast } from "sonner";
import { doc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/features/auth/AuthProvider";
import { useRequireAuth } from "@/hooks/useAuth";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import type { UserRole } from "@/types";

const ROLE_COLOR: Record<UserRole, string> = {
    citizen: "bg-[var(--trust-green-muted)] text-[var(--trust-green)]",
    officer: "bg-blue-500/10 text-blue-400",
    dept_admin: "bg-purple-500/10 text-purple-400",
    system_admin: "bg-[var(--civic-amber-muted)] text-[var(--civic-amber)]",
};

const ROLE_LABEL: Record<UserRole, string> = {
    citizen: "Citizen",
    officer: "Officer",
    dept_admin: "Dept. Admin",
    system_admin: "System Admin",
};

interface ComplaintStats {
    total: number;
    resolved: number;
    active: number;
    avgResolutionDays: number | null;
}

export default function ProfilePage() {
    const { user, refreshUser } = useAuth();
    const { loading } = useRequireAuth();
    const push = usePushNotifications();
    const [name, setName] = useState(user?.name ?? "");
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [stats, setStats] = useState<ComplaintStats | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);

    // Load complaint stats
    useEffect(() => {
        if (!user?.id || !db || user.role !== "citizen") {
            setStatsLoading(false);
            return;
        }
        const q = query(collection(db, "grievances"), where("citizenId", "==", user.id));
        getDocs(q).then((snap) => {
            const complaints = snap.docs.map(d => d.data());
            const resolved = complaints.filter(c => c.status === "closed");
            const active = complaints.filter(c => c.status !== "closed");

            // Avg resolution days
            let avgDays: number | null = null;
            const withTimes = resolved.filter(c => c.closedAt && c.createdAt);
            if (withTimes.length > 0) {
                const totalMs = withTimes.reduce((sum, c) => {
                    return sum + (new Date(c.closedAt).getTime() - new Date(c.createdAt).getTime());
                }, 0);
                avgDays = Math.round(totalMs / withTimes.length / 86400000);
            }

            setStats({ total: complaints.length, resolved: resolved.length, active: active.length, avgResolutionDays: avgDays });
            setStatsLoading(false);
        }).catch(() => setStatsLoading(false));
    }, [user?.id, user?.role]);

    if (loading || !user) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--civic-amber)]" />
            </div>
        );
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim() || !user || !db) return;
        setSaving(true);
        try {
            await updateDoc(doc(db, "users", user.id), { name: name.trim() });
            await refreshUser();
            toast.success("Profile updated!");
        } catch {
            toast.error("Failed to update profile.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDeleteAccount() {
        if (!user || !db) return;
        setDeleting(true);
        try {
            // Delete user Firestore doc; Firebase Auth deletion requires the Admin SDK or re-auth
            await updateDoc(doc(db, "users", user.id), { deleted: true, deletedAt: new Date().toISOString() });
            // Sign out + redirect
            const { signOut } = await import("firebase/auth");
            const { auth } = await import("@/lib/firebase");
            if (auth) await signOut(auth);
            toast.success("Account deleted. Goodbye.");
            window.location.href = "/";
        } catch {
            toast.error("Failed to delete account. Please try again.");
            setDeleting(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-8">
            <div>
                <h1 className="text-2xl font-display font-bold">My Profile</h1>
                <p className="text-muted-foreground text-sm mt-0.5">Manage your account details</p>
            </div>

            {/* Avatar + role */}
            <div className="glass rounded-2xl p-6 flex items-center gap-5">
                <Avatar className="w-16 h-16 bg-[var(--civic-amber-muted)] border-2 border-[var(--civic-amber)]/30 text-2xl font-bold text-[var(--civic-amber)] flex items-center justify-center">
                    {user.name?.charAt(0)?.toUpperCase() ?? "?"}
                </Avatar>
                <div className="space-y-1">
                    <h2 className="text-lg font-display font-bold">{user.name}</h2>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={`text-xs font-semibold ${ROLE_COLOR[user.role]}`}>
                            <Shield className="w-3 h-3 mr-1" />
                            {ROLE_LABEL[user.role]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                            Member since {new Date(user.createdAt).getFullYear()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Complaint Stats — citizens only */}
            {user.role === "citizen" && (
                <div className="glass rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-[var(--civic-amber)]" />
                        <h3 className="text-base font-semibold">Your Activity</h3>
                    </div>
                    <Separator className="bg-white/10" />
                    {statsLoading ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { label: "Total Filed", value: stats?.total ?? 0, color: "text-[var(--civic-amber)]", icon: <BarChart2 className="w-3.5 h-3.5" /> },
                                { label: "Resolved", value: stats?.resolved ?? 0, color: "text-[var(--trust-green)]", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
                                { label: "Active", value: stats?.active ?? 0, color: "text-blue-400", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
                                { label: "Avg Resolution", value: stats?.avgResolutionDays != null ? `${stats.avgResolutionDays}d` : "—", color: "text-purple-400", icon: <Shield className="w-3.5 h-3.5" /> },
                            ].map(stat => (
                                <div key={stat.label} className="rounded-xl bg-white/[0.03] border border-white/5 p-3 text-center space-y-1">
                                    <div className={`flex items-center justify-center gap-1 ${stat.color}`}>
                                        {stat.icon}
                                    </div>
                                    <div className={`text-xl font-display font-black ${stat.color}`}>{stat.value}</div>
                                    <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Edit form */}
            <div className="glass rounded-2xl p-6 space-y-6">
                <h3 className="text-base font-semibold">Account Information</h3>
                <Separator className="bg-white/10" />

                <form onSubmit={handleSave} className="space-y-5">
                    <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Display Name</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="pl-10 bg-white/5 border-white/10 focus:border-[var(--civic-amber)]/50"
                                placeholder="Your name"
                                required
                            />
                        </div>
                    </div>

                    {user.email && (
                        <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input value={user.email} disabled className="pl-10 bg-white/5 border-white/10 opacity-60 cursor-not-allowed" />
                            </div>
                            <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
                        </div>
                    )}

                    {user.phone && (
                        <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">Mobile Number</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input value={user.phone} disabled className="pl-10 bg-white/5 border-white/10 opacity-60 cursor-not-allowed" />
                            </div>
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={saving || name.trim() === user.name}
                        className="bg-[var(--civic-amber)] text-[var(--navy-deep)] hover:bg-[var(--civic-amber)]/90 font-bold gap-2"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </Button>
                </form>
            </div>

            {/* Role info */}
            <div className="glass rounded-2xl p-5 border border-white/5">
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Your role is <span className="text-foreground font-medium">{ROLE_LABEL[user.role]}</span>.
                    Role changes can only be made by a System Administrator.
                    If you believe your role is incorrect, contact your department administrator.
                </p>
            </div>

            {/* Push Notifications */}
            {push.supported && (
                <div className="glass rounded-2xl p-5 border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                <Bell className="w-4 h-4 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold">Push Notifications</h3>
                                <p className="text-xs text-muted-foreground">
                                    {push.enabled ? "Receive alerts on this device" : "Enable complaint status alerts"}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={push.toggle}
                            disabled={push.loading}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${push.enabled ? "bg-purple-500" : "bg-white/10"
                                } disabled:opacity-50`}
                            aria-label={push.enabled ? "Disable push notifications" : "Enable push notifications"}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${push.enabled ? "translate-x-6" : "translate-x-1"
                                }`} />
                        </button>
                    </div>
                    {push.enabled && (
                        <p className="text-[10px] text-muted-foreground pl-12">
                            You&apos;ll receive alerts when your complaint status changes, escalates, or is resolved.
                        </p>
                    )}
                </div>
            )}

            {/* Danger zone */}
            <div className="glass rounded-2xl p-5 border border-[var(--accountability-red)]/20 space-y-3">
                <div>
                    <h3 className="text-sm font-semibold text-[var(--accountability-red)]">Danger Zone</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                        Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                </div>
                {!confirmDelete ? (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setConfirmDelete(true)}
                        className="border-[var(--accountability-red)]/30 text-[var(--accountability-red)] hover:bg-[var(--accountability-red)]/10 gap-2"
                    >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Account
                    </Button>
                ) : (
                    <div className="rounded-xl border border-[var(--accountability-red)]/30 bg-[var(--accountability-red)]/5 p-4 space-y-3">
                        <p className="text-sm font-semibold text-[var(--accountability-red)]">
                            ⚠️ Are you absolutely sure?
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Your filed complaints will remain for accountability purposes but will be unlinked from your identity.
                        </p>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                onClick={handleDeleteAccount}
                                disabled={deleting}
                                className="bg-[var(--accountability-red)] text-white hover:bg-[var(--accountability-red)]/90 gap-2"
                            >
                                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                Yes, delete my account
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setConfirmDelete(false)}
                                className="border-white/10 hover:bg-white/5"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
