import type { Metadata } from "next";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { AppNavbar } from "@/components/shared/AppNavbar";

export const metadata: Metadata = {
    title: "Dashboard",
};

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <div className="min-h-screen bg-mesh">
                <AppNavbar />
                <main className="pt-16">
                    {children}
                </main>
            </div>
        </AuthProvider>
    );
}
