import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const OPENAI_KEY = process.env.OPENAI_API_KEY!;
const MODEL = process.env.EMBEDDING_MODEL || "text-embedding-3-small";

async function embed(text: string) {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({ input: text, model: MODEL }),
  });
  const j = await res.json();
  return j.data[0].embedding;
}

function splitToChunks(text: string, n=1000) {
  const out = [];
  for (let i=0;i<text.length;i+=n) out.push(text.slice(i,i+n));
  return out;
}

async function main() {
  const dir = path.join(process.cwd(), "data/books");
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".txt") || f.endsWith(".md") || f.endsWith(".json"));
  for (const f of files) {
    const txt = fs.readFileSync(path.join(dir,f),'utf8');
    const chunks = splitToChunks(txt, 1000);
    for (const chunk of chunks) {
      const embedding = await embed(chunk);
      await supabase.from("embeddings").insert({
        doc_id: f,
        content: chunk,
        embedding,
        metadata: { source: f }
      });
    }
  }
  console.log("done");
}

main().catch(console.error);
