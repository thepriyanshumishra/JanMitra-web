"use client";

import { User, Grievance, GrievanceEvent, DepartmentStats, UserRole } from "@/types";

const STORAGE_KEYS = {
    USERS: "jm_users",
    GRIEVANCES: "jm_grievances",
    EVENTS: "jm_events",
    DEPT_STATS: "jm_dept_stats",
    SESSION_USER: "jm_session_user",
};

// Helper to get from local storage
function get<T>(key: string, defaultValue: T): T {
    if (typeof window === "undefined") return defaultValue;
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
}

// Helper to set in local storage
function set<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
}

export const LocalStorage = {
    // ─── Users ───────────────────────────────────────────────────
    getUser: (id: string): User | null => {
        const users = get<Record<string, User>>(STORAGE_KEYS.USERS, {});
        return users[id] || null;
    },
    saveUser: (user: User): void => {
        const users = get<Record<string, User>>(STORAGE_KEYS.USERS, {});
        users[user.id] = user;
        set(STORAGE_KEYS.USERS, users);
    },
    updateUserRole: (id: string, role: UserRole): void => {
        const users = get<Record<string, User>>(STORAGE_KEYS.USERS, {});
        if (users[id]) {
            users[id].role = role;
            set(STORAGE_KEYS.USERS, users);
        }
    },

    // ─── Grievances ──────────────────────────────────────────────
    getGrievance: (id: string): Grievance | null => {
        const grievances = get<Record<string, Grievance>>(STORAGE_KEYS.GRIEVANCES, {});
        return grievances[id] || null;
    },
    getAllGrievances: (): Grievance[] => {
        const grievances = get<Record<string, Grievance>>(STORAGE_KEYS.GRIEVANCES, {});
        return Object.values(grievances).sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    },
    getGrievancesByCitizen: (citizenId: string): Grievance[] => {
        return LocalStorage.getAllGrievances().filter(g => g.citizenId === citizenId);
    },
    getGrievancesByDept: (deptId: string): Grievance[] => {
        return LocalStorage.getAllGrievances().filter(g => g.departmentId === deptId);
    },
    saveGrievance: (grievance: Grievance): void => {
        const grievances = get<Record<string, Grievance>>(STORAGE_KEYS.GRIEVANCES, {});
        grievances[grievance.id] = grievance;
        set(STORAGE_KEYS.GRIEVANCES, grievances);

        // Update stats
        if (grievance.departmentId) {
            LocalStorage.incrementDeptStats(grievance.departmentId);
        }
    },

    // ─── Events ──────────────────────────────────────────────────
    getEvents: (grievanceId: string): GrievanceEvent[] => {
        const allEvents = get<GrievanceEvent[]>(STORAGE_KEYS.EVENTS, []);
        return allEvents
            .filter(e => e.grievanceId === grievanceId)
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    },
    saveEvent: (event: GrievanceEvent): void => {
        const allEvents = get<GrievanceEvent[]>(STORAGE_KEYS.EVENTS, []);
        allEvents.push(event);
        set(STORAGE_KEYS.EVENTS, allEvents);
    },

    // ─── Dept Stats ──────────────────────────────────────────────
    getDeptStats: (deptId: string): DepartmentStats | null => {
        const stats = get<Record<string, DepartmentStats>>(STORAGE_KEYS.DEPT_STATS, {});
        return stats[deptId] || null;
    },
    incrementDeptStats: (deptId: string): void => {
        const stats = get<Record<string, DepartmentStats>>(STORAGE_KEYS.DEPT_STATS, {});
        if (!stats[deptId]) {
            stats[deptId] = {
                departmentId: deptId,
                totalComplaints: 0,
                resolvedOnTime: 0,
                slaHonestyScore: 100,
                avgDelayDays: 0,
                escalationRate: 0,
                reopenRate: 0,
                citizenTrustIndex: 100,
                updatedAt: new Date().toISOString(),
            };
        }
        stats[deptId].totalComplaints += 1;
        stats[deptId].updatedAt = new Date().toISOString();
        set(STORAGE_KEYS.DEPT_STATS, stats);
    },

    // ─── Session ─────────────────────────────────────────────────
    getSessionUser: (): User | null => {
        return get<User | null>(STORAGE_KEYS.SESSION_USER, null);
    },
    setSessionUser: (user: User | null): void => {
        set(STORAGE_KEYS.SESSION_USER, user);
    },

    // ─── Seeding ──────────────────────────────────────────────────
    seedDraftData: (): void => {
        const grievances = get<Record<string, Grievance>>(STORAGE_KEYS.GRIEVANCES, {});
        if (Object.keys(grievances).length > 0) return;

        const now = new Date();
        const past = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
        const future = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

        const seedComplaints: Grievance[] = [
            {
                id: "JM-2024-812734",
                citizenId: "demo-user",
                category: "Water Supply",
                title: "Persistent low water pressure in Sector 4",
                description: "Water pressure has been extremely low for the past 3 days. Difficult to reach upper floors.",
                location: { addressText: "Sector 4, Near Community Center" },
                privacyLevel: "public",
                status: "in_progress",
                slaStatus: "on_track",
                slaDeadlineAt: future(4),
                supportCount: 12,
                reopenCount: 0,
                createdAt: past(3),
                updatedAt: past(1),
                departmentId: "dept_water",
            },
            {
                id: "JM-2024-992102",
                citizenId: "demo-user",
                category: "Sanitation & Garbage",
                title: "Garbage collection missed for 2 weeks",
                description: "The garbage truck hasn't visited lane 7 for two weeks now. Stench is becoming unbearable.",
                location: { addressText: "Lane 7, Raj Nagar" },
                privacyLevel: "public",
                status: "escalated",
                slaStatus: "breached",
                slaDeadlineAt: past(2),
                supportCount: 45,
                reopenCount: 1,
                createdAt: past(9),
                updatedAt: past(1),
                departmentId: "dept_sanitation",
            },
            {
                id: "JM-2024-441290",
                citizenId: "other-user",
                category: "Roads & Footpaths",
                title: "Large pothole on Main Street",
                description: "DANGEROUS: There is a massive pothole near the signal that causes frequent near-accidents.",
                location: { addressText: "Main Street, Opp Metro Station" },
                privacyLevel: "public",
                status: "closed",
                slaStatus: "on_track",
                slaDeadlineAt: past(10),
                supportCount: 89,
                reopenCount: 0,
                createdAt: past(15),
                updatedAt: past(11),
                departmentId: "dept_roads",
            }
        ];

        seedComplaints.forEach(c => {
            grievances[c.id] = c;
            if (c.departmentId) {
                LocalStorage.incrementDeptStats(c.departmentId);
            }
        });
        set(STORAGE_KEYS.GRIEVANCES, grievances);

        // Seed some events
        const events: GrievanceEvent[] = [
            {
                id: "E1", grievanceId: "JM-2024-812734", eventType: "GRIEVANCE_SUBMITTED",
                actorId: "demo-user", actorRole: "citizen", createdAt: past(3),
                payload: {}
            },
            {
                id: "E2", grievanceId: "JM-2024-812734", eventType: "OFFICER_ACKNOWLEDGED",
                actorId: "off-1", actorRole: "officer", createdAt: past(2),
                payload: {}
            },
            {
                id: "E3", grievanceId: "JM-2024-992102", eventType: "ESCALATED",
                actorId: "sys", actorRole: "system_admin", createdAt: past(2),
                payload: { reason: "SLA Breach Auto-Escalation" }
            }
        ];
        set(STORAGE_KEYS.EVENTS, events);
    }
};

// Auto-seed on first load in browser
if (typeof window !== "undefined") {
    LocalStorage.seedDraftData();
}

