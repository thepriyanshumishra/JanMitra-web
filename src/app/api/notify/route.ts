/**
 * POST /api/notify — Internal endpoint: send a transactional email via Resend.
 * Only called server-side (from other API routes or officer actions via client fetch).
 *
 * If RESEND_API_KEY is not set, the notification is logged and skipped gracefully.
 */
import { NextRequest, NextResponse } from "next/server";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.NOTIFY_FROM_EMAIL ?? "JanMitra <notifications@resend.dev>";

type EventType = "SUBMITTED" | "ROUTED" | "STATUS_UPDATED" | "ESCALATED" | "PROOF_UPLOADED" | "CLOSED" | "DELAY_EXPLAINED";

interface NotifyPayload {
  to: string;
  citizenName: string;
  grievanceId: string;
  eventType: EventType;
  extra?: Record<string, string>;
}

const EVENT_SUBJECT: Record<EventType, string> = {
  SUBMITTED: "✅ Your complaint has been received",
  ROUTED: "📋 Your complaint has been routed",
  STATUS_UPDATED: "🔄 Your complaint status was updated",
  ESCALATED: "🚨 Your complaint has been escalated",
  PROOF_UPLOADED: "📎 Officer uploaded resolution proof",
  CLOSED: "🎉 Your complaint has been resolved",
  DELAY_EXPLAINED: "⏳ Your complaint has a delay explanation",
};

const EVENT_MESSAGE: Record<EventType, (extra?: Record<string, string>) => string> = {
  SUBMITTED: () => "Your complaint has been successfully submitted and is being processed.",
  ROUTED: () => "Your complaint has been routed to the responsible department and will be assigned soon.",
  STATUS_UPDATED: (e) => `The status of your complaint has been updated to <strong>${e?.newStatus ?? "updated"}</strong>${e?.message ? `: "${e.message}"` : "."}`,
  ESCALATED: () => "Your complaint has been <strong>escalated</strong> to senior authorities. You can expect a faster response.",
  PROOF_UPLOADED: (e) => `The officer has uploaded resolution proof${e?.fileName ? ` (${e.fileName})` : ""}. Please verify and close if resolved.`,
  CLOSED: () => "Your complaint has been marked as <strong>resolved</strong>. If the issue persists, you can reopen it within 7 days.",
  DELAY_EXPLAINED: (e) => `The officer has explained the delay. Reason: <strong>${e?.delayReason ?? "unspecified"}</strong>${e?.details ? `<br/>${e.details}` : ""}`,
};

function buildEmailHtml(name: string, grievanceId: string, eventType: EventType, extra?: Record<string, string>): string {
  const message = EVENT_MESSAGE[eventType]?.(extra) ?? "Your complaint has been updated.";
  const dashUrl = `https://janmitra.vercel.app/complaints/${grievanceId}`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${EVENT_SUBJECT[eventType]}</title>
</head>
<body style="background:#020817;margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;color:#e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e293b,#0f172a);padding:28px 32px;border-bottom:1px solid rgba(245,158,11,0.2);">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right:12px;">
                    <div style="width:40px;height:40px;background:#f59e0b;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;">
                      <span style="color:#020817;font-weight:900;font-size:22px;line-height:1;">J</span>
                    </div>
                  </td>
                  <td>
                    <span style="font-size:18px;font-weight:700;color:#f8fafc;letter-spacing:-0.5px;">JanMitra</span>
                    <br/>
                    <span style="font-size:11px;color:#94a3b8;letter-spacing:1px;text-transform:uppercase;">Civic Accountability Platform</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;color:#94a3b8;font-size:13px;">Hello ${name},</p>
              <h1 style="margin:0 0 20px;font-size:20px;font-weight:700;color:#f8fafc;line-height:1.3;">${EVENT_SUBJECT[eventType]}</h1>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:#cbd5e1;">${message}</p>

              <!-- Complaint ID chip -->
              <div style="display:inline-block;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:8px;padding:8px 16px;margin-bottom:28px;">
                <span style="font-size:11px;color:#94a3b8;margin-right:8px;">Complaint ID</span>
                <strong style="font-family:monospace;font-size:13px;color:#f59e0b;">${grievanceId}</strong>
              </div>

              <!-- CTA -->
              <div>
                <a href="${dashUrl}"
                   style="display:inline-block;background:#f59e0b;color:#020817;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:10px;font-size:14px;">
                  View Complaint Status →
                </a>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);">
              <p style="margin:0;font-size:11px;color:#475569;line-height:1.6;">
                This is an automated notification from JanMitra. You are receiving this because you filed complaint
                <strong style="color:#64748b;">${grievanceId}</strong>.<br/>
                If you did not file this complaint, please contact support.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

import { adminDb, adminMessaging, adminReady } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  let body: NotifyPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { to, citizenName, grievanceId, eventType, extra } = body;
  if (!to || !grievanceId || !eventType) {
    return NextResponse.json({ error: "Missing required fields: to, grievanceId, eventType" }, { status: 400 });
  }

  const results: { email?: string; push?: string } = {};

  // ── 1. Send Email (via Resend) ───────────────────────────────────
  if (RESEND_API_KEY) {
    try {
      const html = buildEmailHtml(citizenName ?? "Citizen", grievanceId, eventType, extra);
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [to],
          subject: `[JanMitra] ${EVENT_SUBJECT[eventType]} — ${grievanceId}`,
          html,
        }),
      });
      results.email = res.ok ? "sent" : "failed";
    } catch (err) {
      console.error("[notify] Email failed:", err);
      results.email = "error";
    }
  } else {
    results.email = "skipped_no_key";
  }

  // ── 2. Send Push Notification (via FCM) ───────────────────────
  if (adminReady && adminMessaging && adminDb) {
    try {
      // Find user by email to get their FCM token
      const userSnap = await adminDb.collection("users").where("email", "==", to).limit(1).get();
      const fcmToken = !userSnap.empty ? userSnap.docs[0].data()?.fcmToken : null;

      if (fcmToken) {
        await adminMessaging.send({
          token: fcmToken,
          notification: {
            title: `JanMitra: ${EVENT_SUBJECT[eventType].replace(/[✅📋🔄🚨🎉⏳]/g, "").trim()}`,
            body: EVENT_MESSAGE[eventType](extra).replace(/<[^>]*>/g, ""), // strip HTML
          },
          data: {
            grievanceId,
            url: `/complaints/${grievanceId}`,
          },
        });
        results.push = "sent";
      } else {
        results.push = "skipped_no_token";
      }
    } catch (err) {
      console.error("[notify] Push failed:", err);
      results.push = "error";
    }
  } else {
    results.push = "skipped_admin_not_ready";
  }

  return NextResponse.json({ ok: true, results });
}
