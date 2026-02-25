// ── Firebase Cloud Messaging Service Worker ────────────────────────────────
// Receives background push notifications when the app tab is not in focus.
// This file must be served from the root (public/firebase-messaging-sw.js).

importScripts("https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js");

// ── Firebase config (public values only — safe to expose) ────────────────
// These match NEXT_PUBLIC_FIREBASE_* env vars. Values are intentionally
// hardcoded here because service workers cannot read process.env.
// Update these with your actual project values.
const firebaseConfig = {
    apiKey: "AIzaSyDBTRcBsY-fH1uPT6z0WbWwaJTTrtT5Jzs",
    authDomain: "janmitra-web.firebaseapp.com",
    projectId: "janmitra-web",
    storageBucket: "janmitra-web.firebasestorage.app",
    messagingSenderId: "326420705263",
    appId: "1:326420705263:web:357c52b1c25a69136ed01a",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// ── Background push handler ───────────────────────────────────────────────
// Called when a push arrives and the page is in the background or closed.
messaging.onBackgroundMessage((payload) => {
    console.log("[SW] Received background message:", payload);

    const { title = "JanMitra Alert", body = "You have a new update." } = payload.notification ?? {};

    self.registration.showNotification(title, {
        body,
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-72x72.png",
        data: { url: payload.data?.url ?? "/" },
    });
});

// ── Notification click handler ────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const targetUrl = event.notification.data?.url ?? "/";
    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url === targetUrl && "focus" in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
