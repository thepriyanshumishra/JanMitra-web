"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    Bell, LogOut, User, ChevronDown, CheckCircle2,
    Menu, X, LayoutDashboard, FileText, Globe,
    Settings, ShieldCheck, Heart, Info, Activity, Zap,
    Briefcase, Shield
} from "lucide-react";
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
import { cn } from "@/lib/utils";

const ROLE_LABEL: Record<UserRole, string> = {
    citizen: "Citizen",
    officer: "Officer",
    dept_admin: "Dept. Admin",
    system_admin: "System Admin",
};

const ROLE_COLOR: Record<UserRole, string> = {
    citizen: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    officer: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    dept_admin: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    system_admin: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

export function AppNavbar() {
    const { user, signOut, updateRole } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleSignOut = async () => {
        await signOut();
        router.push("/");
    };

    const handleRoleSwitch = async (newRole: UserRole) => {
        await updateRole(newRole);
        router.push(ROLE_HOME[newRole]);
    };

    const isActive = (href: string) => {
        if (href === "/" && pathname !== "/") return false;
        return pathname.startsWith(href);
    };

    const navLinks = [
        ...(user?.role === "citizen"
            ? [
                { href: "/dashboard", label: "My Hub", icon: <LayoutDashboard className="w-4 h-4" /> },
                { href: "/submit", label: "Report Issue", icon: <FileText className="w-4 h-4" /> },
                { href: "/transparency", label: "Registry", icon: <Globe className="w-4 h-4" /> },
            ]
            : user?.role === "officer"
                ? [
                    { href: "/officer", label: "Desk", icon: <LayoutDashboard className="w-4 h-4" /> },
                    { href: "/transparency", label: "Registry", icon: <Globe className="w-4 h-4" /> },
                ]
                : user?.role === "dept_admin"
                    ? [
                        { href: "/admin/dept", label: "Control", icon: <ShieldCheck className="w-4 h-4" /> },
                        { href: "/admin/dept/analytics", label: "Insights", icon: <Activity className="w-4 h-4" /> },
                        { href: "/transparency", label: "Registry", icon: <Globe className="w-4 h-4" /> },
                    ]
                    : user?.role === "system_admin"
                        ? [
                            { href: "/admin/system", label: "Network", icon: <Settings className="w-4 h-4" /> },
                            { href: "/admin/system/departments", label: "Units", icon: <ShieldCheck className="w-4 h-4" /> },
                            { href: "/transparency", label: "Registry", icon: <Globe className="w-4 h-4" /> },
                        ]
                        : [
                            { href: "/", label: "Home", icon: <Heart className="w-4 h-4" /> },
                            { href: "/how-it-works", label: "How it Works", icon: <Zap className="w-4 h-4" /> },
                            { href: "/transparency", label: "Transparency", icon: <Globe className="w-4 h-4" /> },
                            { href: "/about", label: "About", icon: <Info className="w-4 h-4" /> },
                        ])
    ];

    return (
        <header
            className={cn(
                "fixed top-0 inset-x-0 z-50 transition-all duration-500 flex justify-center pt-4 px-4",
                scrolled ? "pt-2" : "pt-6"
            )}
        >
            <nav
                className={cn(
                    "w-full max-w-7xl h-16 rounded-[24px] transition-all duration-500 flex items-center justify-between px-4 sm:px-6 relative overflow-hidden",
                    "glass border border-white/10 dark:border-white/5",
                    scrolled
                        ? "shadow-xl backdrop-blur-2xl bg-background/80 h-14"
                        : "shadow-none bg-background/40"
                )}
            >
                {/* Visual Accent */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-[var(--civic-amber)]/30 to-transparent pointer-events-none" />

                {/* Left Section: Logo */}
                <Link href="/" className="flex items-center gap-3 group relative z-10 shrink-0">
                    <div className="relative">
                        <div className="absolute inset-0 bg-[var(--civic-amber)] rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                        <img
                            src="/icons/icon-192x192.png"
                            alt="JanMitra"
                            className="w-8 h-8 sm:w-9 sm:h-9 relative transform transition-transform group-hover:scale-105"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-display text-base sm:text-lg font-black tracking-tight leading-none text-foreground">JanMitra</span>
                        <span className="text-[10px] font-bold text-[var(--civic-amber)] uppercase tracking-widest opacity-80 mt-0.5">Jan-Kalyan</span>
                    </div>
                </Link>

                {/* Center Section: Navigation (Desktop) */}
                <div className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2 bg-foreground/5 rounded-2xl p-1 border border-foreground/5">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "relative px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2",
                                isActive(link.href)
                                    ? "text-foreground bg-foreground/10 shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                            )}
                        >
                            <span className={cn(
                                "transition-colors",
                                isActive(link.href) ? "text-[var(--civic-amber)]" : "text-muted-foreground group-hover:text-foreground"
                            )}>
                                {link.icon}
                            </span>
                            {link.label}
                            {isActive(link.href) && (
                                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--civic-amber)] shadow-[0_0_8px_var(--civic-amber)]" />
                            )}
                        </Link>
                    ))}
                </div>

                {/* Right Section: Actions */}
                <div className="flex items-center gap-2 sm:gap-4 relative z-10">
                    <div className="hidden sm:flex items-center gap-2">
                        <ThemeToggle />
                    </div>

                    {user ? (
                        <div className="flex items-center gap-2">
                            {/* Notification Bell */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="relative rounded-xl hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-all transform hover:scale-105 hidden sm:flex"
                                aria-label="Notifications"
                            >
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--accountability-red)] rounded-full border-2 border-[var(--navy-deep)] pulse-red" />
                            </Button>

                            {/* User Profile Trigger */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2 p-1 pl-1 pr-2 sm:pr-3 rounded-full bg-foreground/5 border border-foreground/10 hover:bg-foreground/10 transition-all outline-none group">
                                        <Avatar className="w-7 h-7 sm:w-8 sm:h-8 border-2 border-[var(--civic-amber)]/20 shadow-lg transition-transform group-hover:scale-105">
                                            <div className="w-full h-full bg-gradient-to-br from-[var(--civic-amber)] to-orange-600 flex items-center justify-center text-white font-black text-xs sm:text-sm">
                                                {user.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                        </Avatar>
                                        <div className="hidden sm:flex flex-col items-start leading-tight">
                                            <span className="text-xs font-black text-foreground truncate max-w-[80px]">
                                                {user.name?.split(" ")[0]}
                                            </span>
                                            <span className="text-[9px] font-bold text-[var(--civic-amber)] uppercase tracking-tighter">
                                                {ROLE_LABEL[user.role]}
                                            </span>
                                        </div>
                                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[280px] mt-4 bg-popover/95 backdrop-blur-2xl border-foreground/10 p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                                    <div className="px-4 py-4 mb-2 bg-foreground/5 rounded-2xl border border-foreground/5">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-12 h-12 border-2 border-[var(--civic-amber)]">
                                                <div className="w-full h-full bg-gradient-to-br from-[var(--civic-amber)] to-orange-600 flex items-center justify-center text-white font-black text-xl">
                                                    {user.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-black truncate text-foreground">{user.name}</h4>
                                                <p className="text-[10px] text-muted-foreground truncate">{user.email ?? user.phone}</p>
                                                <Badge className={cn("mt-1.5 text-[9px] px-1.5 py-0 border", ROLE_COLOR[user.role])}>
                                                    {ROLE_LABEL[user.role]}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Links */}
                                    <DropdownMenuLabel className="px-2 text-[10px] font-black uppercase text-muted-foreground tracking-widest py-1">Management</DropdownMenuLabel>
                                    <DropdownMenuItem className="rounded-xl focus:bg-foreground/10 cursor-pointer transition-colors py-2.5">
                                        <Link href="/profile" className="flex items-center gap-3 w-full">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold text-sm">Account Profile</span>
                                        </Link>
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator className="bg-foreground/10 my-1.5" />

                                    {/* Role Switcher */}
                                    <DropdownMenuLabel className="px-2 text-[10px] font-black uppercase text-muted-foreground tracking-widest py-1">Switch Perspective</DropdownMenuLabel>
                                    <div className="grid grid-cols-1 gap-1 px-1">
                                        {(Object.keys(ROLE_LABEL) as UserRole[]).map((r) => (
                                            <DropdownMenuItem
                                                key={r}
                                                onClick={() => handleRoleSwitch(r)}
                                                className={cn(
                                                    "rounded-xl focus:bg-foreground/10 cursor-pointer transition-colors py-2 gap-3",
                                                    user.role === r ? "bg-foreground/5 text-[var(--civic-amber)]" : "text-muted-foreground"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                                    user.role === r ? "bg-[var(--civic-amber)]/10" : "bg-foreground/5"
                                                )}>
                                                    {r === 'citizen' && <User className="w-4 h-4" />}
                                                    {r === 'officer' && <Shield className="w-4 h-4" />}
                                                    {r === 'dept_admin' && <Briefcase className="w-4 h-4" />}
                                                    {r === 'system_admin' && <Settings className="w-4 h-4" />}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-bold text-sm leading-none">{ROLE_LABEL[r]}</span>
                                                    <span className="text-[9px] opacity-70 mt-1 truncate">
                                                        {r === 'citizen' && "Public Dashboard"}
                                                        {r === 'officer' && "Grievance Desk"}
                                                        {r === 'dept_admin' && "Department Analytics"}
                                                        {r === 'system_admin' && "Network Control"}
                                                    </span>
                                                </div>
                                            </DropdownMenuItem>
                                        ))}
                                    </div>

                                    <DropdownMenuSeparator className="bg-foreground/10 my-1.5" />

                                    <DropdownMenuItem
                                        onClick={handleSignOut}
                                        className="rounded-xl focus:bg-red-500/10 text-red-400 hover:text-red-400 cursor-pointer transition-colors py-2.5 font-bold"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                                            <LogOut className="w-4 h-4" />
                                        </div>
                                        End Session
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/login" className="hidden sm:block">
                                <Button variant="ghost" size="sm" className="font-bold text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground">
                                    Sign In
                                </Button>
                            </Link>
                            <Link href="/submit">
                                <Button size="sm" className="rounded-full px-5 bg-[var(--civic-amber)] text-[var(--navy-deep)] hover:bg-[var(--civic-amber)]/90 font-black text-xs uppercase tracking-tighter glow-amber transition-all hover:scale-105 active:scale-95">
                                    Report Issue
                                </Button>
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Trigger */}
                    <button
                        className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl glass border-foreground/10 text-foreground"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div
                className={cn(
                    "fixed inset-0 top-[72px] z-40 lg:hidden transition-all duration-500 ease-in-out",
                    mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setMobileMenuOpen(false)} />

                {/* Content */}
                <div
                    className={cn(
                        "absolute inset-x-4 top-4 bg-popover/95 backdrop-blur-3xl border border-foreground/10 rounded-3xl p-6 transition-transform duration-500 shadow-2xl",
                        mobileMenuOpen ? "translate-y-0" : "-translate-y-10"
                    )}
                >
                    <div className="flex flex-col gap-4">
                        <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-2">Navigation</div>
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={cn(
                                    "flex items-center gap-4 px-4 py-4 rounded-2xl border transition-all",
                                    isActive(link.href)
                                        ? "bg-[var(--civic-amber)]/10 border-[var(--civic-amber)]/20 text-foreground font-black"
                                        : "bg-foreground/5 border-foreground/5 text-muted-foreground"
                                )}
                            >
                                <span className={isActive(link.href) ? "text-[var(--civic-amber)]" : ""}>
                                    {link.icon}
                                </span>
                                {link.label}
                            </Link>
                        ))}

                        <div className="h-[1px] bg-foreground/5 my-2" />

                        {user && (
                            <div className="flex flex-col gap-3">
                                <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-2">Switch Perspective</div>
                                <div className="grid grid-cols-2 gap-2">
                                    {(Object.keys(ROLE_LABEL) as UserRole[]).map((r) => (
                                        <button
                                            key={r}
                                            onClick={() => {
                                                handleRoleSwitch(r);
                                                setMobileMenuOpen(false);
                                            }}
                                            className={cn(
                                                "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all",
                                                user.role === r
                                                    ? "bg-[var(--civic-amber)]/10 border-[var(--civic-amber)]/20 text-foreground"
                                                    : "bg-foreground/5 border-foreground/5 text-muted-foreground"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center",
                                                user.role === r ? "bg-[var(--civic-amber)] text-[var(--navy-deep)]" : "bg-foreground/10"
                                            )}>
                                                {r === 'citizen' && <User className="w-5 h-5" />}
                                                {r === 'officer' && <Shield className="w-5 h-5" />}
                                                {r === 'dept_admin' && <Briefcase className="w-5 h-5" />}
                                                {r === 'system_admin' && <Settings className="w-5 h-5" />}
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-tight">{ROLE_LABEL[r]}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!user && (
                            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                <Button className="w-full bg-foreground/5 border border-foreground/10 text-foreground font-black h-14 rounded-2xl">
                                    Sign In to JanMitra
                                </Button>
                            </Link>
                        )}

                        <div className="flex items-center justify-between px-2 pt-2">
                            <span className="text-xs text-muted-foreground">Dark / Light Mode</span>
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
