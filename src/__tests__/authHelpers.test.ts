import { describe, it, expect } from "vitest";

// ── Pure helpers tested in isolation ─────────────────────────────

/** Mirrors the slugify utility used in the departments page */
function slugify(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/** Maps role string to a priority number (higher = more privileged) */
function rolePriority(role: string): number {
    const ORDER: Record<string, number> = {
        citizen: 0,
        officer: 1,
        dept_admin: 2,
        system_admin: 3,
    };
    return ORDER[role] ?? -1;
}

/** Returns true if user has access to a route requiring minRole */
function hasMinRole(userRole: string, minRole: string): boolean {
    return rolePriority(userRole) >= rolePriority(minRole);
}

// ── Tests ─────────────────────────────────────────────────────────

describe("slugify()", () => {
    it("converts spaces to hyphens", () => {
        expect(slugify("Water Supply")).toBe("water-supply");
    });
    it("lowercases", () => {
        expect(slugify("ELECTRICITY")).toBe("electricity");
    });
    it("removes leading/trailing hyphens", () => {
        expect(slugify("  health dept  ")).toBe("health-dept");
    });
    it("collapses multiple special chars to single hyphen", () => {
        expect(slugify("Roads & Transport!")).toBe("roads-transport");
    });
    it("handles already-valid slug", () => {
        expect(slugify("roads-transport")).toBe("roads-transport");
    });
});

describe("rolePriority()", () => {
    it("returns 0 for citizen", () => expect(rolePriority("citizen")).toBe(0));
    it("returns 1 for officer", () => expect(rolePriority("officer")).toBe(1));
    it("returns 2 for dept_admin", () => expect(rolePriority("dept_admin")).toBe(2));
    it("returns 3 for system_admin", () => expect(rolePriority("system_admin")).toBe(3));
    it("returns -1 for unknown role", () => expect(rolePriority("hacker")).toBe(-1));
});

describe("hasMinRole()", () => {
    it("system_admin passes all checks", () => {
        expect(hasMinRole("system_admin", "citizen")).toBe(true);
        expect(hasMinRole("system_admin", "officer")).toBe(true);
        expect(hasMinRole("system_admin", "system_admin")).toBe(true);
    });
    it("citizen fails officer+ checks", () => {
        expect(hasMinRole("citizen", "officer")).toBe(false);
        expect(hasMinRole("citizen", "system_admin")).toBe(false);
    });
    it("citizen passes citizen check", () => {
        expect(hasMinRole("citizen", "citizen")).toBe(true);
    });
    it("officer passes officer check but not dept_admin", () => {
        expect(hasMinRole("officer", "officer")).toBe(true);
        expect(hasMinRole("officer", "dept_admin")).toBe(false);
    });
});
