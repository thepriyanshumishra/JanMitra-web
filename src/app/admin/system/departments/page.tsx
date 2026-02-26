"use client";

import { useEffect, useState, Fragment } from "react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Building2, Plus, Loader2, Edit2, Trash2, ShieldAlert, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/AuthProvider";
import { AppNavbar } from "@/components/shared/AppNavbar";

interface Department {
    id: string;
    name: string;
    slug: string;
    description: string;
    headOfficerName: string;
    slaDays: number;
    isActive: boolean;
    createdAt: string;
}

const defaultForm = { name: "", slug: "", description: "", headOfficerName: "", slaDays: 7 };

export default function SystemAdminDepartmentsPage() {
    const { user, loading: authLoading } = useAuth();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Create form
    const [isCreating, setIsCreating] = useState(false);
    const [form, setForm] = useState(defaultForm);

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState(defaultForm);

    // Delete confirm
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        if (!db) return;
        const unsub = onSnapshot(collection(db, "departments"), (snap) => {
            setDepartments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Department)));
            setLoading(false);
        });
        return () => unsub();
    }, []);

    function slugify(name: string) {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!db) return;
        setSaving(true);
        try {
            await addDoc(collection(db, "departments"), {
                name: form.name.trim(),
                slug: form.slug.trim() || slugify(form.name),
                description: form.description.trim(),
                headOfficerName: form.headOfficerName.trim(),
                slaDays: form.slaDays,
                isActive: true,
                createdAt: serverTimestamp(),
            });
            toast.success("Department created successfully");
            setForm(defaultForm);
            setIsCreating(false);
        } catch {
            toast.error("Failed to create department");
        } finally {
            setSaving(false);
        }
    }

    async function handleEdit(e: React.FormEvent) {
        e.preventDefault();
        if (!db || !editingId) return;
        setSaving(true);
        try {
            await updateDoc(doc(db, "departments", editingId), {
                name: editForm.name.trim(),
                slug: editForm.slug.trim() || slugify(editForm.name),
                description: editForm.description.trim(),
                headOfficerName: editForm.headOfficerName.trim(),
                slaDays: editForm.slaDays,
            });
            toast.success("Department updated");
            setEditingId(null);
        } catch {
            toast.error("Failed to update department");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: string) {
        if (!db) return;
        setSaving(true);
        try {
            await deleteDoc(doc(db, "departments", id));
            toast.success("Department deleted");
        } catch {
            toast.error("Failed to delete department");
        } finally {
            setSaving(false);
            setDeletingId(null);
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

    function startEdit(dept: Department) {
        setEditingId(dept.id);
        setEditForm({
            name: dept.name,
            slug: dept.slug ?? "",
            description: dept.description ?? "",
            headOfficerName: dept.headOfficerName,
            slaDays: dept.slaDays,
        });
        setIsCreating(false);
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
                    {!isCreating && !editingId && (
                        <Button onClick={() => setIsCreating(true)} className="bg-[var(--civic-amber)] text-[var(--navy-deep)] hover:bg-[var(--civic-amber)]/90 font-bold gap-2">
                            <Plus className="w-4 h-4" /> New Department
                        </Button>
                    )}
                </div>

                {/* ── Create Form ── */}
                {isCreating && (
                    <form onSubmit={handleCreate} className="glass rounded-2xl p-6 mb-8 border border-[var(--civic-amber)]/20 animate-in slide-in-from-top-4 space-y-4">
                        <h2 className="text-sm font-display font-semibold">Create New Department</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Department Name *</Label>
                                <Input required value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))}
                                    placeholder="e.g. Water Supply Board"
                                    className="bg-white/5 border-white/10" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Slug (URL key)</Label>
                                <Input value={form.slug}
                                    onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                                    placeholder="water-supply"
                                    className="bg-white/5 border-white/10 font-mono text-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Head Officer Name *</Label>
                                <Input required value={form.headOfficerName}
                                    onChange={e => setForm(f => ({ ...f, headOfficerName: e.target.value }))}
                                    placeholder="e.g. A. Kumar"
                                    className="bg-white/5 border-white/10" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Default SLA (Days)</Label>
                                <Input required type="number" min="1" max="30" value={form.slaDays}
                                    onChange={e => setForm(f => ({ ...f, slaDays: parseInt(e.target.value) || 7 }))}
                                    className="bg-white/5 border-white/10" />
                            </div>
                            <div className="md:col-span-2 space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Description</Label>
                                <Textarea value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="Brief description of this department's responsibilities"
                                    rows={2}
                                    className="bg-white/5 border-white/10 resize-none text-sm" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsCreating(false)} className="border-white/10">Cancel</Button>
                            <Button type="submit" disabled={saving} className="bg-[var(--civic-amber)] text-[var(--navy-deep)] font-bold gap-2">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Create Department</>}
                            </Button>
                        </div>
                    </form>
                )}

                {/* ── Table ── */}
                <div className="glass rounded-2xl overflow-hidden">
                    {departments.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">
                            <Building2 className="w-10 h-10 mx-auto mb-3 opacity-20" />
                            <p>No departments configured yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground bg-white/5 border-b border-white/10">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Department</th>
                                        <th className="px-6 py-4 font-medium">Head Officer</th>
                                        <th className="px-6 py-4 font-medium">SLA (Days)</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {departments.map(dept => (
                                        <Fragment key={dept.id}>
                                            <tr key={dept.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="font-semibold">{dept.name}</p>
                                                    {dept.slug && <p className="text-xs font-mono text-muted-foreground mt-0.5">/{dept.slug}</p>}
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground">{dept.headOfficerName}</td>
                                                <td className="px-6 py-4 font-mono">{dept.slaDays}</td>
                                                <td className="px-6 py-4">
                                                    <Badge variant="outline" className={dept.isActive
                                                        ? "bg-[var(--trust-green-muted)] text-[var(--trust-green)] border-0"
                                                        : "bg-white/5 text-muted-foreground border-white/10"
                                                    }>
                                                        {dept.isActive ? "Active" : "Inactive"}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button variant="ghost" size="sm" onClick={() => toggleActive(dept.id, dept.isActive)}
                                                            className="text-xs hover:bg-white/10">
                                                            {dept.isActive ? "Deactivate" : "Activate"}
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => startEdit(dept)}
                                                            className="text-xs hover:bg-white/10 gap-1">
                                                            <Edit2 className="w-3.5 h-3.5" /> Edit
                                                        </Button>
                                                        <Button variant="ghost" size="sm"
                                                            onClick={() => setDeletingId(dept.id)}
                                                            className="text-xs text-[var(--accountability-red)] hover:bg-[var(--accountability-red-muted)] gap-1">
                                                            <Trash2 className="w-3.5 h-3.5" /> Delete
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* ── Inline Delete Confirm ── */}
                                            {deletingId === dept.id && (
                                                <tr key={`del-${dept.id}`} className="bg-[var(--accountability-red-muted)]">
                                                    <td colSpan={5} className="px-6 py-4">
                                                        <div className="flex items-center justify-between gap-4">
                                                            <p className="text-sm text-[var(--accountability-red)] font-medium">
                                                                Delete <strong>{dept.name}</strong>? This cannot be undone.
                                                            </p>
                                                            <div className="flex gap-2 shrink-0">
                                                                <Button size="sm" variant="outline"
                                                                    onClick={() => setDeletingId(null)}
                                                                    className="border-white/10 h-8 text-xs gap-1">
                                                                    <X className="w-3.5 h-3.5" /> Cancel
                                                                </Button>
                                                                <Button size="sm"
                                                                    onClick={() => handleDelete(dept.id)}
                                                                    disabled={saving}
                                                                    className="bg-[var(--accountability-red)] hover:bg-[var(--accountability-red)]/90 text-white h-8 text-xs gap-1">
                                                                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Trash2 className="w-3.5 h-3.5" /> Confirm Delete</>}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}

                                            {/* ── Inline Edit Form ── */}
                                            {editingId === dept.id && (
                                                <tr key={`edit-${dept.id}`} className="bg-white/[0.02]">
                                                    <td colSpan={5} className="px-6 py-5">
                                                        <form onSubmit={handleEdit} className="space-y-4">
                                                            <p className="text-xs text-[var(--civic-amber)] font-semibold uppercase tracking-widest mb-3">Editing: {dept.name}</p>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="space-y-1.5">
                                                                    <Label className="text-xs text-muted-foreground">Department Name *</Label>
                                                                    <Input required value={editForm.name}
                                                                        onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                                                                        className="bg-white/5 border-white/10" />
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <Label className="text-xs text-muted-foreground">Slug</Label>
                                                                    <Input value={editForm.slug}
                                                                        onChange={e => setEditForm(f => ({ ...f, slug: e.target.value }))}
                                                                        className="bg-white/5 border-white/10 font-mono text-sm" />
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <Label className="text-xs text-muted-foreground">Head Officer *</Label>
                                                                    <Input required value={editForm.headOfficerName}
                                                                        onChange={e => setEditForm(f => ({ ...f, headOfficerName: e.target.value }))}
                                                                        className="bg-white/5 border-white/10" />
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <Label className="text-xs text-muted-foreground">SLA Days</Label>
                                                                    <Input type="number" min="1" max="30" value={editForm.slaDays}
                                                                        onChange={e => setEditForm(f => ({ ...f, slaDays: parseInt(e.target.value) || 7 }))}
                                                                        className="bg-white/5 border-white/10" />
                                                                </div>
                                                                <div className="md:col-span-2 space-y-1.5">
                                                                    <Label className="text-xs text-muted-foreground">Description</Label>
                                                                    <Textarea value={editForm.description}
                                                                        onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                                                                        rows={2}
                                                                        className="bg-white/5 border-white/10 resize-none text-sm" />
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-end gap-2 pt-1">
                                                                <Button type="button" variant="outline" size="sm"
                                                                    onClick={() => setEditingId(null)}
                                                                    className="border-white/10 gap-1">
                                                                    <X className="w-3.5 h-3.5" /> Cancel
                                                                </Button>
                                                                <Button type="submit" size="sm" disabled={saving}
                                                                    className="bg-[var(--civic-amber)] text-[var(--navy-deep)] font-bold gap-1">
                                                                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Check className="w-3.5 h-3.5" /> Save Changes</>}
                                                                </Button>
                                                            </div>
                                                        </form>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
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
