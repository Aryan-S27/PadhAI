import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://zbfqidnjspzruabgazvx.supabase.co";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  console.error("Missing supabase anon key in env!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Querying documents...");
  const { data, error } = await supabase
    .from("documents")
    .select("id, title, type, status, subject_code");

  if (error) {
    console.error("Error fetching documents:", error);
    return;
  }

  console.log("Documents Found:", data.length);
  data.forEach(doc => {
    console.log(`- Code: ${doc.subject_code} | Type: ${doc.type} | Status: ${doc.status} | Title: "${doc.title}"`);
  });
}

run();
