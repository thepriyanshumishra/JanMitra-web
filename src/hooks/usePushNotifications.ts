/**
 * usePushNotifications
 *
 * Manages Firebase Cloud Messaging (FCM) push notification subscription.
 *
 * Usage:
 *   const { enabled, loading, toggle } = usePushNotifications();
 *
 * Requirements:
 *   - NEXT_PUBLIC_FIREBASE_VAPID_KEY in .env.local
 *     (Firebase Console → Project Settings → Cloud Messaging → Web Push certs)
 *   - public/firebase-messaging-sw.js must be deployed
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/features/auth/AuthProvider";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

/**
 * Returns false if FCM is not possible in this environment
 * (no service worker support, no VAPID key, or SSR context).
 */
function isPushSupported(): boolean {
    if (typeof window === "undefined") return false;
    if (!("serviceWorker" in navigator)) return false;
    if (!("PushManager" in window)) return false;
    if (!VAPID_KEY) return false;
    return true;
}

export function usePushNotifications() {
    const { user } = useAuth();
    const [enabled, setEnabled] = useState(false);
    const [loading, setLoading] = useState(false);

    // Check if user already granted permission on mount
    useEffect(() => {
        if (!isPushSupported()) return;
        setEnabled(Notification.permission === "granted");
    }, []);

    const saveFcmToken = useCallback(async (token: string) => {
        if (!db || !user) return;
        await updateDoc(doc(db, "users", user.id), { fcmToken: token });
    }, [user]);

    const removeFcmToken = useCallback(async () => {
        if (!db || !user) return;
        await updateDoc(doc(db, "users", user.id), { fcmToken: null });
    }, [user]);

    const enable = useCallback(async () => {
        if (!isPushSupported()) return;
        setLoading(true);
        try {
            const permission = await Notification.requestPermission();
            if (permission !== "granted") {
                setEnabled(false);
                return;
            }

            // Dynamically import to keep bundle slim
            const { getMessaging, getToken } = await import("firebase/messaging");
            const { app } = await import("@/lib/firebase");
            if (!app) return;

            const messaging = getMessaging(app);

            // Register the service worker manually to ensure scope is correct
            const registration = await navigator.serviceWorker.register(
                "/firebase-messaging-sw.js",
                { scope: "/" }
            );

            const token = await getToken(messaging, {
                vapidKey: VAPID_KEY,
                serviceWorkerRegistration: registration,
            });

            await saveFcmToken(token);
            setEnabled(true);
        } catch (err) {
            console.error("[FCM] Failed to get token:", err);
            setEnabled(false);
        } finally {
            setLoading(false);
        }
    }, [saveFcmToken]);

    const disable = useCallback(async () => {
        setLoading(true);
        try {
            const { getMessaging, deleteToken } = await import("firebase/messaging");
            const { app } = await import("@/lib/firebase");
            if (!app) return;
            const messaging = getMessaging(app);
            await deleteToken(messaging);
            await removeFcmToken();
            setEnabled(false);
        } catch (err) {
            console.error("[FCM] Failed to delete token:", err);
        } finally {
            setLoading(false);
        }
    }, [removeFcmToken]);

    const toggle = useCallback(() => {
        if (enabled) {
            disable();
        } else {
            enable();
        }
    }, [enabled, enable, disable]);

    return {
        enabled,
        loading,
        toggle,
        supported: isPushSupported(),
    };
}
