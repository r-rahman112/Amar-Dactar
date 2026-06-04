const fs = require('fs');

const content = fs.readFileSync('post-deployment.md', 'utf8');
fs.appendFileSync('README.md', '\n\n' + content);
console.log('Appended to README.md');
