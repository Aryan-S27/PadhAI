import { createClient } from "@supabase/supabase-js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const SUPABASE_URL = "https://zbfqidnjspzruabgazvx.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiZnFpZG5qc3B6cnVhYmdhenZ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyMzkxMywiZXhwIjoyMDk4NDk5OTEzfQ.hgXLsFv4xA_k4Ww9KlbD_Guuca3Otiu6HOYDnjMYLmU";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function run() {
  const { data: docs } = await supabase.from("documents").select("*");
  for (const doc of docs) {
    console.log(`\nDocument: ${doc.title} (${doc.storage_path})`);
    try {
      const { data: blob, error } = await supabase.storage.from("padhai-docs").download(doc.storage_path);
      if (error) {
        console.error("Download error:", error);
        continue;
      }
      const buffer = Buffer.from(await blob.arrayBuffer());
      const parsed = await pdfParse(buffer);
      console.log(`Parsed info: numpages = ${parsed.numpages}`);
      console.log(`Text length: ${parsed.text.length} chars`);
      console.log(`Snippet of first 200 chars: ${JSON.stringify(parsed.text.slice(0, 200))}`);
    } catch (e) {
      console.error("Error parsing:", e);
    }
  }
}

run();
