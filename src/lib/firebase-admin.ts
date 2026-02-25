/**
 * Firebase Admin SDK singleton — SERVER ONLY.
 * Never import this in client components.
 *
 * Requires env var: FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY
 *   Value: the full service account JSON (as a single-line string).
 *
 * Falls back to a no-op stub when the var is not set (safe for local
 * dev without a service account) — admin-gated features will return
 * 503 Service Unavailable in that case.
 */
import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let adminApp: App;
let adminAuth: Auth;
let adminDb: Firestore;

/** True when the Admin SDK is fully initialised. */
export let adminReady = false;

try {
    const raw = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY;
    if (!raw) {
        console.warn(
            "[firebase-admin] FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY is not set. " +
            "Admin-gated features will be disabled."
        );
    } else {
        const serviceAccount = JSON.parse(raw);
        adminApp =
            getApps().find((a) => a.name === "admin") ??
            initializeApp({ credential: cert(serviceAccount) }, "admin");
        adminAuth = getAuth(adminApp);
        adminDb = getFirestore(adminApp);
        adminReady = true;
    }
} catch (err) {
    console.error("[firebase-admin] Initialisation failed:", err);
}

export { adminAuth, adminDb };
