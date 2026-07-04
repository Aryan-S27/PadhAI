import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const SUPABASE_URL = "https://zbfqidnjspzruabgazvx.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiZnFpZG5qc3B6cnVhYmdhenZ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyMzkxMywiZXhwIjoyMDk4NDk5OTEzfQ.hgXLsFv4xA_k4Ww9KlbD_Guuca3Otiu6HOYDnjMYLmU";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function run() {
  console.log("Reading extracted subjects...");
  const subjects = JSON.parse(fs.readFileSync("scripts/extracted_subjects.json", "utf8"));

  for (const subject of subjects) {
    console.log(`Seeding subject: ${subject.name} (${subject.code})...`);

    // Check if exists
    const { data: existing } = await supabase
      .from("subjects")
      .select("id")
      .eq("code", subject.code)
      .maybeSingle();

    if (existing) {
      console.log(`Subject ${subject.code} already exists. Updating modules...`);
      const { error: updateErr } = await supabase
        .from("subjects")
        .update({
          name: subject.name,
          short_name: subject.short_name,
          branch: subject.branch,
          year: subject.year,
          semester: subject.semester,
          modules: subject.modules,
          is_active: true
        })
        .eq("id", existing.id);

      if (updateErr) {
        console.error("Update error:", updateErr.message);
      } else {
        console.log("Updated successfully.");
      }
    } else {
      console.log(`Subject ${subject.code} does not exist. Inserting...`);
      const { error: insertErr } = await supabase
        .from("subjects")
        .insert({
          code: subject.code,
          name: subject.name,
          short_name: subject.short_name,
          branch: subject.branch,
          year: subject.year,
          semester: subject.semester,
          modules: subject.modules,
          is_active: true
        });

      if (insertErr) {
        console.error("Insert error:", insertErr.message);
      } else {
        console.log("Inserted successfully.");
      }
    }
  }
}

run().catch(console.error);
