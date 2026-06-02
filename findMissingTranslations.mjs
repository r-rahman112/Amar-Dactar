import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx')) results.push(file);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src/components'));
const bnJsonPath = path.join(__dirname, 'src/locales/bn.json');
const bnTranslations = JSON.parse(fs.readFileSync(bnJsonPath, 'utf8'));
const enTranslations = JSON.parse(fs.readFileSync(path.join(__dirname, 'src/locales/en.json'), 'utf8'));

let matchRegex = /t\((['"`])((?:(?!\1).)*)\1\)/g;

let missing = {};

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = matchRegex.exec(content)) !== null) {
    const key = match[2];
    if (!bnTranslations[key]) {
      missing[key] = key;
    }
  }
});

fs.writeFileSync(path.join(__dirname, 'missing.json'), JSON.stringify(missing, null, 2));
console.log('Extracted missing translations');
