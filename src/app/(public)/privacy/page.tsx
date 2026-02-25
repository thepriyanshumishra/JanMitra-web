import Link from "next/link";
import { Shield } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "JanMitra's Privacy Policy — how we handle your data.",
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-mesh text-foreground">
            {/* Minimal nav */}
            <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-[var(--glass-border)]">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[var(--civic-amber)] flex items-center justify-center glow-amber">
                            <Shield className="w-3.5 h-3.5 text-[var(--navy-deep)]" />
                        </div>
                        <span className="font-display font-bold tracking-tight">JanMitra</span>
                    </Link>
                    <span className="text-sm text-muted-foreground">/</span>
                    <span className="text-sm text-muted-foreground">Privacy Policy</span>
                </div>
            </nav>

            <main className="pt-28 pb-20 max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
                <div>
                    <h1 className="text-4xl font-display font-bold tracking-tight mb-3">Privacy Policy</h1>
                    <p className="text-muted-foreground text-sm">Last updated: February 2025</p>
                </div>

                {[
                    {
                        title: "1. What We Collect",
                        body: `JanMitra collects information you voluntarily provide during account registration (name, email or phone number) and when filing a complaint (description, category, location, and any evidence you attach). For public complaints, this information may be visible to other users as configured by you. For private complaints, your identity is never shared publicly.`,
                    },
                    {
                        title: "2. How We Use Your Data",
                        body: `Your data is used exclusively to: (a) route and resolve your grievance through the appropriate government department; (b) provide you with real-time status tracking; (c) compile anonymous, aggregate city-wide statistics for the public Transparency Dashboard. We never sell your personal data to third parties.`,
                    },
                    {
                        title: "3. Privacy Levels",
                        body: `When filing a complaint, you choose one of three privacy levels:\n\n• Public — your description and location are viewable by all, to signal shared civic issues.\n• Restricted — only JanMitra staff and the assigned department officer can view details.\n• Private — fully confidential; only the responsible officer, department head, and system administrators can access your complaint.`,
                    },
                    {
                        title: "4. Authentication",
                        body: `We use Firebase Authentication to manage user identity. Passwords are never stored by JanMitra — they are handled exclusively by Firebase's industry-standard secure hashing. You may also sign in via Google OAuth or phone OTP.`,
                    },
                    {
                        title: "5. Data Storage",
                        body: `All complaint data is stored in Google Cloud Firestore, in servers located in Asia. Firebase Security Rules ensure that only authenticated, role-authorized users can read or write documents they are permitted to access.`,
                    },
                    {
                        title: "6. Cookies & Local Storage",
                        body: `JanMitra uses a single HTTP-only session cookie to maintain your secure login state. No third-party advertising or analytics cookies are used.`,
                    },
                    {
                        title: "7. Third-Party Services",
                        body: `We integrate with the following third-party services:\n\n• Firebase (Google) — Authentication, Firestore, and Storage\n• Groq — AI-powered complaint extraction via the Manus assistant (your input is sent for processing, but is not stored by Groq per their API terms)\n\nWe encourage you to review their respective privacy policies.`,
                    },
                    {
                        title: "8. Your Rights",
                        body: `You have the right to access, correct, or delete your personal data at any time. You can do so from your Profile page. For account deletion requests, contact us at privacy@janmitra.in.`,
                    },
                    {
                        title: "9. Contact",
                        body: `For questions about this Privacy Policy, please email privacy@janmitra.in.`,
                    },
                ].map((section) => (
                    <section key={section.title} className="glass rounded-2xl p-6 space-y-3">
                        <h2 className="text-lg font-display font-semibold">{section.title}</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                            {section.body}
                        </p>
                    </section>
                ))}

                <div className="text-center pt-4">
                    <Link href="/" className="text-sm text-[var(--civic-amber)] hover:underline">
                        ← Back to JanMitra
                    </Link>
                </div>
            </main>
        </div>
    );
}
