const GEMINI_API_KEY = "AIzaSyD65zoOJyxN0E3OLOP1d-2bj5wKXSCz-eY";

async function testModel(modelName) {
  console.log(`Testing model: ${modelName}...`);
  const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
  
  const payload = {
    contents: [
      {
        parts: [
          { text: "Hello, reply with 'success' if you receive this." }
        ]
      }
    ]
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      console.log(`✓ ${modelName} success:`, data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim());
      return true;
    } else {
      console.log(`✗ ${modelName} failed with status ${res.status}:`, await res.text());
      return false;
    }
  } catch (e) {
    console.error(`✗ ${modelName} error:`, e.message);
    return false;
  }
}

async function run() {
  await testModel("models/gemini-3.5-flash");
  await testModel("models/gemini-flash-latest");
  await testModel("models/gemini-2.5-flash");
}

run();
