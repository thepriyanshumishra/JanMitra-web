import Link from "next/link";
import {
    CheckCircle2, ArrowRight, Zap, GitBranch, Shield,
    Search, MessageCircle, MapPin, Bell, BarChart3,
    RotateCcw, Database, Send
} from "lucide-react";

const ManusIcon = (props: any) => (
    <img src="/icons/icon-192x192.png" alt="Manus AI" className={props.className} />
);
import { AppNavbar } from "@/components/shared/AppNavbar";
import { Footer } from "@/components/shared/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "How It Works",
    description: "Explore the four-step loop of accountability: Reporting, Routing, Action, and Closure. See how JanMitra traces every hand-off.",
};

export default function HowItWorksPage() {
    const steps = [
        {
            id: "01",
            icon: MessageCircle,
            title: "Reporting",
            desc: "Use Manus AI to describe your issue in natural language (voice or text). Our engine extracts the category, location, and urgency automatically.",
            features: ["Voice-to-Grievance", "Automatic Category Detection", "Smart Location Pinning"]
        },
        {
            id: "02",
            icon: Zap,
            title: "Routing",
            desc: "The Responsibility Trace Engine maps your grievance to the specific department and officer responsible for your ward immediately.",
            features: ["Ward-based Precision", "SLA Timer Activation", "Immutable Hand-off Trace"]
        },
        {
            id: "03",
            icon: Send,
            title: "Action",
            desc: "Government officers receive the grievance with all evidence. They acknowledge, investigate, and act on the issue within defined timelines.",
            features: ["Mobile Officer Dashboard", "Evidence Verification", "Step-by-Step Status Updates"]
        },
        {
            id: "04",
            icon: CheckCircle2,
            title: "Closure & Feedback",
            desc: "Once work is done, you verify the resolution. If unsatisfied, you can reopen the ticket, triggering an automatic audit of the resolution.",
            features: ["Closure Verification", "One-Tap Reopen", "Citizen Satisfaction Feedback"]
        }
    ];

    return (
        <div className="min-h-screen bg-[#020817] text-foreground">
            <AppNavbar />

            {/* Hero */}
            <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 border-b border-white/5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_40%)]" />
                <div className="max-w-7xl mx-auto relative text-center space-y-6">
                    <Badge className="bg-blue-500/10 text-blue-400 border-0 mb-2">Platform Mechanics</Badge>
                    <h1 className="text-4xl md:text-6xl font-display font-bold">How <span className="text-gradient-civic">JanMitra</span> Works</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        A transparent loop of accountability designed to bridge the gap between citizens and administration.
                    </p>
                </div>
            </section>

            {/* The Journey Map */}
            <section className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="space-y-24">
                        {steps.map((step, i) => (
                            <div key={step.id} className={`flex flex-col lg:flex-row items-center gap-16 ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                                <div className="flex-1 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <span className="text-6xl font-display font-bold text-white/5 tabular-nums select-none outline-text">
                                            {step.id}
                                        </span>
                                        <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${i % 2 === 0 ? 'text-[var(--civic-amber)]' : 'text-blue-400'}`}>
                                            <step.icon className="w-8 h-8" />
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-display font-bold">{step.title}</h3>
                                    <p className="text-muted-foreground text-lg leading-relaxed">
                                        {step.desc}
                                    </p>
                                    <div className="grid sm:grid-cols-2 gap-4 pt-4">
                                        {step.features.map(f => (
                                            <div key={f} className="flex items-center gap-2 text-sm text-foreground/80">
                                                <CheckCircle2 className="w-4 h-4 text-[var(--trust-green)]" />
                                                {f}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex-1 w-full max-w-md">
                                    <div className="glass aspect-square rounded-[2rem] p-8 border-white/10 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent group-hover:from-white/10 transition-colors" />
                                        {/* Abstract visual representation of the step */}
                                        <div className="relative h-full flex items-center justify-center">
                                            {i === 0 && <MessageCircle className="w-32 h-32 text-[var(--civic-amber)] opacity-20 animate-pulse" />}
                                            {i === 1 && <GitBranch className="w-32 h-32 text-blue-400 opacity-20 animate-pulse" />}
                                            {i === 2 && <Shield className="w-32 h-32 text-purple-400 opacity-20 animate-pulse" />}
                                            {i === 3 && <img src="/icons/icon-192x192.png" alt="" className="w-32 h-32 opacity-20 animate-pulse grayscale invert dark:invert-0" />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Technical Infrastructure Strip */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white/[0.02] border-y border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-display font-bold">The Tech Behind the Trust</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                        {[
                            { icon: ManusIcon, t: "LLM Orchestration", d: "Deep integration with Gemini for conversational understanding." },
                            { icon: Database, t: "Immutable Logs", d: "Blockchain-inspired event sourcing for every hand-off." },
                            { icon: MapPin, t: "Geospatial Intelligence", d: "Sophisticated mapping to ensure issues reach the right ward." },
                            { icon: Bell, t: "Push Accountability", d: "Active notification system for citizens and officials alike." }
                        ].map((t, i) => (
                            <div key={i} className="space-y-4">
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto border border-white/10">
                                    <t.icon className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <h4 className="font-bold">{t.t}</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed px-4">{t.d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Ready to start? */}
            <section className="py-32 px-4 sm:px-6 lg:px-8 text-center">
                <div className="max-w-2xl mx-auto space-y-8">
                    <h2 className="text-4xl font-display font-bold">Experience the future of civic accountability.</h2>
                    <div className="flex justify-center gap-4">
                        <Link href="/submit">
                            <Button size="lg" className="bg-[var(--civic-amber)] text-[var(--navy-deep)] font-bold px-8 glow-amber">Start a Grievance</Button>
                        </Link>
                        <Link href="/about">
                            <Button size="lg" variant="ghost" className="hover:bg-white/5">Read the Manifesto</Button>
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
