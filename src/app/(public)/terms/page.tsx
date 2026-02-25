import { AppNavbar } from "@/components/shared/AppNavbar";
import { Footer } from "@/components/shared/Footer";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms & Conditions",
    description: "Read the terms and conditions for using the JanMitra platform, including user conduct, data integrity, and accountability standards.",
};

export default function TermsPage() {
    const sections = [
        { title: "Acceptance of Terms", content: "By accessing or using JanMitra, you agree to be bound by these Terms and Conditions. If you do not agree, please refrain from using the platform." },
        { title: "User Responsibilities", content: "Users are responsible for the accuracy of information provided in grievances. False reporting or abuse of the platform may lead to account suspension." },
        { title: "Privacy & Data", content: "We prioritize citizen privacy. Personal data is handled according to our Privacy Policy. Public complaints will have personal identifiers redacted by default." },
        { title: "System Integrity", content: "Any attempt to tamper with the Responsibility Trace Engine or manipulate SLA data is strictly prohibited and may result in legal action." },
        { title: "Service Limitations", content: "While JanMitra strives for 100% accountability, we do not guarantee the resolution of every grievance, as individual case results depend on government action." },
        { title: "Modifications", content: "JanMitra reserves the right to update these terms at any time. Continued use of the platform constitutes acceptance of updated terms." }
    ];

    return (
        <div className="min-h-screen bg-[#020817] text-foreground">
            <AppNavbar />

            <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto space-y-12">
                    {/* Header */}
                    <div className="space-y-4">
                        <Badge variant="outline" className="border-white/10 text-muted-foreground uppercase tracking-widest text-[10px]">Legal Framework</Badge>
                        <h1 className="text-4xl md:text-5xl font-display font-bold">Terms & Conditions</h1>
                        <p className="text-muted-foreground">Last Updated: February 26, 2026</p>
                    </div>

                    <div className="prose prose-invert prose-blue max-w-none">
                        <div className="grid gap-12">
                            {sections.map((section, i) => (
                                <div key={i} className="space-y-4 border-l border-white/5 pl-8 relative group">
                                    <div className="absolute top-0 left-[-1px] w-[1px] h-0 bg-blue-500 group-hover:h-full transition-all duration-300" />
                                    <h3 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
                                        <span className="text-blue-500/50 tabular-nums text-sm font-mono">0{i + 1}.</span>
                                        {section.title}
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed text-sm">
                                        {section.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Additional Info Block */}
                    <div className="p-8 glass rounded-3xl border-white/10 bg-white/[0.01] space-y-6">
                        <h4 className="text-lg font-display font-bold">Governance & Legal Accountability</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            As JanMitra is an infrastructure layer designed to improve public accountability, our terms are structured to be in compliance with the Information Technology Act, 2000 and the Digital Personal Data Protection Act (DPDP), 2023.
                        </p>
                        <div className="pt-4 flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 text-xs text-[var(--trust-green)] font-bold">
                                <ChevronRight className="w-4 h-4" /> DPDP Compliant
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[var(--trust-green)] font-bold">
                                <ChevronRight className="w-4 h-4" /> End-to-End Traced
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[var(--trust-green)] font-bold">
                                <ChevronRight className="w-4 h-4" /> Safe Harbor Protected
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
