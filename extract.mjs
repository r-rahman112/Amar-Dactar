import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ctxPath = path.join(__dirname, 'src/contexts/LanguageContext.tsx');
let ctxContent = fs.readFileSync(ctxPath, 'utf8');

// We have the translations object in the file
// Let's parse it using a regex or simple eval
const match = ctxContent.match(/const translations:\s*Record<string,\s*string>\s*=\s*({[\s\S]*?});/);
if (match) {
  const translationsCode = match[1];
  
  // Safe eval by wrapping it
  const evalCode = `
    const translations = ${translationsCode};
    export default translations;
  `;
  fs.writeFileSync('temp-eval.mjs', evalCode);
  import('./temp-eval.mjs').then(module => {
    const translations = module.default;
    
    // bn.json
    fs.writeFileSync(path.join(__dirname, 'src/locales/bn.json'), JSON.stringify(translations, null, 2));
    
    // en.json
    const enObj = {};
    for (const key of Object.keys(translations)) {
      enObj[key] = key; // ID is English string
    }
    fs.writeFileSync(path.join(__dirname, 'src/locales/en.json'), JSON.stringify(enObj, null, 2));
    
    console.log('Successfully created bn.json and en.json');
  });
}
