"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Loader2, Shield, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function LoginCallbackPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function completeSignIn() {
            if (!auth) return;

            // ── Handle Passwordless Email link ────────────────────
            if (isSignInWithEmailLink(auth, window.location.href)) {
                let email = window.localStorage.getItem("emailForSignIn");
                if (!email) {
                    email = window.prompt("Please provide your email for confirmation");
                }
                if (email) {
                    try {
                        await signInWithEmailLink(auth, email, window.location.href);
                        window.localStorage.removeItem("emailForSignIn");
                        toast.success("Successfully signed in!");
                        router.push("/dashboard");
                    } catch (err: unknown) {
                        const msg = err instanceof Error ? err.message : "Link expired or invalid.";
                        setError(msg);
                    }
                }
            } else {
                router.push("/login");
            }
        }

        completeSignIn();
    }, [router]);

    if (error) {
        return (
            <div className="text-center space-y-4 max-w-sm glass p-8 rounded-2xl">
                <AlertCircle className="w-12 h-12 text-[var(--accountability-red)] mx-auto" />
                <h1 className="text-xl font-bold font-display">Something went wrong</h1>
                <p className="text-sm text-muted-foreground">{error}</p>
                <button
                    onClick={() => router.push("/login")}
                    className="text-[var(--civic-amber)] hover:underline text-sm font-medium"
                >
                    Back to login
                </button>
            </div>
        );
    }

    return (
        <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--civic-amber)] glow-amber animate-pulse">
                <Shield className="w-7 h-7 text-[var(--navy-deep)]" />
            </div>
            <h1 className="text-xl font-bold font-display">Verifying your link...</h1>
            <div className="flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
        </div>
    );
}
