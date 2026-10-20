import { NextResponse } from "next/server";
import { answerWithEngine, twinSummary } from "@/services/copilot";
import { buildTwin } from "@/services/engine";
import { resolvePersona } from "@/services/custom";
import { cookies } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`copilot:${ip}`)) return NextResponse.json({ error: "Too many requests. Please wait a minute." }, { status: 429 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const { message, persona } = (body ?? {}) as { message?: unknown; persona?: unknown };
  if (typeof message !== "string" || !message.trim() || message.length > 400) return NextResponse.json({ error: "Message must be 1 to 400 characters." }, { status: 400 });
  const resolved = resolvePersona(persona, (await cookies()).get("wt_custom")?.value);
  if (!resolved) return NextResponse.json({ error: "Unknown persona. Enter your numbers first." }, { status: 400 });

  const base = answerWithEngine(resolved, message);
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json({ ...base, mode: "engine" });

  try {
    const twin = buildTwin(resolved);
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
        max_tokens: 400,
        system:
          "You are WealthTwin Copilot, a calm financial education assistant for a synthetic demo user in India. Answer in at most 90 words using ONLY the facts in the JSON twin and the engine note. Use Indian rupee formatting. Never give regulated investment advice; frame as education. If a figure is not in the data, say you do not have it.",
        messages: [{ role: "user", content: `Twin: ${JSON.stringify(twinSummary(twin))}\nEngine note: ${base.answer}\nQuestion: ${message}` }],
      }),
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = data.content?.filter((c) => c.type === "text").map((c) => c.text).join("\n").trim();
    if (!text) throw new Error("empty");
    return NextResponse.json({ ...base, answer: text, mode: "ai" });
  } catch {
    return NextResponse.json({ ...base, mode: "engine" });
  }
}
