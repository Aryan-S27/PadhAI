import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://zbfqidnjspzruabgazvx.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiZnFpZG5qc3B6cnVhYmdhenZ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyMzkxMywiZXhwIjoyMDk4NDk5OTEzfQ.hgXLsFv4xA_k4Ww9KlbD_Guuca3Otiu6HOYDnjMYLmU";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function checkStatus() {
  console.log("\n=== PadhAI Supabase RAG Database Status ===\n");

  // 1. Subject Count
  const { data: subjects, error: subjErr } = await supabase
    .from("subjects")
    .select("code, name, branch, semester");

  if (subjErr) {
    console.error("Error fetching subjects:", subjErr.message);
  } else {
    console.log(`📚 Total Subjects: ${subjects.length}`);
    subjects.forEach((s) => {
      console.log(`   - [${s.branch} Sem ${s.semester}] ${s.code}: ${s.name}`);
    });
  }

  console.log("");

  // 2. Document Status Summary
  const { data: docs, error: docErr } = await supabase
    .from("documents")
    .select("status, type");

  if (docErr) {
    console.error("Error fetching documents:", docErr.message);
  } else {
    console.log(`📄 Total Documents: ${docs.length}`);
    const summary = docs.reduce((acc, doc) => {
      acc[doc.status] = (acc[doc.status] || 0) + 1;
      return acc;
    }, {});
    console.log("   Status breakdown:", JSON.stringify(summary));
  }

  console.log("");

  // 3. Document Chunks Count
  const { count, error: chunkErr } = await supabase
    .from("document_chunks")
    .select("id", { count: "exact", head: true });

  if (chunkErr) {
    console.error("Error fetching chunks count:", chunkErr.message);
  } else {
    console.log(`🧩 Total Vector Chunks in RAG: ${count}`);
  }
  console.log("\n==========================================\n");
}

checkStatus();
