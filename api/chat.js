// api/chat.js (Vercel serverless)
import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "OPENAI_API_KEY not configured on server." });
  }

  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: "No prompt provided" });

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 300
    });
    const text = response.choices?.[0]?.message?.content ?? "";
    return res.status(200).json({ result: text });
  } catch (e) {
    console.error("OpenAI error:", e);
    return res.status(500).json({ error: e.message || "OpenAI call failed" });
  }
}
