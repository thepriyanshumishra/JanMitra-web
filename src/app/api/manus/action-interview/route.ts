import { NextResponse, type NextRequest } from "next/server";
import { validateSession } from "@/lib/auth-middleware";

const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const SYSTEM_PROMPT = `You are Manus, an AI auditor embedded in JanMitra.
Your job is to help a government officer provide a valid, detailed reason for an action (RESOLVE, ESCALATE, or DELAY) on a citizen complaint.
Do this by asking ONE brief, polite question at a time. Provide 2-4 short suggestion chips (1-5 words each) representing common answers.
Do not be overly strict. If their answer makes sense, accept it and finalize. Max 2-3 questions total.
When you have gathered enough context to form a professional, logical justification for the action, set isComplete to true and synthesize the finalReason.

Output ONLY a JSON object in this exact format:
{
  "isComplete": boolean,
  "question": "Next question to ask (if isComplete is false)",
  "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"],
  "finalReason": "A professional summary of their reason (if isComplete is true)",
  "requiresEvidence": boolean // true if resolving a physical issue
}`;

export async function POST(req: NextRequest) {
    try {
        await validateSession(req);
    } catch {
        // Fallback for local
    }

    try {
        const { action, category, description, history } = await req.json();

        if (!GROQ_API_KEY) {
            // Mock response if no key
            if (history.length > 2) {
                return NextResponse.json({
                    isComplete: true,
                    finalReason: "Action completed based on officer feedback.",
                    requiresEvidence: false
                });
            }
            return NextResponse.json({
                isComplete: false,
                question: "What is the primary reason for this action?",
                suggestions: ["Work completed", "Budget pending", "Requires clearance"],
            });
        }

        const formattedHistory = (history || []).map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
        }));

        const prompt = `Complaint Category: ${category}
Complaint Details: ${description}

Action Required: ${action}

Evaluate the history and generate the next prompt or complete the process based on SYSTEM rules.`;

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
                    ...formattedHistory
                ],
                temperature: 0.2, // low temperature for logic
                response_format: { type: "json_object" },
            }),
        });

        if (!res.ok) throw new Error(`Groq error: ${res.status}`);

        const data = await res.json();
        const raw = data.choices?.[0]?.message?.content ?? "{}";

        let parsed = { isComplete: false, question: "Why are you taking this action?", suggestions: [], finalReason: "", requiresEvidence: false };
        try {
            parsed = JSON.parse(raw);
        } catch {
            const match = raw.match(/\{[\s\S]*\}/);
            if (match) parsed = JSON.parse(match[0]);
        }

        return NextResponse.json({
            isComplete: Boolean(parsed.isComplete),
            question: parsed.question ?? "",
            suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
            finalReason: parsed.finalReason ?? "",
            requiresEvidence: Boolean(parsed.requiresEvidence),
        });

    } catch (err: any) {
        console.error("[manus/action-interview]", err);
        return NextResponse.json({ error: "Interview failed" }, { status: 500 });
    }
}
