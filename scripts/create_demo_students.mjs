import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://zbfqidnjspzruabgazvx.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiZnFpZG5qc3B6cnVhYmdhenZ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyMzkxMywiZXhwIjoyMDk4NDk5OTEzfQ.hgXLsFv4xA_k4Ww9KlbD_Guuca3Otiu6HOYDnjMYLmU";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const SUBJECT_CODE = "2014111-CT";
const MODULE_NAME = "Module 1: Finite Automata & Regular Expressions";

async function run() {
  console.log("Seeding Demo Accounts...");

  const students = [
    {
      email: "demo-student-a@padhai.test",
      name: "Student A (High Mastery)",
      progress: {
        questions_attempted: 10,
        questions_correct: 9,
        doubts_raised: 0,
        last_doubt_at: null,
        time_spent_mins: 45
      }
    },
    {
      email: "demo-student-b@padhai.test",
      name: "Student B (Low Mastery / Struggling)",
      progress: {
        questions_attempted: 4,
        questions_correct: 1,
        doubts_raised: 4,
        last_doubt_at: new Date(Date.now() - 3 * 3600000).toISOString(),
        time_spent_mins: 15
      }
    }
  ];

  for (const s of students) {
    console.log(`Checking if ${s.email} exists...`);
    
    // Check if user exists in auth.users via list
    const { data: usersData, error: listErr } = await supabase.auth.admin.listUsers();
    if (listErr) {
      console.error("Failed to list users:", listErr.message);
      return;
    }

    let user = usersData.users.find(u => u.email === s.email);

    if (!user) {
      console.log(`Creating auth user for ${s.email}...`);
      const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
        email: s.email,
        password: "Password123!",
        email_confirm: true,
        user_metadata: {
          name: s.name,
          branch: "AIDS",
          year: 2,
          studyLevel: "degree"
        }
      });

      if (createErr) {
        console.error(`Failed to create ${s.email}:`, createErr.message);
        continue;
      }
      user = newUser.user;
      console.log(`User created. ID: ${user.id}`);
    } else {
      console.log(`User already exists. ID: ${user.id}`);
    }

    // Upsert profile self-healing
    const { error: profErr } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        name: s.name,
        branch: "AIDS",
        year: 2
      });
    if (profErr) {
      console.error(`Failed to upsert profile for ${s.email}:`, profErr.message);
    }

    // Upsert topic progress
    console.log(`Upserting user_topic_progress for ${s.email}...`);
    const { error: progErr } = await supabase
      .from("user_topic_progress")
      .upsert({
        user_id: user.id,
        subject_code: SUBJECT_CODE,
        module_name: MODULE_NAME,
        ...s.progress,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id,subject_code,module_name" });

    if (progErr) {
      console.error(`Failed to upsert progress for ${s.email}:`, progErr.message);
    } else {
      console.log(`Successfully seeded progress for ${s.email}!`);
    }
  }
}

run();
