import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, 'src', 'assets');

fs.mkdirSync(dir, { recursive: true });

const targetFile = path.join(dir, 'hero.png');

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
};

https.get('https://i.ibb.co.com/KcQSJnqf/Chat-GPT-Image-May-31-2026-02-44-03-PM.png', options, (res) => {
  if (res.statusCode === 301 || res.statusCode === 302) {
    https.get(res.headers.location, options, (res2) => {
      const file = fs.createWriteStream(targetFile);
      res2.pipe(file);
      file.on('finish', () => file.close());
    });
  } else {
    const file = fs.createWriteStream(targetFile);
    res.pipe(file);
    file.on('finish', () => file.close());
  }
}).on('error', (err) => {
  console.error('Download failed:', err);
});
