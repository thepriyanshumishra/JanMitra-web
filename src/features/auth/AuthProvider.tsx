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

interface AuthContextValue {
    user: User | null;
    firebaseUser: FirebaseUser | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
    user: null,
    firebaseUser: null,
    loading: true,
    signOut: async () => { },
    refreshUser: async () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUserProfile = useCallback(async (fbUser: FirebaseUser): Promise<User | null> => {
        if (!db) return null;
        try {
            const ref = doc(db, "users", fbUser.uid);
            const snap = await getDoc(ref);
            if (snap.exists()) {
                return snap.data() as User;
            }
            // New user — create default profile
            const newUser: User = {
                id: fbUser.uid,
                firebaseUid: fbUser.uid,
                role: "citizen" as UserRole,
                name: fbUser.displayName ?? fbUser.email?.split("@")[0] ?? "Citizen",
                ...(fbUser.email ? { email: fbUser.email } : {}),
                ...(fbUser.phoneNumber ? { phone: fbUser.phoneNumber } : {}),
                createdAt: new Date().toISOString(),
            };
            // Strip any undefined fields before writing (Firestore rejects them)
            const firestoreData = Object.fromEntries(
                Object.entries({ ...newUser, createdAt: serverTimestamp() })
                    .filter(([, v]) => v !== undefined)
            );
            await setDoc(ref, firestoreData);
            return newUser;
        } catch (err) {
            console.error("Error fetching user profile:", err);
            return null;
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
                // Post session cookie
                const idToken = await fbUser.getIdToken();
                await fetch("/api/auth/session", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ idToken }),
                }).catch(() => { });

                const profile = await fetchUserProfile(fbUser);
                setUser(profile);
            } else {
                setUser(null);
                // Clear session
                await fetch("/api/auth/session", { method: "DELETE" }).catch(() => { });
            }
            setLoading(false);
        });
        return unsub;
    }, [fetchUserProfile]);

    const signOut = useCallback(async () => {
        if (!auth) return;
        await firebaseSignOut(auth);
        setUser(null);
        setFirebaseUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, firebaseUser, loading, signOut, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
