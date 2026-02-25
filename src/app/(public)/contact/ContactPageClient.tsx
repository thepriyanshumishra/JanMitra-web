"use client";

import {
    Mail, Phone, MapPin, MessageSquare,
    ArrowRight, Globe, Github, Twitter,
    Linkedin, Shield, Send
} from "lucide-react";
import { AppNavbar } from "@/components/shared/AppNavbar";
import { Footer } from "@/components/shared/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";

export default function ContactPageClient() {
    const [sending, setSending] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        setTimeout(() => {
            setSending(false);
            toast.success("Message received! Our team will get back to you within 24 hours.");
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#020817] text-foreground">
            <AppNavbar />

            <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="max-w-7xl mx-auto relative">
                    <div className="grid lg:grid-cols-2 gap-16">
                        {/* Left Col - Info */}
                        <div className="space-y-12">
                            <div className="space-y-6">
                                <Badge className="bg-blue-500/10 text-blue-400 border-0 py-1 px-4">Contact Our Team</Badge>
                                <h1 className="text-5xl font-display font-bold">Let&apos;s build <span className="text-gradient-civic">accountable</span> cities together.</h1>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    Have questions about the platform? Interested in implementing JanMitra for your Municipal Corporation or Department? We&apos;re here to help.
                                </p>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <h4 className="font-bold">Email Us</h4>
                                    <p className="text-sm text-muted-foreground">For general inquiries and support.</p>
                                    <p className="text-sm font-semibold text-foreground">support@janmitra.in</p>
                                </div>
                                <div className="space-y-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                        <Phone className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <h4 className="font-bold">Call Us</h4>
                                    <p className="text-sm text-muted-foreground">Mon-Fri, 9am - 6pm IST.</p>
                                    <p className="text-sm font-semibold text-foreground">+91-1800-JAN-MITRA</p>
                                </div>
                                <div className="space-y-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                        <MapPin className="w-5 h-5 text-[var(--civic-amber)]" />
                                    </div>
                                    <h4 className="font-bold">Headquarters</h4>
                                    <p className="text-sm text-muted-foreground">Innovate India Hub, Block C, Civic Center, New Delhi.</p>
                                </div>
                                <div className="space-y-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                        <Globe className="w-5 h-5 text-[var(--trust-green)]" />
                                    </div>
                                    <h4 className="font-bold">Follow Us</h4>
                                    <div className="flex gap-4 pt-1">
                                        <Twitter className="w-4 h-4 text-muted-foreground hover:text-white cursor-pointer" />
                                        <Linkedin className="w-4 h-4 text-muted-foreground hover:text-white cursor-pointer" />
                                        <Github className="w-4 h-4 text-muted-foreground hover:text-white cursor-pointer" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 glass rounded-2xl border-white/10 space-y-4">
                                <h4 className="text-sm font-bold flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-blue-400" />
                                    Government Partnerships
                                </h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Looking for a technical demonstration for your department? Our implementation specialists can provide a sandbox environment for evaluation.
                                </p>
                                <Button variant="link" className="text-blue-400 p-0 h-auto text-xs font-bold hover:no-underline flex items-center gap-1">
                                    Request Partner Deck <ArrowRight className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>

                        {/* Right Col - Form */}
                        <div className="relative">
                            <div className="glass p-8 md:p-10 rounded-3xl border-white/10 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-50" />
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-muted-foreground uppercase">Full Name</Label>
                                        <Input required placeholder="Your Name" className="bg-white/5 border-white/10 h-11 focus:border-blue-500/50" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-muted-foreground uppercase">Email Address</Label>
                                        <Input required type="email" placeholder="name@organization.com" className="bg-white/5 border-white/10 h-11 focus:border-blue-500/50" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-muted-foreground uppercase">Inquiry Type</Label>
                                        <select className="flex h-11 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none">
                                            <option>General Support</option>
                                            <option>Partnership Proposal</option>
                                            <option>Report a Bug</option>
                                            <option>Media Inquiry</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-muted-foreground uppercase">Message</Label>
                                        <Textarea required placeholder="Tell us how we can help..." rows={5} className="bg-white/5 border-white/10 focus:border-blue-500/50 resize-none" />
                                    </div>
                                    <Button type="submit" disabled={sending} className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold gap-2">
                                        {sending ? (
                                            <>Sending Message...</>
                                        ) : (
                                            <><Send className="w-4 h-4" /> Send Message</>
                                        )}
                                    </Button>
                                    <p className="text-[10px] text-muted-foreground text-center">
                                        By submitting this form, you agree to our <span className="underline">Privacy Policy</span>. We typically respond within 1 business day.
                                    </p>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map or Locations placeholder */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-card/10">
                <div className="max-w-7xl mx-auto flex flex-col items-center space-y-8">
                    <div className="text-center space-y-4">
                        <h2 className="text-2xl font-display font-bold">Operating globally from New Delhi.</h2>
                        <p className="text-sm text-muted-foreground">Our distributed team is scaling accountability across the country.</p>
                    </div>
                    {/* Visual placeholder for a map */}
                    <div className="w-full h-[400px] glass rounded-3xl border-white/5 bg-[url('/grid-dark.svg')] relative flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-blue-500/5" />
                        <div className="relative group text-center space-y-4">
                            <div className="w-12 h-12 rounded-full bg-[var(--civic-amber)] animate-ping absolute top-0 left-0 opacity-20" />
                            <MapPin className="w-12 h-12 text-[var(--civic-amber)] mx-auto relative z-10 drop-shadow-[0_0_15px_var(--civic-amber)]" />
                            <div className="p-4 bg-black/60 backdrop-blur-md rounded-xl border border-white/10">
                                <p className="font-bold text-sm">JanMitra HQ</p>
                                <p className="text-xs text-muted-foreground">New Delhi, India</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
