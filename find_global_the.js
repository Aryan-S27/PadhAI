import fs from "fs";
import path from "path";

const dir = "supabase/migrations";
const files = fs.readdirSync(dir);

console.log("Analyzing all migrations for 'the' outside of SQL string quotes...");

files.forEach(file => {
  if (!file.endsWith(".sql")) return;
  const content = fs.readFileSync(path.join(dir, file), "utf-8");
  const lines = content.split("\n");
  
  let inString = false;
  
  lines.forEach((line, i) => {
    // Track quotes
    for (let j = 0; j < line.length; j++) {
      if (line[j] === "'") {
        const prev = line[j - 1];
        const next = line[j + 1];
        if (prev === "'" || next === "'") {
          if (next === "'") j++;
        } else {
          inString = !inString;
        }
      } else {
        if (!inString) {
          const substring = line.substring(j, j + 3).toLowerCase();
          if (substring === "the") {
            const prevChar = line[j - 1] || " ";
            const nextChar = line[j + 3] || " ";
            const isWord = /[^a-zA-Z]/.test(prevChar) && /[^a-zA-Z]/.test(nextChar);
            if (isWord) {
              console.log(`FOUND 'the' OUTSIDE STRING in ${file} on Line ${i + 1}:`);
              console.log(`  "${line.trim()}"`);
            }
          }
        }
      }
    }
  });
});
