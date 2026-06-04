import fs from 'fs';

const filesToProcess = [
  'src/components/DoctorDashboard.tsx',
  'src/components/DoctorScheduleManager.tsx',
  'src/components/DoctorAppointmentsView.tsx',
  'src/components/DoctorVerificationsManagement.tsx',
  'src/components/ConsultationScheduler.tsx',
  'src/components/PaidDoctorChat.tsx'
];

filesToProcess.forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  if (!content.includes('useTranslation')) {
    content = content.replace(/(import .*?;\n)/, `$1import { useTranslation } from '../contexts/LanguageContext';\n`);
  }

  // Ensure const { t } = useTranslation() - tricky because there might be multiple components or it's inside the default export
  if (!content.includes('const { t } = useTranslation()') && !content.includes('const { t, language } = useTranslation()')) {
    content = content.replace(/export default function \w+\([^)]*\)\s*\{/, `$&  const { t } = useTranslation();\n`);
  }

  // Very careful regex for >Text< replacements (avoiding tags, empty space, and existing expressions)
  // We look for > followed by optional whitespace, some words, optional whitespace, and <
  const textRegex = />\s*([a-zA-Z0-9\s.,'":?!()-]+)\s*</g;
  
  content = content.replace(textRegex, (match, text) => {
    let cleanText = text.trim();
    if (cleanText.length === 0 || cleanText === '-' || !(/[a-zA-Z]/.test(cleanText))) return match; // skip pure whitespace or non-text
    // skip if inside an existing {t('...')}
    if (match.includes('{t(')) return match;

    // replace just the inner text, preserving whitespace
    const beforeSpaces = match.substring(0, match.indexOf(cleanText));
    const afterSpaces = match.substring(match.indexOf(cleanText) + cleanText.length);
    
    // escape single quotes
    cleanText = cleanText.replace(/'/g, "\\'");
    
    return `${beforeSpaces}{t('${cleanText}')}${afterSpaces}`;
  });

  // Also replace some specific placeholder="text" correctly
  content = content.replace(/placeholder="([^"]+)"/g, (match, text) => {
     if (text.includes('{')) return match; 
     let cText = text.replace(/'/g, "\\'");
     return `placeholder={t('${cText}')}`;
  });

  fs.writeFileSync(filePath, content);
  console.log('Fixed', filePath);
});
