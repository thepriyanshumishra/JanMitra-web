"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { signUpWithEmail } from "@/features/auth/authHelpers";
import { useRoleRedirect } from "@/hooks/useAuth";

const passwordRules = [
    { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { label: "Contains a number", test: (p: string) => /\d/.test(p) },
    { label: "Contains a letter", test: (p: string) => /[a-zA-Z]/.test(p) },
];

export default function SignupPage() {
    const { loading: authLoading } = useRoleRedirect();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [agreed, setAgreed] = useState(false);

    if (authLoading) return null;

    const passStrength = passwordRules.filter((r) => r.test(password)).length;
    const strengthColor =
        passStrength === 0 ? "bg-border" :
            passStrength === 1 ? "bg-[var(--accountability-red)]" :
                passStrength === 2 ? "bg-[var(--warning-yellow)]" :
                    "bg-[var(--trust-green)]";

    async function handleSignup(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) { toast.error("Please enter your name"); return; }
        if (password !== confirmPassword) { toast.error("Passwords don't match"); return; }
        if (passStrength < 3) { toast.error("Password doesn't meet all requirements"); return; }
        if (!agreed) { toast.error("Please agree to the Privacy Policy"); return; }

        setLoading(true);
        try {
            await signUpWithEmail(email, password, name.trim());
            toast.success("Account created! Welcome to JanMitra.");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Signup failed";
            if (msg.includes("email-already-in-use")) {
                toast.error("This email is already registered. Try logging in.");
            } else {
                toast.error(msg);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-md space-y-6 relative z-10">
            {/* Logo */}
            <div className="text-center space-y-3">
                <img src="/icons/icon-192x192.png" alt="JanMitra" className="w-14 h-14 mx-auto object-contain drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]" />
                <div>
                    <h1 className="text-3xl font-display font-bold tracking-tight">Create account</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Join the accountability movement
                    </p>
                </div>
            </div>

            {/* Card */}
            <div className="glass rounded-2xl p-7 space-y-5">
                <form onSubmit={handleSignup} className="space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm text-muted-foreground">Full name</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="name"
                                type="text"
                                placeholder="Priyanshu Sharma"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="pl-10 bg-white/5 border-white/10 focus:border-[var(--civic-amber)]/50 transition-colors"
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm text-muted-foreground">Email address</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10 bg-white/5 border-white/10 focus:border-[var(--civic-amber)]/50 transition-colors"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm text-muted-foreground">Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="password"
                                type={showPass ? "text" : "password"}
                                placeholder="Min. 8 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 pr-10 bg-white/5 border-white/10 focus:border-[var(--civic-amber)]/50 transition-colors"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* Strength meter */}
                        {password.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex gap-1.5">
                                    {[0, 1, 2].map((i) => (
                                        <div
                                            key={i}
                                            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i < passStrength ? strengthColor : "bg-border"
                                                }`}
                                        />
                                    ))}
                                </div>
                                <div className="space-y-1">
                                    {passwordRules.map((r) => (
                                        <div key={r.label} className="flex items-center gap-2 text-xs">
                                            <CheckCircle2
                                                className={`w-3.5 h-3.5 transition-colors ${r.test(password) ? "text-[var(--trust-green)]" : "text-muted-foreground/40"
                                                    }`}
                                            />
                                            <span className={r.test(password) ? "text-[var(--trust-green)]" : "text-muted-foreground/60"}>
                                                {r.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Confirm password */}
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm text-muted-foreground">Confirm password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="confirmPassword"
                                type={showPass ? "text" : "password"}
                                placeholder="Re-enter password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`pl-10 bg-white/5 border-white/10 focus:border-[var(--civic-amber)]/50 transition-colors ${confirmPassword && confirmPassword !== password
                                    ? "border-[var(--accountability-red)]/50"
                                    : confirmPassword && confirmPassword === password
                                        ? "border-[var(--trust-green)]/50"
                                        : ""
                                    }`}
                                required
                            />
                            {confirmPassword && (
                                <CheckCircle2
                                    className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${confirmPassword === password
                                        ? "text-[var(--trust-green)]"
                                        : "text-[var(--accountability-red)]"
                                        }`}
                                />
                            )}
                        </div>
                    </div>

                    {/* Privacy agreement */}
                    <div className="flex items-start gap-3 pt-1">
                        <button
                            type="button"
                            onClick={() => setAgreed(!agreed)}
                            className={`mt-0.5 w-4 h-4 rounded border-2 shrink-0 transition-all flex items-center justify-center ${agreed
                                ? "bg-[var(--civic-amber)] border-[var(--civic-amber)]"
                                : "border-white/20 hover:border-white/40"
                                }`}
                        >
                            {agreed && <CheckCircle2 className="w-3 h-3 text-[var(--navy-deep)]" />}
                        </button>
                        <span className="text-xs text-muted-foreground leading-relaxed">
                            I agree to JanMitra&apos;s{" "}
                            <Link href="/privacy" className="text-[var(--civic-amber)] hover:underline">
                                Privacy Policy
                            </Link>{" "}
                            and understand that my complaint data may be used for governance analytics (anonymized).
                        </span>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[var(--civic-amber)] text-[var(--navy-deep)] hover:bg-[var(--civic-amber)]/90 font-bold glow-amber group mt-2"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                Create Account
                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </Button>
                </form>

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs text-muted-foreground">
                        <span className="bg-[var(--card)] px-3">Already have an account?</span>
                    </div>
                </div>

                <Link href="/login">
                    <Button variant="outline" className="w-full border-white/10 hover:bg-white/5">
                        Sign in instead
                    </Button>
                </Link>
            </div>

            <p className="text-center text-xs text-muted-foreground">
                Your account will be created as a{" "}
                <span className="text-foreground font-medium">Citizen</span>.
                Officers and administrators are assigned by system admins.
            </p>
        </div>
    );
}
