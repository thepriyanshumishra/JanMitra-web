"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Building2, Plus, Loader2, Edit2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/AuthProvider";
import { AppNavbar } from "@/components/shared/AppNavbar";

interface Department {
    id: string;
    name: string;
    headOfficerName: string;
    slaDays: number;
    isActive: boolean;
    createdAt: string;
}

export default function SystemAdminDepartmentsPage() {
    const { user, loading: authLoading } = useAuth();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [isCreating, setIsCreating] = useState(false);
    const [form, setForm] = useState({ name: "", headOfficerName: "", slaDays: 7 });

    useEffect(() => {
        if (!db) return;
        const unsub = onSnapshot(collection(db, "departments"), (snap) => {
            setDepartments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Department)));
            setLoading(false);
        });
        return () => unsub();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!db) return;
        setSaving(true);
        try {
            await addDoc(collection(db, "departments"), {
                name: form.name.trim(),
                headOfficerName: form.headOfficerName.trim(),
                slaDays: form.slaDays,
                isActive: true,
                createdAt: serverTimestamp(),
            });
            toast.success("Department added");
            setForm({ name: "", headOfficerName: "", slaDays: 7 });
            setIsCreating(false);
        } catch {
            toast.error("Failed to add department");
        } finally {
            setSaving(false);
        }
    }

    async function toggleActive(id: string, current: boolean) {
        if (!db) return;
        try {
            await updateDoc(doc(db, "departments", id), { isActive: !current });
            toast.success(`Department ${!current ? "activated" : "deactivated"}`);
        } catch {
            toast.error("Failed to update status");
        }
    }

    if (authLoading || loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--civic-amber)]" />
        </div>
    );

    if (user?.role !== "system_admin") {
        return (
            <div className="min-h-screen bg-background">
                <AppNavbar />
                <div className="pt-32 px-4 text-center">
                    <ShieldAlert className="w-12 h-12 text-[var(--accountability-red)] mx-auto mb-4" />
                    <h1 className="text-xl font-display font-bold">Access Denied</h1>
                    <p className="text-muted-foreground mt-2">Only system administrators can access this page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <AppNavbar />
            <main className="pt-24 max-w-5xl mx-auto px-4 sm:px-6 pb-12">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-display font-bold">Manage Departments</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">Configure routing endpoints and SLA windows</p>
                    </div>
                    {!isCreating && (
                        <Button onClick={() => setIsCreating(true)} className="bg-[var(--civic-amber)] text-[var(--navy-deep)] hover:bg-[var(--civic-amber)]/90 font-bold gap-2">
                            <Plus className="w-4 h-4" /> New Department
                        </Button>
                    )}
                </div>

                {isCreating && (
                    <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 mb-8 border border-[var(--civic-amber)]/20 animate-in slide-in-from-top-4">
                        <h2 className="text-sm font-display font-semibold mb-4">Create New Department</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Department Name</Label>
                                <Input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Water Supply Board" className="bg-white/5 border-white/10" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Head Officer Name</Label>
                                <Input required value={form.headOfficerName} onChange={e => setForm(f => ({ ...f, headOfficerName: e.target.value }))} placeholder="e.g. A. Kumar" className="bg-white/5 border-white/10" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Default SLA (Days)</Label>
                                <Input required type="number" min="1" max="30" value={form.slaDays} onChange={e => setForm(f => ({ ...f, slaDays: parseInt(e.target.value) || 7 }))} className="bg-white/5 border-white/10" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={() => setIsCreating(false)} className="border-white/10">Cancel</Button>
                            <Button type="submit" disabled={saving} className="bg-[var(--civic-amber)] text-[var(--navy-deep)] font-bold">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Department"}
                            </Button>
                        </div>
                    </form>
                )}

                <div className="glass rounded-2xl overflow-hidden">
                    {departments.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">
                            <Building2 className="w-10 h-10 mx-auto mb-3 opacity-20" />
                            <p>No departments configured.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground bg-white/5 border-b border-white/10">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Department</th>
                                        <th className="px-6 py-4 font-medium">Head Officer</th>
                                        <th className="px-6 py-4 font-medium">SLA Days</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {departments.map(dept => (
                                        <tr key={dept.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4 font-medium">{dept.name}</td>
                                            <td className="px-6 py-4 text-muted-foreground">{dept.headOfficerName}</td>
                                            <td className="px-6 py-4 font-mono">{dept.slaDays}</td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className={dept.isActive ? "bg-[var(--trust-green-muted)] text-[var(--trust-green)] border-0" : "bg-white/5 text-muted-foreground border-white/10"}>
                                                    {dept.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleActive(dept.id, dept.isActive)}
                                                    className="text-xs hover:bg-white/10"
                                                >
                                                    {dept.isActive ? "Deactivate" : "Activate"}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
