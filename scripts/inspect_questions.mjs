import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://zbfqidnjspzruabgazvx.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiZnFpZG5qc3B6cnVhYmdhenZ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyMzkxMywiZXhwIjoyMDk4NDk5OTEzfQ.hgXLsFv4xA_k4Ww9KlbD_Guuca3Otiu6HOYDnjMYLmU";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function run() {
  const { data: questions, error } = await supabase.from("question_bank").select("id, subject_code, type, question, marks, year_of_exam");
  if (error) {
    console.error("Error fetching questions:", error);
    return;
  }
  console.log(`Total questions in question_bank: ${questions.length}`);
  const summary = {};
  for (const q of questions) {
    if (!summary[q.subject_code]) {
      summary[q.subject_code] = { mcq: 0, theory: 0, questions: [] };
    }
    summary[q.subject_code][q.type]++;
    summary[q.subject_code].questions.push(q);
  }
  console.log("Summary:", JSON.stringify(summary, null, 2));
}

run();
