import type { Metadata } from "next";
import { AuthProvider } from "@/features/auth/AuthProvider";

export const metadata: Metadata = {
    title: "Sign In",
    robots: { index: false },
};

import { ThemeToggle } from "@/components/shared/ThemeToggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-mesh flex items-center justify-center p-4 relative overflow-hidden">
            {/* Theme Toggle in Corner */}
            <div className="absolute top-6 right-6 z-50">
                <ThemeToggle />
            </div>
            {/* Background orbs */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[var(--civic-amber)]/6 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[var(--trust-green)]/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/3 rounded-full blur-[140px] pointer-events-none" />
            {children}
        </div>
    );
}
