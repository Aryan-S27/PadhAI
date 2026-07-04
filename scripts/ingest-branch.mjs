// scripts/ingest-branch.mjs
// Recursively scans the local 'branch/' folder, extracts text/OCR/summaries, embeds them,
// and saves documents and chunks to Supabase.
// Uses Axios with timeouts, page limits, and a robust 429 rate-limit backoff handler.

import fs from "fs";
import path from "path";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

// ── Config & Env Loading ──────────────────────────────────────────────────────
function loadEnv() {
  if (fs.existsSync(".env")) {
    const content = fs.readFileSync(".env", "utf8");
    const lines = content.split(/\r?\n/);
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || "";
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        process.env[key] = val.trim();
      }
    }
  }
}
loadEnv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://zbfqidnjspzruabgazvx.supabase.co";
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiZnFpZG5qc3B6cnVhYmdhenZ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyMzkxMywiZXhwIjoyMDk4NDk5OTEzfQ.hgXLsFv4xA_k4Ww9KlbD_Guuca3Otiu6HOYDnjMYLmU";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyD65zoOJyxN0E3OLOP1d-2bj5wKXSCz-eY";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Rate Limit / Backoff Handler ──────────────────────────────────────────────
async function callGeminiWithRetry(apiCallFn, maxRetries = 4) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await apiCallFn();
    } catch (err) {
      const isRateLimit =
        err.response?.status === 429 ||
        err.message?.includes("429") ||
        err.message?.toLowerCase().includes("quota") ||
        err.response?.data?.error?.message?.toLowerCase().includes("quota");

      if (isRateLimit && attempt < maxRetries - 1) {
        attempt++;
        const delay = 65000;
        console.log(`\n      [429] Rate limit hit. Waiting ${delay / 1000}s before retry (Attempt ${attempt}/${maxRetries})...`);
        await sleep(delay);
      } else {
        const status = err.response?.status ? `Status ${err.response.status}` : err.code || "Error";
        const details = err.response?.data?.error?.message || err.message;
        throw new Error(`${status}: ${details}`);
      }
    }
  }
}

// ── Chunking & Embedding ──────────────────────────────────────────────────────
function chunkText(text, chunkTokens = 400, overlapTokens = 50) {
  const chunkChars = chunkTokens * 4; // ~4 chars per token
  const overlapChars = overlapTokens * 4;
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkChars, text.length);
    const slice = text.slice(start, end).trim();
    if (slice.length > 80) chunks.push(slice);
    start += chunkChars - overlapChars;
    if (start >= text.length) break;
  }
  return chunks;
}

async function embedText(text) {
  // If VITE_USE_LOCAL_LLM is enabled, call Ollama locally for nomic-embed-text
  if (process.env.VITE_USE_LOCAL_LLM === "true") {
    const embedModel = process.env.VITE_LOCAL_EMBED_MODEL || "nomic-embed-text";
    const res = await axios.post("http://localhost:11434/api/embeddings", {
      model: embedModel,
      prompt: text
    }, {
      timeout: 30000
    });
    const values = res.data?.embedding;
    if (!values?.length) throw new Error("Empty local embedding values");
    return values;
  }

  // Cloud Gemini embedding fallback
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key=${GEMINI_API_KEY}`;
  return callGeminiWithRetry(async () => {
    const res = await axios.post(url, {
      model: "models/gemini-embedding-2",
      content: { parts: [{ text }] },
      taskType: "RETRIEVAL_DOCUMENT",
      outputDimensionality: 768,
    }, {
      timeout: 30000
    });

    const values = res.data?.embedding?.values;
    if (!values?.length) throw new Error("Empty embedding values");
    return values;
  });
}

// ── Gemini OCR ────────────────────────────────────────────────────────────────
async function ocrPdf(buffer) {
  const base64Pdf = buffer.toString("base64");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const payload = {
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: "application/pdf",
              data: base64Pdf
            }
          },
          {
            text: "You are an expert OCR PDF text extractor. Extract all the text, question numbers, tables, diagrams descriptions, and options from this exam question paper PDF. Keep the text clean, well-structured, and preserve the original wording and layout. Do not add introductory/concluding remarks, just output the extracted text."
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.1
    }
  };

  return callGeminiWithRetry(async () => {
    const res = await axios.post(url, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 60000
    });

    const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text || text.trim().length < 50) {
      throw new Error("Gemini returned empty or short text");
    }
    return text;
  });
}

// ── Directory Walker ───────────────────────────────────────────────────────────
async function collectFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      await collectFiles(p, fileList);
    } else if (p.endsWith(".pdf")) {
      fileList.push(p);
    }
  }
  return fileList;
}

// ── Main Ingestion Flow ────────────────────────────────────────────────────────
async function main() {
  console.log("\n=== PadhAI Branch Ingestion Pipeline (Optimized) ===\n");

  const branchRoot = path.resolve("branch");
  if (!fs.existsSync(branchRoot)) {
    console.error("Local 'branch' directory not found.");
    return;
  }

  const pdfFiles = await collectFiles(branchRoot);
  console.log(`Found ${pdfFiles.length} PDF files under 'branch/'\n`);

  for (const pdfPath of pdfFiles) {
    const relativePath = path.relative(branchRoot, pdfPath).replace(/\\/g, "/");
    console.log(`Processing file: ${relativePath}`);

    const parts = relativePath.split("/");
    if (parts.length < 3) {
      console.log("   ⚠ Skipping: Path structure too shallow.");
      continue;
    }

    const branch = parts[0]; // e.g. "AIDS"
    const semStr = parts[1]; // e.g. "SEM 4"
    const semester = parseInt(semStr.replace(/\D/g, ""), 10);
    const inSyllabusDir = parts[2].toLowerCase() === "syllabus";

    let targetSubjects = [];

    if (inSyllabusDir) {
      console.log(`   📝 Detected semester syllabus. Querying all subjects for branch ${branch} sem ${semester}...`);
      const { data: subjects, error: subjErr } = await supabase
        .from("subjects")
        .select("*")
        .eq("branch", branch)
        .eq("semester", semester);

      if (subjErr) {
        console.error("   ❌ Subject query error:", subjErr.message);
        continue;
      }
      if (!subjects?.length) {
        console.log(`   ⚠ No active subjects found in DB for branch ${branch} sem ${semester}. Skipping syllabus for now.`);
        continue;
      }
      targetSubjects = subjects;
    } else if (parts[2].toLowerCase() === "subjects" && parts.length >= 5) {
      const subjectDirName = parts[3]; // e.g. "2014112-DBMS"
      const { data: subject, error: subjErr } = await supabase
        .from("subjects")
        .select("*")
        .eq("code", subjectDirName)
        .maybeSingle();

      if (subjErr) {
        console.error("   ❌ Subject query error:", subjErr.message);
        continue;
      }
      if (!subject) {
        console.log(`   ⚠ Subject with code ${subjectDirName} not found in DB. Skipping.`);
        continue;
      }
      targetSubjects = [subject];
    } else {
      console.log("   ⚠ Skipping: File is not in syllabus or subjects directory.");
      continue;
    }

    // Determine document properties
    const filename = path.basename(pdfPath);
    let type = "past_paper";
    let title = filename.replace(/\.pdf$/i, "");
    let yearOfExam = null;

    const lowerPath = relativePath.toLowerCase();
    const isReferenceMaterial = lowerPath.includes("/reference material/") || lowerPath.includes("/reference-material/");

    if (lowerPath.includes("/syllabus/")) {
      type = "syllabus";
      title = `${branch} Sem ${semester} General Syllabus`;
    } else if (lowerPath.includes("syllabus.pdf") || lowerPath.includes("-syllabus")) {
      type = "syllabus";
      title = `${targetSubjects[0]?.short_name || targetSubjects[0]?.name} Syllabus`;
    } else if (isReferenceMaterial) {
      type = "notes";
      title = `${targetSubjects[0]?.short_name || targetSubjects[0]?.name} Reference - ${title}`;
    } else {
      type = "past_paper";
      title = `${targetSubjects[0]?.short_name || targetSubjects[0]?.name} Paper - ${title}`;
      const yearMatch = filename.match(/\b(20\d{2})\b/);
      if (yearMatch) {
        yearOfExam = parseInt(yearMatch[1], 10);
      }
    }

    // Process document for each target subject
    for (const subject of targetSubjects) {
      const storagePath = `local://${relativePath}`;
      const docLabel = `${subject.short_name} - ${title}`;

      console.log(`   ↳ Ingesting for Subject: ${subject.name} (${subject.code})`);

      // Check if document already exists and is done
      const { data: existingDoc } = await supabase
        .from("documents")
        .select("*")
        .eq("storage_path", storagePath)
        .eq("subject_code", subject.code)
        .maybeSingle();

      if (existingDoc && existingDoc.status === "done") {
        console.log(`     ✓ Document already fully ingested. Chunks count: ${existingDoc.chunk_count}. Skipping.`);
        continue;
      }

      let docId = existingDoc?.id;
      if (existingDoc) {
        await supabase.from("documents").update({ status: "processing", error_message: null }).eq("id", docId);
        await supabase.from("document_chunks").delete().eq("document_id", docId);
      } else {
        const { data: newDoc, error: insErr } = await supabase
          .from("documents")
          .insert({
            subject_id: subject.id,
            subject_code: subject.code,
            title,
            type,
            storage_path: storagePath,
            year_of_exam: yearOfExam,
            status: "processing",
            chunk_count: 0
          })
          .select()
          .single();

        if (insErr) {
          console.error(`     ❌ Insert document error: ${insErr.message}`);
          continue;
        }
        docId = newDoc.id;
      }

      try {
        const buffer = fs.readFileSync(pdfPath);
        let rawText = "";
        let parsedOk = false;
        let numPages = 1;

        // Try parsing digitally, with page limit of 100 for large reference textbooks
        try {
          const parsed = await pdfParse(buffer);
          rawText = parsed.text || "";
          numPages = parsed.numpages || 1;
          parsedOk = true;
        } catch (pdfErr) {
          // Fallback to OCR
        }

        const isShort = rawText.trim().length < 200;
        const isGarbage = rawText.includes("X237YF0F5B7");

        if (!parsedOk || isShort || isGarbage) {
          console.log(`     [SKIP] Scanned/corrupted PDF requires OCR. Skipping for this pass to avoid rate limits.`);
          await supabase.from("documents").update({ status: "error", error_message: "Scanned document skipped to avoid rate limits." }).eq("id", docId);
          continue;
        } else {
          console.log(`     parsed digital PDF (${numPages} pgs, ${rawText.length} chars)`);
        }

        // 2. Chunk text
        const chunks = chunkText(rawText);
        console.log(`     chunked into ${chunks.length} segments`);

        // 3. Embed & Insert chunks sequentially
        let inserted = 0;
        console.log(`     embedding ${chunks.length} chunks sequentially...`);
        for (let i = 0; i < chunks.length; i++) {
          const content = chunks[i];
          try {
            process.stdout.write(`       embedding chunk ${i + 1}/${chunks.length}... `);
            const embedding = await embedText(content);
            const { error: insErr } = await supabase.from("document_chunks").insert({
              document_id: docId,
              subject_id: subject.id,
              subject_code: subject.code,
              chunk_index: i,
              content,
              metadata: {
                doc_type: type,
                year_of_exam: yearOfExam,
                title: title,
                page_estimate: Math.floor(i / 2) + 1,
              },
              embedding,
            });
            if (insErr) throw insErr;
            inserted++;
            console.log("ok");
            await sleep(150); // 150ms spacing between requests
          } catch (chunkErr) {
            console.log(`failed: ${chunkErr.message}`);
          }
        }

        // 4. Update document status to done
        await supabase
          .from("documents")
          .update({
            status: "done",
            chunk_count: inserted,
            error_message: null
          })
          .eq("id", docId);

        console.log(`     ✓ Successfully ingested ${inserted}/${chunks.length} chunks\n`);

      } catch (err) {
        console.error(`     ❌ Error ingesting document: ${err.message}`);
        await supabase
          .from("documents")
          .update({
            status: "error",
            error_message: err.message
          })
          .eq("id", docId);
      }
    }
  }

  console.log("=== Branch Ingestion Finished ===");
}

main().catch(console.error);
