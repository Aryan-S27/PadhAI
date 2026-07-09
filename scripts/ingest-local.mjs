// scripts/ingest-local.mjs
// Local RAG ingestion pipeline for PadhAI.
// Downloads PDFs from Supabase Storage, parses text, chunks, embeds, stores.
// Supports OCR fallback via Gemini 3.5 Flash for scanned papers.
//
// Usage: node scripts/ingest-local.mjs
//   or:  npm run ingest

import { createClient } from "@supabase/supabase-js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

// ── Config ────────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://zbfqidnjspzruabgazvx.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiZnFpZG5qc3B6cnVhYmdhenZ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyMzkxMywiZXhwIjoyMDk4NDk5OTEzfQ.hgXLsFv4xA_k4Ww9KlbD_Guuca3Otiu6HOYDnjMYLmU";
const GEMINI_API_KEY = "AIzaSyD65zoOJyxN0E3OLOP1d-2bj5wKXSCz-eY";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ── Helpers ───────────────────────────────────────────────────────────────────

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
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key=${GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "models/gemini-embedding-2",
      content: { parts: [{ text }] },
      taskType: "RETRIEVAL_DOCUMENT",
      outputDimensionality: 768,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Embed error ${res.status}: ${err}`);
  }
  const data = await res.json();
  const values = data?.embedding?.values;
  if (!values?.length) throw new Error("Empty embedding");
  return values; // float32[768]
}

async function extractTextWithGemini(buffer) {
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
            text: "You are an expert OCR PDF text extractor. Extract all the text, question numbers, tables, diagrams descriptions, and options from this exam question paper PDF. Keep the text clean, well-structured, and preserve the original wording, numbers, and layout as much as possible. Do not add any introductory or concluding remarks, just output the extracted text."
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.1
    }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini OCR error ${res.status}: ${errText}`);
  }

  const result = await res.json();
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text || text.trim().length < 50) {
    throw new Error("Gemini OCR returned empty or very short text");
  }
  return text;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n=== PadhAI Local Ingestion Pipeline ===\n");

  // 1. Reset all documents (including done) to fresh ingest everything with high quality OCR
  const { count: resetCount } = await supabase
    .from("documents")
    .update({ status: "pending", error_message: null })
    .in("status", ["processing", "error", "done"])
    .select("*", { count: "exact", head: true });
  if (resetCount > 0) console.log(`Reset ${resetCount} documents to 'pending' for clean ingestion.`);

  // 2. Fetch pending docs
  const { data: docs, error } = await supabase
    .from("documents")
    .select("*")
    .eq("status", "pending")
    .order("year_of_exam");

  if (error) { console.error("DB error:", error.message); return; }
  if (!docs?.length) { console.log("No pending documents."); return; }

  console.log(`Found ${docs.length} document(s) to ingest.\n`);

  for (const doc of docs) {
    const label = `[${doc.year_of_exam}] ${doc.title}`;
    console.log(`── ${label}`);

    try {
      // Mark processing
      await supabase.from("documents").update({ status: "processing" }).eq("id", doc.id);

      // Clean out any existing chunks for this document first to avoid duplicates
      await supabase.from("document_chunks").delete().eq("document_id", doc.id);

      // 3. Download PDF
      process.stdout.write("   Downloading... ");
      const { data: blob, error: dlErr } = await supabase.storage
        .from("padhai-docs")
        .download(doc.storage_path);
      if (dlErr || !blob) throw new Error(`Download failed: ${dlErr?.message}`);
      console.log("done");

      // 4. Parse PDF → text
      process.stdout.write("   Parsing PDF... ");
      const buffer = Buffer.from(await blob.arrayBuffer());

      let rawText = "";
      let parsedOk = false;
      try {
        const parsed = await pdfParse(buffer);
        rawText = parsed.text || "";
        parsedOk = true;
      } catch (pdfErr) {
        // Suppress parsing error to fallback to Gemini OCR
      }

      const isShort = rawText.trim().length < 500;
      const isGarbage = rawText.includes("X237YF0F5B7");

      if (!parsedOk || isShort || isGarbage) {
        process.stdout.write("scanned/corrupted PDF. Using Gemini 3.5 Flash OCR... ");
        rawText = await extractTextWithGemini(buffer);
        console.log(`done (${rawText.length} chars)`);
      } else {
        console.log(`done (digital text: ${rawText.length} chars)`);
      }

      // 5. Chunk
      const chunks = chunkText(rawText);
      console.log(`   Chunked into ${chunks.length} segments`);

      // 6. Embed + insert
      let inserted = 0;
      const BATCH = 5;
      for (let i = 0; i < chunks.length; i += BATCH) {
        const batch = chunks.slice(i, i + BATCH);
        const batchNum = Math.floor(i / BATCH) + 1;
        const totalBatches = Math.ceil(chunks.length / BATCH);
        process.stdout.write(`   Embedding batch ${batchNum}/${totalBatches}... `);

        const results = await Promise.allSettled(
          batch.map(async (content, j) => {
            const embedding = await embedText(content);
            const { error: insErr } = await supabase.from("document_chunks").insert({
              document_id: doc.id,
              subject_id: doc.subject_id,
              subject_code: doc.subject_code,
              chunk_index: i + j,
              content,
              metadata: {
                doc_type: doc.type,
                year_of_exam: doc.year_of_exam,
                title: doc.title,
                page_estimate: Math.floor((i + j) / 2) + 1,
              },
              embedding,
            });
            if (insErr) throw insErr;
          })
        );

        const ok = results.filter((r) => r.status === "fulfilled").length;
        const fail = results.filter((r) => r.status === "rejected").length;
        inserted += ok;
        console.log(`${ok} ok${fail ? `, ${fail} failed` : ""}`);

        if (fail) {
          results.forEach((r, idx) => {
            if (r.status === "rejected") {
              console.log(`     ⚠ chunk ${i + idx}: ${r.reason?.message || r.reason}`);
            }
          });
        }

        if (i + BATCH < chunks.length) await sleep(600);
      }

      // 7. Mark done
      await supabase.from("documents").update({
        status: "done",
        chunk_count: inserted,
        error_message: null,
      }).eq("id", doc.id);

      console.log(`   ✓ Ingested ${inserted}/${chunks.length} chunks\n`);

    } catch (err) {
      console.log(`\n   ✗ Error: ${err.message}`);
      await supabase.from("documents").update({
        status: "error",
        error_message: err.message,
      }).eq("id", doc.id);
      console.log("");
    }
  }

  // 8. Final summary
  const { count: totalChunks } = await supabase
    .from("document_chunks")
    .select("*", { count: "exact", head: true });
  const { data: statuses } = await supabase
    .from("documents")
    .select("status")
    .eq("subject_code", "MU-CS-SEM4-OS");

  console.log("=== Summary ===");
  console.log(`Total chunks in DB: ${totalChunks}`);
  console.log(`Documents: ${statuses?.map((d) => d.status).join(", ")}`);
  console.log("Done.\n");
}

main().catch(console.error);
