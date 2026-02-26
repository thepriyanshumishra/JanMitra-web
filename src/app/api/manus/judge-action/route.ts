import { NextResponse, type NextRequest } from "next/server";
import { validateSession } from "@/lib/auth-middleware";

const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const SYSTEM_PROMPT = `You are Manus, an AI auditor for JanMitra (a civic grievance platform).
An officer is attempting to take an action on a citizen's complaint.
You need to evaluate the officer's provided reason for this action.

Actions that require evaluation:
1. ESCALATE: Escaling a complaint.
2. CLOSE/RESOLVE: Closing a complaint.
3. DELAY: Explaining a delay.

Respond ONLY with a valid JSON object in this exact shape:
{
  "isValid": boolean,
  "feedback": "If invalid, explain why the reason is insufficient or evasive. If valid, leave empty.",
  "requiresEvidence": boolean
}

Rules:
- A valid reason must be detailed, professional, and logically justify the action. 
- Vague reasons like "done", "fixed", "will do later", "not my job", "resolving soon" should be marked invalid.
- Instead of just rejecting, be helpful! If a reason is invalid, your \`feedback\` should politely explain what's missing and suggest what kind of information they should include instead. Don't be too forceful or robotic. Use a collaborative tone (e.g. "Could you add a bit more detail about...", "It would be helpful to include...").
- Examples of valid: "Pothole filled with asphalt on 24 Feb", "Escalated due to lack of heavy machinery required for excavation".
- "requiresEvidence" applies if this action ideally requires photographic or documentary proof (e.g. resolving a physical issue, or claiming third-party delays). ALWAYS true if resolving a physical complaint like garbage, roads, water leaks, etc.
- Output ONLY raw JSON.`;

export async function POST(req: NextRequest) {
    try {
        await validateSession(req);
    } catch {
        // Fallback or ignore for local hackathon, we can still proceed
    }

    try {
        const { action, reason, category, description } = await req.json();

        if (!reason || typeof reason !== "string") {
            return NextResponse.json({ error: "reason is required" }, { status: 400 });
        }

        if (!GROQ_API_KEY) {
            return NextResponse.json({
                isValid: true,
                feedback: "",
                requiresEvidence: false,
                _fallback: true,
            });
        }

        const prompt = `Complaint Category: ${category}
Complaint Details: ${description}

Officer Action: ${action}
Officer Reason: ${reason}

Evaluate the reason based on the system rules.`;

        const res = await fetch(GROQ_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: prompt },
                ],
                temperature: 0.1,
                response_format: { type: "json_object" },
            }),
        });

        if (!res.ok) {
            throw new Error(`Groq API error: ${res.status}`);
        }

        const data = await res.json();
        const raw = data.choices?.[0]?.message?.content ?? "{}";

        let parsed = { isValid: true, feedback: "", requiresEvidence: false };
        try {
            parsed = JSON.parse(raw);
        } catch {
            const match = raw.match(/\{[\s\S]*\}/);
            if (match) parsed = JSON.parse(match[0]);
        }

        return NextResponse.json({
            isValid: Boolean(parsed.isValid),
            feedback: parsed.feedback ?? "",
            requiresEvidence: Boolean(parsed.requiresEvidence),
        });
    } catch (err) {
        console.error("[manus/judge-action]", err);
        return NextResponse.json({ error: "Judgment failed" }, { status: 500 });
    }
}
