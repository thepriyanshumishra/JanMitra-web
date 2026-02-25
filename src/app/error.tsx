"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("[Error Boundary]", error);
    }, [error]);

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[var(--accountability-red-muted)] flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-[var(--accountability-red)]" />
            </div>
            <div className="space-y-2">
                <h1 className="text-xl font-display font-bold">Something went wrong</h1>
                <p className="text-sm text-muted-foreground max-w-sm">
                    An unexpected error occurred. This has been logged. Please try refreshing or go back to the dashboard.
                </p>
                {error.digest && (
                    <p className="text-xs text-muted-foreground/50 font-mono">Error ID: {error.digest}</p>
                )}
            </div>
            <div className="flex gap-3">
                <Button
                    onClick={reset}
                    className="bg-[var(--civic-amber)] text-[var(--navy-deep)] hover:bg-[var(--civic-amber)]/90 font-bold gap-2"
                >
                    <RotateCcw className="w-4 h-4" /> Try Again
                </Button>
                <Button
                    variant="outline"
                    className="border-white/10 hover:bg-white/5"
                    onClick={() => (window.location.href = "/dashboard")}
                >
                    Go to Dashboard
                </Button>
            </div>
        </div>
    );
}
