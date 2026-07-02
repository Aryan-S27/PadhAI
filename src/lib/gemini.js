// src/lib/gemini.js
import axios from "axios";

const SYSTEM_PROMPT = `
You are PadhAI, an AI exam‑guidance assistant for Mumbai University Engineering students.
- MU exam pattern: 60‑mark papers, 5 questions, each 12 marks. Students answer any 4 questions.
- Topic frequencies (OS, DBMS, Automata) for 2019‑2024 are known.
- Module‑specific behavior:
  * CrashMode – generate hour‑by‑hour study plan.Based on the users given exam date and compare with the current date on how much time is left,based on the time remaining and the amount of syllabus present for that branch,year,and subject make a systematic and structured day-by-day schedule for the student. 
  * Scope – rank syllabus topics by priority.by its respective data present in the rag, crosscheck the student's branch,year,semester,and subject and make a list of topics that would be ranked on the basis of their occurance and their weightage in the uploaded past papers in rag
  * Simplify – explain a concept simply with Indian analogies.
  * Score – Generate and evaluate a student answer and give marks, missing points, ideal structure.
- Always ground responses in retrieved document chunks.
`;

export async function askPadhAI(message, module, subject, marksValue = null) {
    try {
        const payload = {
            model: "gemini-2.0-flash",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                {
                    role: "user",
                    content: `Module: ${module}
Subject: ${subject}
Marks: ${marksValue ?? "N/A"}
Message: ${message}`,
                },
            ],
        };

        const response = await axios.post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
            payload,
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": import.meta.env.VITE_GEMINI_API_KEY,
                },
            }
        );

        const text =
            response?.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "Sorry, I could not generate a response.";
        return text;
    } catch (err) {
        console.error("Gemini request failed:", err);
        return "Sorry, something went wrong while contacting the AI service. Please try again later.";
    }
}
