"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Bell, LogOut, User, ChevronDown, CheckCircle2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/features/auth/AuthProvider";
import { ROLE_HOME } from "@/hooks/useAuth";
import type { UserRole } from "@/types";
import { ThemeToggle } from "./ThemeToggle";

const ROLE_LABEL: Record<UserRole, string> = {
    citizen: "Citizen",
    officer: "Officer",
    dept_admin: "Dept. Admin",
    system_admin: "System Admin",
};

const ROLE_COLOR: Record<UserRole, string> = {
    citizen: "bg-[var(--trust-green-muted)] text-[var(--trust-green)]",
    officer: "bg-blue-500/10 text-blue-400",
    dept_admin: "bg-purple-500/10 text-purple-400",
    system_admin: "bg-[var(--civic-amber-muted)] text-[var(--civic-amber)]",
};

export function AppNavbar() {
    const { user, signOut, refreshUser } = useAuth();
    const pathname = usePathname();

    const isActive = (href: string) => pathname.startsWith(href);

    const navLinks = [
        { href: "/", label: "Home" },
        ...(user?.role === "citizen"
            ? [
                { href: "/dashboard", label: "My Complaints" },
                { href: "/submit", label: "File Complaint" },
                { href: "/transparency", label: "Transparency" },
            ]
            : user?.role === "officer"
                ? [
                    { href: "/officer", label: "My Queue" },
                    { href: "/transparency", label: "Transparency" },
                ]
                : user?.role === "dept_admin"
                    ? [
                        { href: "/admin/dept", label: "Dashboard" },
                        { href: "/admin/dept/analytics", label: "Analytics" },
                        { href: "/transparency", label: "Transparency" },
                    ]
                    : user?.role === "system_admin"
                        ? [
                            { href: "/admin/system", label: "Overview" },
                            { href: "/admin/system/departments", label: "Departments" },
                            { href: "/transparency", label: "Transparency" },
                        ]
                        : [
                            { href: "/transparency", label: "Transparency" },
                            { href: "/about", label: "About" },
                        ])
    ];

    // Logo always goes home now for better platform navigation
    const home = "/";

    return (
        <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-[var(--glass-border)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href={home} className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[var(--civic-amber)] flex items-center justify-center glow-amber">
                        <Shield className="w-4 h-4 text-[var(--navy-deep)]" />
                    </div>
                    <span className="font-display text-lg font-bold tracking-tight">JanMitra</span>
                </Link>

                {/* Nav links */}
                {navLinks.length > 0 && (
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(link.href)
                                    ? "bg-white/10 text-foreground"
                                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                )}

                {/* Right side */}
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    {user ? (
                        <>
                            {/* Notifications */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="relative text-muted-foreground hover:text-foreground"
                            >
                                <Bell className="w-4 h-4" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--accountability-red)] rounded-full pulse-red" />
                            </Button>

                            {/* User menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="flex items-center gap-2 h-9 px-3 hover:bg-white/5"
                                    >
                                        <Avatar className="w-7 h-7 bg-[var(--civic-amber-muted)] border border-[var(--civic-amber)]/30">
                                            <span className="text-xs font-bold text-[var(--civic-amber)]">
                                                {user.name?.charAt(0)?.toUpperCase() ?? "?"}
                                            </span>
                                        </Avatar>
                                        <span className="hidden sm:block text-sm font-medium max-w-[100px] truncate">
                                            {user.name?.split(" ")[0]}
                                        </span>
                                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-56 bg-[var(--card)] border-white/10"
                                >
                                    <DropdownMenuLabel className="space-y-1">
                                        <p className="text-sm font-medium">{user.name}</p>
                                        <p className="text-xs text-muted-foreground font-normal truncate">
                                            {user.email ?? user.phone}
                                        </p>
                                        <Badge
                                            variant="secondary"
                                            className={`text-[10px] font-semibold ${ROLE_COLOR[user.role]}`}
                                        >
                                            {ROLE_LABEL[user.role]}
                                        </Badge>
                                    </DropdownMenuLabel>

                                    {/* ── DEMO: Quick Role Switcher (dev only) ── */}
                                    {process.env.NODE_ENV === "development" && (<>
                                        <DropdownMenuSeparator className="bg-white/10" />
                                        <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase pb-0">Demo Role Switch</DropdownMenuLabel>
                                        {(["citizen", "officer", "dept_admin", "system_admin"] as UserRole[]).map((r) => (
                                            <DropdownMenuItem
                                                key={r}
                                                disabled={user.role === r}
                                                onClick={async () => {
                                                    if (!db) return;
                                                    const { doc, updateDoc } = await import("firebase/firestore");
                                                    await updateDoc(doc(db, "users", user.id), { role: r });
                                                    // Sync AuthProvider cache BEFORE navigating so the
                                                    // layout guard sees the new role immediately.
                                                    await refreshUser();
                                                    window.location.href = ROLE_HOME[r];
                                                }}
                                                className="text-xs py-1.5 cursor-pointer hover:bg-white/5 flex items-center justify-between"
                                            >
                                                {ROLE_LABEL[r]}
                                                {user.role === r && <CheckCircle2 className="w-3 h-3 text-[var(--civic-amber)]" />}
                                            </DropdownMenuItem>
                                        ))}
                                    </>)}
                                    {/* ─────────────────────────────── */}

                                    <DropdownMenuSeparator className="bg-white/10" />
                                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-white/5">
                                        <Link href="/profile" className="flex items-center gap-2">
                                            <User className="w-4 h-4" /> My Profile
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-white/10" />
                                    <DropdownMenuItem
                                        onClick={signOut}
                                        className="cursor-pointer text-[var(--accountability-red)] hover:bg-[var(--accountability-red-muted)] hover:text-[var(--accountability-red)] gap-2"
                                    >
                                        <LogOut className="w-4 h-4" /> Sign out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link href="/transparency">
                                <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-muted-foreground hover:text-foreground">
                                    Transparency
                                </Button>
                            </Link>
                            <Link href="/login">
                                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                                    Sign In
                                </Button>
                            </Link>
                            <Link href="/submit">
                                <Button size="sm" className="bg-[var(--civic-amber)] text-[var(--navy-deep)] hover:bg-[var(--civic-amber)]/90 font-semibold glow-amber">
                                    File a Complaint
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
