import { NextResponse, type NextRequest } from "next/server";

// ─── Model config ─────────────────────────────────────────────────
// Primary: llama-3.3-70b-versatile  (best quality, still free on Groq dev tier)
// Fallback: llama-3.1-8b-instant    (3x faster, ~10x cheaper in tokens, great for extraction)
const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const CATEGORIES = [
    "Water Supply",
    "Sanitation & Garbage",
    "Roads & Footpaths",
    "Electricity",
    "Public Transport",
    "Health & Hospital",
    "Education",
    "Parks & Recreation",
    "Pollution",
    "Land & Property",
    "Police & Safety",
    "Other",
];

const SYSTEM_PROMPT = `You are Manus, an AI assistant embedded in JanMitra — India's governance accountability platform.
Your job is to extract structured information from a citizen's informal complaint description.

Available categories: ${CATEGORIES.join(", ")}

Respond ONLY with a valid JSON object in this exact shape, no other text:
{
  "category": "<one of the categories above>",
  "title": "<concise 5-10 word title of the issue, max 80 characters>",
  "description": "<clear, formal 2-4 sentence description suitable for a government complaint>",
  "location": "<extracted location or area if mentioned, else empty string>"
}

Rules:
- Choose the single closest matching category
- title must be under 80 characters
- description must be factual and professional in tone
- Output ONLY raw JSON, no markdown, no backticks`;

export async function POST(req: NextRequest) {
    try {
        const { message } = await req.json();
        if (!message || typeof message !== "string") {
            return NextResponse.json({ error: "message is required" }, { status: 400 });
        }

        // Graceful fallback if API key not set
        if (!GROQ_API_KEY) {
            return NextResponse.json({
                category: "Other",
                title: "Civic issue reported",
                description: message.slice(0, 300),
                location: "",
                _fallback: true,
            });
        }

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
                    { role: "user", content: `Citizen's complaint: "${message}"` },
                ],
                temperature: 0.2,
                max_tokens: 300,
                response_format: { type: "json_object" },
            }),
        });

        if (!res.ok) {
            const errText = await res.text();
            console.error("[manus/extract] Groq error:", errText);
            throw new Error(`Groq API error: ${res.status}`);
        }

        const data = await res.json();
        const raw = data.choices?.[0]?.message?.content ?? "{}";

        let parsed: Record<string, string>;
        try {
            parsed = JSON.parse(raw);
        } catch {
            // If model returned something that's not pure JSON, extract the JSON block
            const match = raw.match(/\{[\s\S]*\}/);
            parsed = match ? JSON.parse(match[0]) : { category: "Other", title: message.slice(0, 60), description: message, location: "" };
        }

        return NextResponse.json({
            category: parsed.category ?? "Other",
            title: (parsed.title ?? "").slice(0, 80),
            description: parsed.description ?? message,
            location: parsed.location ?? "",
        });
    } catch (err) {
        console.error("[manus/extract]", err);
        return NextResponse.json({ error: "Extraction failed" }, { status: 500 });
    }
}
