// ─── User & Auth Types ───────────────────────────────────────────────

export type UserRole = "citizen" | "officer" | "dept_admin" | "system_admin";

export interface User {
    id: string;
    firebaseUid: string;
    role: UserRole;
    name: string;
    email?: string;
    phone?: string;
    departmentId?: string;
    createdAt: string;
}

// ─── Grievance / Complaint Types ─────────────────────────────────────

export type PrivacyLevel = "public" | "restricted" | "private";

export type GrievanceStatus =
    | "submitted"
    | "routed"
    | "assigned"
    | "acknowledged"
    | "in_progress"
    | "escalated"
    | "closed"
    | "reopened"
    | "final_closed";

export type SLAStatus = "on_track" | "at_risk" | "breached";

export interface Grievance {
    id: string;
    citizenId: string;
    category: string;
    subCategory?: string;
    title: string;
    description: string;
    location: GrievanceLocation;
    privacyLevel: PrivacyLevel;
    status: GrievanceStatus;
    slaStatus: SLAStatus;
    slaDeadlineAt: string;
    departmentId?: string;
    officerId?: string;
    openedForId?: string; // for delegated complaints
    supportCount: number;
    reopenCount: number;
    createdAt: string;
    updatedAt: string;
    closedAt?: string;
}

export interface GrievanceLocation {
    ward?: string;
    area?: string;
    pincode?: string;
    lat?: number;
    lng?: number;
    addressText: string;
}

// ─── Responsibility Trace / Event Types ────────────────────────────

export type GrievanceEventType =
    | "GRIEVANCE_SUBMITTED"
    | "ROUTED_TO_DEPARTMENT"
    | "OFFICER_ASSIGNED"
    | "OFFICER_ACKNOWLEDGED"
    | "UPDATE_PROVIDED"
    | "PROOF_UPLOADED"
    | "DELAY_EXPLANATION_SUBMITTED"
    | "SLA_BREACHED"
    | "ESCALATED"
    | "COMPLAINT_CLOSED"
    | "CITIZEN_FEEDBACK_SUBMITTED"
    | "REOPENED"
    | "FINAL_CLOSED"
    | "SUPPORT_SIGNAL_ADDED";

export interface GrievanceEvent {
    id: string;
    grievanceId: string;
    eventType: GrievanceEventType;
    actorId?: string;
    actorRole?: UserRole;
    payload: Record<string, unknown>;
    createdAt: string;
}

// ─── Department Types ─────────────────────────────────────────────

export type GovernanceHealth = "stable" | "under_strain" | "critical";

export interface Department {
    id: string;
    name: string;
    slug: string;
    description?: string;
    slaHoursDefault: number;
    governanceHealth: GovernanceHealth;
    createdAt: string;
}

export interface DepartmentStats {
    departmentId: string;
    totalComplaints: number;
    resolvedOnTime: number;
    slaHonestyScore: number; // 0–100
    avgDelayDays: number;
    escalationRate: number;
    reopenRate: number;
    citizenTrustIndex: number; // 0–100
    updatedAt: string;
}

// ─── Citizen Feedback ─────────────────────────────────────────────

export interface CitizenFeedback {
    id: string;
    grievanceId: string;
    citizenId: string;
    wasResolved: boolean | null;
    solutionMatched: boolean | null;
    proofSufficient: boolean | null;
    submittedAt: string;
}

// ─── Delay Explanation ───────────────────────────────────────────

export type DelayReason =
    | "weather_natural_event"
    | "budget_approval_pending"
    | "contractor_delay"
    | "inter_department_dependency"
    | "equipment_resource_failure"
    | "legal_regulatory_hold"
    | "other";

export interface DelayExplanation {
    grievanceId: string;
    officerId: string;
    reason: DelayReason;
    details?: string;
    estimatedResolutionDate?: string;
    submittedAt: string;
}

// ─── API Response Wrappers ────────────────────────────────────────

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}
