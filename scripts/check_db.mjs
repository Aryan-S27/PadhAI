import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://zbfqidnjspzruabgazvx.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiZnFpZG5qc3B6cnVhYmdhenZ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyMzkxMywiZXhwIjoyMDk4NDk5OTEzfQ.hgXLsFv4xA_k4Ww9KlbD_Guuca3Otiu6HOYDnjMYLmU";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function run() {
  const { data: docs, error: docErr } = await supabase.from("documents").select("*");
  if (docErr) {
    console.error("Error fetching documents:", docErr);
    return;
  }
  console.log("Documents in DB:", docs.map(d => ({
    id: d.id,
    title: d.title,
    subject_code: d.subject_code,
    status: d.status,
    chunk_count: d.chunk_count,
    error_message: d.error_message
  })));

  const { count, error: chunkErr } = await supabase
    .from("document_chunks")
    .select("*", { count: "exact", head: true });
  if (chunkErr) {
    console.error("Error fetching chunk count:", chunkErr);
  } else {
    console.log("Total chunks in document_chunks table:", count);
  }
}

run();
