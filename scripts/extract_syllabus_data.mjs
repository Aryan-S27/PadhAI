import fs from "fs";
import path from "path";

const GEMINI_API_KEY = "AIzaSyD65zoOJyxN0E3OLOP1d-2bj5wKXSCz-eY";

const SYLLABUS_FILES = [
  {
    path: "c:\\Users\\aryan\\Aryan\\Padhai3\\branch\\AIDS\\SEM 4\\Subjects\\2014111-CT\\6.20N-B.E.-AI-DS.-Sem-IIV-Computational Theory syllabus.pdf",
    code: "2014111-CT",
    short: "CT",
    name: "Computational Theory"
  },
  {
    path: "c:\\Users\\aryan\\Aryan\\Padhai3\\branch\\AIDS\\SEM 4\\Subjects\\2014112-DBMS\\6.20N-B.E.-AI-DS.-Sem-IV-DBMS syllabus.pdf",
    code: "2014112-DBMS",
    short: "DBMS",
    name: "Database Management Systems"
  },
  {
    path: "c:\\Users\\aryan\\Aryan\\Padhai3\\branch\\AIDS\\SEM 4\\Subjects\\2014113-OS\\6.20N-B.E.-AI-DS.-Sem-III-IV-Operating system syllabus.pdf",
    code: "2014113-OS",
    short: "OS",
    name: "Operating Systems"
  }
];

async function extractSyllabus(fileInfo) {
  console.log(`Extracting modules for ${fileInfo.name} from syllabus PDF...`);
  const buffer = fs.readFileSync(fileInfo.path);
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
            text: `You are an expert syllabus parser. Analyze this course syllabus PDF and extract the structural modules and key topics.
            Format the output strictly as a JSON array of modules containing:
            - num (integer, e.g. 1)
            - title (string, e.g. "Introduction to Operating Systems")
            - topics (array of strings, e.g. ["Process concepts", "Thread management"])

            Return ONLY the valid JSON array of modules, no markdown blocks, no other text.`
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json"
    }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error(`Gemini parse error: ${await res.text()}`);
  }

  const result = await res.json();
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  return JSON.parse(text);
}

async function run() {
  const results = [];
  for (const file of SYLLABUS_FILES) {
    try {
      const modules = await extractSyllabus(file);
      results.push({
        code: file.code,
        name: file.name,
        short_name: file.short,
        branch: "AIDS",
        year: 2,
        semester: 4,
        modules
      });
      console.log(`Successfully extracted ${file.name}`);
    } catch (e) {
      console.error(`Failed for ${file.name}:`, e.message);
    }
  }

  fs.writeFileSync("scripts/extracted_subjects.json", JSON.stringify(results, null, 2));
  console.log("\nFinished. Results written to scripts/extracted_subjects.json");
}

run().catch(console.error);
