import { NextResponse, type NextRequest } from "next/server";
import { validateSession } from "@/lib/auth-middleware";

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

const SYSTEM_PROMPT = `You are Manus, an AI civic assistant embedded in JanMitra — India's governance accountability platform. 
Your goal is to help citizens file a formal complaint by guiding them to provide necessary details through a friendly, conversational interview.

You MUST always output exactly ONE valid JSON object, and absolutely nothing else. No markdown wrapping, no extra text.

You operate in two modes depending on how complete the information is.

REQUIRED INFORMATION TO COLLECT:
1. What the issue is (to determine Category, Title, Description)
2. Where it is happening (Location)
3. If they have any evidence (Photo, Video, Document, etc.)

MODE 1: ASKING QUESTIONS (type: "question")
If you are missing key information (like the exact location, or if they have evidence), ask exactly ONE clear, short follow-up question. 
Be empathetic but concise. Reply in the same language the user is speaking.
Set "fieldFocus" to indicate what you are currently asking for: "issue", "location", "evidence", or "general".

MODE 2: FINISHED (type: "extracted")
When you have gathered enough information (Issue details, Location, and whether they have evidence), extract the final complaint data. Even if they say they don't have a specific location or evidence, if they have explicitly answered the question, consider it gathered.
The extraction must ALWAYS be translated into English, regardless of the language the user spoke.

JSON SCHEMA:
{
  "type": "question" | "extracted",

  // IF type == "question", include these:
  "text": "<Your follow-up question here>",
  "fieldFocus": "issue" | "location" | "evidence" | "general",

  // IF type == "extracted", include these (IN ENGLISH):
  "category": "<one of the exact categories provided>",
  "title": "<concise 5-10 word title of the issue>",
  "description": "<clear, formal 2-4 sentence description suitable for a government complaint>",
  "location": "<extracted location if mentioned, else empty string>"
}

CATEGORIES LIST: ${CATEGORIES.join(", ")}

RULES:
- Ask exactly ONE question at a time. Do not ask for location and evidence in the same message.
- "fieldFocus" is crucial: if you ask "Where is this occurring?", set fieldFocus: "location". If you ask "Do you have any photos?", set fieldFocus: "evidence".
- Be conversational. e.g. "I understand. Potholes can be dangerous. Could you tell me the exact road or landmark where this is?"
- Only switch to type: "extracted" when you are confident you have everything or the user explicitly skips/declines to provide more.
`;

export async function POST(req: NextRequest) {
    try {
        await validateSession(req);
    } catch (e) {
        if (e instanceof Response) return e;
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "messages array is required" }, { status: 400 });
        }

        if (!GROQ_API_KEY) {
            // Fallback for missing API key
            return NextResponse.json({
                type: "question",
                text: "I am currently in disconnected mode, but I will record what you say. Could you provide your location?",
                fieldFocus: "location",
                _fallback: true
            });
        }

        const apiMessages = [
            { role: "system", content: SYSTEM_PROMPT },
            // Filter and map the conversation history
            ...messages.map((m: any) => ({
                role: m.role === "manus" ? "assistant" : "user",
                content: m.text
            }))
        ];

        const res = await fetch(GROQ_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: apiMessages,
                temperature: 0.3,
                max_tokens: 500,
                response_format: { type: "json_object" },
            }),
        });

        if (!res.ok) {
            const errText = await res.text();
            console.error("[manus/chat] Groq error:", errText);
            throw new Error(`Groq API error: ${res.status}`);
        }

        const data = await res.json();
        const raw = data.choices?.[0]?.message?.content ?? "{}";

        let parsed: any;
        try {
            parsed = JSON.parse(raw);
        } catch {
            const match = raw.match(/\{[\s\S]*\}/);
            parsed = match ? JSON.parse(match[0]) : { type: "question", text: "I'm having trouble understanding. Could you please rephrase?", fieldFocus: "general" };
        }

        return NextResponse.json(parsed);
    } catch (err) {
        console.error("[manus/chat]", err);
        return NextResponse.json({ error: "Chat processing failed" }, { status: 500 });
    }
}
