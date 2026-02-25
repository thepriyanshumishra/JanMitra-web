import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "JanMitra — Governance Accountability Platform",
    template: "%s | JanMitra",
  },
  description:
    "JanMitra makes institutional failure impossible to stay invisible. Track the flow of responsibility inside government departments with our Responsibility Trace Engine.",
  keywords: ["governance", "accountability", "grievance", "transparency", "civic tech"],
  authors: [{ name: "JanMitra" }],
  metadataBase: new URL("https://janmitra.in"),
  openGraph: {
    title: "JanMitra — Governance Accountability Platform",
    description: "Making institutional failure impossible to stay invisible.",
    type: "website",
    locale: "en_IN",
    siteName: "JanMitra",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "JanMitra",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#020817",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased scrollbar-thin`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <TooltipProvider delayDuration={200}>
            {children}
            <Toaster
              theme="dark"
              position="top-right"
              toastOptions={{
                style: {
                  background: "oklch(0.16 0.03 240)",
                  border: "1px solid oklch(1 0 0 / 10%)",
                  color: "oklch(0.95 0.005 240)",
                },
              }}
            />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
