const GEMINI_API_KEY = "AIzaSyD65zoOJyxN0E3OLOP1d-2bj5wKXSCz-eY";

async function run() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
  try {
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      console.log("Available models:");
      data.models?.forEach(m => {
        console.log(`- ${m.name} (supports: ${m.supportedGenerationMethods?.join(", ")})`);
      });
    } else {
      console.error(`Failed to list models with status ${res.status}:`, await res.text());
    }
  } catch (e) {
    console.error("Error:", e.message);
  }
}

run();
