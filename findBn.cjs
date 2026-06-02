const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.tsx');
let found = false;
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (/[\u0980-\u09FF]/.test(content)) {
    console.log(`Found Bengali in ${file}`);
    found = true;
  }
});
if (!found) console.log("No Bengali text found anywhere in .tsx files!");
