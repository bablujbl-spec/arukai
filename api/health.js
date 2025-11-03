export default function handler(req, res) {
  res.status(200).json({ ok: true, openai_key_present: !!process.env.OPENAI_API_KEY });
}
