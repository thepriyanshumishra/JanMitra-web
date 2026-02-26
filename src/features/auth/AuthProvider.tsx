"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    type ReactNode,
} from "react";
import {
    onAuthStateChanged,
    signOut as firebaseSignOut,
    type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { User, UserRole } from "@/types";
import { toast } from "sonner";
import { LocalStorage } from "@/lib/storage";

interface AuthContextValue {
    user: User | null;
    firebaseUser: FirebaseUser | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
    updateRole: (newRole: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
    user: null,
    firebaseUser: null,
    loading: true,
    signOut: async () => { },
    refreshUser: async () => { },
    updateRole: async () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUserProfile = useCallback(async (fbUser: FirebaseUser): Promise<User | null> => {
        // First check LocalStorage
        const localProfile = LocalStorage.getUser(fbUser.uid);
        if (localProfile) {
            LocalStorage.setSessionUser(localProfile);
            return localProfile;
        }

        try {
            // Fallback to Firestore if available, but for now prioritize LocalStorage
            if (db) {
                const ref = doc(db, "users", fbUser.uid);
                const snap = await getDoc(ref);
                if (snap.exists()) {
                    const profile = snap.data() as User;
                    LocalStorage.saveUser(profile);
                    LocalStorage.setSessionUser(profile);
                    return profile;
                }
            }

            // New user — create default profile in LocalStorage
            const newUser: User = {
                id: fbUser.uid,
                firebaseUid: fbUser.uid,
                role: "citizen" as UserRole,
                name: fbUser.displayName ?? fbUser.email?.split("@")[0] ?? "Citizen",
                ...(fbUser.email ? { email: fbUser.email } : {}),
                ...(fbUser.phoneNumber ? { phone: fbUser.phoneNumber } : {}),
                createdAt: new Date().toISOString(),
            };

            LocalStorage.saveUser(newUser);
            LocalStorage.setSessionUser(newUser);

            // Also try to mirror in Firestore if db is ready
            if (db) {
                const ref = doc(db, "users", fbUser.uid);
                const firestoreData = Object.fromEntries(
                    Object.entries({ ...newUser, createdAt: serverTimestamp() })
                        .filter(([, v]) => v !== undefined)
                );
                await setDoc(ref, firestoreData).catch(() => { });
            }

            return newUser;
        } catch (err) {
            console.error("Error fetching user profile:", err);
            // Even on error, return a local profile if we can't hit Firestore
            const fallbackUser: User = {
                id: fbUser.uid,
                firebaseUid: fbUser.uid,
                role: "citizen" as UserRole,
                name: fbUser.displayName ?? fbUser.email?.split("@")[0] ?? "Citizen",
                createdAt: new Date().toISOString(),
            };
            return fallbackUser;
        }
    }, []);

    const refreshUser = useCallback(async () => {
        if (!firebaseUser) return;
        const profile = await fetchUserProfile(firebaseUser);
        setUser(profile);
    }, [firebaseUser, fetchUserProfile]);

    useEffect(() => {
        if (!auth) return;
        const unsub = onAuthStateChanged(auth, async (fbUser) => {
            setFirebaseUser(fbUser);
            if (fbUser) {
                // Post session cookie (fire-and-forget)
                fbUser.getIdToken().then((idToken) => {
                    fetch("/api/auth/session", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ idToken }),
                    }).catch(() => { });
                });

                // ⚠️ Do NOT set loading=false until AFTER profile loads
                // This prevents the login page from flashing before redirect
                const profile = await fetchUserProfile(fbUser);
                setUser(profile);
            } else {
                setUser(null);
                // Clear session
                await fetch("/api/auth/session", { method: "DELETE" }).catch(() => { });
            }
            // Only mark loading done once everything is resolved
            setLoading(false);
        });
        return unsub;
    }, [fetchUserProfile]);

    const signOut = useCallback(async () => {
        if (!auth) return;
        await firebaseSignOut(auth);
        setUser(null);
        setFirebaseUser(null);
        LocalStorage.setSessionUser(null);
    }, []);

    const updateRole = useCallback(async (newRole: UserRole) => {
        if (!user) return;
        try {
            LocalStorage.updateUserRole(user.id, newRole);
            const updatedUser = { ...user, role: newRole };
            setUser(updatedUser);
            LocalStorage.setSessionUser(updatedUser);

            // Mirror in Firestore if possible
            if (db) {
                const ref = doc(db, "users", user.id);
                await setDoc(ref, { role: newRole }, { merge: true }).catch(() => { });
            }

            toast.success(`Role switched to ${newRole}`);
        } catch (err) {
            console.error("Error updating role:", err);
            toast.error("Failed to update role");
        }
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, firebaseUser, loading, signOut, refreshUser, updateRole }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
