"use client";

import Link from "next/link";
import { Shield, Mail, Phone, MapPin, Github, Twitter, Linkedin, ArrowUpRight, Sparkles, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative border-t border-white/10 bg-[#020817] pt-20 pb-10 overflow-hidden isolate">
            {/* Decorative elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--civic-amber)]/50 to-transparent" />
            <div className="absolute -top-24 -left-20 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 rounded-xl bg-[var(--civic-amber-muted)] flex items-center justify-center border border-[var(--civic-amber)]/20 group-hover:scale-105 transition-transform">
                                <img src="/icons/icon-192x192.png" alt="JanMitra" className="w-6 h-6 object-contain drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]" />
                            </div>
                            <span className="text-2xl font-display font-bold tracking-tight">JanMitra</span>
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                            Building the world&apos;s most transparent accountability infrastructure for modern governance.
                            Making institutional failure visible, measurable, and actionable.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="https://github.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all">
                                <Github className="w-4 h-4" />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all">
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all">
                                <Linkedin className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Platform Links */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/50">Platform</h3>
                        <ul className="space-y-4">
                            {[
                                { label: "What is JanMitra?", href: "/about" },
                                { label: "How it Works", href: "/how-it-works" },
                                { label: "Public Dashboard", href: "/transparency" },
                                { label: "Department Registry", href: "/departments" },
                            ].map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-[var(--civic-amber)] transition-colors flex items-center gap-1 group/link">
                                        {link.label}
                                        <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 group-hover/link:opacity-100 group-hover/link:translate-y-0 transition-all" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources & Support */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/50">Support</h3>
                        <ul className="space-y-4">
                            {[
                                { label: "Contact Us", href: "/contact" },
                                { label: "Terms of Service", href: "/terms" },
                                { label: "Privacy Policy", href: "/privacy" },
                                { label: "Help Center", href: "#" },
                            ].map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-[var(--civic-amber)] transition-colors flex items-center gap-1 group/link">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/50">Stay Connected</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Email Support</p>
                                    <p className="text-sm text-foreground">support@janmitra.in</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20">
                                    <Phone className="w-3.5 h-3.5 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Call Toll-Free</p>
                                    <p className="text-sm text-foreground">1800-JAN-MITRA</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[var(--civic-amber-muted)] flex items-center justify-center shrink-0 border border-[var(--civic-amber)]/20">
                                    <MapPin className="w-3.5 h-3.5 text-[var(--civic-amber)]" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Headquarters</p>
                                    <p className="text-sm text-foreground leading-tight">Civic Center, New Delhi, IN</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col items-center md:items-start gap-1">
                        <p className="text-xs text-muted-foreground">
                            © {currentYear} JanMitra Accountability Infrastructure. All rights reserved.
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                            Handcrafted with <Heart className="w-2.5 h-2.5 text-red-500 fill-red-500" /> for a better democracy.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 p-1 bg-white/5 rounded-lg border border-white/5">
                        <img src="/icons/icon-192x192.png" alt="" className="w-4 h-4 grayscale opacity-50" />
                        <span className="text-[10px] font-mono text-muted-foreground">VERSION 2.4.1-STABLE</span>
                        <div className="w-2 h-2 rounded-full bg-[var(--trust-green)] animate-pulse ml-2" />
                    </div>
                </div>
            </div>
        </footer>
    );
}
