"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/AuthProvider";
import type { UserRole } from "@/types";

const ROLE_HOME: Record<UserRole, string> = {
    citizen: "/dashboard",
    officer: "/officer",
    dept_admin: "/admin/dept",
    system_admin: "/admin/system",
};

export function useRoleRedirect(next?: string) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;
        if (user) {
            const destination = next ?? ROLE_HOME[user.role];
            router.replace(destination);
        }
    }, [user, loading, router, next]);

    return { user, loading };
}

export function useRequireAuth(redirectTo = "/login") {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;
        if (!user) {
            router.replace(redirectTo);
        }
    }, [user, loading, router, redirectTo]);

    return { user, loading };
}

export { ROLE_HOME };
