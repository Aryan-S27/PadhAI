import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://zbfqidnjspzruabgazvx.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiZnFpZG5qc3B6cnVhYmdhenZ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyMzkxMywiZXhwIjoyMDk4NDk5OTEzfQ.hgXLsFv4xA_k4Ww9KlbD_Guuca3Otiu6HOYDnjMYLmU";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function run() {
  console.log("Verifying user_topic_progress table status...");

  // 1. Check if table exists
  const { data: cols, error: colErr } = await supabase.rpc("match_documents", {
    query_embedding: Array(768).fill(0),
    similarity_threshold: 0,
    match_count: 1,
    subject_filter: "2014111-CT"
  }); // Just testing general connection first
  
  console.log("Checking user_topic_progress table directly...");
  const { data, error } = await supabase
    .from("user_topic_progress")
    .select("*")
    .limit(1);

  if (error) {
    console.error("❌ Table verification failed:", error.message);
  } else {
    console.log("✅ Table exists!");
    console.log("Columns & data returned:", data);

    // 2. Check RLS policies
    console.log("Querying pg_policies...");
    // We can query pg_policies using supabase.rpc or a raw select if we have a custom function, or we can just try executing a write as a non-service-role key!
    // Since service role bypasses RLS, we can create a temporary client with the anon key to test if select/insert works!
    const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiZnFpZG5qc3B6cnVhYmdhenZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MjM5MTMsImV4cCI6MjA5ODQ5OTkxM30.bBFHabHIVSU9XQP1-pJuFDf6g6uz2P_yg2NAyYw8RwY";
    const anonSupabase = createClient(SUPABASE_URL, ANON_KEY);
    
    const { data: anonData, error: anonErr } = await anonSupabase
      .from("user_topic_progress")
      .select("*")
      .limit(1);

    if (anonErr) {
      console.warn("Anon select returned error (expected if no active session, but table must be recognized):", anonErr.message);
      if (anonErr.message.includes("does not exist")) {
        console.error("❌ Table does not exist in schema.");
      } else {
        console.log("✅ RLS table mapping is active!");
      }
    } else {
      console.log("✅ Anon select succeeded!", anonData);
    }
  }
}

run();
