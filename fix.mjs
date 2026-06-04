import fs from 'fs';
import path from 'path';

function walkDir(dir) {
  let files = [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      files = files.concat(walkDir(fullPath));
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      if (!fullPath.includes('backend') && !fullPath.includes('apiClient.ts')) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

const files = walkDir('src');
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Search for apiClient('/api/vault/${id}`, {
  // It has: apiClient('/api followed by anything that doesn't have a quote, up to `
  let regex = /apiClient\('(\/api[^']*?)\`/g;
  
  let newContent = content.replace(regex, 'apiClient(`$1`');
  
  if (newContent !== content) {
    fs.writeFileSync(file, newContent);
    console.log('Fixed backticks in:', file);
  }
}
