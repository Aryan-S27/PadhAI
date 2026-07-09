import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://zbfqidnjspzruabgazvx.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiZnFpZG5qc3B6cnVhYmdhenZ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyMzkxMywiZXhwIjoyMDk4NDk5OTEzfQ.hgXLsFv4xA_k4Ww9KlbD_Guuca3Otiu6HOYDnjMYLmU";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const STUDENT_A = "dbe9fa55-da03-4d7e-b05b-7b8b909b8ef9";
const STUDENT_B = "1431bec9-65fe-465a-8444-9cd4223dd386";
const SUBJECT_CODE = "2014111-CT";
const MODULE_NAME = "Module 1: Finite Automata & Regular Expressions";

// Simple Ollama caller
async function generateChatLocal(systemPrompt, userMessage, jsonMode = false) {
  try {
    const payload = {
      model: "gemma2:2b",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      stream: false,
      options: { temperature: 0.3, num_ctx: 8192 }
    };
    if (jsonMode) payload.format = "json";

    const res = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(`Ollama chat status: ${res.status}`);
    const data = await res.json();
    return data?.message?.content;
  } catch (err) {
    return `[Local Ollama failed: ${err.message}]`;
  }
}

// Client RAG helper
async function retrieveChunksLocal(query) {
  // Query embeddings
  const embedRes = await fetch("http://localhost:11434/api/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "nomic-embed-text", prompt: query })
  });
  if (!embedRes.ok) return [];
  const embedData = await embedRes.json();
  
  const { data } = await supabase.rpc("match_documents", {
    query_embedding: embedData.embedding,
    subject_filter: SUBJECT_CODE,
    match_count: 3,
    similarity_threshold: 0.15
  });
  return data || [];
}

function formatChunks(chunks) {
  return chunks.map((c, i) => `--- Context ${i+1} ---\n${c.content}`).join("\n\n");
}

// Student Context Builder
async function getStudentContext(userId) {
  try {
    const { data } = await supabase
      .from("user_topic_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("subject_code", SUBJECT_CODE)
      .eq("module_name", MODULE_NAME)
      .maybeSingle();

    if (!data) return "no prior activity";

    const attempted = data.questions_attempted || 0;
    const correct = data.questions_correct || 0;
    const doubts = data.doubts_raised || 0;
    const timeSpent = data.time_spent_mins || 0;
    
    let lastDoubtStr = "";
    if (data.last_doubt_at) {
      const lastDoubtDate = new Date(data.last_doubt_at);
      const diffMs = new Date().getTime() - lastDoubtDate.getTime();
      const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      lastDoubtStr = diffDays === 0 ? "today" : `${diffDays} days ago`;
    }

    let summary = `This student has attempted ${attempted} questions on this module (${correct} correct), `;
    summary += `raised ${doubts} doubts here${lastDoubtStr ? ` (most recently ${lastDoubtStr})` : ""}, `;
    summary += `and spent ${timeSpent} minutes in notes for this module. `;

    let trend = "";
    if (doubts > 3 && timeSpent < 5) {
      trend = "doubts increasing relative to time spent — likely still confused.";
    } else if (attempted > 0 && (correct / attempted) >= 0.8) {
      trend = "high accuracy on questions — strong comprehension.";
    } else if (attempted > 0 && (correct / attempted) < 0.5) {
      trend = "low accuracy on questions — requires fundamental revision.";
    } else {
      trend = "steady progress.";
    }
    
    summary += `Trend: ${trend}`;
    return summary;
  } catch (err) {
    return "no prior activity";
  }
}

async function run() {
  console.log("=== RUNNING PERSONALIZATION COMPARISON TESTS ===");

  const contextA = await getStudentContext(STUDENT_A);
  const contextB = await getStudentContext(STUDENT_B);
  
  console.log(`\n[STUDENT A CONTEXT SUMMARY]:\n${contextA}`);
  console.log(`\n[STUDENT B CONTEXT SUMMARY]:\n${contextB}`);

  // 1. Simplify Doubt Test
  console.log("\n--- TEST 1: SIMPLIFY DOUBT ---");
  const doubt = "What are the limitations of Finite Automata?";
  const chunks = await retrieveChunksLocal(doubt);
  const RAGContext = formatChunks(chunks);

  const simplifyPrompt = `You are PadhAI's Simplify tutor for Mumbai University Engineering students.
Your teaching style:
1. Explain the concept using the Feynman Technique or a clear everyday analogy.
2. Build intuition from the analogy to the technical concept.
3. Give the formal textbook definition clearly.
4. End with "What a full-marks answer needs:" — specific exam keywords and structure.`;

  const simplifyUser = `TOPIC: ${doubt}\nKNOWLEDGE CONTEXT:\n${RAGContext}`;

  console.log("\nGenerating Response for Student A...");
  const promptSystemA = `${simplifyPrompt}\n\nSTUDENT CONTEXT:\n${contextA}\n\nINSTRUCTION: Review student history. If they have repeated doubts (doubts > 2), do not repeat textbook details, use a different analogy. If first doubt, keep it simple.`;
  const resSimplifyA = await generateChatLocal(promptSystemA, simplifyUser);
  console.log(`\n>>> STUDENT A RESPONSE:\n${resSimplifyA}\n`);

  console.log("Generating Response for Student B...");
  const promptSystemB = `${simplifyPrompt}\n\nSTUDENT CONTEXT:\n${contextB}\n\nINSTRUCTION: Review student history. If they have repeated doubts (doubts > 2), do not repeat textbook details, use a different analogy. If first doubt, keep it simple.`;
  const resSimplifyB = await generateChatLocal(promptSystemB, simplifyUser);
  console.log(`\n>>> STUDENT B RESPONSE:\n${resSimplifyB}\n`);

  // 2. Score Grading Test
  console.log("\n--- TEST 2: SCORE GRADING ---");
  const studentAnswer = "Finite automata has very small memory and cannot count high numbers.";
  
  const gradingSystemPrompt = `You are a strict Mumbai University examiner grading a student's answer.
Grade the answer out of 5 marks.
Return your response as a JSON object:
{
  "marks_awarded": <number>,
  "marks_total": 5,
  "grade": "<Excellent|Good|Average|Poor>",
  "exam_tip": "<one specific improvement tip based on student context>"
}`;

  const gradingUser = `QUESTION: ${doubt}\nSTUDENT ANSWER: ${studentAnswer}\nCONTEXT:\n${RAGContext}`;

  console.log("Grading for Student A...");
  const gradeSystemA = `${gradingSystemPrompt}\n\nSTUDENT CONTEXT:\n${contextA}\n\nINSTRUCTION: Review history. If repeat attempt with low score or previous correct answers, acknowledge the trend in exam_tip.`;
  const resGradeA = await generateChatLocal(gradeSystemA, gradingUser, true);
  console.log(`>>> STUDENT A GRADED:\n${resGradeA}\n`);

  console.log("Grading for Student B...");
  const gradeSystemB = `${gradingSystemPrompt}\n\nSTUDENT CONTEXT:\n${contextB}\n\nINSTRUCTION: Review history. If repeat attempt with low score or previous correct answers, acknowledge the trend in exam_tip.`;
  const resGradeB = await generateChatLocal(gradeSystemB, gradingUser, true);
  console.log(`>>> STUDENT B GRADED:\n${resGradeB}\n`);

  // 3. Proactive Chatbot Greeting Test
  console.log("\n--- TEST 3: PROACTIVE CHATBOT GREETINGS ---");
  const getGreeting = (name, contextStr, progressData) => {
    let greeting = `Hello ${name}! I am PadhAI Socratic Guide.`;
    if (progressData) {
      if (progressData.time_spent_mins > 2 && progressData.questions_attempted === 0) {
        greeting = `Hi ${name}! I noticed you spent ${progressData.time_spent_mins} minutes reading notes for "${MODULE_NAME}" but haven't attempted any Score questions yet. Let's quiz ourselves!`;
      } else if (progressData.questions_attempted > 1 && (progressData.questions_correct / progressData.questions_attempted) < 0.6) {
        greeting = `Hi ${name}! I noticed you have been struggling a bit with "${MODULE_NAME}" (grading accuracy is under 60%). Let's review the core logic together.`;
      } else {
        greeting = `Welcome back! I see you recently worked on "${MODULE_NAME}". What should we master next?`;
      }
    }
    return greeting;
  };

  const greetA = getGreeting("Student A", contextA, { time_spent_mins: 45, questions_attempted: 10, questions_correct: 9 });
  const greetB = getGreeting("Student B", contextB, { time_spent_mins: 15, questions_attempted: 4, questions_correct: 1 });

  console.log(`Student A Greeting: "${greetA}"`);
  console.log(`Student B Greeting: "${greetB}"`);
}

run();
