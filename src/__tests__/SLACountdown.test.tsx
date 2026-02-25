import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SLACountdown } from "@/components/grievance/SLACountdown";

// ── Helpers ───────────────────────────────────────────────────────
const fromNow = (ms: number) => new Date(Date.now() + ms).toISOString();
const daysMs = (d: number) => d * 24 * 60 * 60 * 1000;
const hrsMs = (h: number) => h * 60 * 60 * 1000;

describe("SLACountdown", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("shows 'On Track' when deadline is more than 24h away", () => {
        render(<SLACountdown slaDeadlineAt={fromNow(daysMs(3))} />);
        expect(screen.getByText("On Track")).toBeInTheDocument();
    });

    it("shows 'At Risk' when deadline is less than 24h away (but not breached)", () => {
        render(<SLACountdown slaDeadlineAt={fromNow(hrsMs(10))} />);
        expect(screen.getByText("At Risk")).toBeInTheDocument();
    });

    it("shows 'SLA Breached' when deadline is in the past", () => {
        render(<SLACountdown slaDeadlineAt={fromNow(-daysMs(2))} />);
        expect(screen.getByText("SLA Breached")).toBeInTheDocument();
    });

    it("shows compact badge with correct label", () => {
        render(<SLACountdown slaDeadlineAt={fromNow(daysMs(4))} compact />);
        expect(screen.getByText("On Track")).toBeInTheDocument();
        // In compact mode there is no progress bar, just a badge
        expect(screen.queryByText("7-day SLA")).not.toBeInTheDocument();
    });

    it("shows compact 'SLA Breached' badge when breached", () => {
        render(<SLACountdown slaDeadlineAt={fromNow(-hrsMs(5))} compact />);
        expect(screen.getByText("SLA Breached")).toBeInTheDocument();
    });

    it("renders the time label in full mode", () => {
        render(<SLACountdown slaDeadlineAt={fromNow(daysMs(2))} />);
        // Should contain something like '2d Xh left'
        expect(screen.getByText(/left/)).toBeInTheDocument();
    });

    it("renders breached time label (ago) in full mode", () => {
        render(<SLACountdown slaDeadlineAt={fromNow(-daysMs(1) - hrsMs(3))} />);
        expect(screen.getByText(/ago/)).toBeInTheDocument();
    });
});
