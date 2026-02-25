"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body
                style={{
                    background: "#020817",
                    color: "#f8fafc",
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: "24px",
                    fontFamily: "system-ui, sans-serif",
                    padding: "16px",
                    textAlign: "center",
                }}
            >
                <div
                    style={{
                        width: 64,
                        height: 64,
                        borderRadius: 16,
                        background: "rgba(239,68,68,0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <AlertTriangle style={{ width: 32, height: 32, color: "#ef4444" }} />
                </div>
                <div>
                    <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Critical Error</h1>
                    <p style={{ fontSize: 14, color: "#94a3b8", maxWidth: 360, margin: "0 auto" }}>
                        The application encountered a critical error and could not recover. Please refresh the page.
                    </p>
                </div>
                <Button
                    onClick={reset}
                    style={{
                        background: "#f59e0b",
                        color: "#020817",
                        fontWeight: 700,
                        padding: "10px 24px",
                        borderRadius: 10,
                        border: "none",
                        cursor: "pointer",
                        fontSize: 14,
                    }}
                >
                    Refresh Page
                </Button>
            </body>
        </html>
    );
}
