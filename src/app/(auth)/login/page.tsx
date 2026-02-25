"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Shield, Mail, Lock, Phone, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { loginWithEmail, sendOTP, verifyOTP, loginWithGoogle, sendPasswordlessLink } from "@/features/auth/authHelpers";
import { useRoleRedirect } from "@/hooks/useAuth";
import type { ConfirmationResult } from "firebase/auth";
import { RecaptchaVerifier } from "firebase/auth";
import { auth } from "@/lib/firebase";

function LoginContent() {
    const searchParams = useSearchParams();
    const next = searchParams.get("next") ?? undefined;
    const { loading: authLoading } = useRoleRedirect(next);

    const [tab, setTab] = useState<"email" | "phone">("email");
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    // Email state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Phone state
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const [otpSent, setOtpSent] = useState(false);

    // Show loading overlay while Firebase auth resolves.
    // This prevents the Google OAuth redirect from flashing the login form.
    if (authLoading) return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-mesh gap-6">
            {/* Background orbs */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[var(--civic-amber)]/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[var(--trust-green)]/4 rounded-full blur-[100px] pointer-events-none" />
            {/* Logo spinner */}
            <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-[var(--civic-amber)] flex items-center justify-center glow-amber animate-pulse">
                    <Shield className="w-8 h-8 text-[var(--navy-deep)]" />
                </div>
                <div className="absolute -inset-2 rounded-[20px] border-2 border-[var(--civic-amber)]/30 animate-ping" />
            </div>
            <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-foreground">Signing you in…</p>
                <p className="text-xs text-muted-foreground">Setting up your JanMitra account</p>
            </div>
        </div>
    );

    // ── Email Login ──────────────────────────────────────────────
    async function handleEmailLogin(e: React.FormEvent) {
        e.preventDefault();
        if (!email || !password) return;
        setLoading(true);
        try {
            await loginWithEmail(email, password);
            toast.success("Welcome back!");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Login failed";
            toast.error(msg.includes("invalid-credential") ? "Invalid email or password" : msg);
        } finally {
            setLoading(false);
        }
    }

    // ── Passwordless Link ────────────────────────────────────────
    async function handlePasswordlessLink(e: React.MouseEvent) {
        if (!email) {
            toast.error("Enter your email first");
            return;
        }
        setLoading(true);
        try {
            await sendPasswordlessLink(email);
            toast.success("Login link sent to your email!");
        } catch (err: unknown) {
            toast.error("Failed to send login link.");
        } finally {
            setLoading(false);
        }
    }

    // ── Google Login ─────────────────────────────────────────────
    async function handleGoogleLogin() {
        setLoading(true);
        try {
            await loginWithGoogle();
        } catch (err: unknown) {
            console.error("Google Auth Error:", err);
            const msg = err instanceof Error ? err.message : String(err);
            if (msg.includes("popup-closed-by-user")) {
                toast.error("Sign-in popup was closed.");
            } else if (msg.includes("auth/cancelled-popup-request")) {
                // Ignore
            } else {
                toast.error(`Login failed: ${msg}`);
            }
        } finally {
            setLoading(false);
        }
    }

    // ── Phone OTP ────────────────────────────────────────────────
    async function handleSendOTP(e: React.FormEvent) {
        e.preventDefault();
        if (!phone || phone.length < 10) { toast.error("Enter a valid phone number"); return; }
        setLoading(true);
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (!(window as any).recaptchaVerifier) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (window as any).recaptchaVerifier = new RecaptchaVerifier(
                    auth!,
                    "recaptcha-container",
                    { size: "invisible" }
                );
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await sendOTP(`+91${phone}`, (window as any).recaptchaVerifier);
            setConfirmationResult(result);
            setOtpSent(true);
            toast.success("OTP sent to your number");
        } catch {
            toast.error("Failed to send OTP. Try again.");
        } finally {
            setLoading(false);
        }
    }

    async function handleVerifyOTP(e: React.FormEvent) {
        e.preventDefault();
        if (!confirmationResult || !otp) return;
        setLoading(true);
        try {
            await verifyOTP(confirmationResult, otp);
            toast.success("Welcome!");
        } catch {
            toast.error("Incorrect OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-md space-y-6 relative z-10">
            {/* Logo */}
            <Link href="/" className="block text-center space-y-3 group">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--civic-amber)] glow-amber mx-auto transition-transform group-hover:scale-105">
                    <Shield className="w-7 h-7 text-[var(--navy-deep)]" />
                </div>
                <div>
                    <h1 className="text-3xl font-display font-bold tracking-tight">Welcome back</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Sign in to your JanMitra account
                    </p>
                </div>
            </Link>

            {/* Card */}
            <div className="glass rounded-2xl p-7 space-y-6">
                <Tabs value={tab} onValueChange={(v) => setTab(v as "email" | "phone")}>
                    <TabsList className="w-full bg-white/5 border border-white/10">
                        <TabsTrigger value="email" className="flex-1 gap-2 data-[state=active]:bg-[var(--civic-amber)] data-[state=active]:text-[var(--navy-deep)]">
                            <Mail className="w-3.5 h-3.5" /> Email
                        </TabsTrigger>
                        <TabsTrigger value="phone" className="flex-1 gap-2 data-[state=active]:bg-[var(--civic-amber)] data-[state=active]:text-[var(--navy-deep)]">
                            <Phone className="w-3.5 h-3.5" /> Phone / OTP
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* Email form */}
                {tab === "email" && (
                    <form onSubmit={handleEmailLogin} className="space-y-4">
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
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password" className="text-sm text-muted-foreground">Password</Label>
                                <Link href="/forgot-password" className="text-xs text-[var(--civic-amber)] hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type={showPass ? "text" : "password"}
                                    placeholder="••••••••"
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
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[var(--civic-amber)] text-[var(--navy-deep)] hover:bg-[var(--civic-amber)]/90 font-bold glow-amber group"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                    <>Sign In <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" /></>
                                )}
                            </Button>

                            <button
                                type="button"
                                onClick={handlePasswordlessLink}
                                disabled={loading}
                                className="text-xs text-center text-[var(--civic-amber)] hover:underline py-1"
                            >
                                Sign in with link (passwordless)
                            </button>
                        </div>
                    </form>
                )}

                {/* Phone / OTP form */}
                {tab === "phone" && (
                    <form onSubmit={otpSent ? handleVerifyOTP : handleSendOTP} className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">Mobile number</Label>
                            <div className="relative flex items-center">
                                <span className="absolute left-3 text-sm text-muted-foreground font-medium">+91</span>
                                <Input
                                    type="tel"
                                    placeholder="98765 43210"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                    className="pl-12 bg-white/5 border-white/10 focus:border-[var(--civic-amber)]/50 transition-colors"
                                    disabled={otpSent}
                                    maxLength={10}
                                    required
                                />
                            </div>
                        </div>
                        {otpSent && (
                            <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground">Enter 6-digit OTP</Label>
                                <Input
                                    type="text"
                                    placeholder="• • • • • •"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    className="text-center tracking-[0.6em] text-lg bg-white/5 border-white/10 focus:border-[var(--civic-amber)]/50"
                                    maxLength={6}
                                    required
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => { setOtpSent(false); setOtp(""); }}
                                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Change number
                                </button>
                            </div>
                        )}
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[var(--civic-amber)] text-[var(--navy-deep)] hover:bg-[var(--civic-amber)]/90 font-bold glow-amber"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : otpSent ? (
                                "Verify OTP"
                            ) : (
                                "Send OTP"
                            )}
                        </Button>
                    </form>
                )}

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs text-muted-foreground">
                        <span className="bg-[var(--card)] px-3">Or continue with</span>
                    </div>
                </div>

                {/* Google Login */}
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full border-white/10 hover:bg-white/5 gap-3"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    Google
                </Button>

                <div className="relative pt-2">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs text-muted-foreground">
                        <span className="bg-[var(--card)] px-3">Don&apos;t have an account?</span>
                    </div>
                </div>

                <Link href="/signup">
                    <Button variant="outline" className="w-full border-white/10 hover:bg-white/5">
                        Create an account
                    </Button>
                </Link>
            </div>

            {/* reCAPTCHA mount point (invisible) */}
            <div id="recaptcha-container" />

            <p className="text-center text-xs text-muted-foreground">
                By continuing, you agree to JanMitra&apos;s{" "}
                <Link href="/privacy" className="text-[var(--civic-amber)] hover:underline">
                    Privacy Policy
                </Link>
            </p>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--civic-amber)]" /></div>}>
            <LoginContent />
        </Suspense>
    );
}
