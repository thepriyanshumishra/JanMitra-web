"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { resetPassword } from "@/features/auth/authHelpers";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    async function handleReset(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            await resetPassword(email);
            setSent(true);
        } catch {
            toast.error("Failed to send reset email. Check your address.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-md space-y-6 relative z-10">
            <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--civic-amber)] glow-amber mx-auto">
                    <Shield className="w-7 h-7 text-[var(--navy-deep)]" />
                </div>
                <div>
                    <h1 className="text-3xl font-display font-bold tracking-tight">Reset password</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        We&apos;ll email you a reset link
                    </p>
                </div>
            </div>

            <div className="glass rounded-2xl p-7 space-y-5">
                {!sent ? (
                    <form onSubmit={handleReset} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm text-muted-foreground">
                                Email address
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 bg-white/5 border-white/10 focus:border-[var(--civic-amber)]/50"
                                    required
                                />
                            </div>
                        </div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[var(--civic-amber)] text-[var(--navy-deep)] hover:bg-[var(--civic-amber)]/90 font-bold"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Link"}
                        </Button>
                    </form>
                ) : (
                    <div className="text-center space-y-4 py-4">
                        <CheckCircle2 className="w-12 h-12 text-[var(--trust-green)] mx-auto" />
                        <div>
                            <p className="font-semibold">Check your inbox</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                We sent a reset link to <span className="text-foreground">{email}</span>
                            </p>
                        </div>
                    </div>
                )}

                <Link href="/login">
                    <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to sign in
                    </Button>
                </Link>
            </div>
        </div>
    );
}
