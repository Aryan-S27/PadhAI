// supabase/functions/ingest-doc/index.ts
// Ingestion pipeline: download PDF → parse → chunk → embed → store.
// Called by admin/service after uploading a PDF to Supabase Storage.
// NOTE: This is a SLOW function (1-5 min for large PDFs). Call async.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { embedText } from "../_shared/gemini.ts";

// Simple token counter (rough estimate: 1 token ≈ 4 chars)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Split text into overlapping chunks of ~400 tokens
function chunkText(
  text: string,
  chunkTokens = 400,
  overlapTokens = 50,
): string[] {
  const chunkChars = chunkTokens * 4;
  const overlapChars = overlapTokens * 4;
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkChars, text.length);
    chunks.push(text.slice(start, end).trim());
    start += chunkChars - overlapChars;
    if (start >= text.length) break;
  }

  return chunks.filter((c) => c.length > 100); // discard tiny fragments
}

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // This endpoint is admin-only (service role)
    const authHeader = req.headers.get("Authorization");
    const isServiceRole = authHeader?.includes(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "NEVER");

    if (!isServiceRole) {
      return new Response(JSON.stringify({ error: "Admin only" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { document_id } = await req.json();
    if (!document_id) {
      return new Response(JSON.stringify({ error: "document_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // 1. Fetch document record
    const { data: doc, error: docError } = await supabase
      .from("documents")
      .select("*, subjects(code)")
      .eq("id", document_id)
      .single();

    if (docError || !doc) {
      return new Response(JSON.stringify({ error: "Document not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark as processing
    await supabase.from("documents").update({ status: "processing" }).eq("id", document_id);

    // 2. Download from Supabase Storage
    const { data: fileData, error: storageError } = await supabase.storage
      .from("padhai-docs")
      .download(doc.storage_path);

    if (storageError || !fileData) {
      await supabase.from("documents").update({
        status: "error", error_message: `Storage error: ${storageError?.message}`,
      }).eq("id", document_id);
      return new Response(JSON.stringify({ error: "File download failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Extract text
    // For now: treat as plain text. Replace with pdf-parse for real PDFs.
    const rawText = await fileData.text();

    // 4. Chunk the text
    const chunks = chunkText(rawText, 400, 50);
    console.log(`Document ${document_id}: ${chunks.length} chunks from ${rawText.length} chars`);

    // 5. Embed + insert each chunk
    let inserted = 0;
    const batchSize = 5; // embed in small batches to avoid rate limits

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);

      await Promise.all(batch.map(async (content, batchIdx) => {
        const chunkIndex = i + batchIdx;
        try {
          const embedding = await embedText(content);

          await supabase.from("document_chunks").insert({
            document_id,
            subject_id: doc.subject_id,
            subject_code: doc.subject_code,
            chunk_index: chunkIndex,
            content,
            metadata: {
              doc_type: doc.type,
              year_of_exam: doc.year_of_exam,
              title: doc.title,
              tokens: estimateTokens(content),
            },
            embedding,
          });

          inserted++;
        } catch (chunkErr) {
          console.error(`Chunk ${chunkIndex} failed:`, chunkErr);
        }
      }));

      // Small delay between batches to respect Gemini rate limits
      if (i + batchSize < chunks.length) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    // 6. Update document status
    await supabase.from("documents").update({
      status: "done",
      chunk_count: inserted,
    }).eq("id", document_id);

    return new Response(
      JSON.stringify({ success: true, document_id, chunks_inserted: inserted }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );

  } catch (err) {
    console.error("Ingest error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
