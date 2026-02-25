"use client";

import { AppNavbar } from "@/components/shared/AppNavbar";
import { Shield, Target, Users, Zap } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-mesh">
            <AppNavbar />
            <main className="pt-32 pb-24 px-4 max-w-7xl mx-auto space-y-16">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl sm:text-6xl font-display font-bold">The <span className="text-gradient-civic">JanMitra</span> Manifesto</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Making institutional failure impossible to stay invisible. Transforming Indian governance through radical transparency.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { icon: Shield, title: "Accountability", desc: "Every delay is logged. Every resolution is verified by the citizen." },
                        { icon: Zap, title: "Speed", desc: "SLA monitoring ensures that departments act within promised timelines." },
                        { icon: Users, title: "Inclusion", desc: "Built for every Indian. File for yourself or for those without digital access." },
                        { icon: Target, title: "Precision", desc: "AI-powered routing ensures your voice reaches the right desk, every time." },
                    ].map((item, i) => (
                        <div key={i} className="glass p-8 rounded-3xl space-y-4 hover:translate-y-[-4px] transition-transform">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[var(--civic-amber)]">
                                <item.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-display font-bold">{item.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="glass rounded-[40px] p-10 md:p-20 text-center space-y-8 bg-gradient-to-br from-white/3 to-transparent">
                    <h2 className="text-3xl font-display font-bold">Why JanMitra?</h2>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        In a traditional system, a complaint is a piece of paper that can be lost. In JanMitra, a complaint is an <strong>immutable event</strong>.
                        We don&apos;t just track the &apos;status&apos;; we track the <strong>flow of responsibility</strong>.
                        If a department fails, the system makes it visible. If an officer succeeds, the data proves their competence.
                    </p>
                </div>
            </main>
        </div>
    );
}
