import fs from 'fs';

const translationsMap = {
  "Your consultation session will expire in 5 minutes. Extend time if needed.": "আপনার পরামর্শ সেশন শেষ হতে আর ৫ মিনিট বাকি। প্রয়োজনে সময় বাড়াতে পারেন।",
  "Your consultation session will end in 1 minute.": "পরামর্শ সেশন শেষ হতে আর ১ মিনিট বাকি।",
  "Are you sure you want to advance report this user for abusive language? They will be banned for 5 days and their purchased credits will be deducted for all time (will not be refunded in any way). The session will be terminated immediately.": "আপনি কি নিশ্চিত যে আপনি এই ব্যবহারকারীকে অশালীন ভাষার জন্য রিপোর্ট করতে চান? তাদের ৫ দিনের জন্য নিষিদ্ধ করা হবে এবং তাদের কেনা ক্রেডিট চিরতরে কেটে নেওয়া হবে। সেশনটি অবিলম্বে বাতিল করা হবে।"
};

const bnJsonPath = 'src/locales/bn.json';
const enJsonPath = 'src/locales/en.json';

const bn = JSON.parse(fs.readFileSync(bnJsonPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enJsonPath, 'utf8'));

Object.keys(translationsMap).forEach(key => {
    bn[key] = translationsMap[key];
    en[key] = key;
});

fs.writeFileSync(bnJsonPath, JSON.stringify(bn, null, 2));
fs.writeFileSync(enJsonPath, JSON.stringify(en, null, 2));

console.log('Final translations applied.');
