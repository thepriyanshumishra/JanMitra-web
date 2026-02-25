"use client";

import { useState } from "react";
import { User, Mail, Phone, Shield, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/avatar";
import { toast } from "sonner";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/features/auth/AuthProvider";
import { useRequireAuth } from "@/hooks/useAuth";
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

export default function ProfilePage() {
    const { user, refreshUser } = useAuth();
    const { loading } = useRequireAuth();
    const [name, setName] = useState(user?.name ?? "");
    const [saving, setSaving] = useState(false);

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
                        <Badge
                            variant="secondary"
                            className={`text-xs font-semibold ${ROLE_COLOR[user.role]}`}
                        >
                            <Shield className="w-3 h-3 mr-1" />
                            {ROLE_LABEL[user.role]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                            Member since {new Date(user.createdAt).getFullYear()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Edit form */}
            <div className="glass rounded-2xl p-6 space-y-6">
                <h3 className="text-base font-semibold">Account Information</h3>
                <Separator className="bg-white/10" />

                <form onSubmit={handleSave} className="space-y-5">
                    {/* Name */}
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

                    {/* Email (read-only) */}
                    {user.email && (
                        <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    value={user.email}
                                    disabled
                                    className="pl-10 bg-white/5 border-white/10 opacity-60 cursor-not-allowed"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
                        </div>
                    )}

                    {/* Phone (read-only) */}
                    {user.phone && (
                        <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">Mobile Number</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    value={user.phone}
                                    disabled
                                    className="pl-10 bg-white/5 border-white/10 opacity-60 cursor-not-allowed"
                                />
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
        </div>
    );
}
