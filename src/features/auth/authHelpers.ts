import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPhoneNumber,
    type ConfirmationResult,
    updateProfile,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    signInWithRedirect,
    getRedirectResult,
    sendSignInLinkToEmail,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

// ─── Email Auth ──────────────────────────────────────────────────

export async function loginWithEmail(email: string, password: string) {
    if (!auth) throw new Error("Auth not initialized");
    return signInWithEmailAndPassword(auth, email, password);
}

export async function signUpWithEmail(
    email: string,
    password: string,
    name: string
) {
    if (!auth) throw new Error("Auth not initialized");
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    return result;
}

export async function resetPassword(email: string) {
    if (!auth) throw new Error("Auth not initialized");
    return sendPasswordResetEmail(auth, email);
}

// ─── Google Auth ────────────────────────────────────────────────

export async function loginWithGoogle() {
    if (!auth) throw new Error("Auth not initialized");
    const provider = new GoogleAuthProvider();
    // Use redirect (not popup) to avoid COOP browser restrictions
    return signInWithRedirect(auth, provider);
}

export { getRedirectResult };

// ─── Passwordless Email Auth ────────────────────────────────────

export async function sendPasswordlessLink(email: string) {
    if (!auth) throw new Error("Auth not initialized");
    const actionCodeSettings = {
        url: window.location.origin + "/login/callback",
        handleCodeInApp: true,
    };
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem("emailForSignIn", email);
}

// ─── Phone / OTP Auth ────────────────────────────────────────────

export async function sendOTP(
    phoneNumber: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    appVerifier: any
): Promise<ConfirmationResult> {
    if (!auth) throw new Error("Auth not initialized");
    return signInWithPhoneNumber(auth, phoneNumber, appVerifier);
}

export async function verifyOTP(
    confirmationResult: ConfirmationResult,
    otp: string
) {
    return confirmationResult.confirm(otp);
}
