// src/lib/rag.js
import { supabase } from "./supabase";

export async function retrieveChunks(query, subject, marksValue) {
    const chunkCount =
        marksValue === 2 ? 2 : marksValue === 6 ? 4 : 6;

    const { data: embedding } = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
        import.meta.env.VITE_GEMINI_API_KEY,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": import.meta.env.VITE_GEMINI_API_KEY,
            },
            body: JSON.stringify({
                model: "gemini-2.0-flash",
                messages: [
                    {
                        role: "user",
                        content: `Embed this text for similarity search: ${query}`,
                    },
                ],
            }),
        }
    ).then((r) => r.json());

    const queryEmbedding = embedding?.candidates?.[0]?.content?.parts?.[0]?.text; // simplified

    const { data, error } = await supabase.rpc("match_documents", {
        query_embedding: queryEmbedding,
        match_count: chunkCount,
        filter: { subject },
    });

    if (error) throw error;
    return data; // array of {content, similarity, ...}
}
