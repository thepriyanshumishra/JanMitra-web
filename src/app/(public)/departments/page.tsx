"use client";

import { AppNavbar } from "@/components/shared/AppNavbar";
import { Badge } from "@/components/ui/badge";
import { Building2, Droplets, Lightbulb, Pickaxe, Trees, Trash2 } from "lucide-react";

const DEPARTMENTS = [
    { id: "Water", icon: Droplets, color: "text-blue-400", bg: "bg-blue-400/10", desc: "Pipelines, leakages, and water quality monitoring." },
    { id: "Electricity", icon: Lightbulb, color: "text-yellow-400", bg: "bg-yellow-400/10", desc: "Streetlights, power outages, and grid accountability." },
    { id: "Roads", icon: Pickaxe, color: "text-orange-400", bg: "bg-orange-400/10", desc: "Potholes, road relaying, and drainage infrastructure." },
    { id: "Sanitation", icon: Trash2, color: "text-green-400", bg: "bg-green-400/10", desc: "Garbage collection and public health maintenance." },
    { id: "Parks", icon: Trees, color: "text-emerald-400", bg: "bg-emerald-400/10", desc: "Public gardens, playgrounds, and green spaces." },
    { id: "General", icon: Building2, color: "text-purple-400", bg: "bg-purple-400/10", desc: "Other municipal services and general administrative issues." },
];

export default function DepartmentsPage() {
    return (
        <div className="min-h-screen bg-mesh">
            <AppNavbar />
            <main className="pt-32 pb-24 px-4 max-w-7xl mx-auto space-y-12">
                <div className="space-y-4">
                    <Badge className="bg-[var(--civic-amber-muted)] text-[var(--civic-amber)] border-0">Public Service Directory</Badge>
                    <h1 className="text-4xl font-display font-bold">Monitored <span className="text-gradient-civic">Departments</span></h1>
                    <p className="text-muted-foreground max-w-2xl">
                        These departments are currently integrated into the JanMitra Trace Engine. Every resolution they post is subject to citizen verification.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {DEPARTMENTS.map((dept) => (
                        <div key={dept.id} className="glass p-8 rounded-3xl group hover:border-[var(--civic-amber)]/30 transition-all">
                            <div className={`w-12 h-12 rounded-2xl ${dept.bg} flex items-center justify-center ${dept.color} mb-6`}>
                                <dept.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-display font-bold mb-2">{dept.id}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-6">{dept.desc}</p>
                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <span className="text-[10px] font-bold text-[var(--trust-green)]">94% SLA Honesty</span>
                                <span className="text-[10px] text-muted-foreground uppercase font-medium">8 Active Officers</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="glass p-8 rounded-[32px] border border-[var(--civic-amber)]/20 bg-[var(--civic-amber-muted)] flex flex-col md:flex-row items-center gap-8 justify-between">
                    <div className="space-y-2">
                        <h2 className="text-xl font-display font-bold text-[var(--civic-amber)]">Missing a department?</h2>
                        <p className="text-sm text-[var(--civic-amber)] opacity-80">We are gradually onboarding more administrative layers to ensure total coverage.</p>
                    </div>
                    <button className="bg-[var(--civic-amber)] text-[var(--navy-deep)] px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-[var(--civic-amber)]/10 active:scale-95 transition-all shrink-0">
                        Request Onboarding
                    </button>
                </div>
            </main>
        </div>
    );
}
