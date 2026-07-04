import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://zbfqidnjspzruabgazvx.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiZnFpZG5qc3B6cnVhYmdhenZ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyMzkxMywiZXhwIjoyMDk4NDk5OTEzfQ.hgXLsFv4xA_k4Ww9KlbD_Guuca3Otiu6HOYDnjMYLmU";
const GEMINI_API_KEY = "AIzaSyD65zoOJyxN0E3OLOP1d-2bj5wKXSCz-eY";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function run() {
  const { data: docs } = await supabase.from("documents").select("*");
  // Find the May 2022 OS PDF
  const doc = docs.find(d => d.title.includes("2022"));
  if (!doc) {
    console.log("No 2022 document found");
    return;
  }
  console.log(`Downloading ${doc.title} (${doc.storage_path})...`);
  const { data: blob, error } = await supabase.storage.from("padhai-docs").download(doc.storage_path);
  if (error || !blob) {
    console.error("Download failed:", error);
    return;
  }
  console.log(`Downloaded. Size: ${(blob.size / 1024).toFixed(2)} KB`);

  // Base64 encode the PDF
  const buffer = Buffer.from(await blob.arrayBuffer());
  const base64Pdf = buffer.toString("base64");

  console.log("Sending to Gemini 3.5 Flash for OCR extraction...");
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
    console.error(`Gemini error ${res.status}:`, await res.text());
    return;
  }

  const result = await res.json();
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  console.log("\n--- Extracted Text ---");
  console.log(text?.slice(0, 1000));
  console.log("... [TRUNCATED] ...");
}

run();
