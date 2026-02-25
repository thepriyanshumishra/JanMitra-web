"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/AuthProvider";
import { AppNavbar } from "@/components/shared/AppNavbar";

export default function DeptAdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user && user.role !== "dept_admin" && user.role !== "system_admin") {
            router.replace("/dashboard");
        }
        if (!loading && !user) {
            router.replace("/login");
        }
    }, [user, loading, router]);

    if (loading || !user) return null;

    return (
        <div className="min-h-screen bg-background">
            <AppNavbar />
            <main className="pt-16">{children}</main>
        </div>
    );
}
