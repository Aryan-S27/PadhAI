import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://zbfqidnjspzruabgazvx.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiZnFpZG5qc3B6cnVhYmdhenZ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyMzkxMywiZXhwIjoyMDk4NDk5OTEzfQ.hgXLsFv4xA_k4Ww9KlbD_Guuca3Otiu6HOYDnjMYLmU";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function run() {
  const targetEmail = "aryan.sadamastula@gmail.com";
  console.log(`Searching for user with email: ${targetEmail}`);

  // Query auth.users table or use admin auth API
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) {
    console.error("Error listing users:", listErr);
    return;
  }

  const userObj = users.find(u => u.email === targetEmail);
  if (!userObj) {
    console.error(`No user found with email ${targetEmail}`);
    return;
  }

  console.log(`Found User ID: ${userObj.id}`);

  // Check if profile exists
  const { data: profile, error: profErr } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userObj.id)
    .maybeSingle();

  if (profErr) {
    console.error("Error checking profiles:", profErr);
    return;
  }

  if (profile) {
    console.log("Profile already exists:", profile);
    return;
  }

  console.log("Profile missing. Inserting profile row...");
  const { data, error: insErr } = await supabase
    .from("profiles")
    .insert({
      id: userObj.id,
      name: userObj.user_metadata?.name || targetEmail.split("@")[0],
      branch: userObj.user_metadata?.branch || "AIDS",
      year: userObj.user_metadata?.year || 1,
      semester: 4,
      college: userObj.user_metadata?.college || "Mumbai University College"
    })
    .select();

  if (insErr) {
    console.error("Failed to insert profile:", insErr);
  } else {
    console.log("Successfully inserted profile:", data[0]);
  }
}

run();
