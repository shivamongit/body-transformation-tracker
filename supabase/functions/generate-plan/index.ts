// Supabase Edge Function: generate-plan
// Calls OpenAI server-side so the API key is never exposed to the browser.
//
// Deploy:
//   supabase functions deploy generate-plan
//   supabase secrets set OPENAI_API_KEY=sk-...
//
// The browser calls this via supabase.functions.invoke("generate-plan", { body })

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const MODEL = Deno.env.get("OPENAI_MODEL") || "gpt-4o-mini";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    if (!OPENAI_API_KEY) {
      return json({ error: "OPENAI_API_KEY not set. Run: supabase secrets set OPENAI_API_KEY=sk-..." }, 500);
    }

    const input = await req.json();
    const p = input.profile || {};

    const system =
      "You are an elite, evidence-based strength & physique coach. " +
      "Produce a clear, actionable, day-by-day workout plan tailored to the user. " +
      "Use progressive overload, 10-20 sets/muscle/week, train each muscle ~2x/week, " +
      "and respect their equipment, experience and weekly day count. " +
      "Format as clean readable text with day headers and exercise/sets/reps. " +
      "Add a short weekly summary and 3 key coaching cues. Be concise, no fluff.";

    const user = `Client profile:
- Weight: ${p.weight} kg, Goal: ${p.goalWeight} kg
- Height: ${p.height}, Age: ${p.age}, Body fat: ${p.bodyFat}
- Primary goal: ${input.goal}
- Days per week: ${input.days}
- Preferred split: ${input.split}
- Equipment: ${input.equipment}
- Experience: ${input.experience}
- Focus areas / weak points: ${input.focus}
- Extra notes: ${input.notes || "none"}

Write the full ${input.days}-day plan now.`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.7,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return json({ error: `OpenAI error: ${err}` }, 502);
    }

    const data = await res.json();
    const plan = data.choices?.[0]?.message?.content ?? "No content returned.";
    return json({ plan });
  } catch (e) {
    return json({ error: String(e?.message || e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
