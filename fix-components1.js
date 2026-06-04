import fs from 'fs';

function fixFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Ensure useTranslation is imported
  if (!content.includes('useTranslation')) {
    content = content.replace(/(import React.*?;\n)/, `$1import { useTranslation } from '../contexts/LanguageContext';\n`);
  }

  // Ensure t is extracted
  if (!content.includes('const { t } = useTranslation()') && !content.includes('const { t, language } = useTranslation()')) {
    content = content.replace(/(export default function \w+\([^)]*\)\s*\{*.)/, `$1\n  const { t } = useTranslation();\n`);
  }

  // Apply replacements
  replacements.forEach(([from, to]) => {
     content = content.replace(from, to);
  });

  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${filePath}`);
}

const plan = [
  ['src/components/SessionTimeoutManager.tsx', [
    [/Session Warning/g, "{t('Session Warning')}"],
    [/Your session is about to expire/g, "{t('Your session is about to expire')}"],
    [/For your security, you will be automatically logged out due to inactivity in:/g, "{t('For your security, you will be automatically logged out due to inactivity in:')}"],
    [/>\s*Log Out\s*</g, ">{t('Log Out')}<"],
    [/>\s*Keep Me Logged In\s*</g, ">{t('Keep Me Logged In')}<"],
  ]],
  ['src/components/GlobalLoader.tsx', [
    [/>\s*Loading secure modules...\s*</g, ">{t('Loading secure modules...')}<"],
  ]],
  ['src/components/AdminPanel.tsx', [
    [/>\s*Admin Panel Security Details\s*</g, ">{t('Admin Panel Security Details')}<"],
    [/>\s*Dashboard Analytics\s*</g, ">{t('Dashboard Analytics')}<"],
    [/>\s*Total Active Patients\s*</g, ">{t('Total Active Patients')}<"],
    [/>\s*Total Doctors\s*</g, ">{t('Total Doctors')}<"],
    [/>\s*Pending Verifications\s*</g, ">{t('Pending Verifications')}<"],
    [/>\s*System Errors\s*</g, ">{t('System Errors')}<"],
    [/const \{ t \} = useTranslation\(\);\n  const \{ t \} = useTranslation\(\);/g, "const { t } = useTranslation();"],
  ]],
  ['src/components/BrandLogo.tsx', [
    [/aria-label="Go to Home Page"/g, "aria-label={t('Go to Home Page')}"],
    [/<span className={`([^`]+)`}>\s*আমার ডাক্তার\s*<\/span>/g, "<span className={`$1`}>{t('আমার ডাক্তার')}</span>"],
  ]]
];

plan.forEach(([passFile, reps]) => fixFile(passFile, reps));
